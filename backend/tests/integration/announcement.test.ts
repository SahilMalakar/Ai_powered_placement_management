import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';

describe('Announcement Module Integration Tests', () => {
    const setupUserWithProfile = async (email: string, branch: any) => {
        const user = await prisma.user.create({
            data: {
                email,
                password: 'HashedPassword123',
                role: 'STUDENT',
                isProfileCompleted: true,
            },
        });
        const profile = await prisma.studentProfile.create({
            data: {
                userId: user.id,
                fullName: 'Sahil Malakar',
                branch,
                rollNo: '2026/CSE/90',
                dob: new Date('2004-05-15'),
            },
        });
        return { user, profile };
    };

    describe('GET /api/v1/students/announcements', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/students/announcements', ['STUDENT']);
        });

        it('should fail if student has no profile', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'no-profile-ann@example.com',
                    password: 'HashedPassword123',
                    role: 'STUDENT',
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .get('/api/v1/students/announcements')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Academic profile not found');
        });

        it('should successfully fetch announcements targeted to student\'s branch', async () => {
            const { user } = await setupUserWithProfile('student-ann@example.com', 'CSE');
            const admin = await prisma.user.create({
                data: {
                    email: 'admin-ann@example.com',
                    password: 'HashedPassword123',
                    role: 'ADMIN',
                },
            });

            // Create notification for CSE students
            await prisma.notificationMessage.create({
                data: {
                    message: 'Important CSE announcement',
                    branches: ['CSE', 'ETE'],
                    status: 'COMPLETED',
                    createdById: admin.id,
                },
            });

            // Create notification for ME students (should not be returned to CSE student)
            await prisma.notificationMessage.create({
                data: {
                    message: 'Mechanical announcement',
                    branches: ['ME'],
                    status: 'COMPLETED',
                    createdById: admin.id,
                },
            });

            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .get('/api/v1/students/announcements')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.messages.length).toBe(1);
            expect(res.body.data.messages[0].message).toBe('Important CSE announcement');
            expect(res.body.data.pagination.totalCount).toBe(1);
        });
    });
});
