/**
 * Electron App - Main Entry Point
 * Demonstrates consumption of @scaling-memory/shared package
 */

import {
  LoggerFactory,
  LogLevel,
  ConfigBuilder,
  Environment,
  createAnalysisJob,
  JobType,
  JobPriority,
  MarketDataSerializer,
  TimeInterval,
  DataSource,
  MessageBuilder,
  MessageType,
  InMemoryMessageBus,
  Topics,
  TaskBuilder,
  TaskExecutionMode,
  type Logger,
  type AppConfig,
  type Candle,
  type AnalysisJob,
  type MessageBus,
} from '@scaling-memory/shared';

class ElectronApp {
  private logger: Logger;
  private config: AppConfig;
  private messageBus: MessageBus;

  constructor() {
    this.config = this.initializeConfig();
    this.logger = this.initializeLogger();
    this.messageBus = new InMemoryMessageBus();
    this.setupMessageHandlers();
  }

  private initializeConfig(): AppConfig {
    return new ConfigBuilder()
      .withName('electron-app')
      .withVersion('0.0.1')
      .withEnvironment(Environment.DEVELOPMENT)
      .withLogging({
        level: 'debug',
        format: 'text',
        destination: 'console',
      })
      .withFeatures({
        marketData: true,
        analysis: true,
        notifications: true,
      })
      .build();
  }

  private initializeLogger(): Logger {
    return LoggerFactory.createConsoleLogger({
      minLevel: LogLevel.DEBUG,
      format: 'text',
    });
  }

  private setupMessageHandlers(): void {
    this.messageBus.subscribe(Topics.MARKET_DATA, {
      handle: async (message) => {
        this.logger.info('Market data received', { topic: message.topic });
      },
      canHandle: (message) => message.type === MessageType.EVENT,
    });

    this.messageBus.subscribe(Topics.ANALYSIS_JOB, {
      handle: async (message) => {
        this.logger.info('Analysis job received', { jobId: message.payload });
      },
      canHandle: () => true,
    });
  }

  async start(): Promise<void> {
    this.logger.info('Starting Electron app', {
      name: this.config.name,
      version: this.config.version,
    });

    await this.processMarketData();
    await this.createAnalysisTask();
    await this.scheduleBackgroundTask();

    this.logger.info('Electron app started successfully');
  }

  private async processMarketData(): Promise<void> {
    const candle: Candle = {
      timestamp: Date.now(),
      open: 50000,
      high: 51000,
      low: 49500,
      close: 50500,
      volume: 100,
      symbol: 'BTC/USD',
      interval: TimeInterval.HOUR_1,
    };

    const serialized = MarketDataSerializer.serializeCandle(candle);
    const deserialized = MarketDataSerializer.deserializeCandle(serialized);

    this.logger.debug('Market data processed', {
      symbol: deserialized.symbol,
      close: deserialized.close,
    });

    const event = MessageBuilder.event(
      Topics.MARKET_DATA,
      { candle: deserialized },
      'electron-app'
    ).build();

    await this.messageBus.publish(event);
  }

  private async createAnalysisTask(): Promise<void> {
    const job: AnalysisJob = createAnalysisJob(
      JobType.TECHNICAL_ANALYSIS,
      {
        symbol: 'BTC/USD',
        indicators: ['RSI', 'MACD', 'BB'],
        timeframe: '1h',
      },
      {
        priority: JobPriority.HIGH,
        metadata: { source: 'user-request' },
      }
    );

    this.logger.info('Analysis job created', {
      jobId: job.id,
      type: job.type,
    });

    const message = MessageBuilder.event(Topics.ANALYSIS_JOB, job.id, 'electron-app').build();
    await this.messageBus.publish(message);
  }

  private async scheduleBackgroundTask(): Promise<void> {
    const task = new TaskBuilder()
      .withName('market-data-sync')
      .withSchedule({
        mode: TaskExecutionMode.RECURRING,
        interval: 60000,
      })
      .withInput({ source: 'exchange-api' })
      .withTimeout(30000)
      .withRetry(3, 1000)
      .build();

    this.logger.debug('Background task scheduled', {
      taskId: task.id,
      name: task.name,
    });
  }
}

console.log('Electron app consuming @scaling-memory/shared package');
console.log('This demonstrates that the shared package can be imported and used without duplication');

const app = new ElectronApp();
app.start().catch((error) => {
  console.error('Failed to start app:', error);
  process.exit(1);
});
