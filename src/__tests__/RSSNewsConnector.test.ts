import Parser from 'rss-parser';
import { RSSNewsConnector } from '../connectors/RSSNewsConnector';

jest.mock('rss-parser');

describe('RSSNewsConnector', () => {
  let connector: RSSNewsConnector;

  beforeEach(() => {
    connector = new RSSNewsConnector({
      name: 'RSSNews',
      feeds: ['https://example.com/rss'],
      cacheEnabled: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch and normalize RSS news', async () => {
    const mockFeed = {
      items: [
        {
          title: 'Test News 1',
          link: 'https://example.com/news1',
          pubDate: '2024-01-01T00:00:00Z',
          contentSnippet: 'This is test news',
          categories: ['finance', 'markets'],
        },
        {
          title: 'Test News 2',
          link: 'https://example.com/news2',
          isoDate: '2024-01-02T00:00:00Z',
          description: 'Another test news',
        },
      ],
    };

    const mockParser = {
      parseURL: jest.fn().mockResolvedValue(mockFeed),
    };

    (Parser as jest.MockedClass<typeof Parser>).mockImplementation(() => mockParser as any);

    connector = new RSSNewsConnector({
      name: 'RSSNews',
      feeds: ['https://example.com/rss'],
      cacheEnabled: false,
    });

    const data = await connector.fetch();

    expect(data).toHaveLength(2);
    expect(data[0].type).toBe('news');
    expect(data[0].data.title).toBe('Test News 1');
    expect(data[0].data.url).toBe('https://example.com/news1');
    expect(data[0].data.tags).toEqual(['finance', 'markets']);
  });

  test('should handle feed errors gracefully', async () => {
    const mockParser = {
      parseURL: jest.fn().mockRejectedValue(new Error('Feed Error')),
    };

    (Parser as jest.MockedClass<typeof Parser>).mockImplementation(() => mockParser as any);

    connector = new RSSNewsConnector({
      name: 'RSSNews',
      feeds: ['https://example.com/rss'],
      cacheEnabled: false,
    });

    const data = await connector.fetch();

    expect(data).toHaveLength(0);
  });
});
