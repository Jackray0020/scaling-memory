import Parser from 'rss-parser';
import { BaseConnector } from './BaseConnector';
import { FinancialData, NewsData, ConnectorConfig } from '../core/types';

export class RSSNewsConnector extends BaseConnector {
  private parser: Parser;

  constructor(config: ConnectorConfig) {
    super({
      name: 'RSSNews',
      rateLimit: 5000,
      ...config,
    });
    this.parser = new Parser({
      timeout: this.config.timeout,
    });
  }

  async fetch(): Promise<FinancialData[]> {
    const feeds = this.config.feeds || [
      'https://feeds.bloomberg.com/markets/news.rss',
      'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    ];

    const results: FinancialData[] = [];

    for (const feedUrl of feeds) {
      try {
        const items = await this.fetchFeed(feedUrl);
        results.push(...items);
      } catch (error) {
        console.error(`Error fetching RSS feed ${feedUrl}:`, error);
      }
    }

    return results;
  }

  private async fetchFeed(feedUrl: string): Promise<FinancialData[]> {
    const cacheKey = `rss_${feedUrl}`;

    const feed = await this.fetchWithCache(cacheKey, async () => {
      return await this.parser.parseURL(feedUrl);
    });

    return feed.items.slice(0, 10).map((item) => {
      const newsData = this.normalizeData(item, feedUrl);
      return {
        id: this.generateId('news', item.link || item.guid || ''),
        source: this.config.name,
        type: 'news' as const,
        timestamp: new Date(),
        data: newsData,
      };
    });
  }

  private normalizeData(item: any, feedUrl: string): NewsData {
    const publishedAt = item.pubDate
      ? new Date(item.pubDate)
      : item.isoDate
      ? new Date(item.isoDate)
      : new Date();

    return {
      title: item.title || 'Untitled',
      summary: item.contentSnippet || item.content || item.description || '',
      url: item.link || item.guid || '',
      publishedAt,
      source: feedUrl,
      tags: item.categories || [],
      metadata: {
        author: item.creator || item.author,
        guid: item.guid,
      },
    };
  }
}
