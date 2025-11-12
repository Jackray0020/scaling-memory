import * as http from 'http';
import { URL } from 'url';
import FinancialDataIngestion from '../index';

export class APIServer {
  private server: http.Server;
  private dataIngestion: FinancialDataIngestion;
  private port: number;

  constructor(port: number = 3000, dbPath?: string) {
    this.port = port;
    this.dataIngestion = new FinancialDataIngestion(dbPath);
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method !== 'GET') {
      res.writeHead(405);
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    try {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const pathname = url.pathname;

      if (pathname === '/api/market') {
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const data = await this.dataIngestion.getMarketData(limit);
        res.writeHead(200);
        res.end(JSON.stringify(data));
      } else if (pathname === '/api/news') {
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const data = await this.dataIngestion.getNewsData(limit);
        res.writeHead(200);
        res.end(JSON.stringify(data));
      } else if (pathname === '/api/all') {
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const data = await this.dataIngestion.getAllData(limit);
        res.writeHead(200);
        res.end(JSON.stringify(data));
      } else if (pathname === '/api/jobs') {
        const jobId = url.searchParams.get('jobId') || undefined;
        const data = await this.dataIngestion.getJobResults(jobId);
        res.writeHead(200);
        res.end(JSON.stringify(data));
      } else if (pathname === '/api/scheduled-jobs') {
        const jobs = this.dataIngestion.getScheduler().getScheduledJobs();
        res.writeHead(200);
        res.end(JSON.stringify(jobs));
      } else if (pathname === '/api/health') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date() }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (error) {
      console.error('API Error:', error);
      res.writeHead(500);
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Internal server error',
        })
      );
    }
  }

  start(): void {
    this.dataIngestion.scheduleJobs();
    this.server.listen(this.port, () => {
      console.log(`API Server running on http://localhost:${this.port}`);
      console.log('Available endpoints:');
      console.log('  GET /api/market?limit=50');
      console.log('  GET /api/news?limit=50');
      console.log('  GET /api/all?limit=100');
      console.log('  GET /api/jobs?jobId=optional');
      console.log('  GET /api/scheduled-jobs');
      console.log('  GET /api/health');
    });
  }

  stop(): void {
    this.dataIngestion.shutdown();
    this.server.close();
  }
}

if (require.main === module) {
  const server = new APIServer(3000);
  server.start();

  process.on('SIGINT', () => {
    console.log('\nShutting down API server...');
    server.stop();
    process.exit(0);
  });
}
