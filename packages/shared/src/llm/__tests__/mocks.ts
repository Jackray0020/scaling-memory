/**
 * Mock implementations for testing
 */

import {
  ProviderAdapter,
  LLMConfig,
  Message,
  LLMResponse,
  LLMRequestOptions,
  ProviderType
} from '../types';

export class MockProviderAdapter implements ProviderAdapter {
  private providerName: ProviderType;
  private responses: Map<string, string> = new Map();
  private callCount: number = 0;
  private shouldFail: boolean = false;

  constructor(providerName: ProviderType = 'openai') {
    this.providerName = providerName;
    this.initializeResponses();
  }

  private initializeResponses(): void {
    this.responses.set(
      'analyze',
      'This is a mock analysis result from ' + this.providerName
    );
    this.responses.set(
      'question',
      'This is a mock answer from ' + this.providerName
    );
  }

  getProviderName(): ProviderType {
    return this.providerName;
  }

  async complete(
    messages: Message[],
    options?: LLMRequestOptions
  ): Promise<LLMResponse> {
    if (this.shouldFail) {
      throw new Error('Mock provider error');
    }

    this.callCount++;

    const lastMessage = messages[messages.length - 1]?.content || '';
    const responseKey = lastMessage.toLowerCase().includes('analysis') ? 'analyze' : 'question';
    const content = this.responses.get(responseKey) || 'Mock response';

    return {
      content,
      model: `mock-${this.providerName}-model`,
      provider: this.providerName,
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30
      },
      finishReason: 'stop'
    };
  }

  async stream(
    messages: Message[],
    onChunk: (chunk: string) => void,
    options?: LLMRequestOptions
  ): Promise<LLMResponse> {
    if (this.shouldFail) {
      throw new Error('Mock provider streaming error');
    }

    this.callCount++;

    const lastMessage = messages[messages.length - 1]?.content || '';
    const responseKey = lastMessage.toLowerCase().includes('analysis') ? 'analyze' : 'question';
    const fullContent = this.responses.get(responseKey) || 'Mock streamed response';

    // Simulate streaming by sending chunks
    const chunkSize = 5;
    for (let i = 0; i < fullContent.length; i += chunkSize) {
      const chunk = fullContent.slice(i, i + chunkSize);
      onChunk(chunk);
      // Simulate async behavior
      await new Promise((resolve) => setImmediate(resolve));
    }

    return {
      content: fullContent,
      model: `mock-${this.providerName}-model`,
      provider: this.providerName,
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30
      },
      finishReason: 'stop'
    };
  }

  async validateConfig(config: LLMConfig): Promise<boolean> {
    return !this.shouldFail && !!config.apiKey;
  }

  async healthCheck(): Promise<boolean> {
    return !this.shouldFail;
  }

  // Test helpers
  setResponse(key: string, response: string): void {
    this.responses.set(key, response);
  }

  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  getCallCount(): number {
    return this.callCount;
  }

  reset(): void {
    this.callCount = 0;
    this.shouldFail = false;
    this.initializeResponses();
  }
}
