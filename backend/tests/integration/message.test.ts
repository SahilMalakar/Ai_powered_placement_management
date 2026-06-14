import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';

// Mock addBulkEmailsToQueue to prevent queue operations during integration tests
vi.mock('../../src/shared/queues/notification.queue.js', () => {
    return {
        addBulkEmailsToQueue: vi.fn().mockResolvedValue(true),
    };
});

describe('Admin Message Module Integration Tests', () => {
    const setupAdminAndStudents = async () => {
        const admin = await prisma.user.create({
            data: {
                email: `admin-msg-${Date.now()}@example.com`,
                password: 'HashedPassword123',
                role: 'ADMIN',
            },
        });

        // Setup student in target branch CSE
        const student1 = await prisma.user.create({
            data: {
                email: `student-msg1-${Date.now()}@example.com`,
                password: 'HashedPassword123',
                role: 'STUDENT',
            },
        });
        await prisma.studentProfile.create({
            data: {
                userId: student1.id,
                fullName: 'Announce CSE Student',
                branch: 'CSE',
                rollNo: `ROLL-CSE-${Date.now()}`,
                dob: new Date('2004-01-01'),
                verificationStatus: 'VERIFIED',
            },
        });

        // Setup student in non-target branch ME
        const student2 = await prisma.user.create({
            data: {
                email: `student-msg2-${Date.now()}@example.com`,
                password: 'HashedPassword123',
                role: 'STUDENT',
            },
        });
        await prisma.studentProfile.create({
            data: {
                userId: student2.id,
                fullName: 'Announce ME Student',
                branch: 'ME',
                rollNo: `ROLL-ME-${Date.now()}`,
                dob: new Date('2004-01-01'),
                verificationStatus: 'VERIFIED',
            },
        });

        return { admin, student1, student2 };
    };

    describe('POST /api/v1/admin/messages', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'post', '/api/v1/admin/messages', ['ADMIN', 'SUPER_ADMIN']);
        });

        it('should broadcast an announcement successfully to target branch students', async () => {
            const { admin } = await setupAdminAndStudents();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .post('/api/v1/admin/messages')
                .set('Cookie', [cookie])
                .send({
                    message: 'Attention CSE students: Pre-placement talk tomorrow at 10 AM.',
                    link: 'https://docs.google.com/spreadsheets/d/12345',
                    branches: ['CSE'],
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.recipientCount).toBe(1);
            expect(res.body.data.message.status).toBe('COMPLETED');
            expect(res.body.data.message.message).toContain('Attention CSE students');
        });

        it('should handle zero target students gracefully', async () => {
            const { admin } = await setupAdminAndStudents();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .post('/api/v1/admin/messages')
                .set('Cookie', [cookie])
                .send({
                    message: 'Attention EE students: Mandatory lab sessions next week.',
                    link: 'http://example.com/ee-info',
                    branches: ['EE'],
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.recipientCount).toBe(0);
            expect(res.body.data.message.status).toBe('COMPLETED');
        });

        it('should fail with invalid fields', async () => {
            const { admin } = await setupAdminAndStudents();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            // Message too short (needs min 10 chars)
            const res = await request(app)
                .post('/api/v1/admin/messages')
                .set('Cookie', [cookie])
                .send({
                    message: 'Short',
                    branches: ['CSE'],
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/admin/messages', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/admin/messages', ['ADMIN', 'SUPER_ADMIN']);
        });

        it('should retrieve announcement history successfully', async () => {
            const { admin } = await setupAdminAndStudents();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            // Seed a message
            await prisma.notificationMessage.create({
                data: {
                    message: 'Mandatory mock interviews for ME department next Monday.',
                    branches: ['ME'],
                    createdById: admin.id,
                },
            });

            const res = await request(app)
                .get('/api/v1/admin/messages')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.messages.length).toBeGreaterThan(0);
            expect(res.body.data.messages[0].message).toBe('Mandatory mock interviews for ME department next Monday.');
        });
    });
});
