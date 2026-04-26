import { useState } from 'react';

/**
 * Single promotional image card with skeleton loader and download link.
 */
function ImageCard({ url, label }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="image-card">
      {!loaded && <div className="image-skeleton" aria-label="Loading image..." />}
      <img
        src={url}
        alt={label}
        style={{ display: loaded ? 'block' : 'none' }}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)} // also reveal on error so skeleton clears
      />
      <div className="image-footer">
        <span className="image-label">🖼 {label}</span>
        <a
          href={url}
          download
          target="_blank"
          rel="noreferrer"
          className="btn-download"
          id={`download-${label.toLowerCase().replace(/\s+/g, '-')}`}
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
  const { blog_post, tweets, seo } = data;

  // Render blog body paragraphs split by \n
  const blogParagraphs = (blog_post.body || '').split('\n').filter(Boolean);

  return (
    <section className="results-section">
      <div className="container">

        {/* ── Section A: Campaign Header ── */}
        <div className="campaign-header">
          <h1 className="campaign-title text-gradient">{data.campaign_title}</h1>
          <div className="campaign-meta">
            <span className="meta-badge audience">
              👥 {data.target_audience}
            </span>
            <span className="meta-badge voice">
              🎯 {data.brand_voice}
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
            {blog_post.title}
          </h3>

          <p className="blog-meta-desc">{blog_post.meta_description}</p>

          <div className="blog-body">
            {blogParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <button className="btn-cta" id="blog-cta-btn">
            {blog_post.cta} →
          </button>
        </div>

        {/* ── Section C: Tweets ── */}
        <div className="section-header">
          <div className="section-icon tweets">🐦</div>
          <h2 className="section-title">Tweet Variants</h2>
        </div>
        <div className="tweets-grid">
          {(tweets || []).map((tweet) => (
            <div key={tweet.variant} className="tweet-card" id={`tweet-variant-${tweet.variant}`}>
              <div className="tweet-variant">
                ✦ Variant {tweet.variant}
              </div>
              <p className="tweet-text">{tweet.text}</p>
              <div className="tweet-hashtags">
                {(tweet.hashtags || []).map((tag) => (
                  <span key={tag} className="hashtag-pill">
                    #{tag.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            </div>
          ))}
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
                🏷 {seo.primary_keyword}
              </span>
            </div>

            <div>
              <p className="seo-block-label">Secondary Keywords</p>
              <div className="secondary-keywords">
                {(seo.secondary_keywords || []).map((kw) => (
                  <span key={kw} className="keyword-pill">{kw}</span>
                ))}
              </div>
            </div>

            <div>
              <p className="seo-block-label">Meta Title</p>
              <div className="meta-title-display" id="seo-meta-title">
                {seo.meta_title}
              </div>
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* ── Section E: Generated Images ── */}
        <div className="section-header">
          <div className="section-icon images">🎨</div>
          <h2 className="section-title">Promotional Images</h2>
        </div>
        <div className="images-grid">
          <ImageCard url={data.image_url_1} label="Image 1" />
          <ImageCard url={data.image_url_2} label="Image 2" />
        </div>

      </div>
    </section>
  );
}
