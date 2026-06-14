import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';

describe('Admin Team Module Integration Tests', () => {
    const setupSuperAdmin = async () => {
        return await prisma.user.create({
            data: {
                email: `super-${Date.now()}@example.com`,
                password: 'HashedPassword123',
                role: 'SUPER_ADMIN',
            },
        });
    };

    const setupAdmin = async () => {
        return await prisma.user.create({
            data: {
                email: `admin-${Date.now()}@example.com`,
                password: 'HashedPassword123',
                role: 'ADMIN',
            },
        });
    };

    describe('GET /api/v1/admin/team', () => {
        it('should check auth guard (requires SUPER_ADMIN)', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/admin/team', ['SUPER_ADMIN']);
        });

        it('should retrieve all admin users successfully', async () => {
            const superAdmin = await setupSuperAdmin();
            const admin = await setupAdmin();
            const cookie = await getAuthCookie('SUPER_ADMIN', superAdmin.id, superAdmin.email);

            const res = await request(app)
                .get('/api/v1/admin/team')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(2);
            const emails = res.body.data.map((u: any) => u.email);
            expect(emails).toContain(superAdmin.email);
            expect(emails).toContain(admin.email);
        });
    });

    describe('POST /api/v1/admin/team', () => {
        it('should check auth guard (requires SUPER_ADMIN)', async () => {
            await expectAuthGuarded(app, 'post', '/api/v1/admin/team', ['SUPER_ADMIN']);
        });

        it('should register a new admin member successfully', async () => {
            const superAdmin = await setupSuperAdmin();
            const cookie = await getAuthCookie('SUPER_ADMIN', superAdmin.id, superAdmin.email);

            const newAdminEmail = `newadmin-${Date.now()}@example.com`;
            const res = await request(app)
                .post('/api/v1/admin/team')
                .set('Cookie', [cookie])
                .send({
                    email: newAdminEmail,
                    password: 'SecurePassword123',
                    role: 'ADMIN',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe(newAdminEmail);
            expect(res.body.data.role).toBe('ADMIN');
        });

        it('should fail with invalid email or short password', async () => {
            const superAdmin = await setupSuperAdmin();
            const cookie = await getAuthCookie('SUPER_ADMIN', superAdmin.id, superAdmin.email);

            const res = await request(app)
                .post('/api/v1/admin/team')
                .set('Cookie', [cookie])
                .send({
                    email: 'invalid-email',
                    password: '123',
                    role: 'ADMIN',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('PATCH /api/v1/admin/team/:id/role', () => {
        it('should check auth guard (requires SUPER_ADMIN)', async () => {
            await expectAuthGuarded(app, 'patch', '/api/v1/admin/team/1/role', ['SUPER_ADMIN']);
        });

        it('should swap admin role successfully', async () => {
            const superAdmin = await setupSuperAdmin();
            const admin = await setupAdmin();
            const cookie = await getAuthCookie('SUPER_ADMIN', superAdmin.id, superAdmin.email);

            const res = await request(app)
                .patch(`/api/v1/admin/team/${admin.id}/role`)
                .set('Cookie', [cookie])
                .send({
                    role: 'SUPER_ADMIN',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.role).toBe('SUPER_ADMIN');
        });
    });

    describe('DELETE /api/v1/admin/team/:id', () => {
        it('should check auth guard (requires SUPER_ADMIN)', async () => {
            await expectAuthGuarded(app, 'delete', '/api/v1/admin/team/1', ['SUPER_ADMIN']);
        });

        it('should soft delete/deactivate admin user successfully', async () => {
            const superAdmin = await setupSuperAdmin();
            const admin = await setupAdmin();
            const cookie = await getAuthCookie('SUPER_ADMIN', superAdmin.id, superAdmin.email);

            const res = await request(app)
                .delete(`/api/v1/admin/team/${admin.id}`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify db state
            const dbUser = await prisma.user.findUnique({ where: { id: admin.id } });
            expect(dbUser!.deletedAt).not.toBeNull();
        });
    });

    describe('POST /api/v1/admin/team/:id/reactivate', () => {
        it('should check auth guard (requires SUPER_ADMIN)', async () => {
            await expectAuthGuarded(app, 'post', '/api/v1/admin/team/1/reactivate', ['SUPER_ADMIN']);
        });

        it('should reactivate a deactivated/deleted admin user successfully', async () => {
            const superAdmin = await setupSuperAdmin();
            // Create a soft-deleted admin
            const admin = await prisma.user.create({
                data: {
                    email: `admin-deleted-${Date.now()}@example.com`,
                    password: 'HashedPassword123',
                    role: 'ADMIN',
                    deletedAt: new Date(),
                },
            });

            const cookie = await getAuthCookie('SUPER_ADMIN', superAdmin.id, superAdmin.email);

            const res = await request(app)
                .post(`/api/v1/admin/team/${admin.id}/reactivate`)
                .set('Cookie', [cookie])
                .send({
                    password: 'NewSecurePassword123',
                    role: 'ADMIN',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify db state
            const dbUser = await prisma.user.findUnique({ where: { id: admin.id } });
            expect(dbUser!.deletedAt).toBeNull();
        });
    });
});
