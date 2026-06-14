import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';

describe('Admin JobApplication Module Integration Tests', () => {
    const setupAdminAndApplicant = async (adminEmail: string, studentEmail: string) => {
        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                password: 'HashedPassword123',
                role: 'ADMIN',
            },
        });

        const student = await prisma.user.create({
            data: {
                email: studentEmail,
                password: 'HashedPassword123',
                role: 'STUDENT',
                isProfileCompleted: true,
            },
        });

        const profile = await prisma.studentProfile.create({
            data: {
                userId: student.id,
                fullName: 'Applicant Student',
                branch: 'CSE',
                rollNo: '2026/CSE/100',
                dob: new Date('2004-05-15'),
                cgpa: 9.0,
                verificationStatus: 'VERIFIED',
            },
        });

        const job = await prisma.job.create({
            data: {
                title: 'Data Analyst',
                company: 'Google',
                description: 'Analyze data.',
                requiredCgpa: 7.0,
                allowedBranches: ['CSE'],
                backlogAllowed: true,
                status: 'ACTIVE',
                deadline: new Date(Date.now() + 86400000),
                createdById: admin.id,
            },
        });

        const application = await prisma.application.create({
            data: {
                userId: student.id,
                jobId: job.id,
                status: 'APPLIED',
                snapshot: {
                    fullName: profile.fullName,
                    branch: 'CSE',
                    cgpa: profile.cgpa,
                },
            },
        });

        return { admin, student, job, application };
    };

    describe('GET /api/v1/admin-apps/list', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/admin-apps/list', ['ADMIN', 'SUPER_ADMIN']);
        });

        it('should list all applications', async () => {
            const { admin } = await setupAdminAndApplicant('app-list-admin@example.com', 'app-list-stud@example.com');
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .get('/api/v1/admin-apps/list')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.applicants.length).toBeGreaterThan(0);
        });
    });

    describe('POST /api/v1/admin-apps/application/status', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'post', '/api/v1/admin-apps/application/status', ['ADMIN', 'SUPER_ADMIN']);
        });

        it('should batch update application statuses', async () => {
            const { admin, application } = await setupAdminAndApplicant('app-status-admin@example.com', 'app-status-stud@example.com');
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .post('/api/v1/admin-apps/application/status')
                .set('Cookie', [cookie])
                .send({
                    applicationIds: [application.id],
                    status: 'SHORTLISTED',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.updated).toBe(1);

            // Verify database update
            const dbApp = await prisma.application.findUnique({ where: { id: application.id } });
            expect(dbApp!.status).toBe('SHORTLISTED');
        });

        it('should fail with invalid transition or body', async () => {
            const { admin } = await setupAdminAndApplicant('app-status-admin2@example.com', 'app-status-stud2@example.com');
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .post('/api/v1/admin-apps/application/status')
                .set('Cookie', [cookie])
                .send({
                    applicationIds: [],
                    status: 'SHORTLISTED',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
});
