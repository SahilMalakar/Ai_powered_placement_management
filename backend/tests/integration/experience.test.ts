import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';

describe('Experience Module Integration Tests', () => {
    const experienceData = {
        role: 'Frontend Intern',
        company: 'Microsoft',
        location: 'Redmond',
        startDate: '2025-05-01',
        endDate: '2025-08-31',
        description: ['Developing dashboard components', 'Optimizing accessibility'],
        toolsUsed: 'React, TypeScript, CSS',
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
                rollNo: '2026/CSE/30',
                dob: new Date('2004-05-15'),
            },
        });
        return { user, profile };
    };

    describe('GET /api/v1/students/profile/experience', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/students/profile/experience', ['STUDENT']);
        });

        it('should fetch empty experience list', async () => {
            const { user } = await setupUserWithProfile('experience1@example.com');
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .get('/api/v1/students/profile/experience')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
        });
    });

    describe('POST /api/v1/students/profile/experience', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'post', '/api/v1/students/profile/experience', ['STUDENT']);
        });

        it('should add experience successfully', async () => {
            const { user } = await setupUserWithProfile('experience2@example.com');
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .post('/api/v1/students/profile/experience')
                .set('Cookie', [cookie])
                .send(experienceData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.role).toBe('Frontend Intern');
            expect(res.body.data.company).toBe('Microsoft');
        });
    });

    describe('PATCH /api/v1/students/profile/experience/:id', () => {
        it('should update experience details', async () => {
            const { user, profile } = await setupUserWithProfile('experience3@example.com');
            const experience = await prisma.experience.create({
                data: {
                    profileId: profile.id,
                    role: 'Intern',
                    company: 'Old Corp',
                    startDate: new Date('2025-05-01'),
                    description: ['Boring work'],
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .patch(`/api/v1/students/profile/experience/${experience.id}`)
                .set('Cookie', [cookie])
                .send({
                    role: 'Lead Developer Intern',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.role).toBe('Lead Developer Intern');
        });
    });

    describe('DELETE /api/v1/students/profile/experience/:id', () => {
        it('should delete experience details', async () => {
            const { user, profile } = await setupUserWithProfile('experience4@example.com');
            const experience = await prisma.experience.create({
                data: {
                    profileId: profile.id,
                    role: 'Temporary Role',
                    company: 'Old Corp',
                    startDate: new Date('2025-05-01'),
                    description: ['Quick work'],
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .delete(`/api/v1/students/profile/experience/${experience.id}`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const dbExp = await prisma.experience.findUnique({ where: { id: experience.id } });
            expect(dbExp).toBeNull();
        });
    });
});
