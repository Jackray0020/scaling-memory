/**
 * Content script for extracting page content
 */

/**
 * Get current page content
 */
function getPageContent() {
  return {
    url: window.location.href,
    title: document.title,
    html: document.documentElement.outerHTML,
    text: document.body.innerText,
  };
}

/**
 * Listen for analysis requests from popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'get-page-content') {
    const content = getPageContent();
    sendResponse({ success: true, data: content });
  }

  if (request.type === 'extract-selected') {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      sendResponse({
        success: true,
        data: {
          selectedText: selection.toString(),
          url: window.location.href,
          title: document.title,
        },
      });
    } else {
      sendResponse({ success: false, error: 'No text selected' });
    }
  }
});

// Inject a script to enable content extraction
const script = document.createElement('script');
script.textContent = `
  window.getPageData = function() {
    return {
      url: window.location.href,
      title: document.title,
      content: document.body.innerText,
      html: document.documentElement.outerHTML
    };
  };
`;
document.documentElement.appendChild(script);
script.remove();
