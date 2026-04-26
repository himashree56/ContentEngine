import { useState } from 'react';

const TEXT_MODELS = [
  { value: 'openai/gpt-4o', label: 'GPT-4o (OpenAI)' },
  { value: 'anthropic/claude-sonnet-4-5', label: 'Claude Sonnet 4.5 (Anthropic)' },
];

/**
 * Hero input section with textarea + model selector + generate button.
 */
export default function InputSection({ onSubmit, isProcessing }) {
  const [brief, setBrief] = useState('');
  const [model, setModel] = useState(TEXT_MODELS[0].value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!brief.trim() || isProcessing) return;
    onSubmit(brief.trim(), model);
  };

  return (
    <section className="hero">
      <div className="hero-eyebrow">
        <span>✦</span>
        AI-Powered Marketing Engine
      </div>

      <h1>
        Turn a brief into a{' '}
        <span className="text-gradient">full campaign</span>
        <br />in seconds
      </h1>

      <p className="hero-subtitle">
        Generate blog posts, tweets, SEO metadata, and promotional images —
        all in parallel, powered by OpenRouter AI.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="input-card">
          <label className="input-label" htmlFor="campaign-brief">
            Campaign Brief
          </label>
          <textarea
            id="campaign-brief"
            className="input-textarea"
            placeholder="Describe your campaign brief... e.g. Launch campaign for sustainable bamboo water bottles targeting eco-conscious millennials"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            disabled={isProcessing}
            rows={5}
          />

          <div className="input-row">
            <div className="select-wrapper">
              <label className="input-label" htmlFor="model-select" style={{ marginBottom: 6 }}>
                AI Model
              </label>
              <select
                id="model-select"
                className="input-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={isProcessing}
              >
                {TEXT_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              id="generate-btn"
              type="submit"
              className="btn-generate"
              disabled={isProcessing || !brief.trim()}
            >
              {isProcessing ? (
                <>
                  <span className="btn-spinner" />
                  Generating...
                </>
              ) : (
                <>
                  <span>⚡</span>
                  Generate Campaign
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
