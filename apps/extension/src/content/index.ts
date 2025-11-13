import {
  MessageType,
  PageContent,
  PageInfo,
  createMessage,
  onMessage,
  sendMessageToBackground,
} from '@scaling-memory/shared';

console.log('[Scaling Memory] Content script loaded');

function extractPageContent(): PageContent {
  const metaDescription = document.querySelector('meta[name="description"]');
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  const metaAuthor = document.querySelector('meta[name="author"]');

  const content: PageContent = {
    url: window.location.href,
    title: document.title,
    textContent: document.body.innerText,
    html: document.documentElement.outerHTML,
    metadata: {
      description: metaDescription?.getAttribute('content') || undefined,
      keywords: metaKeywords?.getAttribute('content')?.split(',').map(k => k.trim()) || undefined,
      author: metaAuthor?.getAttribute('content') || undefined,
    },
  };

  return content;
}

function getPageInfo(): PageInfo {
  const favicon = document.querySelector<HTMLLinkElement>('link[rel*="icon"]');

  return {
    url: window.location.href,
    title: document.title,
    favicon: favicon?.href,
    timestamp: Date.now(),
  };
}

onMessage((message, sender, sendResponse) => {
  console.log('[Content Script] Received message:', message.type);

  switch (message.type) {
    case MessageType.GET_PAGE_INFO: {
      const pageInfo = getPageInfo();
      sendResponse(pageInfo);
      break;
    }

    case MessageType.CAPTURE_PAGE_CONTENT: {
      const content = extractPageContent();
      console.log('[Content Script] Page content captured:', {
        url: content.url,
        title: content.title,
        textLength: content.textContent.length,
        hasMetadata: !!content.metadata,
      });

      sendMessageToBackground(
        createMessage(MessageType.CONTENT_CAPTURED, content)
      ).then(() => {
        console.log('[Content Script] Content sent to background');
        sendResponse({ success: true });
      });

      return true;
    }

    default:
      console.log('[Content Script] Unknown message type:', message.type);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Scaling Memory] DOM fully loaded, page scraper hooks active');
});

if (document.readyState === 'complete') {
  console.log('[Scaling Memory] Page already loaded, page scraper hooks active');
}
