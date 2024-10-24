import mariadb from 'mariadb';
import * as redis from 'redis';

export class DataStore {
    private cache: { [key: string]: any } = {};
    private redis_enable: boolean = false;
    private redisClient;
    private pool_enable: boolean = false;
    private pool;

    constructor(Redis: {
        enable: boolean, config: {
            url: string,
            username: string,
            password: string,
        } | undefined
    }, MariaDb: {
        enable: boolean, config: {
            host: string,
            user: string,
            password: string,
            database: string,
        } | undefined
    }) {
        this.redis_enable = Redis.enable;
        this.pool_enable = MariaDb.enable;

        if (this.redis_enable) {
            console.log(Redis.config)
            if (Redis.config !== undefined) {
                this.redisClient = redis.createClient({ url: Redis.config.url as string, username: Redis.config.username as string, password: Redis.config.password as string});//, legacyMode: true });
                this.redisClient.connect().then(() => console.log('Connected to Redis'))
                    .catch((err) => console.error('Redis Client Error', err));
            }
        }
        if (this.pool_enable) {
            if (typeof (MariaDb.config) !== undefined) {
                this.pool = mariadb.createPool({host: MariaDb.config?.host, user: MariaDb.config?.user, password: MariaDb.config?.password, database: MariaDb.config?.database});
            }
        }
    }
    async contain(key: string, updateCacheValue: boolean = false): Promise<boolean> {
        try {
            if (this.cache[key] !== undefined) {
                return true;
            }
            if (this.redis_enable) {
                const redisValue = await this.redisClient?.get(key);
                if (redisValue !== null) {
                    if (updateCacheValue) {
                        this.cache[key] = redisValue;
                    }
                    return true;
                }
            }

            if (this.pool_enable) {
                const mariaDbValue = await this.queryMariaDB(key);
                if (mariaDbValue) {
                    if (updateCacheValue) {
                        this.cache[key] = mariaDbValue;
                        if (this.redis_enable) {
                            await this.redisClient?.set(key, mariaDbValue); // Update Redis cache
                        }
                    }
                    return true;
                }
            }
            return false
        } catch (e) { console.error('contain'); return false};
    }

    // Get value from cache or Redis or MariaDB
    async get(key: string): Promise<any> {
        try {
            // Check local cache first
            if (this.cache[key] !== undefined) {
                return this.cache[key];
            }

            // Fallback to Redis
            if (this.redis_enable) {
                const redisValue = await this.redisClient?.get(key);
                if (redisValue !== null) {
                    this.cache[key] = redisValue; // Update local cache
                    return redisValue;
                }
            }

            // Fallback to MariaDB
            if (this.pool_enable) {
                const mariaDbValue = await this.queryMariaDB(key);
                if (mariaDbValue) {
                    this.cache[key] = mariaDbValue; // Update local cache
                    if (this.redis_enable) {
                        await this.redisClient?.set(key, mariaDbValue); // Update Redis cache
                    }
                    return mariaDbValue;
                }
            }

            return null; // Not found
        } catch (e) { console.error('get') };
    }

    // Set value in both local cache and Redis
    async set(key: string, value: any): Promise<void> {
        try {
            this.cache[key] = value; // Update local cache
            if (this.redis_enable) {
                await this.redisClient?.set(key, value); // Update Redis cache
            }
            if (this.pool_enable) {
                await this.updateMariaDB(key, value); // Update MariaDB
            }
        } catch (e) { console.error('set') };
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
        } catch (e) { console.error('delete') };
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
        } catch (e) { console.error('queryMariaDB') };
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
        } catch (e) { console.error('deleteFromMariaDB') };
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
        } catch (e) { console.error('updateMariaDB') };
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
        } catch (e) { console.error('close') };
    }
}
