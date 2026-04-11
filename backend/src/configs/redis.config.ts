import { Redis } from 'ioredis';
import { serverConfig } from './index.js';

export function connectToRedis(connectionName: string = 'Default') {
    try {
        let redisClient: Redis;

        return () => {
            if (!redisClient) {
                redisClient = new Redis(serverConfig.REDIS_URL, {
                    maxRetriesPerRequest: null,
                });

                redisClient.on('connect', () => {
                    console.log(
                        `Redis [${connectionName}] connected successfully`
                    );
                });

                redisClient.on('error', (error) => {
                    console.log(
                        `Redis [${connectionName}] connection failed`,
                        error
                    );
                });
            }
            return redisClient;
        };
    } catch (error) {
        console.log(
            `Error creating Redis connection [${connectionName}]:`,
            error
        );
        throw error;
    }
}

export const getRedisConnection = connectToRedis('Main');
export const getRedisConnectionForCaching = connectToRedis('Cache');
