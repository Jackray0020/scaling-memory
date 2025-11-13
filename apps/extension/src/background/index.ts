import {
  MessageType,
  PageContent,
  onMessage,
} from '@scaling-memory/shared';

console.log('[Scaling Memory] Background service worker initialized');

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Background] Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    console.log('[Background] First time installation');
  } else if (details.reason === 'update') {
    console.log('[Background] Extension updated');
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('[Background] Tab activated:', activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('[Background] Page loaded:', {
      tabId,
      url: tab.url,
      title: tab.title,
    });
  }
});

onMessage((message, sender, sendResponse) => {
  console.log('[Background] Received message:', message.type, 'from tab:', sender.tab?.id);

  switch (message.type) {
    case MessageType.CONTENT_CAPTURED: {
      const content = message.payload as PageContent;
      console.log('[Background] Content captured:', {
        url: content.url,
        title: content.title,
        textLength: content.textContent.length,
        timestamp: message.timestamp,
      });

      chrome.storage.local.get(['capturedPages'], (result) => {
        const capturedPages = result.capturedPages || [];
        capturedPages.push({
          ...content,
          capturedAt: message.timestamp,
        });

        chrome.storage.local.set({ capturedPages }, () => {
          console.log('[Background] Content saved to storage. Total pages:', capturedPages.length);
        });
      });

      sendResponse({ success: true });
      break;
    }

    default:
      console.log('[Background] Unknown message type:', message.type);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Raw message received:', message);
  return false;
});
