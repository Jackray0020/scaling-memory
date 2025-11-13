/**
 * Inter-app messaging contracts
 * Defines message types and protocols for communication between apps
 */

/**
 * Message types for inter-app communication
 */
export enum MessageType {
  REQUEST = 'request',
  RESPONSE = 'response',
  EVENT = 'event',
  COMMAND = 'command',
  NOTIFICATION = 'notification',
}

/**
 * Message priority levels
 */
export enum MessagePriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3,
}

/**
 * Base message interface
 */
export interface Message<T = unknown> {
  id: string;
  type: MessageType;
  topic: string;
  payload: T;
  timestamp: number;
  priority?: MessagePriority;
  correlationId?: string;
  replyTo?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Request message
 */
export interface RequestMessage<T = unknown> extends Message<T> {
  type: MessageType.REQUEST;
  expectsResponse: boolean;
  timeout?: number;
}

/**
 * Response message
 */
export interface ResponseMessage<T = unknown> extends Message<T> {
  type: MessageType.RESPONSE;
  success: boolean;
  error?: MessageError;
}

/**
 * Event message
 */
export interface EventMessage<T = unknown> extends Message<T> {
  type: MessageType.EVENT;
  source: string;
}

/**
 * Message error
 */
export interface MessageError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Message handler interface
 */
export interface MessageHandler<T = unknown, R = unknown> {
  handle(message: Message<T>): Promise<R> | R;
  canHandle(message: Message): boolean;
}

/**
 * Message bus interface for dependency inversion
 */
export interface MessageBus {
  publish(message: Message): Promise<void>;
  subscribe(topic: string, handler: MessageHandler): void;
  unsubscribe(topic: string, handler: MessageHandler): void;
  request<T, R>(message: RequestMessage<T>): Promise<ResponseMessage<R>>;
}

/**
 * Message filter interface
 */
export interface MessageFilter {
  matches(message: Message): boolean;
}

/**
 * Topic-based message filter
 */
export class TopicFilter implements MessageFilter {
  constructor(private pattern: string | RegExp) {}

  matches(message: Message): boolean {
    if (typeof this.pattern === 'string') {
      return message.topic === this.pattern;
    }
    return this.pattern.test(message.topic);
  }
}

/**
 * Type-based message filter
 */
export class TypeFilter implements MessageFilter {
  constructor(private messageType: MessageType) {}

  matches(message: Message): boolean {
    return message.type === this.messageType;
  }
}

/**
 * Message builder
 */
export class MessageBuilder<T = unknown> {
  private message: Partial<Message<T>> = {
    id: this.generateId(),
    timestamp: Date.now(),
    priority: MessagePriority.NORMAL,
  };

  static request<T>(topic: string, payload: T): MessageBuilder<T> {
    return new MessageBuilder<T>()
      .withType(MessageType.REQUEST)
      .withTopic(topic)
      .withPayload(payload);
  }

  static response<T>(topic: string, payload: T, correlationId: string): MessageBuilder<T> {
    return new MessageBuilder<T>()
      .withType(MessageType.RESPONSE)
      .withTopic(topic)
      .withPayload(payload)
      .withCorrelationId(correlationId);
  }

  static event<T>(topic: string, payload: T, source: string): MessageBuilder<T> {
    return new MessageBuilder<T>()
      .withType(MessageType.EVENT)
      .withTopic(topic)
      .withPayload(payload)
      .withMetadata({ source });
  }

  withType(type: MessageType): this {
    this.message.type = type;
    return this;
  }

  withTopic(topic: string): this {
    this.message.topic = topic;
    return this;
  }

  withPayload(payload: T): this {
    this.message.payload = payload;
    return this;
  }

  withPriority(priority: MessagePriority): this {
    this.message.priority = priority;
    return this;
  }

  withCorrelationId(correlationId: string): this {
    this.message.correlationId = correlationId;
    return this;
  }

  withReplyTo(replyTo: string): this {
    this.message.replyTo = replyTo;
    return this;
  }

  withMetadata(metadata: Record<string, unknown>): this {
    this.message.metadata = { ...this.message.metadata, ...metadata };
    return this;
  }

  build(): Message<T> {
    if (!this.message.type || !this.message.topic || this.message.payload === undefined) {
      throw new Error('Type, topic, and payload are required');
    }
    return this.message as Message<T>;
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Message serialization utilities
 */
export const MessageSerializer = {
  serialize<T>(message: Message<T>): string {
    return JSON.stringify(message);
  },

  deserialize<T = unknown>(data: string): Message<T> {
    const parsed = JSON.parse(data);
    return {
      id: String(parsed.id),
      type: parsed.type as MessageType,
      topic: String(parsed.topic),
      payload: parsed.payload as T,
      timestamp: Number(parsed.timestamp),
      priority:
        parsed.priority !== undefined ? (Number(parsed.priority) as MessagePriority) : undefined,
      correlationId: parsed.correlationId ? String(parsed.correlationId) : undefined,
      replyTo: parsed.replyTo ? String(parsed.replyTo) : undefined,
      metadata: parsed.metadata,
    };
  },
};

/**
 * Standard message topics
 */
export const Topics = {
  MARKET_DATA: 'market.data',
  ANALYSIS_JOB: 'analysis.job',
  SYSTEM_EVENT: 'system.event',
  USER_ACTION: 'user.action',
  ERROR: 'system.error',
} as const;

/**
 * In-memory message bus implementation for testing
 */
export class InMemoryMessageBus implements MessageBus {
  private handlers = new Map<string, Set<MessageHandler>>();
  private pendingRequests = new Map<string, (response: ResponseMessage) => void>();

  async publish(message: Message): Promise<void> {
    const handlers = this.handlers.get(message.topic);
    if (!handlers) return;

    for (const handler of handlers) {
      if (handler.canHandle(message)) {
        await handler.handle(message);
      }
    }
  }

  subscribe(topic: string, handler: MessageHandler): void {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
    this.handlers.get(topic)!.add(handler);
  }

  unsubscribe(topic: string, handler: MessageHandler): void {
    const handlers = this.handlers.get(topic);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  async request<T, R>(message: RequestMessage<T>): Promise<ResponseMessage<R>> {
    return new Promise((resolve, reject) => {
      const timeout = message.timeout || 5000;
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(message.id);
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);

      this.pendingRequests.set(message.id, (response: ResponseMessage) => {
        clearTimeout(timeoutId);
        resolve(response as ResponseMessage<R>);
      });

      this.publish(message).catch(reject);
    });
  }
}
