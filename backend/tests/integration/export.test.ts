import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';
import { getRedisConnectionForCaching } from '../../src/infra/redis.config.js';
import { CACHE_KEYS } from '../../src/shared/utils/cacheKeys.js';

// Mock addExportJobToQueue to avoid executing BullMQ during integration tests
vi.mock('../../src/shared/queues/export.queue.js', () => {
    return {
        addExportJobToQueue: vi.fn().mockResolvedValue({ id: 'fake-export-job-id' }),
    };
});

describe('Admin Export Module Integration Tests', () => {
    const setupAdmin = async () => {
        return await prisma.user.create({
            data: {
                email: `admin-export-${Date.now()}@example.com`,
                password: 'HashedPassword123',
                role: 'ADMIN',
            },
        });
    };

    describe('POST /api/v1/admin/export', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'post', '/api/v1/admin/export', ['ADMIN', 'SUPER_ADMIN']);
        });

        it('should enqueue student export job successfully', async () => {
            const admin = await setupAdmin();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .post('/api/v1/admin/export')
                .set('Cookie', [cookie])
                .send({
                    type: 'students',
                    branch: 'all',
                });

            expect(res.status).toBe(202);
            expect(res.body.success).toBe(true);
            expect(res.body.data.jobId).toBeDefined();
            expect(typeof res.body.data.jobId).toBe('string');

            // Verify status in Redis cache
            const cacheClient = getRedisConnectionForCaching();
            const cacheKey = CACHE_KEYS.EXPORT_JOB(res.body.data.jobId);
            const cachedVal = await cacheClient.get(cacheKey);
            expect(cachedVal).not.toBeNull();
            const jobResult = JSON.parse(cachedVal!);
            expect(jobResult.status).toBe('processing');
        });

        it('should fail with invalid schema body', async () => {
            const admin = await setupAdmin();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .post('/api/v1/admin/export')
                .set('Cookie', [cookie])
                .send({
                    type: 'invalid-type',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/admin/export/:jobId/status', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/admin/export/fake-job/status', ['ADMIN', 'SUPER_ADMIN']);
        });

        it('should return job status from cache', async () => {
            const admin = await setupAdmin();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            // Seed job status in Redis cache
            const cacheClient = getRedisConnectionForCaching();
            const cacheKey = CACHE_KEYS.EXPORT_JOB('test-job-status-id');
            await cacheClient.set(cacheKey, JSON.stringify({
                status: 'completed',
                downloadUrl: 'https://example.com/download.csv',
                createdAt: new Date().toISOString()
            }));

            const res = await request(app)
                .get('/api/v1/admin/export/test-job-status-id/status')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('completed');
            expect(res.body.data.downloadUrl).toBe('https://example.com/download.csv');
        });

        it('should return 404 for unknown job ID', async () => {
            const admin = await setupAdmin();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .get('/api/v1/admin/export/non-existent-job-id/status')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/v1/admin/export/logs', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/admin/export/logs', ['ADMIN', 'SUPER_ADMIN']);
        });

        it('should return list of export logs', async () => {
            const admin = await setupAdmin();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            // Seed log
            await prisma.exportLog.create({
                data: {
                    exportedBy: admin.id,
                    type: 'students',
                    fileUrl: 'https://example.com/download-logs.csv',
                    filters: { branch: 'CSE' },
                    recordCount: 5
                }
            });

            const res = await request(app)
                .get('/api/v1/admin/export/logs')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.logs.length).toBeGreaterThan(0);
            expect(res.body.data.logs[0].fileUrl).toBe('https://example.com/download-logs.csv');
        });
    });

    describe('DELETE /api/v1/admin/export/logs/:id', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'delete', '/api/v1/admin/export/logs/1', ['ADMIN', 'SUPER_ADMIN']);
        });

        it('should delete export log successfully', async () => {
            const admin = await setupAdmin();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            // Seed log
            const log = await prisma.exportLog.create({
                data: {
                    exportedBy: admin.id,
                    type: 'students',
                    fileUrl: 'https://example.com/delete-log.csv',
                    filters: { branch: 'CSE' },
                    recordCount: 2
                }
            });

            const res = await request(app)
                .delete(`/api/v1/admin/export/logs/${log.id}`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Confirm deletion
            const dbLog = await prisma.exportLog.findUnique({ where: { id: log.id } });
            expect(dbLog).toBeNull();
        });

        it('should return 404 for non-existent log', async () => {
            const admin = await setupAdmin();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .delete('/api/v1/admin/export/logs/9999')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(404);
        });
    });
});
