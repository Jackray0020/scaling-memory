chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeData') {
    const data = scrapePageData(request.selectors);
    sendResponse({ success: true, data });
  } else if (request.action === 'getPageContent') {
    const content = getPageContent();
    sendResponse({ success: true, content });
  } else if (request.action === 'executeCustomScript') {
    try {
      const result = executeCustomScript(request.script);
      sendResponse({ success: true, result });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true;
});

function scrapePageData(selectors) {
  const data = {};
  
  if (!selectors || typeof selectors !== 'object') {
    return getPageContent();
  }
  
  for (const [key, selector] of Object.entries(selectors)) {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 1) {
        data[key] = elements[0].textContent.trim();
      } else if (elements.length > 1) {
        data[key] = Array.from(elements).map(el => el.textContent.trim());
      } else {
        data[key] = null;
      }
    } catch (error) {
      data[key] = `Error: ${error.message}`;
    }
  }
  
  return data;
}

function getPageContent() {
  return {
    title: document.title,
    url: window.location.href,
    text: document.body.innerText,
    html: document.documentElement.outerHTML,
    metadata: {
      description: document.querySelector('meta[name="description"]')?.content || '',
      keywords: document.querySelector('meta[name="keywords"]')?.content || '',
      author: document.querySelector('meta[name="author"]')?.content || ''
    },
    links: Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.textContent.trim(),
      href: a.href
    })).slice(0, 100),
    images: Array.from(document.querySelectorAll('img')).map(img => ({
      alt: img.alt,
      src: img.src
    })).slice(0, 50)
  };
}

function executeCustomScript(script) {
  const scriptFunction = new Function(script);
  return scriptFunction();
}

console.log('LLM Task Scheduler content script loaded');
