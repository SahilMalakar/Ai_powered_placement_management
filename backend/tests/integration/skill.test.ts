import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';

describe('Skill Module Integration Tests', () => {
    const skillData = {
        category: 'Programming Languages',
        skills: ['TypeScript', 'JavaScript', 'Go'],
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
                rollNo: '2026/CSE/50',
                dob: new Date('2004-05-15'),
            },
        });
        return { user, profile };
    };

    describe('GET /api/v1/students/profile/skill', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/students/profile/skill', ['STUDENT']);
        });

        it('should fetch empty skill list', async () => {
            const { user } = await setupUserWithProfile('skill1@example.com');
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .get('/api/v1/students/profile/skill')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
        });
    });

    describe('POST /api/v1/students/profile/skill', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'post', '/api/v1/students/profile/skill', ['STUDENT']);
        });

        it('should add skill successfully', async () => {
            const { user } = await setupUserWithProfile('skill2@example.com');
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .post('/api/v1/students/profile/skill')
                .set('Cookie', [cookie])
                .send(skillData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.category).toBe('Programming Languages');
            expect(res.body.data.skills).toEqual(['TypeScript', 'JavaScript', 'Go']);
        });
    });

    describe('PATCH /api/v1/students/profile/skill/:id', () => {
        it('should update skill details', async () => {
            const { user, profile } = await setupUserWithProfile('skill3@example.com');
            const skill = await prisma.skill.create({
                data: {
                    profileId: profile.id,
                    category: 'Old Category',
                    skills: ['Old Skill'],
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .patch(`/api/v1/students/profile/skill/${skill.id}`)
                .set('Cookie', [cookie])
                .send({
                    category: 'New Category',
                    skills: ['TypeScript'],
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.category).toBe('New Category');
            expect(res.body.data.skills).toEqual(['TypeScript']);
        });
    });

    describe('DELETE /api/v1/students/profile/skill/:id', () => {
        it('should delete skill details', async () => {
            const { user, profile } = await setupUserWithProfile('skill4@example.com');
            const skill = await prisma.skill.create({
                data: {
                    profileId: profile.id,
                    category: 'Temp Category',
                    skills: ['Temp Skill'],
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .delete(`/api/v1/students/profile/skill/${skill.id}`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const dbSkill = await prisma.skill.findUnique({ where: { id: skill.id } });
            expect(dbSkill).toBeNull();
        });
    });
});
