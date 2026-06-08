/**
 * CohortPage — Full-screen page for cohort applications & career consultations.
 * Shows the full AI Campaign roadmap pipeline and contact actions.
 */
export default function CohortPage({ onBack }) {
  const pipeline = [
    {
      icon: '✦',
      title: 'Generate Campaign',
      desc: 'Enter a brief → AI creates blog post, tweets, SEO metadata, and 6 promotional images in parallel.',
      color: '#8b5cf6',
    },
    {
      icon: '🔗',
      title: 'Auto Publish (LinkedIn)',
      desc: 'One-click publishing pushes the full campaign to LinkedIn, scheduling posts at optimal engagement windows.',
      color: '#3b82f6',
    },
    {
      icon: '💬',
      title: 'User Engagement',
      desc: 'Track comments, clicks, shares, and reactions. AI surfaces the top-performing content in real time.',
      color: '#06b6d4',
    },
    {
      icon: '📋',
      title: 'Lead Capture',
      desc: 'Smart forms and DM funnels collect prospect details — name, email, intent — automatically into a pipeline.',
      color: '#10b981',
    },
    {
      icon: '🗄️',
      title: 'Store in DB (MongoDB)',
      desc: 'All leads, campaigns, and engagement metrics are persisted in MongoDB for history, analytics, and retargeting.',
      color: '#f59e0b',
    },
    {
      icon: '🧠',
      title: 'AI Optimization',
      desc: 'The engine learns what performs best — tone, format, visuals — and builds a personalized model for your brand.',
      color: '#ec4899',
    },
    {
      icon: '🚀',
      title: 'Regenerate Better Campaigns',
      desc: 'Insights loop back into generation. Every campaign is smarter than the last — compounding results over time.',
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="cohort-page">
      {/* Back button */}
      <button className="cohort-back-btn" onClick={onBack} id="cohort-back-btn">
        ← Back to Engine
      </button>

      {/* Hero */}
      <div className="cohort-hero">
        <div className="hero-eyebrow"><span>✦</span> Next Cohort Open</div>
        <h1>
          Build AI Systems That <span className="text-gradient">Market Themselves</span>
        </h1>
        <p className="cohort-hero-sub">
          Join the next cohort of the AI Content Marketing Engine programme — a hands-on sprint
          where you build, deploy, and launch a full autonomous marketing stack using real AI APIs,
          task queues, and production databases.
        </p>

        {/* CTA Buttons */}
        <div className="cohort-cta-row">
          <a
            href={`mailto:himashree966@gmail.com?subject=Cohort%20Application&body=Hi%2C%20I%20would%20like%20to%20apply%20for%20the%20next%20cohort.`}
            className="cohort-btn-primary"
            id="cohort-email-apply"
          >
            ✉ Apply via Email
          </a>
          <a
            href={`https://wa.me/917022989390?text=Hi%2C%20I%20saw%20the%20ContentEngine%20cohort%20and%20would%20like%20to%20book%20a%2015-minute%20career%20chat.`}
            target="_blank"
            rel="noreferrer"
            className="cohort-btn-secondary"
            id="cohort-whatsapp-chat"
          >
            📞 Book 15-Min Career Chat
          </a>
        </div>

        {/* Contact Cards */}
        <div className="cohort-contact-row">
          <div className="cohort-contact-card">
            <span className="cohort-contact-icon">📧</span>
            <div>
              <div className="cohort-contact-label">Email</div>
              <a href="mailto:himashree966@gmail.com" className="cohort-contact-value">

              </a>
            </div>
          </div>
          <div className="cohort-contact-card">
            <span className="cohort-contact-icon">📱</span>
            <div>
              <div className="cohort-contact-label">Phone / WhatsApp</div>
              <a href="tel:+917022989390" className="cohort-contact-value">
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Pipeline */}
      <div className="cohort-pipeline-section">
        <div className="cohort-section-label">
          <span>⚡</span> The Full Campaign Pipeline
        </div>
        <h2 className="cohort-pipeline-title">
          From a brief to a self-optimizing marketing machine
        </h2>
        <p className="cohort-pipeline-sub">
          This is what you'll build in the cohort — an end-to-end AI marketing system that
          generates, publishes, captures leads, and gets smarter with every campaign.
        </p>

        <div className="pipeline-steps">
          {pipeline.map((step, i) => (
            <div key={i} className="pipeline-step" id={`pipeline-step-${i + 1}`}>
              <div className="pipeline-connector">
                <div className="pipeline-dot" style={{ background: step.color, boxShadow: `0 0 16px ${step.color}55` }}>
                  <span className="pipeline-dot-icon">{step.icon}</span>
                </div>
                {i < pipeline.length - 1 && <div className="pipeline-line" />}
              </div>
              <div className="pipeline-card" style={{ borderColor: `${step.color}33` }}>
                <div className="pipeline-card-header">
                  <span className="pipeline-step-num" style={{ color: step.color }}>
                    Step {i + 1}
                  </span>
                  <h3 className="pipeline-card-title" style={{ color: step.color }}>
                    {step.title}
                  </h3>
                </div>
                <p className="pipeline-card-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What You'll Build */}
      <div className="cohort-build-section">
        <div className="cohort-section-label"><span>🛠</span> What You'll Build</div>
        <div className="cohort-build-grid">
          {[
            { icon: '⚡', title: 'FastAPI Backend', desc: 'REST APIs, Celery task queues, Redis broker' },
            { icon: '🤖', title: 'Multi-Model AI', desc: 'OpenRouter, Ollama local models, image generation' },
            { icon: '⚛️', title: 'React Frontend', desc: 'Real-time polling, results dashboard, rich UI' },
            { icon: '🗄️', title: 'MongoDB Integration', desc: 'Lead storage, campaign history, analytics' },
            { icon: '🔗', title: 'LinkedIn Publisher', desc: 'Auto-post campaigns at optimal engagement times' },
            { icon: '📊', title: 'AI Optimization Loop', desc: 'Learn from engagement, regenerate smarter campaigns' },
          ].map((item, i) => (
            <div key={i} className="cohort-build-card" id={`build-card-${i + 1}`}>
              <div className="build-card-icon">{item.icon}</div>
              <div className="build-card-title">{item.title}</div>
              <div className="build-card-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="cohort-footer-cta">
        <h2>Ready to build? Let's talk.</h2>
        <p>Reach out and get your personalized roadmap in under 48 hours.</p>
        <div className="cohort-cta-row">
          <a
            href={`mailto:himashree966@gmail.com?subject=Cohort%20Application`}
            className="cohort-btn-primary"
            id="cohort-footer-email"
          >
            ✉ Apply via Email
          </a>
          <a
            href={`https://wa.me/917022989390?text=Hi%2C%20I%20want%20to%20book%20a%2015-min%20career%20chat%20about%20the%20AI%20cohort.`}
            target="_blank"
            rel="noreferrer"
            className="cohort-btn-secondary"
            id="cohort-footer-whatsapp"
          >
            📞 Book 15-Min Career Chat
          </a>
        </div>
      </div>
    </div>
  );
}
