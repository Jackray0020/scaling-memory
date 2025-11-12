import { MCPServerConfig, MCPAuthConfig } from './types';

export class MCPConfigManager {
  private servers: Map<string, MCPServerConfig> = new Map();

  registerServer(config: MCPServerConfig): void {
    this.validateConfig(config);
    this.servers.set(config.id, config);
  }

  unregisterServer(serverId: string): boolean {
    return this.servers.delete(serverId);
  }

  getServer(serverId: string): MCPServerConfig | undefined {
    return this.servers.get(serverId);
  }

  getAllServers(): MCPServerConfig[] {
    return Array.from(this.servers.values());
  }

  hasServer(serverId: string): boolean {
    return this.servers.has(serverId);
  }

  updateServer(serverId: string, updates: Partial<MCPServerConfig>): boolean {
    const existing = this.servers.get(serverId);
    if (!existing) {
      return false;
    }

    const updated = { ...existing, ...updates, id: serverId };
    this.validateConfig(updated);
    this.servers.set(serverId, updated);
    return true;
  }

  private validateConfig(config: MCPServerConfig): void {
    if (!config.id || typeof config.id !== 'string') {
      throw new Error('Server config must have a valid id');
    }

    if (!config.name || typeof config.name !== 'string') {
      throw new Error('Server config must have a valid name');
    }

    if (!config.endpoint || typeof config.endpoint !== 'string') {
      throw new Error('Server config must have a valid endpoint');
    }

    if (!this.isValidUrl(config.endpoint)) {
      throw new Error(`Invalid endpoint URL: ${config.endpoint}`);
    }

    if (config.auth) {
      this.validateAuth(config.auth);
    }
  }

  private validateAuth(auth: MCPAuthConfig): void {
    const validTypes = ['none', 'bearer', 'apikey', 'oauth'];
    if (!validTypes.includes(auth.type)) {
      throw new Error(`Invalid auth type: ${auth.type}`);
    }

    if (auth.type === 'bearer' && !auth.credentials?.token) {
      throw new Error('Bearer auth requires a token');
    }

    if (auth.type === 'apikey' && !auth.credentials?.apiKey) {
      throw new Error('API key auth requires an apiKey');
    }

    if (auth.type === 'oauth' && (!auth.credentials?.clientId || !auth.credentials?.clientSecret)) {
      throw new Error('OAuth auth requires clientId and clientSecret');
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
