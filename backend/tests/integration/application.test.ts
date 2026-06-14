import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';

describe('Application Module Integration Tests', () => {
    describe('POST /api/v1/students/application/:jobId/apply', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'post', '/api/v1/students/application/1/apply', ['STUDENT']);
        });

        it('should apply to a job successfully when eligible', async () => {
            // 1. Create Admin
            const admin = await prisma.user.create({
                data: {
                    email: 'admin-app@example.com',
                    password: 'HashedPassword123',
                    role: 'ADMIN',
                },
            });

            // 2. Create Job
            const job = await prisma.job.create({
                data: {
                    title: 'Software Engineer Intern',
                    company: 'Acme Corp',
                    description: 'Fun job.',
                    requiredCgpa: 8.0,
                    allowedBranches: ['CSE', 'ETE'],
                    backlogAllowed: false,
                    status: 'ACTIVE',
                    deadline: new Date(Date.now() + 86400000), // tomorrow
                    createdById: admin.id,
                },
            });

            // 3. Create Student User & Profile
            const student = await prisma.user.create({
                data: {
                    email: 'stud-app@example.com',
                    password: 'HashedPassword123',
                    role: 'STUDENT',
                    isProfileCompleted: true,
                },
            });

            await prisma.studentProfile.create({
                data: {
                    userId: student.id,
                    fullName: 'Sahil Malakar',
                    branch: 'CSE',
                    rollNo: '2026/CSE/10',
                    astuRollNo: 'ASTU/2026/CSE/10',
                    dob: new Date('2004-05-15'),
                    cgpa: 8.5,
                    backlog: false,
                    verificationStatus: 'VERIFIED',
                },
            });

            const cookie = await getAuthCookie('STUDENT', student.id, student.email);

            // 4. Apply
            const res = await request(app)
                .post(`/api/v1/students/application/${job.id}/apply`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.jobId).toBe(job.id);
            expect(res.body.data.status).toBe('APPLIED');
        });

        it('should fail if student has already applied', async () => {
            // Reuse student and job created in first test
            const student = await prisma.user.findUnique({ where: { email: 'stud-app@example.com' } });
            const job = await prisma.job.findFirst({ where: { company: 'Acme Corp' } });
            const cookie = await getAuthCookie('STUDENT', student!.id, student!.email);

            const res = await request(app)
                .post(`/api/v1/students/application/${job!.id}/apply`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Already applied');
        });

        it('should fail if student CGPA is below required CGPA', async () => {
            const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
            const job = await prisma.job.create({
                data: {
                    title: 'High CGPA Job',
                    company: 'High Corp',
                    description: 'Needs 9.0 CGPA',
                    requiredCgpa: 9.0,
                    allowedBranches: ['CSE'],
                    backlogAllowed: true,
                    status: 'ACTIVE',
                    deadline: new Date(Date.now() + 86400000),
                    createdById: admin!.id,
                },
            });

            const student = await prisma.user.findUnique({ where: { email: 'stud-app@example.com' } });
            const cookie = await getAuthCookie('STUDENT', student!.id, student!.email);

            const res = await request(app)
                .post(`/api/v1/students/application/${job.id}/apply`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('CGPA too low');
        });

        it('should fail if student branch is not allowed', async () => {
            const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
            const job = await prisma.job.create({
                data: {
                    title: 'ETE Only Job',
                    company: 'ETE Corp',
                    description: 'No CSE allowed',
                    requiredCgpa: 7.0,
                    allowedBranches: ['ETE'],
                    backlogAllowed: true,
                    status: 'ACTIVE',
                    deadline: new Date(Date.now() + 86400000),
                    createdById: admin!.id,
                },
            });

            const student = await prisma.user.findUnique({ where: { email: 'stud-app@example.com' } });
            const cookie = await getAuthCookie('STUDENT', student!.id, student!.email);

            const res = await request(app)
                .post(`/api/v1/students/application/${job.id}/apply`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Branch not eligible');
        });
    });

    describe('GET /api/v1/students/application', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/students/application', ['STUDENT']);
        });

        it('should get applications list for authenticated student', async () => {
            const student = await prisma.user.findUnique({ where: { email: 'stud-app@example.com' } });
            const cookie = await getAuthCookie('STUDENT', student!.id, student!.email);

            const res = await request(app)
                .get('/api/v1/students/application')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.data[0].job).toBeDefined();
        });
    });
});
