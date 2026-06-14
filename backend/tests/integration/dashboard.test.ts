import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';

describe('Admin Dashboard Module Integration Tests', () => {
    const setupAdminAndData = async () => {
        const admin = await prisma.user.create({
            data: {
                email: `admin-dash-${Date.now()}@example.com`,
                password: 'HashedPassword123',
                role: 'ADMIN',
            },
        });

        const student = await prisma.user.create({
            data: {
                email: `student-dash-${Date.now()}@example.com`,
                password: 'HashedPassword123',
                role: 'STUDENT',
                isProfileCompleted: true,
            },
        });

        const profile = await prisma.studentProfile.create({
            data: {
                userId: student.id,
                fullName: 'Dash Student',
                branch: 'CSE',
                rollNo: `ROLL-${Date.now()}`,
                dob: new Date('2004-01-01'),
                cgpa: 8.5,
                verificationStatus: 'VERIFIED',
            },
        });

        const job = await prisma.job.create({
            data: {
                title: 'Software Developer',
                company: 'Vercel',
                description: 'Write modern web apps.',
                requiredCgpa: 8.0,
                allowedBranches: ['CSE'],
                backlogAllowed: false,
                status: 'ACTIVE',
                deadline: new Date(Date.now() + 86400000),
                createdById: admin.id,
            },
        });

        await prisma.application.create({
            data: {
                userId: student.id,
                jobId: job.id,
                status: 'SELECTED',
                snapshot: {
                    fullName: profile.fullName,
                    branch: 'CSE',
                    cgpa: profile.cgpa,
                },
            },
        });

        return { admin };
    };

    describe('GET /api/v1/admin/dashboard/stats', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/admin/dashboard/stats', ['ADMIN', 'SUPER_ADMIN']);
        });

        it('should return aggregated stats successfully', async () => {
            const { admin } = await setupAdminAndData();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .get('/api/v1/admin/dashboard/stats')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.totalStudents).toBeGreaterThanOrEqual(1);
            expect(res.body.data.totalJobs).toBeGreaterThanOrEqual(1);
            expect(res.body.data.totalApplications).toBeGreaterThanOrEqual(1);
            expect(res.body.data.recentActivities).toBeInstanceOf(Array);
            expect(res.body.data.branchDistribution).toBeInstanceOf(Array);
        });
    });
});
