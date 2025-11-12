import React, { useState } from 'react';
import { AnalysisResult } from '@ai-browsing/core';
import './AnalysisPanel.css';

interface AnalysisPanelProps {
  isLoading: boolean;
  onAnalyze: (pageContent: { url: string; title: string; content: string }) => void;
  error: string | null;
  results: AnalysisResult[];
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  isLoading,
  onAnalyze,
  error,
  results,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleAnalyze = () => {
    if (!url || !content) {
      alert('Please enter URL and content');
      return;
    }
    onAnalyze({ url, title: title || 'Untitled', content });
  };

  const loadSamplePage = () => {
    setUrl('https://example.com/trading-news');
    setTitle('Latest Trading News');
    setContent(`
      Apple Inc. (AAPL) reported strong Q3 earnings, beating analyst expectations.
      The company's revenue increased 12% year-over-year, driven by strong iPhone sales.
      Services segment showed exceptional growth at 18% increase.
      
      Meanwhile, tech sector showed mixed signals with semiconductor shortages easing.
      NVIDIA's recent product launches have bolstered market sentiment.
      
      Investors are watching for potential interest rate changes next month.
      Several key economic indicators suggest possible inflation stabilization.
      
      This combination of strong corporate earnings and macro indicators presents
      interesting trading opportunities in the tech sector for the coming weeks.
    `);
  };

  return (
    <div className="analysis-panel">
      <h2>Content Analysis</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>URL:</label>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com"
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Page title"
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label>Content:</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste page content here..."
          rows={8}
          disabled={isLoading}
        />
      </div>

      <div className="button-group">
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="analyze-btn"
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
        <button
          onClick={loadSamplePage}
          disabled={isLoading}
          className="sample-btn"
        >
          Load Sample
        </button>
      </div>

      <div className="results">
        <h3>Results ({results.length})</h3>
        <div className="results-list">
          {results.map((result, idx) => (
            <div key={idx} className="result-item">
              <h4>{result.title}</h4>
              <p className="url">{result.url}</p>
              <p className="summary">{result.summary}</p>

              {result.insights && result.insights.length > 0 && (
                <div className="insights">
                  <strong>Insights:</strong>
                  <ul>
                    {result.insights.map((insight: string, i: number) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.tradingSignals && result.tradingSignals.length > 0 && (
                <div className="trading-signals">
                  <strong>Trading Signals:</strong>
                  {result.tradingSignals.map((signal: any, i: number) => (
                    <div key={i} className={`signal signal-${signal.type}`}>
                      <span className="type">{signal.type.toUpperCase()}</span>
                      <span className="confidence">({Math.round(signal.confidence * 100)}%)</span>
                      <p>{signal.description}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="metadata">
                <span className="provider">{result.provider}</span>
                <span className="time">{new Date(result.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
