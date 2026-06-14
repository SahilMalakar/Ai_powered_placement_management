import { beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/prisma/prisma.js';
import { getRedisConnection, getRedisConnectionForCaching } from '../src/infra/redis.config.js';
import { app } from '../src/server.js';
import { errorMiddleware } from '../src/shared/middlewares/error.middleware.js';

// Attach error middleware to the express app for testing
app.use(errorMiddleware);

beforeAll(async () => {
    // List tables in correct dependency order or use CASCADE
    const tablenames = [
        'ExportLog',
        'NotificationMessage',
        'ATSResult',
        'Resume',
        'Application',
        'Job',
        'Document',
        'SemesterResult',
        'AdditionalDetail',
        'Skill',
        'Project',
        'Experience',
        'SocialLink',
        'StudentProfile',
        'User'
    ];
    
    for (const name of tablenames) {
        try {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${name}" CASCADE;`);
        } catch (error) {
            // Silence error if table doesn't exist or is not initialized yet
        }
    }
    
    // Clear Redis caches
    try {
        const redis = getRedisConnection();
        await redis.flushdb();
    } catch (error) {
        // Redis connection might not be active, ignore
    }
    
    try {
        const redisCache = getRedisConnectionForCaching();
        await redisCache.flushdb();
    } catch (error) {
        // Cache Redis connection might not be active, ignore
    }
});

afterAll(async () => {
    // Disconnect Prisma
    await prisma.$disconnect();
    
    // Close Redis connections
    try {
        const redis = getRedisConnection();
        await redis.quit();
    } catch (e) {}
    
    try {
        const redisCache = getRedisConnectionForCaching();
        await redisCache.quit();
    } catch (e) {}
});
