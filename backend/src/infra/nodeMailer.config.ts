import nodemailer from 'nodemailer';
import { serverConfig } from '../configs/index.js';


export const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use any Service ID from the table below (case-insensitive)
    auth: {
        user: serverConfig.MAIL_USER,
        pass: serverConfig.MAIL_PASS,
    },
});
