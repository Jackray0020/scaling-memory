import { MCPClient, MCPServerConfig, MCPEvent } from '@scaling-memory/shared';

class ExtensionMCPDemo {
  private client: MCPClient;
  private statusLog: string[] = [];

  constructor() {
    this.client = new MCPClient({
      defaultTimeout: 20000,
      autoReconnect: true,
      reconnectDelay: 3000,
      maxReconnectAttempts: 5,
      logger: {
        debug: (msg, ...args) => this.log('DEBUG', msg, ...args),
        info: (msg, ...args) => this.log('INFO', msg, ...args),
        warn: (msg, ...args) => this.log('WARN', msg, ...args),
        error: (msg, ...args) => this.log('ERROR', msg, ...args)
      }
    });

    this.setupEventHandlers();
  }

  private log(level: string, message: string, ...args: unknown[]): void {
    const entry = `[Extension ${level}] ${message} ${args.length ? JSON.stringify(args) : ''}`;
    this.statusLog.push(entry);
    console.log(entry);
  }

  private setupEventHandlers(): void {
    this.client.on('connected', (event: MCPEvent) => {
      this.log('INFO', `Connected to server: ${event.serverId}`);
      this.notifyExtension('connected', event.serverId);
    });

    this.client.on('disconnected', (event: MCPEvent) => {
      this.log('INFO', `Disconnected from server: ${event.serverId}`);
      this.notifyExtension('disconnected', event.serverId);
    });

    this.client.on('error', (event: MCPEvent) => {
      this.log('ERROR', `Error from server ${event.serverId}`, event.data);
      this.notifyExtension('error', event.serverId, event.data);
    });

    this.client.on('reconnecting', (event: MCPEvent) => {
      this.log('INFO', `Reconnecting to server: ${event.serverId}`, event.data);
      this.notifyExtension('reconnecting', event.serverId, event.data);
    });
  }

  private notifyExtension(event: string, serverId: string, data?: unknown): void {
    this.log('DEBUG', `Extension notification: ${event}`, { serverId, data });
  }

  async initializeExtensionMCP(): Promise<void> {
    this.log('INFO', 'Initializing MCP for browser extension...');

    const servers: MCPServerConfig[] = [
      {
        id: 'content-service',
        name: 'Content Enhancement Service',
        endpoint: 'https://api.example.com/mcp/content',
        auth: {
          type: 'bearer',
          credentials: {
            token: 'extension-auth-token'
          }
        },
        timeout: 20000
      },
      {
        id: 'translation-service',
        name: 'Translation Service',
        endpoint: 'https://api.example.com/mcp/translate',
        auth: {
          type: 'apikey',
          credentials: {
            apiKey: 'translation-api-key'
          }
        },
        timeout: 15000
      },
      {
        id: 'user-prefs-service',
        name: 'User Preferences Service',
        endpoint: 'https://api.example.com/mcp/prefs',
        auth: {
          type: 'none'
        }
      }
    ];

    for (const serverConfig of servers) {
      this.client.registerServer(serverConfig);
      this.log('INFO', `Registered: ${serverConfig.name}`);
    }
  }

  async connectExtensionServices(): Promise<void> {
    this.log('INFO', 'Connecting extension services...');
    const servers = this.client.getAllServers();

    const connectionPromises = servers.map(async (server) => {
      try {
        await this.client.connect(server.id);
        this.log('INFO', `Connected: ${server.name}`);
        return { success: true, server: server.name };
      } catch (error) {
        this.log('ERROR', `Failed to connect ${server.name}`, error);
        return { success: false, server: server.name, error };
      }
    });

    const results = await Promise.allSettled(connectionPromises);
    this.log('INFO', `Connection results: ${results.length} servers processed`);
  }

  async enhancePageContent(content: string): Promise<string> {
    this.log('INFO', 'Enhancing page content...');

    try {
      const response = await this.client.query(
        'content-service',
        'enhance',
        { content, options: { format: 'html', enhance: true } },
        { timeout: 10000 }
      );

      if (response.success && response.data) {
        this.log('INFO', 'Content enhanced successfully');
        return (response.data as { enhanced: string }).enhanced || content;
      }

      return content;
    } catch (error) {
      this.log('ERROR', 'Content enhancement failed', error);
      return content;
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    this.log('INFO', `Translating text to ${targetLanguage}...`);

    try {
      const response = await this.client.query(
        'translation-service',
        'translate',
        { text, target: targetLanguage, source: 'auto' },
        { timeout: 8000 }
      );

      if (response.success && response.data) {
        this.log('INFO', 'Translation successful');
        return (response.data as { translated: string }).translated || text;
      }

      return text;
    } catch (error) {
      this.log('ERROR', 'Translation failed', error);
      return text;
    }
  }

  async saveUserPreference(key: string, value: unknown): Promise<boolean> {
    this.log('INFO', `Saving user preference: ${key}`);

    try {
      const response = await this.client.query(
        'user-prefs-service',
        'setPreference',
        { key, value },
        { timeout: 5000 }
      );

      if (response.success) {
        this.log('INFO', 'Preference saved successfully');
        return true;
      }

      return false;
    } catch (error) {
      this.log('ERROR', 'Failed to save preference', error);
      return false;
    }
  }

  async getUserPreference(key: string): Promise<unknown> {
    this.log('INFO', `Getting user preference: ${key}`);

    try {
      const response = await this.client.query(
        'user-prefs-service',
        'getPreference',
        { key },
        { timeout: 5000 }
      );

      if (response.success && response.data) {
        return (response.data as { value: unknown }).value;
      }

      return null;
    } catch (error) {
      this.log('ERROR', 'Failed to get preference', error);
      return null;
    }
  }

  async performBatchOperations(): Promise<void> {
    this.log('INFO', 'Performing batch operations...');

    const operations = [
      this.enhancePageContent('<p>Sample content</p>'),
      this.translateText('Hello, world!', 'es'),
      this.saveUserPreference('theme', 'dark'),
      this.getUserPreference('theme')
    ];

    const results = await Promise.allSettled(operations);
    this.log('INFO', `Batch operations complete: ${results.length} operations`);
  }

  getStatusLog(): string[] {
    return [...this.statusLog];
  }

  async cleanup(): Promise<void> {
    this.log('INFO', 'Cleaning up extension MCP connections...');
    const servers = this.client.getAllServers();

    for (const server of servers) {
      try {
        const session = this.client.getSession(server.id);
        if (session?.connected) {
          await this.client.disconnect(server.id);
        }
      } catch (error) {
        this.log('ERROR', `Error during cleanup for ${server.name}`, error);
      }
    }

    this.log('INFO', 'Cleanup complete');
  }
}

export async function runExtensionDemo(): Promise<void> {
  console.log('\n=== Browser Extension MCP Client Demo ===\n');

  const demo = new ExtensionMCPDemo();

  await demo.initializeExtensionMCP();
  console.log('');

  await demo.connectExtensionServices();
  console.log('');

  await demo.performBatchOperations();
  console.log('');

  console.log('Status log entries:', demo.getStatusLog().length);
  console.log('');

  await demo.cleanup();
  console.log('');

  console.log('=== Extension Demo Complete ===\n');
}

if (require.main === module) {
  runExtensionDemo().catch(error => {
    console.error('Extension demo failed:', error);
    process.exit(1);
  });
}
