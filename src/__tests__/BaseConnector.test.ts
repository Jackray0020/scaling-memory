import { BaseConnector } from '../connectors/BaseConnector';
import { FinancialData, ConnectorConfig } from '../core/types';

class TestConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config);
  }

  async fetch(): Promise<FinancialData[]> {
    return this.fetchWithCache('test', async () => {
      return [
        {
          id: 'test_1',
          source: 'test',
          type: 'market',
          timestamp: new Date(),
          data: {
            symbol: 'TEST',
            price: 100,
            change: 5,
            changePercent: 5,
          },
        },
      ];
    });
  }
}

describe('BaseConnector', () => {
  let connector: TestConnector;

  beforeEach(() => {
    connector = new TestConnector({
      name: 'TestConnector',
      cacheEnabled: true,
      cacheTTL: 1000,
      rateLimit: 100,
    });
  });

  afterEach(() => {
    connector.clearCache();
  });

  test('should create connector with default config', () => {
    expect(connector.getName()).toBe('TestConnector');
  });

  test('should fetch data successfully', async () => {
    const data = await connector.fetch();
    expect(data).toHaveLength(1);
    expect(data[0].source).toBe('test');
    expect(data[0].data.symbol).toBe('TEST');
  });

  test('should use cache on second fetch', async () => {
    const data1 = await connector.fetch();
    const data2 = await connector.fetch();
    
    expect(data1[0].id).toBe(data2[0].id);
  });

  test('should clear cache', async () => {
    await connector.fetch();
    connector.clearCache();
    
    const data = await connector.fetch();
    expect(data).toHaveLength(1);
  });

  test('should enforce rate limit', async () => {
    const start = Date.now();
    await connector.fetch();
    connector.clearCache();
    await connector.fetch();
    const duration = Date.now() - start;
    
    expect(duration).toBeGreaterThanOrEqual(100);
  });
});
