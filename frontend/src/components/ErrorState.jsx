/**
 * Error state with message display and retry callback.
 */
export default function ErrorState({ error, onRetry }) {
  return (
    <div className="error-card">
      <div className="error-icon">⚠️</div>
      <h2 className="error-title">Campaign Generation Failed</h2>
      <p className="error-msg">{error || 'An unexpected error occurred.'}</p>
      <button id="retry-btn" className="btn-retry" onClick={onRetry}>
        ↺ Try Again
      </button>
    </div>
  );
}
