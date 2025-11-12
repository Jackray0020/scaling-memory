import React, { useState, useEffect } from 'react';
import {
  AnalysisResult,
  SessionHistory,
  LLMProvider,
} from '@ai-browsing/core';
import AnalysisPanel from './components/AnalysisPanel';
import SessionPanel from './components/SessionPanel';
import ProviderSettings from './components/ProviderSettings';
import './App.css';

interface AppState {
  currentSession: string | null;
  sessions: SessionHistory[];
  currentProvider: LLMProvider;
  analysisResults: AnalysisResult[];
  isLoading: boolean;
  error: string | null;
  showSettings: boolean;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentSession: null,
    sessions: [],
    currentProvider: 'local',
    analysisResults: [],
    isLoading: false,
    error: null,
    showSettings: false,
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const result = await window.browsing.listSessions();
      if (result.success) {
        setState(prev => ({
          ...prev,
          sessions: result.data || [],
        }));
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleAnalyze = async (pageContent: {
    url: string;
    title: string;
    content: string;
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Create or use current session
      let sessionId = state.currentSession;
      if (!sessionId) {
        const newSessionId = `session_${Date.now()}`;
        const createResult = await window.browsing.createSession(newSessionId, state.currentProvider);
        if (createResult.success) {
          sessionId = newSessionId;
          setState(prev => ({ ...prev, currentSession: sessionId }));
        }
      }

      const request = {
        content: {
          url: pageContent.url,
          title: pageContent.title,
          content: pageContent.content,
        },
        provider: state.currentProvider,
        sessionId: sessionId || undefined,
      };

      const result = await window.browsing.analyzePage(request);
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          analysisResults: [...prev.analysisResults, result.data!],
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Analysis failed',
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      }));
    }
  };

  const handleProviderChange = (provider: LLMProvider) => {
    setState(prev => ({ ...prev, currentProvider: provider }));
  };

  const handleSessionSelect = (sessionId: string) => {
    setState(prev => ({ ...prev, currentSession: sessionId }));
  };

  const handleClearSession = async (sessionId: string) => {
    try {
      const result = await window.browsing.clearSession(sessionId);
      if (result.success) {
        await loadSessions();
        setState(prev => ({
          ...prev,
          currentSession: prev.currentSession === sessionId ? null : prev.currentSession,
          analysisResults: [],
        }));
      }
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Browsing Analysis</h1>
        <button
          className="settings-btn"
          onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
        >
          ⚙️ Settings
        </button>
      </header>

      <div className="app-container">
        {state.showSettings && (
          <ProviderSettings
            currentProvider={state.currentProvider}
            onProviderChange={handleProviderChange}
            onClose={() => setState(prev => ({ ...prev, showSettings: false }))}
          />
        )}

        <div className="main-content">
          <AnalysisPanel
            isLoading={state.isLoading}
            onAnalyze={handleAnalyze}
            error={state.error}
            results={state.analysisResults}
          />

          <SessionPanel
            sessions={state.sessions}
            currentSessionId={state.currentSession}
            onSessionSelect={handleSessionSelect}
            onClearSession={handleClearSession}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
