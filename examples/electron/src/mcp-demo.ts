import { MCPClient, MCPServerConfig, MCPConnectionState } from '@scaling-memory/shared';

class ElectronMCPDemo {
  private client: MCPClient;

  constructor() {
    this.client = new MCPClient({
      defaultTimeout: 30000,
      autoReconnect: true,
      reconnectDelay: 5000,
      maxReconnectAttempts: 3,
      logger: {
        debug: (msg, ...args) => console.debug(`[Electron MCP] ${msg}`, ...args),
        info: (msg, ...args) => console.info(`[Electron MCP] ${msg}`, ...args),
        warn: (msg, ...args) => console.warn(`[Electron MCP] ${msg}`, ...args),
        error: (msg, ...args) => console.error(`[Electron MCP] ${msg}`, ...args)
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connected', (event) => {
      console.log(`[Electron] Connected to server: ${event.serverId}`);
    });

    this.client.on('disconnected', (event) => {
      console.log(`[Electron] Disconnected from server: ${event.serverId}`);
    });

    this.client.on('error', (event) => {
      console.error(`[Electron] Error from server ${event.serverId}:`, event.data);
    });

    this.client.on('reconnecting', (event) => {
      console.log(`[Electron] Reconnecting to server: ${event.serverId}`, event.data);
    });
  }

  async initializeMCPServers(): Promise<void> {
    console.log('[Electron] Initializing MCP servers...');

    const servers: MCPServerConfig[] = [
      {
        id: 'ai-service',
        name: 'AI Service',
        endpoint: 'http://localhost:3001/mcp',
        auth: {
          type: 'bearer',
          credentials: {
            token: process.env.AI_SERVICE_TOKEN || 'mock-token'
          }
        },
        timeout: 30000,
        retryAttempts: 3
      },
      {
        id: 'data-service',
        name: 'Data Service',
        endpoint: 'http://localhost:3002/mcp',
        auth: {
          type: 'apikey',
          credentials: {
            apiKey: process.env.DATA_SERVICE_KEY || 'mock-api-key'
          }
        },
        timeout: 15000
      },
      {
        id: 'analytics-service',
        name: 'Analytics Service',
        endpoint: 'http://localhost:3003/mcp',
        auth: {
          type: 'none'
        }
      }
    ];

    for (const serverConfig of servers) {
      this.client.registerServer(serverConfig);
      console.log(`[Electron] Registered server: ${serverConfig.name}`);
    }
  }

  async connectToAllServers(): Promise<void> {
    console.log('[Electron] Connecting to all servers...');
    const servers = this.client.getAllServers();

    for (const server of servers) {
      try {
        await this.client.connect(server.id);
        console.log(`[Electron] Successfully connected to: ${server.name}`);
      } catch (error) {
        console.error(`[Electron] Failed to connect to ${server.name}:`, error);
      }
    }
  }

  async performMockQueries(): Promise<void> {
    console.log('[Electron] Performing mock queries...');

    try {
      const aiResponse = await this.client.query(
        'ai-service',
        'getModelInfo',
        { model: 'gpt-4' }
      );
      console.log('[Electron] AI Service response:', aiResponse.data);
    } catch (error) {
      console.error('[Electron] AI Service query failed:', error);
    }

    try {
      const dataResponse = await this.client.query(
        'data-service',
        'fetchData',
        { collection: 'users', limit: 10 }
      );
      console.log('[Electron] Data Service response:', dataResponse.data);
    } catch (error) {
      console.error('[Electron] Data Service query failed:', error);
    }

    try {
      const analyticsResponse = await this.client.query(
        'analytics-service',
        'trackEvent',
        { event: 'page_view', page: '/dashboard' },
        { timeout: 5000 }
      );
      console.log('[Electron] Analytics Service response:', analyticsResponse.data);
    } catch (error) {
      console.error('[Electron] Analytics Service query failed:', error);
    }
  }

  async checkConnectionStates(): Promise<void> {
    console.log('[Electron] Checking connection states...');
    const servers = this.client.getAllServers();

    for (const server of servers) {
      const state = this.client.getConnectionState(server.id);
      const session = this.client.getSession(server.id);
      
      console.log(`[Electron] ${server.name}:`, {
        state,
        connected: session?.connected,
        lastActivity: session?.lastActivity
      });
    }
  }

  async disconnectAll(): Promise<void> {
    console.log('[Electron] Disconnecting from all servers...');
    const servers = this.client.getAllServers();

    for (const server of servers) {
      try {
        await this.client.disconnect(server.id);
        console.log(`[Electron] Disconnected from: ${server.name}`);
      } catch (error) {
        console.error(`[Electron] Error disconnecting from ${server.name}:`, error);
      }
    }
  }

  async demonstrateErrorRecovery(): Promise<void> {
    console.log('[Electron] Demonstrating error recovery...');

    this.client.registerServer({
      id: 'unstable-service',
      name: 'Unstable Service',
      endpoint: 'http://localhost:9999/mcp',
      timeout: 2000
    });

    try {
      await this.client.connect('unstable-service');
    } catch (error) {
      console.log('[Electron] Expected connection failure:', (error as Error).message);
      const state = this.client.getConnectionState('unstable-service');
      console.log('[Electron] Connection state after failure:', state);
    }
  }
}

export async function runElectronDemo(): Promise<void> {
  console.log('\n=== Electron MCP Client Demo ===\n');

  const demo = new ElectronMCPDemo();

  await demo.initializeMCPServers();
  console.log('');

  await demo.connectToAllServers();
  console.log('');

  await demo.checkConnectionStates();
  console.log('');

  await demo.performMockQueries();
  console.log('');

  await demo.demonstrateErrorRecovery();
  console.log('');

  await demo.disconnectAll();
  console.log('');

  console.log('=== Electron Demo Complete ===\n');
}

if (require.main === module) {
  runElectronDemo().catch(error => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}
