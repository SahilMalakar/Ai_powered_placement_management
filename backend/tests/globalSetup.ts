import { prisma } from '../src/prisma/prisma.js';
import { getRedisConnection, getRedisConnectionForCaching } from '../src/infra/redis.config.js';

export default async function globalTeardown() {
    await prisma.$disconnect();

    try {
        await getRedisConnection().quit();
    } catch (e) {}

    try {
        await getRedisConnectionForCaching().quit();
    } catch (e) {}
}
