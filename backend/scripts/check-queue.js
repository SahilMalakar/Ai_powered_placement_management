import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const QUEUES = ["resumeQueue", "documentQueue", "verificationQueue"];

async function getQueueStats(queueName) {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    redis.llen(`bull:${queueName}:wait`),
    redis.scard(`bull:${queueName}:active`),
    redis.scard(`bull:${queueName}:completed`),
    redis.scard(`bull:${queueName}:failed`),
    redis.zcard(`bull:${queueName}:delayed`),
  ]);

  return { waiting, active, completed, failed, delayed };
}

async function clearQueue(queueName) {
  const keys = await redis.keys(`bull:${queueName}:*`);
  if (keys.length === 0) {
    console.log(`No keys found for ${queueName}`);
    return;
  }
  await redis.del(...keys);
  console.log(`🗑️  Cleared ${keys.length} keys for ${queueName}`);
}

async function clearAllQueues() {
  const allKeys = await redis.keys("bull:*");

  if (allKeys.length === 0) {
    console.log("✅ No queues found.");
    return;
  }

  await redis.del(...allKeys);
  console.log(`✅ Cleared all ${allKeys.length} queue keys`);
}


async function listCache() {
  const keys = await redis.keys("*");
  const cacheKeys = keys.filter(k => !k.startsWith("bull:"));
  
  if (cacheKeys.length === 0) {
    console.log("\n📭 Cache is empty.");
    return;
  }

  console.log("\n📋 Current Cache Keys:");
  cacheKeys.forEach(k => console.log(`  - ${k}`));
  console.log(`\nTotal: ${cacheKeys.length} keys`);
}

async function clearCache() {
  const keys = await redis.keys("*");
  const cacheKeys = keys.filter(k => !k.startsWith("bull:"));
  
  if (cacheKeys.length === 0) {
    console.log("\n⚠️ No cache keys found to clear.");
    return;
  }

  await redis.del(...cacheKeys);
  console.log(`\nHTX  🗑️  Cleared ${cacheKeys.length} application cache keys.`);
}

async function main() {
  const arg = process.argv[2];

  if (arg === "--clear") {
    const target = process.argv[3] || "resumeQueue";
    console.log(`\n⚠️  Clearing queue: ${target}`);
    await clearQueue(target);
  } else if (arg === "--clear-all") {
    console.log("\n⚠️  Clearing ALL queues");
    for (const queue of QUEUES) {
      await clearQueue(queue);
    }
  } else if (arg === "--list-cache") {
    await listCache();
  } else if (arg === "--clear-cache") {
    await clearCache();
  } else if(arg === "--clear-all-queues") {
    await clearAllQueues();
  } else {
    console.log("\n📊 Queue Statistics:");
    for (const queue of QUEUES) {
      const stats = await getQueueStats(queue);
      console.log(`\n--- ${queue} ---`);
      console.log(`  Waiting:   ${stats.waiting}`);
      console.log(`  Active:    ${stats.active}`);
      console.log(`  Completed: ${stats.completed}`);
      console.log(`  Failed:    ${stats.failed}`);
      console.log(`  Delayed:   ${stats.delayed}`);
    }
    
    await listCache();
  }

  redis.disconnect();
}

main().catch(console.error);
