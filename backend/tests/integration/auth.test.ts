import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';
import { getRedisConnectionForCaching } from '../../src/infra/redis.config.js';
import { CACHE_KEYS } from '../../src/shared/utils/cacheKeys.js';
import bcrypt from 'bcrypt';

describe('Auth Module Integration Tests', () => {
    const testEmail = 'student@example.com';
    const testPassword = 'Password123';

    describe('POST /api/v1/auth/signup', () => {
        it('should successfully register a student and set cookies', async () => {
            const res = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    email: testEmail,
                    password: testPassword,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toBeDefined();
            expect(res.body.data.user.email).toBe(testEmail);
            expect(res.body.data.user.role).toBe('STUDENT');
            expect(res.body.data.token).toBeDefined();

            // Verify cookies are set
            const cookies = res.headers['set-cookie'] as unknown as string[];
            expect(cookies).toBeDefined();
            expect(cookies.some(c => c.startsWith('token='))).toBe(true);
            expect(cookies.some(c => c.startsWith('refreshToken='))).toBe(true);

            // Verify database record
            const dbUser = await prisma.user.findUnique({ where: { email: testEmail } });
            expect(dbUser).toBeDefined();
            expect(dbUser!.role).toBe('STUDENT');
        });

        it('should fail registration with a duplicate email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    email: testEmail,
                    password: testPassword,
                });

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('already exists');
        });

        it('should fail with invalid email or weak password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    email: 'notanemail',
                    password: '123',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should successfully login and return token', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: testPassword,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.user.email).toBe(testEmail);

            const cookies = res.headers['set-cookie'] as unknown as string[];
            expect(cookies).toBeDefined();
            expect(cookies.some(c => c.startsWith('token='))).toBe(true);
        });

        it('should fail with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: 'WrongPassword123',
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/auth/me', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/auth/me', ['STUDENT', 'ADMIN', 'SUPER_ADMIN']);
        });

        it('should return logged in user session', async () => {
            const dbUser = await prisma.user.findUnique({ where: { email: testEmail } });
            const cookie = await getAuthCookie('STUDENT', dbUser!.id, dbUser!.email);

            const res = await request(app)
                .get('/api/v1/auth/me')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe(testEmail);
            expect(res.body.data.role).toBe('STUDENT');
        });
    });

    describe('PATCH /api/v1/auth/change-password', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'patch', '/api/v1/auth/change-password', ['STUDENT', 'ADMIN', 'SUPER_ADMIN']);
        });

        it('should successfully change password', async () => {
            const dbUser = await prisma.user.findUnique({ where: { email: testEmail } });
            const cookie = await getAuthCookie('STUDENT', dbUser!.id, dbUser!.email);

            const res = await request(app)
                .patch('/api/v1/auth/change-password')
                .set('Cookie', [cookie])
                .send({
                    oldPassword: testPassword,
                    newPassword: 'NewPassword123',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Try logging in with the new password
            const loginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: 'NewPassword123',
                });
            expect(loginRes.status).toBe(200);
        });
    });

    describe('OTP Password Reset Flow', () => {
        it('should trigger forget-password and reset password via Redis OTP', async () => {
            // 1. Trigger forget password
            const forgetRes = await request(app)
                .post('/api/v1/auth/forget-password')
                .send({ email: testEmail });

            expect(forgetRes.status).toBe(200);

            // 2. Fetch OTP from test Redis instance
            const cacheClient = getRedisConnectionForCaching();
            const otpKey = CACHE_KEYS.PASSWORD_RESET_OTP(testEmail);
            const cachedOtp = await cacheClient.get(otpKey);
            expect(cachedOtp).toBeDefined();
            expect(cachedOtp!.length).toBe(6);

            // 3. Reset password using the OTP
            const resetRes = await request(app)
                .patch('/api/v1/auth/reset-password')
                .send({
                    email: testEmail,
                    otp: cachedOtp!,
                    newPassword: 'ResetPass123',
                });

            expect(resetRes.status).toBe(200);
            expect(resetRes.body.success).toBe(true);

            // 4. Verify login with reset password
            const loginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: 'ResetPass123',
                });
            expect(loginRes.status).toBe(200);
        });

        it('should fail password reset with invalid OTP', async () => {
            const resetRes = await request(app)
                .patch('/api/v1/auth/reset-password')
                .send({
                    email: testEmail,
                    otp: '000000',
                    newPassword: 'ResetPass123',
                });

            expect(resetRes.status).toBe(401);
            expect(resetRes.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/refresh-token', () => {
        it('should successfully refresh tokens', async () => {
            const freshEmail = 'refresh-test@example.com';
            const freshPassword = 'Password123';

            const signupRes = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    email: freshEmail,
                    password: freshPassword,
                });

            const cookies = signupRes.headers['set-cookie'] as unknown as string[];
            const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));
            expect(refreshTokenCookie).toBeDefined();

            // Request new access token using refresh token
            const refreshRes = await request(app)
                .post('/api/v1/auth/refresh-token')
                .set('Cookie', [refreshTokenCookie!]);

            expect(refreshRes.status).toBe(200);
            expect(refreshRes.body.success).toBe(true);
            expect(refreshRes.body.data.token).toBeDefined();

            const newCookies = refreshRes.headers['set-cookie'] as unknown as string[];
            expect(newCookies.some(c => c.startsWith('token='))).toBe(true);
        });

        it('should fail with 401 if refresh token is missing', async () => {
            const refreshRes = await request(app)
                .post('/api/v1/auth/refresh-token');

            expect(refreshRes.status).toBe(401);
        });
    });
});
