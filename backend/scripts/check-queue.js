import Redis from "ioredis";

const redis = new Redis("redis://:strongpassword@127.0.0.1:6379");

const QUEUES = ["resumeQueue", "atsQueue", "documentQueue"];

async function checkQueues() {
  console.log("\n📊 BullMQ Queue Status\n" + "=".repeat(40));

  for (const queue of QUEUES) {
    const waiting = await redis.llen(`bull:${queue}:wait`);
    const active = await redis.llen(`bull:${queue}:active`);
    const failed = await redis.zcard(`bull:${queue}:failed`);
    const delayed = await redis.zcard(`bull:${queue}:delayed`);
    const completed = await redis.zcard(`bull:${queue}:completed`);

    console.log(`\n🔹 ${queue}`);
    console.log(`   Waiting:   ${waiting}`);
    console.log(`   Active:    ${active}`);
    console.log(`   Failed:    ${failed}`);
    console.log(`   Delayed:   ${delayed}`);
    console.log(`   Completed: ${completed}`);
  }
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

const arg = process.argv[2];

if (arg === "--clear") {
  const target = process.argv[3] || "resumeQueue";
  console.log(`\n⚠️  Clearing queue: ${target}`);
  await clearQueue(target);
  console.log("Done!");
} else if (arg === "--clear-all") {
  console.log("\n⚠️  Clearing ALL queues");
  for (const queue of QUEUES) {
    await clearQueue(queue);
  }
  console.log("Done!");
} else {
  await checkQueues();
}

await redis.quit();
