import React from 'react';
import { SessionHistory } from '@ai-browsing/core';
import './SessionPanel.css';

interface SessionPanelProps {
  sessions: SessionHistory[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onClearSession: (sessionId: string) => void;
}

const SessionPanel: React.FC<SessionPanelProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onClearSession,
}) => {
  return (
    <div className="session-panel">
      <h2>Sessions</h2>

      <div className="sessions-list">
        {sessions.length === 0 ? (
          <p className="empty">No sessions yet</p>
        ) : (
          sessions.map(session => (
            <div
              key={session.sessionId}
              className={`session-item ${currentSessionId === session.sessionId ? 'active' : ''}`}
              onClick={() => onSessionSelect(session.sessionId)}
            >
              <div className="session-header">
                <span className="session-id">{session.sessionId}</span>
                <span className="provider-badge">{session.provider}</span>
              </div>

              <div className="session-info">
                <span className="entry-count">{session.entries.length} entries</span>
                <span className="date">
                  {new Date(session.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="session-entries">
                {session.entries.slice(0, 3).map((entry: any, idx: number) => (
                  <div key={idx} className="entry-preview">
                    <small>{entry.title}</small>
                  </div>
                ))}
                {session.entries.length > 3 && (
                  <small className="more">+{session.entries.length - 3} more</small>
                )}
              </div>

              <button
                className="delete-btn"
                onClick={e => {
                  e.stopPropagation();
                  if (confirm('Delete this session?')) {
                    onClearSession(session.sessionId);
                  }
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionPanel;
