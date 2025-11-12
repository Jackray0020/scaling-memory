import axios from 'axios';
import { BaseConnector } from './BaseConnector';
import { FinancialData, MarketData, ConnectorConfig } from '../core/types';

export class MarketAPIConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super({
      name: 'MarketAPI',
      endpoint: 'https://query1.finance.yahoo.com/v8/finance/chart',
      rateLimit: 2000,
      ...config,
    });
  }

  async fetch(): Promise<FinancialData[]> {
    const symbols = this.config.symbols || ['AAPL', 'GOOGL', 'MSFT'];
    const results: FinancialData[] = [];

    for (const symbol of symbols) {
      try {
        const data = await this.fetchSymbol(symbol);
        results.push(data);
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
      }
    }

    return results;
  }

  private async fetchSymbol(symbol: string): Promise<FinancialData> {
    const cacheKey = `market_${symbol}`;

    const rawData = await this.fetchWithCache(cacheKey, async () => {
      const url = `${this.config.endpoint}/${symbol}`;
      const response = await axios.get(url, {
        timeout: this.config.timeout,
        params: {
          interval: '1d',
          range: '1d',
        },
      });

      return response.data;
    });

    const marketData = this.normalizeData(symbol, rawData);

    return {
      id: this.generateId('market', symbol),
      source: this.config.name,
      type: 'market',
      timestamp: new Date(),
      data: marketData,
    };
  }

  private normalizeData(symbol: string, rawData: any): MarketData {
    try {
      const result = rawData.chart?.result?.[0];
      const quote = result?.indicators?.quote?.[0];
      const meta = result?.meta;

      const close = quote?.close?.[quote.close.length - 1] || meta?.regularMarketPrice || 0;
      const open = quote?.open?.[0] || meta?.regularMarketOpen || close;
      const high = quote?.high?.[0] || meta?.regularMarketDayHigh || close;
      const low = quote?.low?.[0] || meta?.regularMarketDayLow || close;
      const volume = quote?.volume?.[0] || meta?.regularMarketVolume || 0;

      const change = close - (meta?.chartPreviousClose || open);
      const changePercent = (change / (meta?.chartPreviousClose || open)) * 100;

      return {
        symbol,
        price: close,
        change,
        changePercent,
        volume,
        high,
        low,
        open,
        close,
        metadata: {
          currency: meta?.currency,
          exchange: meta?.exchangeName,
          marketState: meta?.marketState,
        },
      };
    } catch (error) {
      console.error(`Error normalizing data for ${symbol}:`, error);
      return {
        symbol,
        price: 0,
        change: 0,
        changePercent: 0,
      };
    }
  }
}
