import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * Mock Login Modal for Social Media connection.
 */
function LoginModal({ isOpen, onClose, onLogin }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'grid', placeItems: 'center', zIndex: 1000
    }}>
      <div className="input-card" style={{ maxWidth: 400, width: '90%', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 16 }}>Connect Socials</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Login to LinkedIn or Twitter to authorize <b>Playwright MCP</b> to post on your behalf.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn-generate" onClick={() => onLogin('LinkedIn')} style={{ background: '#0077b5' }}>
            Login with LinkedIn
          </button>
          <button className="btn-generate" onClick={() => onLogin('Twitter')} style={{ background: '#000000' }}>
            Login with Twitter
          </button>
          <button className="btn-retry" onClick={onClose} style={{ marginTop: 8 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/**
 * Single promotional image card powered by Puter.js (Flux-schnell)
 */
function ImageCard({ prompt, fallbackUrl, label, styleHint, delay = 0 }) {
  const [imgSrc, setImgSrc] = useState(fallbackUrl);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let retryTimer = null;
    let initialTimer = null;

    if (window.puter && prompt) {
      setLoading(true);

      const finalPrompt = `${prompt}. ${styleHint}, no humans, no people, no faces, no hands, product only`;

      console.log(`[Puter] Scheduled "${label}" generation in ${delay}ms...`);

      const runGeneration = (retriesLeft) => {
        if (!active) return;
        console.log(`[Puter] Requesting "${label}" (Flux-schnell). Retries left: ${retriesLeft}`);

        window.puter.ai.txt2img(finalPrompt, { model: "black-forest-labs/flux-schnell" })
          .then(imageElement => {
            if (!active) return;
            if (imageElement && imageElement.src) {
              setImgSrc(imageElement.src);
              setLoading(false);
            } else {
              throw new Error("No image src returned by Puter.js");
            }
          })
          .catch(err => {
            if (!active) return;
            console.error(`Puter generation failed for ${label}:`, err);
            if (retriesLeft > 0) {
              console.log(`[Puter] Retrying "${label}" in 3000ms...`);
              retryTimer = setTimeout(() => {
                runGeneration(retriesLeft - 1);
              }, 3000);
            } else {
              setImgSrc(fallbackUrl);
              setLoading(false);
            }
          });
      };

      initialTimer = setTimeout(() => {
        runGeneration(2); // Start with 2 retries allowed
      }, delay);

      return () => {
        active = false;
        clearTimeout(initialTimer);
        clearTimeout(retryTimer);
      };
    } else {
      setLoading(false);
    }
  }, [prompt, fallbackUrl, label, styleHint, delay]);

  return (
    <div className="image-card">
      <div className="image-container" style={{ position: 'relative', minHeight: 200, background: 'var(--bg-glass)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div className="image-skeleton" style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1
          }} />
        ) : (
          imgSrc && (
            <img
              src={imgSrc}
              alt={label}
              style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }}
            />
          )
        )}
      </div>

      <div className="image-footer" style={{ justifyContent: 'space-between' }}>
        <span className="image-label">🖼 {label}</span>
        <a
          href={imgSrc}
          download={`${label}.jpg`}
          target="_blank"
          rel="noreferrer"
          className="btn-download"
        >
          ↓ Download
        </a>
      </div>
    </div>
  );
}

/**
 * Full results dashboard — renders all campaign sections.
 */
export default function ResultsDashboard({ data }) {
  const [publishing, setPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!data) return null;

  // Use optional chaining and defaults for maximum safety
  const blog_post = data.blog_post || {};
  const tweets = data.social_media?.tweets || [];
  const seo = data.seo_metadata || {};

  const handleAutoPublishClick = () => {
    if (isLoggedIn) {
      startPublishingPipeline('LinkedIn');
    } else {
      setShowLogin(true);
    }
  };

  const startPublishingPipeline = async (platform) => {
    setShowLogin(false);
    setIsLoggedIn(true);
    setPublishing(true);

    setPublishStep(`Launching ${platform} in a real browser window...`);

    try {
      const content = platform === 'Twitter' ? (tweets[0]?.text || '') : (blog_post.title + '\n\n' + blog_post.body);

      const response = await fetch(`http://localhost:8000/publish?platform=${platform}&content=${encodeURIComponent(content)}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to start publisher');

      const steps = [
        'Launching browser instance...',
        'Please log in manually in the opened window...',
        'Once logged in, the AI will inject the content.',
        'Success! Automation is active.'
      ];

      for (const step of steps) {
        setPublishStep(step);
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      setPublishStep('Error: ' + err.message);
    }

    setPublishing(false);
  };

  return (
    <section className="dashboard-fade-in" style={{ paddingBottom: 100 }}>
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={(platform) => {
          setShowLogin(false);
          setIsLoggedIn(true);
          startPublishingPipeline(platform);
        }}
      />

      <div className="container">
        {/* ── Section A: Header ── */}
        <div className="campaign-header">
          <h1 className="campaign-title text-gradient">{data.campaign_title || 'New Marketing Campaign'}</h1>
          <div className="campaign-meta">
            <span className="meta-badge audience">
              👥 {data.target_audience || 'General Audience'}
            </span>
            <span className="meta-badge voice">
              🎯 {data.brand_voice || 'Professional'}
            </span>
          </div>
        </div>

        {/* ── Section B: Blog Post ── */}
        <div className="blog-card">
          <div className="section-header">
            <div className="section-icon blog">📝</div>
            <h2 className="section-title">Blog Post</h2>
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {blog_post.title || 'Draft Article'}
          </h3>

          <p className="blog-meta-desc">{blog_post.meta_description || 'No description provided.'}</p>

          <div className="blog-body markdown-content">
            {blog_post.body ? (
              <ReactMarkdown>{blog_post.body}</ReactMarkdown>
            ) : (
              <p>Generating content...</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            <a href="#" className="btn-cta" onClick={(e) => e.preventDefault()}>
              {blog_post.cta || 'Learn More'} →
            </a>

            <button
              className="btn-generate"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--accent-cyan)' }}
              onClick={handleAutoPublishClick}
              disabled={publishing}
            >
              {publishing ? '🚀 ' + publishStep : '🔗 Auto Publish with Playwright'}
            </button>
          </div>
        </div>

        {/* ── Section C: Tweets ── */}
        <div className="section-header">
          <div className="section-icon tweets">🐦</div>
          <h2 className="section-title">Tweet Variants</h2>
        </div>
        <div className="tweets-grid">
          {tweets.length > 0 ? tweets.map((tweet) => (
            <div key={tweet.variant} className="tweet-card" id={`tweet-variant-${tweet.variant}`}>
              <div className="tweet-variant">
                ✦ Variant {tweet.variant}
              </div>
              <p className="tweet-text">{tweet.text || 'Generating tweet...'}</p>
              <div className="tweet-hashtags">
                {(tweet.hashtags || []).map((tag) => (
                  <span key={tag} className="hashtag-pill">
                    #{tag.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            </div>
          )) : <p>No tweets generated.</p>}
        </div>

        <div className="section-divider" />

        {/* ── Section D: SEO ── */}
        <div className="seo-card">
          <div className="section-header">
            <div className="section-icon seo">🔍</div>
            <h2 className="section-title">SEO Metadata</h2>
          </div>

          <div className="seo-grid">
            <div>
              <p className="seo-block-label">Primary Keyword</p>
              <span className="primary-keyword-badge" id="primary-keyword">
                🏷 {seo.primary_keyword || 'N/A'}
              </span>
            </div>

            <div>
              <p className="seo-block-label">Secondary Keywords</p>
              <div className="secondary-keywords">
                {(seo.secondary_keywords || []).length > 0 ? (seo.secondary_keywords || []).map((kw) => (
                  <span key={kw} className="keyword-pill">{kw}</span>
                )) : <span>None</span>}
              </div>
            </div>

            <div>
              <p className="seo-block-label">Meta Title</p>
              <div className="meta-title-display" id="seo-meta-title">
                {seo.meta_title || 'No SEO title generated.'}
              </div>
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* ── Section E: AI Model Comparison Gallery (6 Images) ── */}
        <div className="section-header">
          <div className="section-icon images">🎨</div>
          <h2 className="section-title">Promotional Images</h2>
        </div>
        <div className="images-grid">
          {(() => {
            const imagePrompts = data.image_prompts || [];
            const labels = [
              "Hero Shot",
              "Lifestyle",
              "Product Close-Up",
              "Social Media Banner",
              "Editorial",
              "Cinematic"
            ];
            const fallbackPrompt = data.campaign_title || data.seo_metadata?.primary_keyword || "marketing campaign";

            // Generate exactly 6 cards using AI prompts where available
            return Array.from({ length: 6 }, (_, i) => {
              const defaultPrompt = `A professional ${labels[i]} for a marketing campaign titled "${data.campaign_title || fallbackPrompt}", targeting "${data.target_audience || 'general audience'}", style matches "${data.brand_voice || 'modern'}", containing absolutely no humans or people`;
              return (
                <ImageCard
                  key={i}
                  prompt={imagePrompts[i] || defaultPrompt}
                  fallbackUrl=""
                  label={labels[i]}
                  styleHint="ultra high quality, 8k, commercial photography"
                  delay={200 + i * 800}
                />
              );
            });
          })()}
        </div>

        <div className="section-divider" />

        {/* ── Section F: Contact Detail ── */}
        <div className="input-card" style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="hero-eyebrow">🚀 CONTACT & CONSULTATION</div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
            <a href="mailto:himashree966@gmail.com" className="btn-generate" style={{ background: 'var(--gradient-hero)' }}>
              📧 Apply via Email
            </a>
            <a href="tel:+917022989390" className="btn-generate" style={{ background: 'var(--bg-glass)', border: '1px solid var(--accent-purple)' }}>
              📞 Book 15-Min Career Chat
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
