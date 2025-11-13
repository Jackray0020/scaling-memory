import { useState, useEffect } from 'react';
import {
  MessageType,
  createMessage,
  sendMessageToTab,
  PageInfo,
} from '@scaling-memory/shared';

function App() {
  const [currentPage, setCurrentPage] = useState<PageInfo | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState<string>('Ready');

  useEffect(() => {
    loadCurrentPageInfo();
  }, []);

  const loadCurrentPageInfo = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const response = await sendMessageToTab<PageInfo>(
          tab.id,
          createMessage(MessageType.GET_PAGE_INFO)
        );
        setCurrentPage(response);
      }
    } catch (error) {
      console.error('Failed to load page info:', error);
      setStatus('Error loading page info');
    }
  };

  const handleCaptureContent = async () => {
    setIsCapturing(true);
    setStatus('Capturing...');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await sendMessageToTab(
          tab.id,
          createMessage(MessageType.CAPTURE_PAGE_CONTENT)
        );
        setStatus('Content captured successfully!');
      }
    } catch (error) {
      console.error('Failed to capture content:', error);
      setStatus('Error capturing content');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>Scaling Memory</h1>
        <p className="subtitle">Page Content Capture</p>
      </header>

      <main className="popup-content">
        {currentPage && (
          <div className="page-info">
            <div className="info-row">
              <span className="label">Title:</span>
              <span className="value">{currentPage.title}</span>
            </div>
            <div className="info-row">
              <span className="label">URL:</span>
              <span className="value url">{currentPage.url}</span>
            </div>
          </div>
        )}

        <button
          className="capture-button"
          onClick={handleCaptureContent}
          disabled={isCapturing}
        >
          {isCapturing ? 'Capturing...' : 'Capture Page Content'}
        </button>

        <div className={`status ${status.includes('Error') ? 'error' : ''}`}>
          {status}
        </div>
      </main>

      <footer className="popup-footer">
        <p>v0.0.1</p>
      </footer>
    </div>
  );
}

export default App;
