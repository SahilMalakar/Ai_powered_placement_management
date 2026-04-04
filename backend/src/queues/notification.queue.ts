import { Queue } from "bullmq";
import { getRedisConnection } from "../configs/redis.config.js";
import { transporter } from "../configs/nodeMailer.config.js";
import { serverConfig } from "../configs/index.js";
import { InternalServerError } from "../utils/errors/httpErrors.js";
import type { NotificationTypes } from "../types/admin/notification.js";

export const notifcationQueue = "notificationQueue"
export const notificationQueuePayload = "notificationQueuePayload"

// initialize the queue instance
export const notificationQueue = new Queue(notifcationQueue, {
    connection: getRedisConnection() as any,
    defaultJobOptions:{
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000
        }
    }
});


// transport function for sending the email
export async function sendNotification(
    to:string,
    subject:string,
    html_body:string
) {
    try {
        await transporter.sendMail({
            from:serverConfig.MAIL_USER,
            to,
            subject,
            html:html_body
        })
    } catch (error) {
        console.log("Error while sending notification",error);

        throw new InternalServerError("Failed to send email")
    }
}

export const addBulkEmailsToQueue = async(notifications: NotificationTypes[]) => {
    try {
        const jobs = notifications.map(notification => ({
            name: notifcationQueue,
            data: notification
        }));
        
        await notificationQueue.addBulk(jobs);
        console.log(`Successfully added ${notifications.length} emails to bulk queue`);
    } catch (error) {
        console.log("Error while adding bulk emails to queue", error);
        throw new InternalServerError("Failed to add bulk emails to queue");
    }
}
