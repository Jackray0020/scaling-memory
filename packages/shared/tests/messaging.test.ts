import { describe, it, expect, beforeEach } from 'vitest';
import {
  MessageType,
  MessagePriority,
  MessageBuilder,
  MessageSerializer,
  TopicFilter,
  TypeFilter,
  InMemoryMessageBus,
  Topics,
  type Message,
  type MessageHandler,
} from '../src/messaging/index.js';

describe('Messaging Module', () => {
  describe('MessageBuilder', () => {
    it('should build request message', () => {
      const message = MessageBuilder.request('test.topic', { data: 'value' }).build();

      expect(message.type).toBe(MessageType.REQUEST);
      expect(message.topic).toBe('test.topic');
      expect(message.payload).toEqual({ data: 'value' });
      expect(message.id).toBeDefined();
      expect(message.timestamp).toBeDefined();
    });

    it('should build response message with correlation ID', () => {
      const message = MessageBuilder.response(
        'test.topic',
        { result: 'success' },
        'corr-123'
      ).build();

      expect(message.type).toBe(MessageType.RESPONSE);
      expect(message.correlationId).toBe('corr-123');
    });

    it('should build event message with source', () => {
      const message = MessageBuilder.event('system.event', { event: 'started' }, 'app-1').build();

      expect(message.type).toBe(MessageType.EVENT);
      expect(message.metadata?.source).toBe('app-1');
    });

    it('should support fluent API with priority and metadata', () => {
      const message = new MessageBuilder()
        .withType(MessageType.COMMAND)
        .withTopic('commands.execute')
        .withPayload({ command: 'restart' })
        .withPriority(MessagePriority.HIGH)
        .withMetadata({ user: 'admin' })
        .build();

      expect(message.priority).toBe(MessagePriority.HIGH);
      expect(message.metadata?.user).toBe('admin');
    });

    it('should throw error when required fields missing', () => {
      const builder = new MessageBuilder().withTopic('test');
      expect(() => builder.build()).toThrow();
    });

    it('should generate unique message IDs', () => {
      const msg1 = MessageBuilder.request('topic', {}).build();
      const msg2 = MessageBuilder.request('topic', {}).build();

      expect(msg1.id).not.toBe(msg2.id);
    });
  });

  describe('MessageSerializer', () => {
    it('should serialize and deserialize message', () => {
      const message: Message<{ value: number }> = {
        id: 'msg-123',
        type: MessageType.EVENT,
        topic: 'test.event',
        payload: { value: 42 },
        timestamp: Date.now(),
        priority: MessagePriority.NORMAL,
      };

      const serialized = MessageSerializer.serialize(message);
      const deserialized = MessageSerializer.deserialize<{ value: number }>(serialized);

      expect(deserialized.id).toBe(message.id);
      expect(deserialized.type).toBe(message.type);
      expect(deserialized.payload.value).toBe(42);
    });

    it('should handle optional fields', () => {
      const message: Message = {
        id: 'msg-456',
        type: MessageType.NOTIFICATION,
        topic: 'alerts',
        payload: 'Alert message',
        timestamp: Date.now(),
        correlationId: 'corr-789',
        replyTo: 'responses.alerts',
        metadata: { source: 'monitoring' },
      };

      const serialized = MessageSerializer.serialize(message);
      const deserialized = MessageSerializer.deserialize(serialized);

      expect(deserialized.correlationId).toBe('corr-789');
      expect(deserialized.replyTo).toBe('responses.alerts');
      expect(deserialized.metadata?.source).toBe('monitoring');
    });

    it('should preserve type information', () => {
      const data = JSON.stringify({
        id: '123',
        type: MessageType.REQUEST,
        topic: 'test',
        payload: { num: '42' },
        timestamp: '1234567890',
      });

      const message = MessageSerializer.deserialize(data);

      expect(typeof message.id).toBe('string');
      expect(typeof message.timestamp).toBe('number');
    });
  });

  describe('Message Filters', () => {
    describe('TopicFilter', () => {
      it('should match exact topic string', () => {
        const filter = new TopicFilter('market.data');
        const message: Message = {
          id: '1',
          type: MessageType.EVENT,
          topic: 'market.data',
          payload: {},
          timestamp: Date.now(),
        };

        expect(filter.matches(message)).toBe(true);
      });

      it('should not match different topic', () => {
        const filter = new TopicFilter('market.data');
        const message: Message = {
          id: '1',
          type: MessageType.EVENT,
          topic: 'system.event',
          payload: {},
          timestamp: Date.now(),
        };

        expect(filter.matches(message)).toBe(false);
      });

      it('should match regex pattern', () => {
        const filter = new TopicFilter(/^market\./);
        const message: Message = {
          id: '1',
          type: MessageType.EVENT,
          topic: 'market.data.btc',
          payload: {},
          timestamp: Date.now(),
        };

        expect(filter.matches(message)).toBe(true);
      });
    });

    describe('TypeFilter', () => {
      it('should match message type', () => {
        const filter = new TypeFilter(MessageType.REQUEST);
        const message: Message = {
          id: '1',
          type: MessageType.REQUEST,
          topic: 'test',
          payload: {},
          timestamp: Date.now(),
        };

        expect(filter.matches(message)).toBe(true);
      });

      it('should not match different type', () => {
        const filter = new TypeFilter(MessageType.REQUEST);
        const message: Message = {
          id: '1',
          type: MessageType.RESPONSE,
          topic: 'test',
          payload: {},
          timestamp: Date.now(),
        };

        expect(filter.matches(message)).toBe(false);
      });
    });
  });

  describe('InMemoryMessageBus', () => {
    let bus: InMemoryMessageBus;

    beforeEach(() => {
      bus = new InMemoryMessageBus();
    });

    it('should publish and receive messages', async () => {
      const received: Message[] = [];
      const handler: MessageHandler = {
        handle: async (message) => {
          received.push(message);
        },
        canHandle: () => true,
      };

      bus.subscribe('test.topic', handler);

      const message = MessageBuilder.event('test.topic', { data: 'test' }, 'source').build();
      await bus.publish(message);

      expect(received).toHaveLength(1);
      expect(received[0].topic).toBe('test.topic');
    });

    it('should handle multiple subscribers', async () => {
      const received1: Message[] = [];
      const received2: Message[] = [];

      const handler1: MessageHandler = {
        handle: async (msg) => received1.push(msg),
        canHandle: () => true,
      };

      const handler2: MessageHandler = {
        handle: async (msg) => received2.push(msg),
        canHandle: () => true,
      };

      bus.subscribe('test.topic', handler1);
      bus.subscribe('test.topic', handler2);

      const message = MessageBuilder.event('test.topic', {}, 'source').build();
      await bus.publish(message);

      expect(received1).toHaveLength(1);
      expect(received2).toHaveLength(1);
    });

    it('should respect canHandle check', async () => {
      const received: Message[] = [];
      const handler: MessageHandler = {
        handle: async (msg) => received.push(msg),
        canHandle: (msg) => msg.priority === MessagePriority.HIGH,
      };

      bus.subscribe('test.topic', handler);

      const lowPriority = new MessageBuilder()
        .withType(MessageType.EVENT)
        .withTopic('test.topic')
        .withPayload({})
        .withPriority(MessagePriority.LOW)
        .build();

      const highPriority = new MessageBuilder()
        .withType(MessageType.EVENT)
        .withTopic('test.topic')
        .withPayload({})
        .withPriority(MessagePriority.HIGH)
        .build();

      await bus.publish(lowPriority);
      await bus.publish(highPriority);

      expect(received).toHaveLength(1);
      expect(received[0].priority).toBe(MessagePriority.HIGH);
    });

    it('should unsubscribe handler', async () => {
      const received: Message[] = [];
      const handler: MessageHandler = {
        handle: async (msg) => received.push(msg),
        canHandle: () => true,
      };

      bus.subscribe('test.topic', handler);
      bus.unsubscribe('test.topic', handler);

      const message = MessageBuilder.event('test.topic', {}, 'source').build();
      await bus.publish(message);

      expect(received).toHaveLength(0);
    });
  });

  describe('Standard Topics', () => {
    it('should provide standard topic constants', () => {
      expect(Topics.MARKET_DATA).toBe('market.data');
      expect(Topics.ANALYSIS_JOB).toBe('analysis.job');
      expect(Topics.SYSTEM_EVENT).toBe('system.event');
      expect(Topics.USER_ACTION).toBe('user.action');
      expect(Topics.ERROR).toBe('system.error');
    });
  });
});
