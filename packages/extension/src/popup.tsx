import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AnalysisResult, SessionHistory, LLMProvider } from '@ai-browsing/core';
import './popup.css';

interface PopupState {
  loading: boolean;
  analyzing: boolean;
  error: string | null;
  result: AnalysisResult | null;
  sessions: SessionHistory[];
  currentSession: string | null;
  currentProvider: LLMProvider;
  showSettings: boolean;
}

const Popup: React.FC = () => {
  const [state, setState] = useState<PopupState>({
    loading: true,
    analyzing: false,
    error: null,
    result: null,
    sessions: [],
    currentSession: null,
    currentProvider: 'local',
    showSettings: false,
  });

  useEffect(() => {
    loadSessions();
    loadSettings();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'list-sessions' });
      if (response.success) {
        setState(prev => ({
          ...prev,
          sessions: response.data || [],
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const loadSettings = () => {
    const provider = (localStorage.getItem('currentProvider') as LLMProvider) || 'local';
    setState(prev => ({ ...prev, currentProvider: provider }));
  };

  const handleAnalyze = async () => {
    setState(prev => ({ ...prev, analyzing: true, error: null }));

    try {
      // Get page content from content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error('No active tab');

      const contentResponse = await chrome.tabs.sendMessage(tab.id, { type: 'get-page-content' });
      if (!contentResponse.success) throw new Error('Failed to get page content');

      // Create or use current session
      let sessionId = state.currentSession;
      if (!sessionId) {
        const newSessionId = `session_${Date.now()}`;
        const createResponse = await chrome.runtime.sendMessage({
          type: 'create-session',
          sessionId: newSessionId,
          provider: state.currentProvider,
        });
        if (createResponse.success) {
          sessionId = newSessionId;
          setState(prev => ({ ...prev, currentSession: sessionId }));
        }
      }

      // Analyze content
      const analysisResponse = await chrome.runtime.sendMessage({
        type: 'analyze',
        payload: {
          content: {
            url: contentResponse.data.url,
            title: contentResponse.data.title,
            content: contentResponse.data.text,
          },
          provider: state.currentProvider,
          sessionId,
        },
      });

      if (analysisResponse.success) {
        setState(prev => ({
          ...prev,
          result: analysisResponse.data,
          analyzing: false,
        }));
        await loadSessions();
      } else {
        throw new Error(analysisResponse.error || 'Analysis failed');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        analyzing: false,
      }));
    }
  };

  const handleProviderChange = (provider: LLMProvider) => {
    setState(prev => ({ ...prev, currentProvider: provider }));
    localStorage.setItem('currentProvider', provider);
  };

  const handleClearSession = async (sessionId: string) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'clear-session',
        sessionId,
      });
      if (response.success) {
        await loadSessions();
        if (state.currentSession === sessionId) {
          setState(prev => ({ ...prev, currentSession: null }));
        }
      }
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  if (state.loading) {
    return <div className="popup popup-loading">Loading...</div>;
  }

  return (
    <div className="popup">
      <div className="popup-header">
        <h2>AI Analyzer</h2>
        <button
          className="settings-icon"
          onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
        >
          ⚙️
        </button>
      </div>

      {state.showSettings && (
        <div className="settings-panel">
          <h3>Provider</h3>
          <div className="provider-options">
            {(['local', 'openai', 'claude', 'gemini'] as const).map(provider => (
              <label key={provider}>
                <input
                  type="radio"
                  name="provider"
                  value={provider}
                  checked={state.currentProvider === provider}
                  onChange={() => handleProviderChange(provider)}
                />
                {provider}
              </label>
            ))}
          </div>
        </div>
      )}

      {state.error && <div className="error">{state.error}</div>}

      <button
        className="analyze-btn"
        onClick={handleAnalyze}
        disabled={state.analyzing}
      >
        {state.analyzing ? 'Analyzing...' : 'Analyze Page'}
      </button>

      {state.result && (
        <div className="result">
          <h3>{state.result.title}</h3>
          <p className="summary">{state.result.summary}</p>

          {state.result.insights && state.result.insights.length > 0 && (
            <div className="insights">
              <strong>Insights:</strong>
              <ul>
                {state.result.insights.map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            </div>
          )}

          {state.result.tradingSignals && state.result.tradingSignals.length > 0 && (
            <div className="signals">
              <strong>Signals:</strong>
              {state.result.tradingSignals.map((signal, i) => (
                <div key={i} className={`signal signal-${signal.type}`}>
                  <span>{signal.type.toUpperCase()}</span>
                  <span>{Math.round(signal.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="sessions">
        <h3>Sessions ({state.sessions.length})</h3>
        {state.sessions.length === 0 ? (
          <p>No sessions</p>
        ) : (
          state.sessions.map(session => (
            <div key={session.sessionId} className="session-item">
              <div>
                <span className="session-id">{session.sessionId.substring(0, 20)}...</span>
                <span className="entry-count">{session.entries.length}</span>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleClearSession(session.sessionId)}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Popup />);
