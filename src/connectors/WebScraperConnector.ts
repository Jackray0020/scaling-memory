import puppeteer, { Browser, Page } from 'puppeteer';
import { BaseConnector } from './BaseConnector';
import { FinancialData, NewsData, ConnectorConfig } from '../core/types';

export class WebScraperConnector extends BaseConnector {
  private browser: Browser | null = null;

  constructor(config: ConnectorConfig) {
    super({
      name: 'WebScraper',
      rateLimit: 3000,
      ...config,
    });
  }

  async fetch(): Promise<FinancialData[]> {
    const urls = this.config.urls || [
      'https://finance.yahoo.com/news/',
    ];

    try {
      await this.initBrowser();
      const results: FinancialData[] = [];

      for (const url of urls) {
        try {
          const items = await this.scrapeUrl(url);
          results.push(...items);
        } catch (error) {
          console.error(`Error scraping ${url}:`, error);
        }
      }

      return results;
    } finally {
      await this.closeBrowser();
    }
  }

  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
  }

  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async scrapeUrl(url: string): Promise<FinancialData[]> {
    const cacheKey = `scraper_${url}`;

    const scrapedData = await this.fetchWithCache(cacheKey, async () => {
      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      const page = await this.browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      );

      try {
        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: this.config.timeout,
        });

        const articles = await page.evaluate(() => {
          const items: any[] = [];
          const articleElements = document.querySelectorAll('article, .article, [data-test-locator="article"]');

          articleElements.forEach((article, index) => {
            if (index >= 10) return;

            const titleEl = article.querySelector('h2, h3, .title, [data-test-locator="headline"]');
            const linkEl = article.querySelector('a');
            const summaryEl = article.querySelector('p, .summary, .description');
            const timeEl = article.querySelector('time, .time, .date');

            if (titleEl && linkEl) {
              items.push({
                title: titleEl.textContent?.trim() || '',
                url: linkEl.href || '',
                summary: summaryEl?.textContent?.trim() || '',
                publishedAt: timeEl?.getAttribute('datetime') || timeEl?.textContent || '',
              });
            }
          });

          return items;
        });

        return articles;
      } finally {
        await page.close();
      }
    });

    return scrapedData.map((item: any) => {
      const newsData = this.normalizeData(item, url);
      return {
        id: this.generateId('scraped', item.url),
        source: this.config.name,
        type: 'news' as const,
        timestamp: new Date(),
        data: newsData,
      };
    });
  }

  private normalizeData(item: any, sourceUrl: string): NewsData {
    let publishedAt: Date;
    
    if (item.publishedAt) {
      const parsed = new Date(item.publishedAt);
      publishedAt = isNaN(parsed.getTime()) ? new Date() : parsed;
    } else {
      publishedAt = new Date();
    }

    return {
      title: item.title || 'Untitled',
      summary: item.summary || '',
      url: item.url || sourceUrl,
      publishedAt,
      source: sourceUrl,
      metadata: {
        scraped: true,
      },
    };
  }
}
