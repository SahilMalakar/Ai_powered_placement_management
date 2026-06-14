import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';

describe('Verification Module Integration Tests', () => {
    const setupUserWithProfile = async (email: string, options: { verificationStatus?: any } = {}) => {
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
                branch: 'CSE',
                rollNo: '2026/CSE/80',
                dob: new Date('2004-05-15'),
                verificationStatus: options.verificationStatus ?? 'NOT_VERIFIED',
            },
        });
        return { user, profile };
    };

    describe('POST /api/v1/students/verification', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'post', '/api/v1/students/verification', ['STUDENT']);
        });

        it('should fail verification if student has no profile', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'no-profile-verify@example.com',
                    password: 'HashedPassword123',
                    role: 'STUDENT',
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .post('/api/v1/students/verification')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('profile not found');
        });

        it('should fail verification if student has no SGPA marksheets', async () => {
            const { user } = await setupUserWithProfile('no-marksheet@example.com');
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .post('/api/v1/students/verification')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('No SGPA marksheets found');
        });

        it('should successfully initiate verification when conditions are met', async () => {
            const { user } = await setupUserWithProfile('verify-success@example.com');
            
            // Add at least one SGPA document
            await prisma.document.create({
                data: {
                    userId: user.id,
                    type: 'SGPA',
                    semester: 1,
                    url: 'https://cloudinary.com/marksheet.pdf',
                },
            });

            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .post('/api/v1/students/verification')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('PROCESSING');

            // Verify database update
            const dbProfile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
            expect(dbProfile!.verificationStatus).toBe('PROCESSING');
        });

        it('should fail if verification is already processing', async () => {
            const { user } = await setupUserWithProfile('already-processing@example.com', {
                verificationStatus: 'PROCESSING',
            });

            // Add marksheet to satisfy pre-conditions
            await prisma.document.create({
                data: {
                    userId: user.id,
                    type: 'SGPA',
                    semester: 1,
                    url: 'https://cloudinary.com/marksheet.pdf',
                },
            });

            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .post('/api/v1/students/verification')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('already processing');
        });
    });
});
