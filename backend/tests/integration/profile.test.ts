import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';

describe('Profile Module Integration Tests', () => {
    const profileData = {
        fullName: 'John Doe',
        branch: 'CSE',
        rollNo: '2026/CSE/01',
        dob: '2004-05-15',
        phoneNumber: '9876543210',
        university: 'Assam Engineering College',
        degree: 'B.Tech',
        graduationYear: 2026,
        summary: 'Aspiring software engineer.',
    };

    describe('GET /api/v1/students/profile', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/students/profile', ['STUDENT']);
        });

        it('should return 404 if profile does not exist', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'noprofile@example.com',
                    password: 'HashedPassword123',
                    role: 'STUDENT',
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .get('/api/v1/students/profile')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/students/profile', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'post', '/api/v1/students/profile', ['STUDENT']);
        });

        it('should create student profile successfully', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'hasprofile@example.com',
                    password: 'HashedPassword123',
                    role: 'STUDENT',
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .post('/api/v1/students/profile')
                .set('Cookie', [cookie])
                .send(profileData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.fullName).toBe('John Doe');
            expect(res.body.data.branch).toBe('CSE');

            // Verify database update
            const updatedUser = await prisma.user.findUnique({
                where: { id: user.id },
            });
            expect(updatedUser!.isProfileCompleted).toBe(true);
        });

        it('should fail with invalid phone format', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'invalidprofile@example.com',
                    password: 'HashedPassword123',
                    role: 'STUDENT',
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .post('/api/v1/students/profile')
                .set('Cookie', [cookie])
                .send({
                    ...profileData,
                    phoneNumber: 'invalid-phone',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('PATCH /api/v1/students/profile', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'patch', '/api/v1/students/profile', ['STUDENT']);
        });

        it('should update profile fields successfully', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'updateprofile@example.com',
                    password: 'HashedPassword123',
                    role: 'STUDENT',
                    isProfileCompleted: true,
                },
            });
            await prisma.studentProfile.create({
                data: {
                    userId: user.id,
                    fullName: 'Old Name',
                    branch: 'CSE',
                    rollNo: '2026/CSE/02',
                    dob: new Date('2004-05-15'),
                    phoneNumber: '9876543210',
                    university: 'AEC',
                    degree: 'B.Tech',
                    graduationYear: 2026,
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .patch('/api/v1/students/profile')
                .set('Cookie', [cookie])
                .send({
                    fullName: 'Sahil Malakar',
                    summary: 'New bio.',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.fullName).toBe('Sahil Malakar');
            expect(res.body.data.summary).toBe('New bio.');
        });
    });

    describe('GET /api/v1/students/profile/academic', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/students/profile/academic', ['STUDENT']);
        });

        it('should fetch academic records successfully', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'academic@example.com',
                    password: 'HashedPassword123',
                    role: 'STUDENT',
                },
            });
            await prisma.studentProfile.create({
                data: {
                    userId: user.id,
                    fullName: 'Academic Stud',
                    branch: 'CSE',
                    rollNo: '2026/CSE/03',
                    dob: new Date('2004-05-15'),
                    cgpa: 8.5,
                },
            });
            await prisma.semesterResult.create({
                data: {
                    userId: user.id,
                    semester: 1,
                    sgpa: 8.2,
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .get('/api/v1/students/profile/academic')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.cgpa).toBe(8.5);
            expect(res.body.data.semesters).toBeDefined();
            expect(res.body.data.semesters[0].semester).toBe(1);
            expect(res.body.data.semesters[0].sgpa).toBe(8.2);
        });
    });
});
