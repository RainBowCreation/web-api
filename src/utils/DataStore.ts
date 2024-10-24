import mariadb from 'mariadb';
import * as redis from 'redis';
import { buffer } from 'stream/consumers';

export class DataStore {
    private cache: { [key: string]: { value: any, expiry: number } } = {};
    private redis_enable: boolean = false;
    private redisClient;
    private pool_enable: boolean = false;
    private pool;
    private cacheTimeout: number;
    private redisTimeout: number;
    private cacheInterval: number;
    private cleanupTimer: NodeJS.Timeout | null = null;

    constructor(Redis: {
        enable: boolean, config: {
            url: string,
            username: string,
            password: string,
        } | undefined, timeout: number
    }, MariaDb: {
        enable: boolean, config: {
            host: string,
            user: string,
            password: string,
            database: string,
        } | undefined
    }, cacheTimeout: number = 60, cacheInterval: number = 60) {
        this.redis_enable = Redis.enable;
        this.pool_enable = MariaDb.enable;
        this.cacheTimeout = cacheTimeout;
        this.cacheInterval = cacheInterval;
        this.redisTimeout = Redis.timeout;

        if (this.redis_enable) {
            if (Redis.config !== undefined) {
                this.redisClient = redis.createClient({ url: Redis.config.url as string, username: Redis.config.username as string, password: Redis.config.password as string });//, legacyMode: true });
                this.redisClient.connect().then(() => console.log('Connected to Redis'))
                    .catch((err) => console.error('Redis Client Error', err));
            }
        }
        if (this.pool_enable) {
            if (typeof (MariaDb.config) !== undefined) {
                this.pool = mariadb.createPool({ host: MariaDb.config?.host, user: MariaDb.config?.user, password: MariaDb.config?.password, database: MariaDb.config?.database });
            }
        }

        this.startCacheCleanup();
    }
    async contain(key: string, updateCacheValue: boolean = false): Promise<boolean> {
        try {
            if (this.cache[key] && !this.isExpired(key)) {
                if (updateCacheValue) {
                    this.get(key);
                }
                return true;
            }
            if (this.redis_enable) {
                const redisValue = await this.redisClient?.get(key);
                if (redisValue !== null) {
                    if (updateCacheValue) {
                        this.get(key);
                    }
                    return true;
                }
            }

            if (this.pool_enable) {
                const mariaDbValue = await this.queryMariaDB(key);
                if (mariaDbValue) {
                    if (updateCacheValue) {
                        this.get(key);
                    }
                    return true;
                }
            }
            return false
        } catch (e) { console.error('utils/DataStore.ts/contain', e); return false };
    }

    private isExpired(key: string): boolean {
        const cachedItem = this.cache[key];
        return cachedItem ? (Date.now() > cachedItem.expiry) : true;
    }

    private calExpiry(): number {
        return Date.now() + this.cacheTimeout * 1000
    }

    // Get value from cache or Redis or MariaDB
    async get(key: string): Promise<any> {
        try {
            // Check local cache first
            if (this.cache[key] && !this.isExpired(key)) {
                this.resetExpiry(key, this.cache[key].value);
                return this.cache[key].value;
            }

            // Fallback to Redis
            if (this.redis_enable) {
                const rawValue = await this.redisClient?.get(key);
                if (rawValue === null || rawValue === undefined) {
                    console.error(`No value found for key: ${key}`);
                    return null; // or handle this case as needed
                }

                let redisValue;
                try {
                    redisValue = JSON.parse(rawValue); // Now we can safely parse
                } catch (e) {
                    console.error('Failed to parse value from Redis:', e);
                    return null; // or handle the error appropriately
                }
                if (redisValue !== null) {
                    this.resetExpiry(key, redisValue)
                    return redisValue;
                }
            }

            // Fallback to MariaDB
            if (this.pool_enable) {
                const mariaDbValue = await this.queryMariaDB(key);
                if (mariaDbValue) {
                    this.resetExpiry(key, this.cache[key].value)
                    return mariaDbValue;
                }
            }

            return null; // Not found
        } catch (e) { console.error('utils/DataStore.ts/get', e) };
    }

    // Set value in both local cache and Redis
    async set(key: string, value: any, bypassTimeOut: boolean = false): Promise<void> {
        try {
            if (bypassTimeOut) {
                this.cache[key] = { value, expiry: -1 };
                if (this.redis_enable) {
                    await this.redisClient?.set(key, JSON.stringify(value));
                }
            }
            else if (this.cacheTimeout == -1) {
                this.cache[key] = { value, expiry: -1 };
            }
            else if (this.redis_enable && this.redisTimeout == -1) {
                await this.redisClient?.set(key, JSON.stringify(value));
            }
            else {
                this.resetExpiry(key, value);
            }
            if (this.pool_enable) {
                await this.updateMariaDB(key, value); // Update MariaDB
            }
        } catch (e) { console.error('utils/DataStore.ts/set', e) };
    }

    async delete(key: string) {
        try {
            if (await this.contain(key)) {
                delete this.cache[key];
            }
            if (this.redis_enable) {
                await this.redisClient?.del(key);
            }
            if (this.pool_enable) {
                await this.deleteFromMariaDB(key);
            }
        } catch (e) { console.error('utils/DataStore.ts/delete', e) };
    }

    // Example method to query MariaDB
    private async queryMariaDB(key: string): Promise<any> {
        try {
            let conn;
            try {
                conn = await this.pool?.getConnection();
                const rows = await conn?.query('SELECT value FROM your_table WHERE key = ?', [key]);
                return rows.length > 0 ? rows[0].value : null;
            } finally {
                if (conn) conn.release(); // Release connection back to the pool
            }
        } catch (e) { console.error('utils/DataStore.ts/queryMariaDB', e) };
    }

    private async deleteFromMariaDB(key: string): Promise<void> {
        try {
            let conn;
            try {
                conn = await this.pool?.getConnection();
                await conn?.query('DELETE FROM your_table WHERE key = ?', [key]);
            } finally {
                if (conn) conn.release(); // Release connection back to the pool
            }
        } catch (e) { console.error('utils/DataStore.ts/deleteFromMariaDB', e) };
    }

    // Example method to update MariaDB
    private async updateMariaDB(key: string, value: any): Promise<void> {
        try {
            let conn;
            try {
                conn = await this.pool?.getConnection();
                await conn?.query('INSERT INTO your_table (key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?', [key, value, value]);
            } finally {
                if (conn) conn.release(); // Release connection back to the pool
            }
        } catch (e) { console.error('utils/DataStore.ts/updateMariaDB', e) };
    }

    // Cleanup method to close Redis and MariaDB connections
    async close(): Promise<void> {
        try {
            if (this.redis_enable) {
                await this.redisClient?.quit();
            }
            if (this.pool_enable) {
                await this.pool?.end();
            }
            this.stopCacheCleanup();
        } catch (e) { console.error('utils/DataStore.ts/close', e) };
    }

    // Method to start cache cleanup timer
    private startCacheCleanup() {
        this.cleanupTimer = setInterval(() => {
            console.log(`Start cleaning..`)
            const now = Date.now();
            for (const key in this.cache) {
                console.log(` |_ ${key}`)
                if (this.cache[key].expiry == -1) {
                    console.log(`  |_ skipped`)
                    continue;
                }
                if (this.cache[key].expiry <= now) {
                    console.log(`  |_ expired`)
                    delete this.cache[key]; // Remove expired key from cache
                }
            }
            console.log(`Done..`)
        }, this.cacheInterval * 1000); // Run cleanup every `cleanupInterval` seconds
    }

    // Method to stop cache cleanup timer
    private stopCacheCleanup() {
        if (this.cleanupTimer !== null) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }

    private async resetExpiry(key: string, value: any) {
        try {
            if (await this.contain(key)) {
                if (this.cache[key].expiry != -1) {
                    this.cache[key] = { value, expiry: this.calExpiry() };
                    if (this.redis_enable) {
                        await this.redisClient?.set(key, JSON.stringify(value), { EX: this.redisTimeout });
                    }
                }
            }
            else if (this.cacheTimeout != -1) {
                this.cache[key] = { value, expiry: this.calExpiry() };
                if (this.redis_enable && this.redisTimeout != -1) {
                    await this.redisClient?.set(key, JSON.stringify(value), { EX: this.redisTimeout });
                }
            }
        } catch (e) { console.error('utils/DataStore.ts/updateExpiry', e) };
    }
}
