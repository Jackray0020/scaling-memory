/**
 * Browser Extension App - Main Entry Point
 * Demonstrates consumption of @scaling-memory/shared package
 */

import {
  LoggerFactory,
  LogLevel,
  ConfigBuilder,
  Environment,
  MarketDataSerializer,
  TimeInterval,
  createAnalysisJob,
  JobType,
  JobPriority,
  JobSerializer,
  MessageBuilder,
  MessagePriority,
  Topics,
  TaskBuilder,
  TaskExecutionMode,
  TaskPriority,
  HttpMethod,
  HttpStatus,
  UrlBuilder,
  Headers,
  ContentType,
  type Logger,
  type AppConfig,
  type MarketDataSnapshot,
  type LlmProvider,
  type CompletionOptions,
  type MessageRole,
} from '@scaling-memory/shared';

class ExtensionApp {
  private logger: Logger;
  private config: AppConfig;

  constructor() {
    this.config = this.initializeConfig();
    this.logger = this.initializeLogger();
  }

  private initializeConfig(): AppConfig {
    return new ConfigBuilder()
      .withName('extension-app')
      .withVersion('0.0.1')
      .withEnvironment(Environment.DEVELOPMENT)
      .withLogging({
        level: 'info',
        format: 'json',
        destination: 'console',
      })
      .withApi({
        baseUrl: 'https://api.example.com',
        timeout: 5000,
        retryAttempts: 3,
      })
      .withFeatures({
        realTimeData: true,
        llmIntegration: true,
        backgroundSync: true,
      })
      .build();
  }

  private initializeLogger(): Logger {
    return LoggerFactory.createConsoleLogger({
      minLevel: LogLevel.INFO,
      format: 'json',
    });
  }

  async start(): Promise<void> {
    this.logger.info('Starting extension app', {
      name: this.config.name,
      version: this.config.version,
    });

    await this.handleMarketDataSnapshot();
    await this.scheduleAnalysisJob();
    await this.demonstrateHttpUtils();
    await this.demonstrateMessaging();

    this.logger.info('Extension app initialized successfully');
  }

  private async handleMarketDataSnapshot(): Promise<void> {
    const snapshot: MarketDataSnapshot = {
      symbol: 'ETH/USD',
      timestamp: Date.now(),
      lastPrice: 3000,
      candles: [
        {
          timestamp: Date.now() - 3600000,
          open: 2950,
          high: 3050,
          low: 2900,
          close: 3000,
          volume: 1000,
          symbol: 'ETH/USD',
          interval: TimeInterval.HOUR_1,
        },
      ],
      volume24h: 50000,
      priceChange24h: 2.5,
    };

    const serialized = MarketDataSerializer.serializeSnapshot(snapshot);
    const deserialized = MarketDataSerializer.deserializeSnapshot(serialized);

    this.logger.info('Market snapshot processed', {
      symbol: deserialized.symbol,
      price: deserialized.lastPrice,
      change24h: deserialized.priceChange24h,
    });
  }

  private async scheduleAnalysisJob(): Promise<void> {
    const job = createAnalysisJob(
      JobType.SENTIMENT_ANALYSIS,
      {
        sources: ['twitter', 'reddit', 'news'],
        keywords: ['ethereum', 'eth', 'defi'],
        startDate: Date.now() - 86400000,
        endDate: Date.now(),
      },
      {
        priority: JobPriority.NORMAL,
        metadata: {
          requestedBy: 'extension-user',
          features: ['sentiment-score', 'trending-topics'],
        },
      }
    );

    const serialized = JobSerializer.serializeJob(job);
    const deserialized = JobSerializer.deserializeJob(serialized);

    this.logger.info('Sentiment analysis scheduled', {
      jobId: deserialized.id,
      status: deserialized.status,
    });

    const task = new TaskBuilder()
      .withName('sentiment-analysis-task')
      .withPriority(TaskPriority.HIGH)
      .withSchedule({
        mode: TaskExecutionMode.DELAYED,
        delay: 5000,
      })
      .withInput(job.parameters)
      .withTimeout(60000)
      .build();

    this.logger.debug('Task created for analysis', { taskId: task.id });
  }

  private async demonstrateHttpUtils(): Promise<void> {
    const apiUrl = new UrlBuilder(this.config.api!.baseUrl)
      .path('v1', 'market', 'data')
      .query({
        symbol: 'BTC/USD',
        interval: '1h',
        limit: 100,
      })
      .build();

    const headers = {
      ...Headers.contentType(ContentType.JSON),
      ...Headers.accept(ContentType.JSON),
      ...Headers.authorization('api-key-123'),
    };

    this.logger.info('HTTP request prepared', {
      url: apiUrl,
      method: HttpMethod.GET,
      expectedStatus: HttpStatus.OK,
    });
  }

  private async demonstrateMessaging(): Promise<void> {
    const notification = MessageBuilder.event(
      Topics.SYSTEM_EVENT,
      {
        type: 'extension-loaded',
        timestamp: Date.now(),
        features: Object.keys(this.config.features || {}),
      },
      'extension-app'
    )
      .withPriority(MessagePriority.NORMAL)
      .withMetadata({
        version: this.config.version,
        environment: this.config.environment,
      })
      .build();

    const serialized = JSON.stringify(notification);
    this.logger.debug('System event notification created', {
      messageId: notification.id,
      topic: notification.topic,
    });
  }

  demonstrateLlmProviderInterface(): void {
    const mockLlmProvider: Partial<LlmProvider> = {
      name: 'extension-llm-provider',
      async healthCheck() {
        return true;
      },
      async listModels() {
        return [
          {
            id: 'gpt-4',
            name: 'GPT-4',
            provider: 'openai',
            capabilities: {
              supportsStreaming: true,
              supportsVision: true,
              supportsFunctionCalling: true,
              supportsSystemMessages: true,
              maxTokens: 8192,
              maxContextWindow: 128000,
            },
          },
        ];
      },
    };

    this.logger.info('LLM provider interface demonstrated', {
      provider: mockLlmProvider.name,
    });
  }
}

console.log('Extension app consuming @scaling-memory/shared package');
console.log('This demonstrates that the same shared package works in both Electron and extension contexts');

const app = new ExtensionApp();
app.start().catch((error) => {
  console.error('Failed to start extension:', error);
});

app.demonstrateLlmProviderInterface();
