import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from './api';
import InputSection from './components/InputSection';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import ResultsDashboard from './components/ResultsDashboard';

const POLL_INTERVAL_MS = 2000;

function App() {
  const [appState, setAppState] = useState('idle'); // idle | processing | complete | failed
  const [taskId, setTaskId] = useState(null);
  const [step, setStep] = useState('');
  const [campaignData, setCampaignData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pollIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // ── Clear all intervals ──
  const clearIntervals = useCallback(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, []);

  // ── Start elapsed timer ──
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  // ── Poll task status ──
  const startPolling = useCallback(
    (id) => {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const result = await api.getStatus(id);

          if (result.status === 'processing') {
            setStep(result.step || 'Working...');
          } else if (result.status === 'complete') {
            clearIntervals();
            setCampaignData(result.data);
            setAppState('complete');
          } else if (result.status === 'failed') {
            clearIntervals();
            setErrorMsg(result.error || 'Unknown error');
            setAppState('failed');
          }
        } catch (err) {
          console.error('[poll] Error fetching status:', err);
        }
      }, POLL_INTERVAL_MS);
    },
    [clearIntervals]
  );

  // ── Handle form submission ──
  const handleSubmit = useCallback(
    async (brief, model) => {
      try {
        clearIntervals();
        setAppState('processing');
        setStep('Queuing your campaign...');
        setCampaignData(null);
        setErrorMsg('');
        startTimer();

        const { task_id } = await api.generateCampaign(brief, model);
        setTaskId(task_id);
        startPolling(task_id);
      } catch (err) {
        clearIntervals();
        setErrorMsg(err?.response?.data?.detail || err.message || 'Failed to start task');
        setAppState('failed');
      }
    },
    [clearIntervals, startTimer, startPolling]
  );

  // ── Reset ──
  const handleReset = useCallback(() => {
    clearIntervals();
    setAppState('idle');
    setTaskId(null);
    setStep('');
    setCampaignData(null);
    setErrorMsg('');
    setElapsedSeconds(0);
  }, [clearIntervals]);

  // Cleanup on unmount
  useEffect(() => () => clearIntervals(), [clearIntervals]);

  const isProcessing = appState === 'processing';

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-logo" onClick={handleReset} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">⚡</div>
            <span className="text-gradient">ContentEngine</span>
          </div>
          <div className="navbar-actions">
            <span className="navbar-badge">AI-Powered</span>
          </div>
        </div>
      </nav>

      {/* ── Hero / Input ── */}
      <div className="container">
        <InputSection onSubmit={handleSubmit} isProcessing={isProcessing} />
      </div>

      {/* ── Loading ── */}
      {appState === 'processing' && (
        <div className="container">
          <LoadingState step={step} elapsedSeconds={elapsedSeconds} />
        </div>
      )}

      {/* ── Error ── */}
      {appState === 'failed' && (
        <div className="container">
          <ErrorState error={errorMsg} onRetry={handleReset} />
        </div>
      )}

      {/* ── Results ── */}
      {appState === 'complete' && campaignData && (
        <ResultsDashboard data={campaignData} />
      )}

      {/* ── Footer ── */}
      <footer className="footer">
        <p>ContentEngine · AI Marketing System · Built for Scale</p>
      </footer>
    </>
  );
}

export default App;
