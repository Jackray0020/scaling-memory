import { LLMConfig, LLMProvider, LLMResponse } from './types';

/**
 * Abstract base class for LLM providers
 */
export abstract class LLMProviderBase {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  abstract sendRequest(prompt: string): Promise<LLMResponse>;

  protected buildSystemPrompt(): string {
    return `You are an expert financial analyst AI that specializes in trading insights.
When analyzing web content, provide:
1. A concise summary (2-3 sentences)
2. Key insights (3-5 bullet points)
3. Trading signals if applicable (bullish/bearish/neutral with confidence 0-1)

Format your response as JSON with keys: summary, insights (array), tradingSignals (array of {type, confidence, description})`;
  }

  protected async parseResponse(content: string): Promise<LLMResponse> {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return {
          content: jsonMatch[0],
        };
      }
      return {
        content,
      };
    } catch (error) {
      throw new Error(`Failed to parse LLM response: ${error}`);
    }
  }
}

/**
 * OpenAI provider implementation
 */
export class OpenAIProvider extends LLMProviderBase {
  async sendRequest(prompt: string): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model || 'gpt-4',
          messages: [
            {
              role: 'system',
              content: this.buildSystemPrompt(),
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return {
        content: data.choices[0].message.content,
        usage: {
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
        },
        model: data.model,
      };
    } catch (error) {
      throw new Error(`OpenAI request failed: ${error}`);
    }
  }
}

/**
 * Claude provider implementation
 */
export class ClaudeProvider extends LLMProviderBase {
  async sendRequest(prompt: string): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      throw new Error('Claude API key not configured');
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model || 'claude-3-opus-20240229',
          max_tokens: this.config.maxTokens || 1000,
          system: this.buildSystemPrompt(),
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return {
        content: data.content[0].text,
        usage: {
          inputTokens: data.usage.input_tokens,
          outputTokens: data.usage.output_tokens,
        },
        model: data.model,
      };
    } catch (error) {
      throw new Error(`Claude request failed: ${error}`);
    }
  }
}

/**
 * Gemini provider implementation
 */
export class GeminiProvider extends LLMProviderBase {
  async sendRequest(prompt: string): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model || 'gemini-pro'}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${this.buildSystemPrompt()}\n\n${prompt}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: this.config.temperature || 0.7,
              maxOutputTokens: this.config.maxTokens || 1000,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return {
        content: data.candidates[0].content.parts[0].text,
        model: this.config.model || 'gemini-pro',
      };
    } catch (error) {
      throw new Error(`Gemini request failed: ${error}`);
    }
  }
}

/**
 * Local provider for testing (mock implementation)
 */
export class LocalProvider extends LLMProviderBase {
  async sendRequest(prompt: string): Promise<LLMResponse> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock response
    const response = {
      summary: 'This is a mock analysis of the provided content.',
      insights: [
        'Key point 1 extracted from content',
        'Key point 2 extracted from content',
        'Key point 3 extracted from content',
      ],
      tradingSignals: [
        {
          type: 'neutral',
          confidence: 0.5,
          description: 'Mock trading signal for testing',
        },
      ],
    };

    return {
      content: JSON.stringify(response),
      model: 'local-mock',
    };
  }
}

/**
 * Provider factory for creating appropriate provider instances
 */
export class LLMProviderFactory {
  static createProvider(config: LLMConfig): LLMProviderBase {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'claude':
        return new ClaudeProvider(config);
      case 'gemini':
        return new GeminiProvider(config);
      case 'local':
        return new LocalProvider(config);
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }
}
