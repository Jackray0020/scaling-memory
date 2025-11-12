import { MCPSession, MCPConnectionState } from './types';

export class MCPSessionManager {
  private sessions: Map<string, MCPSession> = new Map();
  private connectionStates: Map<string, MCPConnectionState> = new Map();

  createSession(serverId: string): MCPSession {
    const session: MCPSession = {
      id: this.generateSessionId(),
      serverId,
      connected: false,
      metadata: {}
    };

    this.sessions.set(serverId, session);
    this.setConnectionState(serverId, MCPConnectionState.DISCONNECTED);
    return session;
  }

  getSession(serverId: string): MCPSession | undefined {
    return this.sessions.get(serverId);
  }

  updateSession(serverId: string, updates: Partial<Omit<MCPSession, 'id' | 'serverId'>>): boolean {
    const session = this.sessions.get(serverId);
    if (!session) {
      return false;
    }

    Object.assign(session, updates);
    if (updates.connected !== undefined) {
      session.lastActivity = new Date();
    }
    return true;
  }

  markConnected(serverId: string): boolean {
    const session = this.sessions.get(serverId);
    if (!session) {
      return false;
    }

    session.connected = true;
    session.connectedAt = new Date();
    session.lastActivity = new Date();
    this.setConnectionState(serverId, MCPConnectionState.CONNECTED);
    return true;
  }

  markDisconnected(serverId: string): boolean {
    const session = this.sessions.get(serverId);
    if (!session) {
      return false;
    }

    session.connected = false;
    this.setConnectionState(serverId, MCPConnectionState.DISCONNECTED);
    return true;
  }

  updateLastActivity(serverId: string): void {
    const session = this.sessions.get(serverId);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  destroySession(serverId: string): boolean {
    this.connectionStates.delete(serverId);
    return this.sessions.delete(serverId);
  }

  getConnectionState(serverId: string): MCPConnectionState {
    return this.connectionStates.get(serverId) || MCPConnectionState.DISCONNECTED;
  }

  setConnectionState(serverId: string, state: MCPConnectionState): void {
    this.connectionStates.set(serverId, state);
  }

  getAllSessions(): MCPSession[] {
    return Array.from(this.sessions.values());
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
