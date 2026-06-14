import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';

describe('AdditionalDetail Module Integration Tests', () => {
    const detailData = {
        title: 'Open Source Contribution',
        description: ['Contributed to Kubernetes scheduler bugs', 'Optimized memory constraints'],
        date: '2025-10-01',
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
                rollNo: '2026/CSE/70',
                dob: new Date('2004-05-15'),
            },
        });
        return { user, profile };
    };

    describe('GET /api/v1/students/profile/additionalDetail', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/students/profile/additionalDetail', ['STUDENT']);
        });

        it('should fetch empty additional detail list', async () => {
            const { user } = await setupUserWithProfile('detail1@example.com');
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .get('/api/v1/students/profile/additionalDetail')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
        });
    });

    describe('POST /api/v1/students/profile/additionalDetail', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'post', '/api/v1/students/profile/additionalDetail', ['STUDENT']);
        });

        it('should add additional detail successfully', async () => {
            const { user } = await setupUserWithProfile('detail2@example.com');
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .post('/api/v1/students/profile/additionalDetail')
                .set('Cookie', [cookie])
                .send(detailData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('Open Source Contribution');
        });
    });

    describe('PATCH /api/v1/students/profile/additionalDetail/:id', () => {
        it('should update additional detail', async () => {
            const { user, profile } = await setupUserWithProfile('detail3@example.com');
            const detail = await prisma.additionalDetail.create({
                data: {
                    profileId: profile.id,
                    title: 'Old Achievement',
                    description: ['Old stuff'],
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .patch(`/api/v1/students/profile/additionalDetail/${detail.id}`)
                .set('Cookie', [cookie])
                .send({
                    title: 'New Achievement',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('New Achievement');
        });
    });

    describe('DELETE /api/v1/students/profile/additionalDetail/:id', () => {
        it('should delete additional detail', async () => {
            const { user, profile } = await setupUserWithProfile('detail4@example.com');
            const detail = await prisma.additionalDetail.create({
                data: {
                    profileId: profile.id,
                    title: 'Temp detail',
                    description: ['Temp stuff'],
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .delete(`/api/v1/students/profile/additionalDetail/${detail.id}`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const dbDetail = await prisma.additionalDetail.findUnique({ where: { id: detail.id } });
            expect(dbDetail).toBeNull();
        });
    });
});
