import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';

describe('SocialLink Module Integration Tests', () => {
    const socialLinkData = {
        platform: 'GitHub',
        url: 'https://github.com/sahilmalakar',
    };

    const setupUserWithProfile = async (email: string) => {
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
                rollNo: '2026/CSE/60',
                dob: new Date('2004-05-15'),
            },
        });
        return { user, profile };
    };

    describe('GET /api/v1/students/profile/socialLink', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/students/profile/socialLink', ['STUDENT']);
        });

        it('should fetch empty social link list', async () => {
            const { user } = await setupUserWithProfile('socialLink1@example.com');
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .get('/api/v1/students/profile/socialLink')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
        });
    });

    describe('POST /api/v1/students/profile/socialLink', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'post', '/api/v1/students/profile/socialLink', ['STUDENT']);
        });

        it('should add social link successfully', async () => {
            const { user } = await setupUserWithProfile('socialLink2@example.com');
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .post('/api/v1/students/profile/socialLink')
                .set('Cookie', [cookie])
                .send(socialLinkData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.platform).toBe('GitHub');
            expect(res.body.data.url).toBe('https://github.com/sahilmalakar');
        });
    });

    describe('PATCH /api/v1/students/profile/socialLink/:id', () => {
        it('should update social link details', async () => {
            const { user, profile } = await setupUserWithProfile('socialLink3@example.com');
            const link = await prisma.socialLink.create({
                data: {
                    profileId: profile.id,
                    platform: 'LinkedIn',
                    url: 'https://linkedin.com/in/old',
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .patch(`/api/v1/students/profile/socialLink/${link.id}`)
                .set('Cookie', [cookie])
                .send({
                    url: 'https://linkedin.com/in/new',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.url).toBe('https://linkedin.com/in/new');
        });
    });

    describe('DELETE /api/v1/students/profile/socialLink/:id', () => {
        it('should delete social link details', async () => {
            const { user, profile } = await setupUserWithProfile('socialLink4@example.com');
            const link = await prisma.socialLink.create({
                data: {
                    profileId: profile.id,
                    platform: 'Portfolio',
                    url: 'https://sahil.dev',
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .delete(`/api/v1/students/profile/socialLink/${link.id}`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const dbLink = await prisma.socialLink.findUnique({ where: { id: link.id } });
            expect(dbLink).toBeNull();
        });
    });
});
