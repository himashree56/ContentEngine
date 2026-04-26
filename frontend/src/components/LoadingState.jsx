/**
 * Animated loading state with progress bar, step message, and elapsed timer.
 */
export default function LoadingState({ step, elapsedSeconds }) {
  return (
    <div className="loading-card">
      <div className="loading-orb">🚀</div>

      <p className="loading-step">{step || 'Queuing your campaign...'}</p>

      <p className="loading-timer">
        ⏱ Elapsed: {elapsedSeconds}s
      </p>

      <div className="progress-bar-track">
        <div className="progress-bar-fill" />
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12 }}>
        AI is crafting your copy and generating images in parallel
      </p>
    </div>
  );
}
