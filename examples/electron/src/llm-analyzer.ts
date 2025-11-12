/**
 * LLM Analyzer Example for Electron
 * Demonstrates using the LLM layer for content analysis
 */

import {
  LLMClient,
  createLLMClient,
  LLMConfig,
  OpenAIAdapter,
  AnthropicAdapter,
  getProviderRegistry,
  getLLMConfig,
  resetProviderRegistry
} from '@scaling-memory/shared';

/**
 * Initialize LLM providers
 */
export async function initializeLLM(provider: 'openai' | 'anthropic'): Promise<LLMClient> {
  // Reset registry for clean state
  resetProviderRegistry();
  const registry = getProviderRegistry();

  // Register OpenAI adapter
  try {
    const openaiConfig = getLLMConfig('openai');
    registry.register('openai', new OpenAIAdapter(openaiConfig));
  } catch (error) {
    console.warn('OpenAI not configured:', (error as Error).message);
  }

  // Register Anthropic adapter
  try {
    const anthropicConfig = getLLMConfig('anthropic');
    registry.register('anthropic', new AnthropicAdapter(anthropicConfig));
  } catch (error) {
    console.warn('Anthropic not configured:', (error as Error).message);
  }

  // Create client with selected provider
  const config = getLLMConfig(provider as any);
  return createLLMClient(config);
}

/**
 * Analyze content using LLM
 */
export async function analyzeContent(
  client: LLMClient,
  content: string,
  analysisType: 'summary' | 'sentiment' | 'keywords' | 'custom',
  customPrompt?: string
): Promise<string> {
  let prompt = '';

  switch (analysisType) {
    case 'summary':
      prompt = 'Please provide a concise summary of the following content.';
      break;
    case 'sentiment':
      prompt = 'Please analyze the sentiment of the following content and provide an assessment.';
      break;
    case 'keywords':
      prompt = 'Please extract and list the key themes and keywords from the following content.';
      break;
    case 'custom':
      prompt = customPrompt || 'Please analyze the following content.';
      break;
  }

  const response = await client.analyze(content, prompt);
  return response.content;
}

/**
 * Stream analysis for long-running operations
 */
export async function streamAnalyzeContent(
  client: LLMClient,
  content: string,
  analysisType: string,
  onChunk: (chunk: string) => void
): Promise<any> {
  const prompt = `Please analyze the following content:\n\n${content}`;

  return client.stream(
    [
      {
        role: 'system',
        content: 'You are a helpful AI assistant for analyzing content.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    onChunk
  );
}

/**
 * Compare results from multiple providers
 */
export async function compareProviders(
  content: string,
  analysisPrompt: string
): Promise<{ openai: string; anthropic: string }> {
  const results: { openai?: string; anthropic?: string } = {};

  // Analyze with OpenAI
  try {
    const openaiClient = await initializeLLM('openai');
    const response = await openaiClient.analyze(content, analysisPrompt);
    results.openai = response.content;
  } catch (error) {
    console.error('OpenAI analysis failed:', (error as Error).message);
    results.openai = 'Error: ' + (error as Error).message;
  }

  // Analyze with Anthropic
  try {
    const anthropicClient = await initializeLLM('anthropic');
    const response = await anthropicClient.analyze(content, analysisPrompt);
    results.anthropic = response.content;
  } catch (error) {
    console.error('Anthropic analysis failed:', (error as Error).message);
    results.anthropic = 'Error: ' + (error as Error).message;
  }

  return {
    openai: results.openai || 'Not available',
    anthropic: results.anthropic || 'Not available'
  };
}

/**
 * Mock analysis for development/testing
 */
export async function mockAnalyzeContent(
  content: string,
  analysisType: string
): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  switch (analysisType) {
    case 'summary':
      return `Summary: This content discusses ${content.split(' ').slice(0, 5).join(' ')}...`;
    case 'sentiment':
      return 'Sentiment: Neutral with positive undertones';
    case 'keywords':
      const words = content.split(' ').slice(0, 5);
      return `Keywords: ${words.join(', ')}`;
    default:
      return `Analysis: ${content.substring(0, 100)}...`;
  }
}
