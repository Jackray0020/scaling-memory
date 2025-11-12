import { Database } from './core/database';
import { Scheduler } from './scheduler/Scheduler';
import { MarketAPIConnector, RSSNewsConnector, WebScraperConnector } from './connectors';
import { JobConfig } from './core/types';

export class FinancialDataIngestion {
  private database: Database;
  private scheduler: Scheduler;

  constructor(dbPath?: string) {
    this.database = new Database(dbPath);
    this.scheduler = new Scheduler(this.database);
    this.initializeConnectors();
  }

  private initializeConnectors(): void {
    const marketConnector = new MarketAPIConnector({
      name: 'MarketAPI',
      symbols: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'],
      cacheEnabled: true,
      cacheTTL: 60000,
    });

    const rssConnector = new RSSNewsConnector({
      name: 'RSSNews',
      feeds: [
        'https://feeds.bloomberg.com/markets/news.rss',
        'https://www.cnbc.com/id/100003114/device/rss/rss.html',
      ],
      cacheEnabled: true,
      cacheTTL: 300000,
    });

    const scraperConnector = new WebScraperConnector({
      name: 'WebScraper',
      urls: ['https://finance.yahoo.com/news/'],
      cacheEnabled: true,
      cacheTTL: 600000,
    });

    this.scheduler.registerConnector(marketConnector);
    this.scheduler.registerConnector(rssConnector);
    this.scheduler.registerConnector(scraperConnector);
  }

  scheduleJobs(): void {
    const jobs: JobConfig[] = [
      {
        id: 'market_data_job',
        name: 'Market Data Collection',
        connectorName: 'MarketAPI',
        schedule: '*/5 * * * *',
        enabled: true,
      },
      {
        id: 'rss_news_job',
        name: 'RSS News Collection',
        connectorName: 'RSSNews',
        schedule: '*/15 * * * *',
        enabled: true,
      },
      {
        id: 'web_scraper_job',
        name: 'Web Scraper Collection',
        connectorName: 'WebScraper',
        schedule: '*/30 * * * *',
        enabled: true,
      },
    ];

    jobs.forEach((job) => this.scheduler.scheduleJob(job));
    console.log('All jobs scheduled successfully');
  }

  async getMarketData(limit: number = 50) {
    return await this.database.getFinancialData('market', limit);
  }

  async getNewsData(limit: number = 50) {
    return await this.database.getFinancialData('news', limit);
  }

  async getAllData(limit: number = 100) {
    return await this.database.getFinancialData(undefined, limit);
  }

  async getJobResults(jobId?: string, limit: number = 50) {
    return await this.database.getJobResults(jobId, limit);
  }

  getScheduler(): Scheduler {
    return this.scheduler;
  }

  getDatabase(): Database {
    return this.database;
  }

  shutdown(): void {
    this.scheduler.stopAll();
    this.database.close();
    console.log('Application shutdown complete');
  }
}

if (require.main === module) {
  const app = new FinancialDataIngestion();
  app.scheduleJobs();

  process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    app.shutdown();
    process.exit(0);
  });

  console.log('Financial Data Ingestion System Started');
  console.log('Press Ctrl+C to stop');
}

export default FinancialDataIngestion;
