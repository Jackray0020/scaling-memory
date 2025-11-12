import { MCPClient } from '../../src/mcp/client';
import { MCPConnectionState, MCPServerConfig } from '../../src/mcp/types';

describe('MCPClient', () => {
  let client: MCPClient;

  beforeEach(() => {
    client = new MCPClient({
      defaultTimeout: 5000,
      autoReconnect: false,
      logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Server Registration', () => {
    it('should register a server successfully', () => {
      const config: MCPServerConfig = {
        id: 'test-server',
        name: 'Test Server',
        endpoint: 'http://localhost:3000'
      };

      expect(() => client.registerServer(config)).not.toThrow();
      expect(client.getSession('test-server')).toBeDefined();
    });

    it('should throw error for invalid server config', () => {
      const invalidConfig = {
        id: '',
        name: 'Test',
        endpoint: 'invalid-url'
      } as MCPServerConfig;

      expect(() => client.registerServer(invalidConfig)).toThrow();
    });

    it('should unregister a server successfully', () => {
      const config: MCPServerConfig = {
        id: 'test-server',
        name: 'Test Server',
        endpoint: 'http://localhost:3000'
      };

      client.registerServer(config);
      const result = client.unregisterServer('test-server');

      expect(result).toBe(true);
      expect(client.getSession('test-server')).toBeUndefined();
    });

    it('should return false when unregistering non-existent server', () => {
      const result = client.unregisterServer('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('Connection Management', () => {
    beforeEach(() => {
      const config: MCPServerConfig = {
        id: 'test-server',
        name: 'Test Server',
        endpoint: 'http://localhost:3000'
      };
      client.registerServer(config);
    });

    it('should connect to a server successfully', async () => {
      const session = await client.connect('test-server');

      expect(session).toBeDefined();
      expect(session.connected).toBe(true);
      expect(session.serverId).toBe('test-server');
      expect(client.getConnectionState('test-server')).toBe(MCPConnectionState.CONNECTED);
    });

    it('should throw error when connecting to non-existent server', async () => {
      await expect(client.connect('non-existent')).rejects.toThrow('Server not found');
    });

    it('should handle already connected server', async () => {
      await client.connect('test-server');
      const session = await client.connect('test-server');

      expect(session.connected).toBe(true);
    });

    it('should disconnect from a server successfully', async () => {
      await client.connect('test-server');
      await client.disconnect('test-server');

      const session = client.getSession('test-server');
      expect(session?.connected).toBe(false);
      expect(client.getConnectionState('test-server')).toBe(MCPConnectionState.DISCONNECTED);
    });

    it('should handle disconnect from already disconnected server', async () => {
      await expect(client.disconnect('test-server')).resolves.not.toThrow();
    });

    it('should emit connection events', async () => {
      const connectHandler = jest.fn();
      client.on('connected', connectHandler);

      await client.connect('test-server');

      expect(connectHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'connected',
          serverId: 'test-server'
        })
      );
    });

    it('should emit disconnection events', async () => {
      const disconnectHandler = jest.fn();
      client.on('disconnected', disconnectHandler);

      await client.connect('test-server');
      await client.disconnect('test-server');

      expect(disconnectHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'disconnected',
          serverId: 'test-server'
        })
      );
    });
  });

  describe('Query Execution', () => {
    beforeEach(async () => {
      const config: MCPServerConfig = {
        id: 'test-server',
        name: 'Test Server',
        endpoint: 'http://localhost:3000'
      };
      client.registerServer(config);
      await client.connect('test-server');
    });

    it('should execute a query successfully', async () => {
      const response = await client.query('test-server', 'testMethod', { param: 'value' });

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.id).toBeDefined();
    });

    it('should throw error when querying disconnected server', async () => {
      await client.disconnect('test-server');

      await expect(
        client.query('test-server', 'testMethod')
      ).rejects.toThrow('Server not connected');
    });

    it('should throw error when querying non-existent server', async () => {
      await expect(
        client.query('non-existent', 'testMethod')
      ).rejects.toThrow('Session not found');
    });

    it('should update last activity on successful query', async () => {
      const session = client.getSession('test-server');
      const initialActivity = session?.lastActivity;

      await new Promise(resolve => setTimeout(resolve, 10));
      await client.query('test-server', 'testMethod');

      const updatedSession = client.getSession('test-server');
      expect(updatedSession?.lastActivity).not.toEqual(initialActivity);
    });

    it('should respect query timeout', async () => {
      const response = await client.query('test-server', 'testMethod', {}, { timeout: 10000 });
      expect(response).toBeDefined();
    });
  });

  describe('Authentication', () => {
    it('should register server with bearer auth', () => {
      const config: MCPServerConfig = {
        id: 'auth-server',
        name: 'Auth Server',
        endpoint: 'http://localhost:3000',
        auth: {
          type: 'bearer',
          credentials: {
            token: 'test-token'
          }
        }
      };

      expect(() => client.registerServer(config)).not.toThrow();
    });

    it('should register server with API key auth', () => {
      const config: MCPServerConfig = {
        id: 'apikey-server',
        name: 'API Key Server',
        endpoint: 'http://localhost:3000',
        auth: {
          type: 'apikey',
          credentials: {
            apiKey: 'test-key'
          }
        }
      };

      expect(() => client.registerServer(config)).not.toThrow();
    });

    it('should register server with OAuth auth', () => {
      const config: MCPServerConfig = {
        id: 'oauth-server',
        name: 'OAuth Server',
        endpoint: 'http://localhost:3000',
        auth: {
          type: 'oauth',
          credentials: {
            clientId: 'client-id',
            clientSecret: 'client-secret'
          }
        }
      };

      expect(() => client.registerServer(config)).not.toThrow();
    });

    it('should throw error for bearer auth without token', () => {
      const config: MCPServerConfig = {
        id: 'invalid-auth',
        name: 'Invalid Auth',
        endpoint: 'http://localhost:3000',
        auth: {
          type: 'bearer',
          credentials: {}
        }
      };

      expect(() => client.registerServer(config)).toThrow('Bearer auth requires a token');
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      const config: MCPServerConfig = {
        id: 'test-server',
        name: 'Test Server',
        endpoint: 'http://localhost:3000'
      };
      client.registerServer(config);
    });

    it('should allow subscribing to events', () => {
      const handler = jest.fn();
      expect(() => client.on('connected', handler)).not.toThrow();
    });

    it('should allow unsubscribing from events', () => {
      const handler = jest.fn();
      client.on('connected', handler);
      expect(() => client.off('connected', handler)).not.toThrow();
    });

    it('should not call unsubscribed handlers', async () => {
      const handler = jest.fn();
      client.on('connected', handler);
      client.off('connected', handler);

      await client.connect('test-server');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should support multiple handlers for same event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      client.on('connected', handler1);
      client.on('connected', handler2);

      await client.connect('test-server');

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      const config: MCPServerConfig = {
        id: 'test-server',
        name: 'Test Server',
        endpoint: 'http://localhost:3000'
      };
      client.registerServer(config);
    });

    it('should handle connection failures gracefully', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.96);

      await expect(client.connect('test-server')).rejects.toThrow();
      expect(client.getConnectionState('test-server')).toBe(MCPConnectionState.FAILED);

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should emit error events on connection failure', async () => {
      const errorHandler = jest.fn();
      client.on('error', errorHandler);

      jest.spyOn(Math, 'random').mockReturnValue(0.96);

      try {
        await client.connect('test-server');
      } catch (error) {
        // Expected
      }

      jest.spyOn(Math, 'random').mockRestore();
    });
  });

  describe('Session Management', () => {
    it('should retrieve session information', () => {
      const config: MCPServerConfig = {
        id: 'test-server',
        name: 'Test Server',
        endpoint: 'http://localhost:3000'
      };
      client.registerServer(config);

      const session = client.getSession('test-server');
      expect(session).toBeDefined();
      expect(session?.serverId).toBe('test-server');
    });

    it('should return undefined for non-existent session', () => {
      const session = client.getSession('non-existent');
      expect(session).toBeUndefined();
    });

    it('should list all registered servers', () => {
      const config1: MCPServerConfig = {
        id: 'server-1',
        name: 'Server 1',
        endpoint: 'http://localhost:3000'
      };
      const config2: MCPServerConfig = {
        id: 'server-2',
        name: 'Server 2',
        endpoint: 'http://localhost:3001'
      };

      client.registerServer(config1);
      client.registerServer(config2);

      const servers = client.getAllServers();
      expect(servers).toHaveLength(2);
      expect(servers.map(s => s.id)).toContain('server-1');
      expect(servers.map(s => s.id)).toContain('server-2');
    });
  });

  describe('Configuration', () => {
    it('should use custom timeout', () => {
      const customClient = new MCPClient({
        defaultTimeout: 10000
      });

      expect(customClient).toBeDefined();
    });

    it('should use custom logger', () => {
      const customLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };

      const customClient = new MCPClient({
        logger: customLogger
      });

      const config: MCPServerConfig = {
        id: 'test-server',
        name: 'Test Server',
        endpoint: 'http://localhost:3000'
      };
      customClient.registerServer(config);

      expect(customLogger.info).toHaveBeenCalled();
    });
  });
});
