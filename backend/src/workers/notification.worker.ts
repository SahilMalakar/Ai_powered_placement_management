import { Worker, Job, UnrecoverableError } from 'bullmq';
import type { NotificationTypes } from '../types/admin/notification.js';
import { BadRequestError } from '../utils/errors/httpErrors.js';
import { getRedisConnection } from '../configs/redis.config.js';
import { readMailTemplate } from '../utils/templates/mail.templet.handler.js';
import {
    notifcationQueue,
    sendNotification,
} from '../queues/notification.queue.js';

export const sendEmailFromQueueViaWorker = async () => {
    const emailWorker = new Worker(
        notifcationQueue,
        async (job: Job<NotificationTypes>) => {
            if (job.name !== notifcationQueue) {
                throw new UnrecoverableError('Invalid job name');
            }
            const payload = job.data;

            try {
                const emailContent = await readMailTemplate(
                    payload.templateId,
                    payload.params
                );

                await sendNotification(payload.to, payload.subject, emailContent);
            } catch (err: any) {
                const message = err?.message || 'Unknown error';
                console.error(`[Notification Worker] Failed to send email to ${payload.to}:`, message);
                
                // If the error is deterministic (e.g. invalid template), don't retry
                if (message.includes('template') || message.includes('400') || message.includes('429')) {
                    throw new UnrecoverableError(`Deterministic failure: ${message}`);
                }
                
                throw err;
            }
        },
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            connection: getRedisConnection() as any,
            concurrency: 5, // will be increased in future
        }
    );

    emailWorker.on('failed', (job, error) => {
        console.error(
            `❌ Email job ${job?.id} failed for ${job?.data.to}:`,
            error
        );
    });

    emailWorker.on('completed', (job) => {
        console.log(
            `✅ Email job ${job.id} sent successfully to: ${job.data.to}`
        );
    });
};
