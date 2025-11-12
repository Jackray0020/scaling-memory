# Financial Data Ingestion System

A comprehensive financial data ingestion system with multi-source connectors, scheduling, caching, and UI dashboards.

## Features

- **Multi-Source Data Collection**
  - Market Data API (Yahoo Finance)
  - RSS News Feeds (Bloomberg, CNBC)
  - Web Scraping (Puppeteer)

- **Robust Architecture**
  - Configurable connectors with rate limiting
  - Intelligent caching system
  - Error handling and retry logic
  - SQLite local storage

- **Scheduling System**
  - Cron-based job scheduling
  - Automatic data collection
  - Job status tracking

- **User Interfaces**
  - Electron desktop application
  - Chrome extension
  - REST API

- **Testing**
  - Comprehensive unit tests
  - Mocked data sources
  - Integration tests

## Installation

```bash
npm install
```

## Usage

### Build the project

```bash
npm run build
```

### Run the main application

```bash
npm start
```

This starts the data ingestion system with scheduled jobs:
- Market data: Every 5 minutes
- RSS news: Every 15 minutes
- Web scraping: Every 30 minutes

### Run the API server

```bash
npm run dev
node dist/api/server.js
```

The API server runs on `http://localhost:3000` with the following endpoints:

- `GET /api/market?limit=50` - Get market data
- `GET /api/news?limit=50` - Get news data
- `GET /api/all?limit=100` - Get all data
- `GET /api/jobs?jobId=optional` - Get job results
- `GET /api/scheduled-jobs` - Get scheduled jobs list
- `GET /api/health` - Health check

### Run the Electron app

```bash
npm run electron
```

### Load the Chrome extension

1. Build the project: `npm run build`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `src/extension` directory

### Run tests

```bash
npm test
```

## Architecture

### Connectors

All connectors extend the `BaseConnector` class which provides:
- Caching with configurable TTL
- Rate limiting
- Retry logic with exponential backoff
- Error handling

#### MarketAPIConnector
Fetches real-time stock market data from Yahoo Finance API.

**Configuration:**
```typescript
{
  name: 'MarketAPI',
  symbols: ['AAPL', 'GOOGL', 'MSFT'],
  cacheEnabled: true,
  cacheTTL: 60000,
  rateLimit: 2000
}
```

#### RSSNewsConnector
Parses RSS feeds from financial news sources.

**Configuration:**
```typescript
{
  name: 'RSSNews',
  feeds: [
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://www.cnbc.com/id/100003114/device/rss/rss.html'
  ],
  cacheEnabled: true,
  cacheTTL: 300000,
  rateLimit: 5000
}
```

#### WebScraperConnector
Scrapes financial news from websites using Puppeteer.

**Configuration:**
```typescript
{
  name: 'WebScraper',
  urls: ['https://finance.yahoo.com/news/'],
  cacheEnabled: true,
  cacheTTL: 600000,
  rateLimit: 3000
}
```

### Data Model

All data is normalized into a common format:

```typescript
interface FinancialData {
  id: string;
  source: string;
  type: 'market' | 'news';
  timestamp: Date;
  data: MarketData | NewsData;
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  metadata?: Record<string, any>;
}

interface NewsData {
  title: string;
  summary?: string;
  url: string;
  publishedAt: Date;
  source?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}
```

### Database

SQLite database stores:
- Financial data (market and news)
- Job execution results
- Indexed by timestamp and type

### Scheduler

Cron-based scheduler manages automated data collection:
- Configurable schedules
- Job enable/disable
- Execution tracking
- Error logging

## Example Usage

### Programmatic Usage

```typescript
import FinancialDataIngestion from './src/index';

const app = new FinancialDataIngestion('./data.db');

// Schedule jobs
app.scheduleJobs();

// Get market data
const marketData = await app.getMarketData(20);
console.log(marketData);

// Get news data
const newsData = await app.getNewsData(30);
console.log(newsData);

// Get job results
const jobResults = await app.getJobResults();
console.log(jobResults);

// Shutdown
app.shutdown();
```

### Custom Connector

```typescript
import { BaseConnector } from './src/connectors/BaseConnector';
import { FinancialData } from './src/core/types';

class CustomConnector extends BaseConnector {
  async fetch(): Promise<FinancialData[]> {
    return this.fetchWithCache('custom_key', async () => {
      // Your custom data fetching logic
      const rawData = await fetchFromAPI();
      return this.normalizeData(rawData);
    });
  }
  
  private normalizeData(rawData: any): FinancialData[] {
    // Transform to normalized format
    return [];
  }
}
```

## Configuration

### Environment Variables

Create a `.env` file:

```env
DB_PATH=./data.db
API_PORT=3000
CACHE_ENABLED=true
CACHE_TTL=300000
RATE_LIMIT=2000
```

## Rate Limiting and Compliance

All connectors implement rate limiting:
- Minimum interval between requests
- Configurable per connector
- Prevents API throttling
- Respects source terms of service

## Error Handling

- Automatic retry with exponential backoff
- Graceful degradation
- Error logging to database
- Job failure tracking

## Testing

Run tests with mocked data sources:

```bash
npm test
```

Test coverage includes:
- Base connector functionality
- Individual connector implementations
- Database operations
- Scheduler behavior
- Error scenarios

## UI Screenshots

### Electron Dashboard
- Real-time market data display
- News feed aggregation
- Job status monitoring
- Auto-refresh capability

### Chrome Extension
- Popup with latest data
- Market data overview
- News headlines
- Offline caching

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## Troubleshooting

### Data not appearing
- Ensure the application is running
- Check job status in UI
- Verify internet connectivity
- Check console for errors

### API errors
- Verify API endpoints are accessible
- Check rate limits
- Review error logs in database

### Extension not connecting
- Ensure API server is running on port 3000
- Check CORS settings
- Verify extension permissions
