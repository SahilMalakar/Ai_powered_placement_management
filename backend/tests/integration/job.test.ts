import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';
import { Branch } from '../../src/prisma/generated/prisma/enums.js';

describe('Admin Job Module Integration Tests', () => {
    const jobData = {
        title: 'Cloud Architect',
        company: 'Amazon',
        description: 'Design cloud infrastructures.',
        requiredCgpa: 8.0,
        allowedBranches: ['CSE', 'ETE'] as Branch[],
        backlogAllowed: true,
        deadline: new Date(Date.now() + 86400000).toISOString(),
    };

    const setupAdmin = async (email: string) => {
        return await prisma.user.create({
            data: {
                email,
                password: 'HashedPassword123',
                role: 'ADMIN',
            },
        });
    };

    describe('POST /api/v1/admin/job', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'post', '/api/v1/admin/job', ['ADMIN', 'SUPER_ADMIN']);
        });

        it('should successfully create a job', async () => {
            const admin = await setupAdmin('job-admin1@example.com');
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .post('/api/v1/admin/job')
                .set('Cookie', [cookie])
                .send(jobData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('Cloud Architect');
            expect(res.body.data.status).toBe('DRAFT');
        });
    });

    describe('POST /api/v1/admin/job/:id/activate and deactivate', () => {
        it('should activate and deactivate a job successfully', async () => {
            const admin = await setupAdmin('job-admin2@example.com');
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const job = await prisma.job.create({
                data: {
                    ...jobData,
                    createdById: admin.id,
                },
            });

            // Activate
            const actRes = await request(app)
                .post(`/api/v1/admin/job/${job.id}/activate`)
                .set('Cookie', [cookie]);

            expect(actRes.status).toBe(200);
            expect(actRes.body.success).toBe(true);
            expect(actRes.body.data.status).toBe('ACTIVE');

            // Deactivate
            const deactRes = await request(app)
                .post(`/api/v1/admin/job/${job.id}/deactivate`)
                .set('Cookie', [cookie]);

            expect(deactRes.status).toBe(200);
            expect(deactRes.body.success).toBe(true);
            expect(deactRes.body.data.status).toBe('DEACTIVE');
        });
    });

    describe('GET /api/v1/admin/job', () => {
        it('should fetch all jobs', async () => {
            const admin = await setupAdmin('job-admin3@example.com');
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .get('/api/v1/admin/job')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.jobs.length).toBeGreaterThan(0);
        });

        it('should fetch a single job by id', async () => {
            const admin = await setupAdmin('job-admin4@example.com');
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const job = await prisma.job.create({
                data: {
                    ...jobData,
                    createdById: admin.id,
                },
            });

            const res = await request(app)
                .get(`/api/v1/admin/job/${job.id}`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('Cloud Architect');
        });
    });

    describe('DELETE /api/v1/admin/job/:id', () => {
        it('should soft delete job', async () => {
            const admin = await setupAdmin('job-admin5@example.com');
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const job = await prisma.job.create({
                data: {
                    ...jobData,
                    createdById: admin.id,
                },
            });

            const res = await request(app)
                .delete(`/api/v1/admin/job/${job.id}`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const dbJob = await prisma.job.findUnique({ where: { id: job.id } });
            expect(dbJob!.deletedAt).not.toBeNull();
        });
    });
});
