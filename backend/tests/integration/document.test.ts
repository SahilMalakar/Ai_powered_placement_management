import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';

describe('Document Module Integration Tests', () => {
    describe('GET /api/v1/students/document', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/students/document', ['STUDENT']);
        });

        it('should return empty list if no documents exist', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'nodocs@example.com',
                    password: 'HashedPassword123',
                    role: 'STUDENT',
                    isProfileCompleted: true,
                },
            });
            await prisma.studentProfile.create({
                data: {
                    userId: user.id,
                    fullName: 'No Docs',
                    branch: 'CSE',
                    rollNo: '2026/CSE/20',
                    dob: new Date('2004-05-15'),
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .get('/api/v1/students/document')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
        });
    });

    describe('POST /api/v1/students/document', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'post', '/api/v1/students/document', ['STUDENT']);
        });

        it('should successfully queue a document upload', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'uploaddoc@example.com',
                    password: 'HashedPassword123',
                    role: 'STUDENT',
                    isProfileCompleted: true,
                },
            });
            await prisma.studentProfile.create({
                data: {
                    userId: user.id,
                    fullName: 'Uploader Student',
                    branch: 'CSE',
                    rollNo: '2026/CSE/21',
                    dob: new Date('2004-05-15'),
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .post('/api/v1/students/document')
                .set('Cookie', [cookie])
                .field('type', 'SGPA')
                .field('semester', 1)
                .attach('file', Buffer.from('dummy pdf content'), 'marksheet_sem1.pdf');

            expect(res.status).toBe(202);
            expect(res.body.success).toBe(true);
            expect(res.body.data.jobId).toBeDefined();
            expect(res.body.data.type).toBe('SGPA');
        });

        it('should fail upload without required file', async () => {
            const user = await prisma.user.findUnique({ where: { email: 'uploaddoc@example.com' } });
            const cookie = await getAuthCookie('STUDENT', user!.id, user!.email);

            const res = await request(app)
                .post('/api/v1/students/document')
                .set('Cookie', [cookie])
                .field('type', 'SGPA')
                .field('semester', 1);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('DELETE /api/v1/students/document/:id', () => {
        it('should delete a document successfully', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'deletedoc@example.com',
                    password: 'HashedPassword123',
                    role: 'STUDENT',
                    isProfileCompleted: true,
                },
            });
            await prisma.studentProfile.create({
                data: {
                    userId: user.id,
                    fullName: 'Deleter Student',
                    branch: 'CSE',
                    rollNo: '2026/CSE/22',
                    dob: new Date('2004-05-15'),
                },
            });
            const document = await prisma.document.create({
                data: {
                    userId: user.id,
                    type: 'SGPA',
                    semester: 1,
                    url: 'https://cloudinary.com/test.pdf',
                    publicId: 'test_public_id',
                },
            });

            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .delete(`/api/v1/students/document/${document.id}`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify database hard deletion
            const dbDoc = await prisma.document.findUnique({ where: { id: document.id } });
            expect(dbDoc).toBeNull();
        });

        it('should fail when deleting another student\'s document', async () => {
            const user1 = await prisma.user.findUnique({ where: { email: 'deletedoc@example.com' } });
            const user2 = await prisma.user.create({
                data: {
                    email: 'thief@example.com',
                    password: 'HashedPassword123',
                    role: 'STUDENT',
                    isProfileCompleted: true,
                },
            });
            await prisma.studentProfile.create({
                data: {
                    userId: user2.id,
                    fullName: 'Thief Student',
                    branch: 'CSE',
                    rollNo: '2026/CSE/23',
                    dob: new Date('2004-05-15'),
                },
            });

            // Create a document belonging to user1
            const document = await prisma.document.create({
                data: {
                    userId: user1!.id,
                    type: 'OTHER',
                    url: 'https://cloudinary.com/secret.pdf',
                },
            });

            const cookie = await getAuthCookie('STUDENT', user2.id, user2.email);

            const res = await request(app)
                .delete(`/api/v1/students/document/${document.id}`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });
});
