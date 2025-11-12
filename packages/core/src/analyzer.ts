import {
  AnalysisRequest,
  AnalysisResult,
  NormalizedContent,
  TradingSignal,
} from './types';
import { LLMProviderFactory } from './llm-provider';
import { ContentChunker } from './normalizer';

/**
 * BrowsingAnalyzer: Performs end-to-end analysis of page content
 */
export class BrowsingAnalyzer {
  /**
   * Analyze page content and generate summary with insights
   */
  static async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    const { content, provider, config, sessionId } = request;

    // Validate content
    if (!content.content || content.content.length === 0) {
      throw new Error('No content to analyze');
    }

    // Chunk content if needed
    const chunks = this.getContentChunks(content);
    const analysisChunks = chunks.length > 1 ? chunks : [{ content: content.content }];

    // Analyze chunks and aggregate results
    const results = await Promise.all(
      analysisChunks.map((chunk, idx) => 
        this.analyzeChunk(chunk.content, provider, config, idx, analysisChunks.length)
      )
    );

    // Aggregate results
    const aggregated = this.aggregateResults(results, content, chunks.length, sessionId || '', provider);

    return aggregated;
  }

  /**
   * Analyze individual chunk
   */
  private static async analyzeChunk(
    content: string,
    provider: string,
    config: any,
    chunkIndex: number,
    totalChunks: number
  ): Promise<any> {
    const providerConfig = {
      provider: provider as any,
      ...config,
    };

    const llmProvider = LLMProviderFactory.createProvider(providerConfig);

    const prompt = this.buildAnalysisPrompt(content, chunkIndex, totalChunks);
    const response = await llmProvider.sendRequest(prompt);

    return this.parseAnalysisResponse(response.content);
  }

  /**
   * Build analysis prompt
   */
  private static buildAnalysisPrompt(
    content: string,
    chunkIndex: number,
    totalChunks: number
  ): string {
    const chunkInfo = totalChunks > 1 ? `\n\n[Analyzing chunk ${chunkIndex + 1}/${totalChunks}]` : '';

    return `Analyze the following web page content and provide:
1. A concise summary (2-3 sentences)
2. Key trading/business insights (3-5 bullet points)
3. Trading signals if applicable

Content:
${content.substring(0, 4000)}${chunkInfo}

Respond in JSON format with keys: summary, insights (array of strings), tradingSignals (array of {type: "bullish"|"bearish"|"neutral", confidence: number 0-1, description: string})`;
  }

  /**
   * Parse analysis response from LLM
   */
  private static parseAnalysisResponse(content: string): any {
    try {
      // Try to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback to manual parsing
      return {
        summary: content.substring(0, 300),
        insights: [content.substring(0, 200)],
        tradingSignals: [],
      };
    } catch (error) {
      return {
        summary: content.substring(0, 300),
        insights: [content.substring(0, 200)],
        tradingSignals: [],
      };
    }
  }

  /**
   * Get content chunks
   */
  private static getContentChunks(content: NormalizedContent): any[] {
    const chunkSize = ContentChunker.getRecommendedChunkSize(content.content.length);
    const chunks = ContentChunker.chunkContent(content.content, chunkSize);
    return chunks;
  }

  /**
   * Aggregate results from multiple chunks
   */
  private static aggregateResults(
    results: any[],
    content: NormalizedContent,
    chunkCount: number,
    sessionId: string,
    provider: string
  ): AnalysisResult {
    if (results.length === 0) {
      throw new Error('No analysis results');
    }

    if (results.length === 1) {
      const result = results[0];
      return {
        sessionId: sessionId || this.generateSessionId(),
        url: content.url,
        title: content.title,
        summary: result.summary || '',
        insights: result.insights || [],
        tradingSignals: result.tradingSignals || [],
        timestamp: Date.now(),
        provider: provider as any,
        chunkCount,
      };
    }

    // Aggregate multiple chunk results
    const combinedSummary = results
      .map(r => r.summary)
      .filter(s => s)
      .join(' ')
      .substring(0, 500);

    const allInsights = results
      .flatMap(r => r.insights || [])
      .filter((v, i, a) => a.indexOf(v) === i) // Deduplicate
      .slice(0, 5);

    const combinedSignals = this.aggregateSignals(results.flatMap(r => r.tradingSignals || []));

    return {
      sessionId: sessionId || this.generateSessionId(),
      url: content.url,
      title: content.title,
      summary: combinedSummary,
      insights: allInsights,
      tradingSignals: combinedSignals,
      timestamp: Date.now(),
      provider: provider as any,
      chunkCount,
    };
  }

  /**
   * Aggregate trading signals from multiple chunks
   */
  private static aggregateSignals(signals: TradingSignal[]): TradingSignal[] {
    if (signals.length === 0) return [];

    // Group signals by type
    const grouped: Record<string, TradingSignal[]> = {};
    for (const signal of signals) {
      if (!grouped[signal.type]) {
        grouped[signal.type] = [];
      }
      grouped[signal.type].push(signal);
    }

    // Average confidence for each type
    const aggregated: TradingSignal[] = [];
    for (const [type, typeSignals] of Object.entries(grouped)) {
      const avgConfidence = typeSignals.reduce((sum, s) => sum + s.confidence, 0) / typeSignals.length;
      const descriptions = typeSignals.map(s => s.description).slice(0, 2);

      aggregated.push({
        type: type as 'bullish' | 'bearish' | 'neutral',
        confidence: avgConfidence,
        description: descriptions.join('; '),
        indicators: typeSignals.flatMap(s => s.indicators || []).slice(0, 3),
      });
    }

    return aggregated;
  }

  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
