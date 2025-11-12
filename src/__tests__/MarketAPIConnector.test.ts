import axios from 'axios';
import { MarketAPIConnector } from '../connectors/MarketAPIConnector';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MarketAPIConnector', () => {
  let connector: MarketAPIConnector;

  beforeEach(() => {
    connector = new MarketAPIConnector({
      name: 'MarketAPI',
      symbols: ['AAPL'],
      cacheEnabled: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch and normalize market data', async () => {
    const mockResponse = {
      data: {
        chart: {
          result: [
            {
              meta: {
                regularMarketPrice: 150.0,
                regularMarketOpen: 148.0,
                regularMarketDayHigh: 151.0,
                regularMarketDayLow: 147.0,
                regularMarketVolume: 1000000,
                chartPreviousClose: 145.0,
                currency: 'USD',
                exchangeName: 'NASDAQ',
                marketState: 'REGULAR',
              },
              indicators: {
                quote: [
                  {
                    close: [150.0],
                    open: [148.0],
                    high: [151.0],
                    low: [147.0],
                    volume: [1000000],
                  },
                ],
              },
            },
          ],
        },
      },
    };

    mockedAxios.get.mockResolvedValue(mockResponse);

    const data = await connector.fetch();

    expect(data).toHaveLength(1);
    expect(data[0].type).toBe('market');
    expect(data[0].data.symbol).toBe('AAPL');
    expect(data[0].data.price).toBe(150.0);
    expect(data[0].data.change).toBe(5.0);
  });

  test('should handle API errors gracefully', async () => {
    mockedAxios.get.mockRejectedValue(new Error('API Error'));

    const data = await connector.fetch();

    expect(data).toHaveLength(0);
  });
});
