import { serverConfig } from './index.js';
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use any Service ID from the table below (case-insensitive)
    auth: {
        user: serverConfig.MAIL_USER,
        pass: serverConfig.MAIL_PASS,
    },
});
