import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';

describe('Project Module Integration Tests', () => {
    const projectData = {
        title: 'E-Commerce Platform',
        description: ['Developed frontend with Next.js', 'Built API gateway with NestJS'],
        link: 'https://github.com/test/ecommerce',
        keyTools: 'Next.js, NestJS, Postgres',
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
                rollNo: '2026/CSE/40',
                dob: new Date('2004-05-15'),
            },
        });
        return { user, profile };
    };

    describe('GET /api/v1/students/profile/project', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/students/profile/project', ['STUDENT']);
        });

        it('should fetch empty project list', async () => {
            const { user } = await setupUserWithProfile('project1@example.com');
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .get('/api/v1/students/profile/project')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
        });
    });

    describe('POST /api/v1/students/profile/project', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'post', '/api/v1/students/profile/project', ['STUDENT']);
        });

        it('should add project successfully', async () => {
            const { user } = await setupUserWithProfile('project2@example.com');
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .post('/api/v1/students/profile/project')
                .set('Cookie', [cookie])
                .send(projectData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('E-Commerce Platform');
            expect(res.body.data.keyTools).toBe('Next.js, NestJS, Postgres');
        });
    });

    describe('PATCH /api/v1/students/profile/project/:id', () => {
        it('should update project details', async () => {
            const { user, profile } = await setupUserWithProfile('project3@example.com');
            const project = await prisma.project.create({
                data: {
                    profileId: profile.id,
                    title: 'Old Title',
                    description: ['Boring project'],
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .patch(`/api/v1/students/profile/project/${project.id}`)
                .set('Cookie', [cookie])
                .send({
                    title: 'New Title',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('New Title');
        });
    });

    describe('DELETE /api/v1/students/profile/project/:id', () => {
        it('should delete project details', async () => {
            const { user, profile } = await setupUserWithProfile('project4@example.com');
            const project = await prisma.project.create({
                data: {
                    profileId: profile.id,
                    title: 'Temporary project',
                    description: ['Boring project'],
                },
            });
            const cookie = await getAuthCookie('STUDENT', user.id, user.email);

            const res = await request(app)
                .delete(`/api/v1/students/profile/project/${project.id}`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const dbProj = await prisma.project.findUnique({ where: { id: project.id } });
            expect(dbProj).toBeNull();
        });
    });
});
