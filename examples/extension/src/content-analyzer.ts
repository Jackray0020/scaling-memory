/**
 * Content Analyzer Example for Browser Extension
 * Demonstrates using the LLM layer for web page analysis
 */

import {
  LLMClient,
  createLLMClient,
  getLLMConfig,
  OpenAIAdapter,
  AnthropicAdapter,
  getProviderRegistry,
  resetProviderRegistry
} from '@scaling-memory/shared';

/**
 * Extract text content from web page
 */
export function extractPageContent(): string {
  const body = document.body;
  const textContent = body.innerText.substring(0, 5000); // Limit to 5000 chars
  return textContent;
}

/**
 * Initialize LLM for extension
 */
export async function initializeLLMForExtension(
  provider: 'openai' | 'anthropic' = 'openai'
): Promise<LLMClient> {
  resetProviderRegistry();
  const registry = getProviderRegistry();

  // Register providers
  try {
    const openaiConfig = getLLMConfig('openai');
    registry.register('openai', new OpenAIAdapter(openaiConfig));
  } catch (error) {
    console.warn('OpenAI not configured');
  }

  try {
    const anthropicConfig = getLLMConfig('anthropic');
    registry.register('anthropic', new AnthropicAdapter(anthropicConfig));
  } catch (error) {
    console.warn('Anthropic not configured');
  }

  const config = getLLMConfig(provider);
  return createLLMClient(config);
}

/**
 * Analyze current page
 */
export async function analyzeCurrentPage(
  client: LLMClient,
  analysisType: 'summary' | 'main-ideas' | 'sentiment' = 'summary'
): Promise<string> {
  const content = extractPageContent();
  const pageTitle = document.title;

  let prompt = '';
  switch (analysisType) {
    case 'summary':
      prompt = `Summarize the following web page content in 2-3 sentences:\n\n${content}`;
      break;
    case 'main-ideas':
      prompt = `Identify the 3-5 main ideas or topics discussed in this content:\n\n${content}`;
      break;
    case 'sentiment':
      prompt = `Analyze the overall sentiment of this content:\n\n${content}`;
      break;
  }

  const response = await client.complete([
    {
      role: 'user',
      content: prompt
    }
  ]);

  return response.content;
}

/**
 * Stream analysis for UI updates
 */
export async function streamAnalyzeCurrentPage(
  client: LLMClient,
  analysisType: string,
  onChunk: (chunk: string) => void,
  onComplete?: (fullContent: string) => void
): Promise<void> {
  const content = extractPageContent();
  const pageTitle = document.title;

  const prompt =
    analysisType === 'summary'
      ? `Summarize this web page: ${content}`
      : `Analyze this web page: ${content}`;

  let fullContent = '';

  await client.stream(
    [
      {
        role: 'user',
        content: prompt
      }
    ],
    (chunk) => {
      fullContent += chunk;
      onChunk(chunk);
    }
  );

  if (onComplete) {
    onComplete(fullContent);
  }
}

/**
 * Create sidebar UI for analysis
 */
export function createAnalysisSidebar(): HTMLElement {
  const sidebar = document.createElement('div');
  sidebar.id = 'llm-analyzer-sidebar';
  sidebar.style.cssText = `
    position: fixed;
    right: 0;
    top: 0;
    width: 400px;
    height: 100vh;
    background: white;
    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  const header = document.createElement('div');
  header.style.cssText =
    'padding: 16px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 16px;';
  header.textContent = 'LLM Analysis';

  const controls = document.createElement('div');
  controls.style.cssText = 'padding: 12px; border-bottom: 1px solid #eee; display: flex; gap: 8px;';

  const summaryBtn = document.createElement('button');
  summaryBtn.textContent = 'Summary';
  summaryBtn.style.cssText =
    'flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;';

  const ideasBtn = document.createElement('button');
  ideasBtn.textContent = 'Ideas';
  ideasBtn.style.cssText =
    'flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;';

  const sentimentBtn = document.createElement('button');
  sentimentBtn.textContent = 'Sentiment';
  sentimentBtn.style.cssText =
    'flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;';

  controls.appendChild(summaryBtn);
  controls.appendChild(ideasBtn);
  controls.appendChild(sentimentBtn);

  const content = document.createElement('div');
  content.id = 'llm-analysis-content';
  content.style.cssText = 'flex: 1; padding: 16px; overflow-y: auto; font-size: 14px;';
  content.textContent = 'Click a button to analyze...';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText =
    'position: absolute; top: 8px; right: 8px; background: none; border: none; font-size: 20px; cursor: pointer;';
  closeBtn.onclick = () => sidebar.remove();

  sidebar.appendChild(header);
  sidebar.appendChild(controls);
  sidebar.appendChild(content);
  sidebar.appendChild(closeBtn);

  return sidebar;
}

/**
 * Add analysis button to page
 */
export function addAnalysisButton(): void {
  const button = document.createElement('button');
  button.id = 'llm-analyzer-btn';
  button.textContent = '🤖 Analyze';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 16px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 24px;
    cursor: pointer;
    font-weight: bold;
    z-index: 9999;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  `;

  button.onmouseover = () => {
    button.style.background = '#45a049';
  };

  button.onmouseout = () => {
    button.style.background = '#4CAF50';
  };

  button.onclick = () => {
    const existing = document.getElementById('llm-analyzer-sidebar');
    if (existing) {
      existing.remove();
    } else {
      const sidebar = createAnalysisSidebar();
      document.body.appendChild(sidebar);
    }
  };

  document.body.appendChild(button);
}

/**
 * Main extension entry point
 */
export async function initializeExtension(): Promise<void> {
  // Add button to page
  addAnalysisButton();

  // Listen for messages from background script
  // @ts-ignore - chrome is a global in extension context
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    // @ts-ignore - chrome is a global in extension context
    chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
      if (request.action === 'analyze') {
        analyzeCurrentPage(request.client, request.analysisType)
          .then((result) => {
            sendResponse({ success: true, result });
          })
          .catch((error) => {
            sendResponse({ success: false, error: (error as Error).message });
          });
        return true; // Keep channel open for async response
      }
    });
  }
}

// Auto-initialize when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}
