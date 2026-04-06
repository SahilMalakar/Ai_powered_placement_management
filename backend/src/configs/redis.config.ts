import { Redis } from "ioredis";
import { serverConfig } from "./index.js";


export function connectToRedis(){
    try {
        let redisClient :Redis;

        return ()=>{
            if (!redisClient) {
                redisClient = new Redis(serverConfig.REDIS_URL,{
                    maxRetriesPerRequest:null,
                });

                redisClient.on("connect",()=>{
                    console.log("Redis connected successfully");
                });

                redisClient.on("error",(error)=>{
                    console.log("Redis connection failed",error);
                });
            }
            return redisClient;
        }
    } catch (error) {
        console.log(`error connecting redis :`, error);

        throw error;
    }
}


export const getRedisConnection = connectToRedis();

export function connectToRedisForCaching(){
    try {
        let cacheClient :Redis;

        return ()=>{
            if (!cacheClient) {
                cacheClient = new Redis(serverConfig.REDIS_URL,{
                    maxRetriesPerRequest:null,
                });

                cacheClient.on("connect",()=>{
                    console.log("Redis Cache Client connected successfully");
                });

                cacheClient.on("error",(error)=>{
                    console.log("Redis Cache Client connection failed",error);
                });
            }
            return cacheClient;
        }
    } catch (error) {
        console.log(`error connecting redis for caching :`, error);

        throw error;
    }
}

export const getRedisConnectionForCaching = connectToRedisForCaching();