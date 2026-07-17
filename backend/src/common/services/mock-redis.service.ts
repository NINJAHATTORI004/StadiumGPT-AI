import { Injectable } from '@nestjs/common';

type MockRedisHash = Record<string, unknown>;

function isHash(value: unknown): value is MockRedisHash {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isList(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Mock Redis service for development (no Docker/Redis server needed)
 * Implements core Redis operations in-memory
 */
@Injectable()
export class MockRedisService {
  private store = new Map<string, unknown>();
  private expireTimers = new Map<string, NodeJS.Timeout>();

  /**
   * SET command
   */
  set(key: string, value: unknown, options?: { EX?: number; PX?: number }): string {
    // Clear existing expiration timer
    this.clearExpiration(key);

    this.store.set(key, value);

    // Handle expiration
    if (options?.EX) {
      const timer = setTimeout(() => {
        this.store.delete(key);
        this.expireTimers.delete(key);
      }, options.EX * 1000);
      this.expireTimers.set(key, timer);
    } else if (options?.PX) {
      const timer = setTimeout(() => {
        this.store.delete(key);
        this.expireTimers.delete(key);
      }, options.PX);
      this.expireTimers.set(key, timer);
    }

    return 'OK';
  }

  /**
   * GET command
   */
  get(key: string): unknown {
    return this.store.get(key) ?? null;
  }

  /**
   * DEL command
   */
  del(...keys: string[]): number {
    let deleted = 0;
    keys.forEach((key) => {
      if (this.store.has(key)) {
        this.store.delete(key);
        this.clearExpiration(key);
        deleted++;
      }
    });
    return deleted;
  }

  /**
   * EXISTS command
   */
  exists(...keys: string[]): number {
    return keys.filter((key) => this.store.has(key)).length;
  }

  /**
   * INCR command
   */
  incr(key: string): number {
    const value = Number(this.store.get(key) ?? 0);
    const newValue = value + 1;
    this.store.set(key, newValue);
    return newValue;
  }

  /**
   * DECR command
   */
  decr(key: string): number {
    const value = Number(this.store.get(key) ?? 0);
    const newValue = value - 1;
    this.store.set(key, newValue);
    return newValue;
  }

  /**
   * LPUSH command (left push to list)
   */
  lpush(key: string, ...values: unknown[]): number {
    const stored = this.store.get(key);
    const list = isList(stored) ? stored : [];
    const nextList = [...values].reverse().concat(list);
    this.store.set(key, nextList);
    return nextList.length;
  }

  /**
   * RPOP command (right pop from list)
   */
  rpop(key: string): unknown {
    const list = this.store.get(key);
    if (!isList(list) || list.length === 0) {
      return null;
    }
    const value = list.pop() ?? null;
    if (list.length === 0) {
      this.store.delete(key);
    } else {
      this.store.set(key, list);
    }
    return value;
  }

  /**
   * LPOP command (left pop from list)
   */
  lpop(key: string): unknown {
    const list = this.store.get(key);
    if (!isList(list) || list.length === 0) {
      return null;
    }
    const value = list.shift() ?? null;
    if (list.length === 0) {
      this.store.delete(key);
    } else {
      this.store.set(key, list);
    }
    return value;
  }

  /**
   * HSET command (hash set)
   */
  hset(key: string, field: string, value: unknown): number {
    const stored = this.store.get(key);
    const hash = isHash(stored) ? { ...stored } : {};
    const isNew = !(field in hash);
    hash[field] = value;
    this.store.set(key, hash);
    return isNew ? 1 : 0;
  }

  /**
   * HGET command (hash get)
   */
  hget(key: string, field: string): unknown {
    const hash = this.store.get(key);
    if (!isHash(hash)) {
      return null;
    }
    return hash?.[field] ?? null;
  }

  /**
   * HGETALL command
   */
  hgetall(key: string): MockRedisHash {
    const hash = this.store.get(key);
    return isHash(hash) ? hash : {};
  }

  /**
   * Clear all data (useful for tests)
   */
  flushAll(): void {
    this.store.clear();
    this.expireTimers.forEach((timer) => clearTimeout(timer));
    this.expireTimers.clear();
  }

  /**
   * Get info about mock Redis
   */
  info(): MockRedisHash {
    return {
      type: 'mock-redis',
      keys: this.store.size,
      timers: this.expireTimers.size,
      note: 'This is an in-memory mock Redis service for development without Docker',
    };
  }

  private clearExpiration(key: string): void {
    const timer = this.expireTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.expireTimers.delete(key);
    }
  }
}
