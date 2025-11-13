/**
 * Market data domain models
 * Represents financial market data structures
 */

/**
 * Time intervals for market data aggregation
 */
export enum TimeInterval {
  MINUTE_1 = '1m',
  MINUTE_5 = '5m',
  MINUTE_15 = '15m',
  MINUTE_30 = '30m',
  HOUR_1 = '1h',
  HOUR_4 = '4h',
  DAY_1 = '1d',
  WEEK_1 = '1w',
  MONTH_1 = '1M',
}

/**
 * Market data source identifiers
 */
export enum DataSource {
  EXCHANGE = 'exchange',
  AGGREGATOR = 'aggregator',
  WEBSOCKET = 'websocket',
  API = 'api',
}

/**
 * Represents a single candlestick/OHLCV data point
 */
export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  symbol: string;
  interval: TimeInterval;
}

/**
 * Real-time tick data
 */
export interface Tick {
  timestamp: number;
  symbol: string;
  price: number;
  volume: number;
  source: DataSource;
}

/**
 * Market depth/order book data
 */
export interface OrderBook {
  timestamp: number;
  symbol: string;
  bids: Array<[price: number, quantity: number]>;
  asks: Array<[price: number, quantity: number]>;
}

/**
 * Trade execution data
 */
export interface Trade {
  id: string;
  timestamp: number;
  symbol: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  source: DataSource;
}

/**
 * Market data snapshot containing multiple data types
 */
export interface MarketDataSnapshot {
  symbol: string;
  timestamp: number;
  lastPrice: number;
  candles?: Candle[];
  orderBook?: OrderBook;
  recentTrades?: Trade[];
  volume24h?: number;
  priceChange24h?: number;
}

/**
 * Serialization utilities for market data
 */
export const MarketDataSerializer = {
  serializeCandle(candle: Candle): string {
    return JSON.stringify(candle);
  },

  deserializeCandle(data: string): Candle {
    const parsed = JSON.parse(data);
    return {
      timestamp: Number(parsed.timestamp),
      open: Number(parsed.open),
      high: Number(parsed.high),
      low: Number(parsed.low),
      close: Number(parsed.close),
      volume: Number(parsed.volume),
      symbol: String(parsed.symbol),
      interval: parsed.interval as TimeInterval,
    };
  },

  serializeTick(tick: Tick): string {
    return JSON.stringify(tick);
  },

  deserializeTick(data: string): Tick {
    const parsed = JSON.parse(data);
    return {
      timestamp: Number(parsed.timestamp),
      symbol: String(parsed.symbol),
      price: Number(parsed.price),
      volume: Number(parsed.volume),
      source: parsed.source as DataSource,
    };
  },

  serializeSnapshot(snapshot: MarketDataSnapshot): string {
    return JSON.stringify(snapshot);
  },

  deserializeSnapshot(data: string): MarketDataSnapshot {
    const parsed = JSON.parse(data);
    return {
      symbol: String(parsed.symbol),
      timestamp: Number(parsed.timestamp),
      lastPrice: Number(parsed.lastPrice),
      candles: parsed.candles?.map((c: any) => ({
        ...c,
        timestamp: Number(c.timestamp),
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
        volume: Number(c.volume),
      })),
      orderBook: parsed.orderBook,
      recentTrades: parsed.recentTrades,
      volume24h: parsed.volume24h !== undefined ? Number(parsed.volume24h) : undefined,
      priceChange24h: parsed.priceChange24h !== undefined ? Number(parsed.priceChange24h) : undefined,
    };
  },
};
