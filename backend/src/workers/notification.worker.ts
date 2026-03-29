import { Worker, Job } from "bullmq";
import type { NotificationTypes } from "../types/admin/notification.js";
import { BadRequestError } from "../utils/errors/httpErrors.js";
import { getRedisConnection } from "../configs/redis.config.js";
import { readMailTemplate } from "../utils/templates/mail.templet.handler.js";
import { notifcationQueue, sendNotification } from "../queues/notification.queue.js";
import type Redis from "ioredis";



export const sendEmailFromQueueViaWorker = async () => {
  const emailWorker = new Worker(
    notifcationQueue,
    async (job: Job<NotificationTypes>) => {

        if (job.name !== notifcationQueue) {
            throw new BadRequestError("Invalid job name")
        }
      const payload = job.data;


      const emailContent = await readMailTemplate(
        payload.templateId,
        payload.params,
      );

      await sendNotification(payload.to, payload.subject, emailContent);

    },
    {
      connection: getRedisConnection() as any,
      concurrency: 5, // will be increased in future
    }
  );

  emailWorker.on("failed", (job, error) => {
    console.error(`❌ Email job ${job?.id} failed for ${job?.data.to}:`, error);
  });

  emailWorker.on("completed", (job) => {
    console.log(`✅ Email job ${job.id} sent successfully to: ${job.data.to}`);
  });
};