import { BaseConnector } from '../src/connectors/BaseConnector';
import { FinancialData, ConnectorConfig } from '../src/core/types';
import axios from 'axios';

export class CryptoConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super({
      name: 'CryptoAPI',
      endpoint: 'https://api.coinbase.com/v2/prices',
      rateLimit: 1000,
      ...config,
    });
  }

  async fetch(): Promise<FinancialData[]> {
    const cryptos = this.config.cryptos || ['BTC-USD', 'ETH-USD', 'SOL-USD'];
    const results: FinancialData[] = [];

    for (const crypto of cryptos) {
      try {
        const data = await this.fetchCrypto(crypto);
        results.push(data);
      } catch (error) {
        console.error(`Error fetching ${crypto}:`, error);
      }
    }

    return results;
  }

  private async fetchCrypto(symbol: string): Promise<FinancialData> {
    const cacheKey = `crypto_${symbol}`;

    const rawData = await this.fetchWithCache(cacheKey, async () => {
      const url = `${this.config.endpoint}/${symbol}/spot`;
      const response = await axios.get(url, {
        timeout: this.config.timeout,
      });
      return response.data;
    });

    const price = parseFloat(rawData.data.amount);

    return {
      id: this.generateId('crypto', symbol),
      source: this.config.name,
      type: 'market',
      timestamp: new Date(),
      data: {
        symbol: symbol,
        price: price,
        change: 0,
        changePercent: 0,
        metadata: {
          currency: rawData.data.currency,
          base: rawData.data.base,
        },
      },
    };
  }
}

if (require.main === module) {
  const connector = new CryptoConnector({
    name: 'CryptoAPI',
    cryptos: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'DOGE-USD'],
  });

  connector
    .fetch()
    .then((data) => {
      console.log('Crypto Data:');
      data.forEach((item) => {
        const market = item.data as any;
        console.log(`${market.symbol}: $${market.price.toFixed(2)}`);
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
