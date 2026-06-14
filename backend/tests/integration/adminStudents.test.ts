import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { prisma } from '../../src/prisma/prisma.js';
import { getAuthCookie } from '../helpers/auth.js';
import { expectAuthGuarded } from '../helpers/authGuard.js';

describe('Admin Students Module Integration Tests', () => {
    const setupAdminAndStudents = async () => {
        // Create an admin
        const admin = await prisma.user.create({
            data: {
                email: `admin-${Date.now()}@example.com`,
                password: 'HashedPassword123',
                role: 'ADMIN',
            },
        });

        // Create a super admin
        const superAdmin = await prisma.user.create({
            data: {
                email: `superadmin-${Date.now()}@example.com`,
                password: 'HashedPassword123',
                role: 'SUPER_ADMIN',
            },
        });

        // Create student 1
        const student1 = await prisma.user.create({
            data: {
                email: `student1-${Date.now()}@example.com`,
                password: 'HashedPassword123',
                role: 'STUDENT',
            },
        });
        await prisma.studentProfile.create({
            data: {
                userId: student1.id,
                fullName: 'Alice Student',
                branch: 'CSE',
                rollNo: `R1-${Date.now()}`,
                dob: new Date('2004-01-01'),
                cgpa: 9.5,
                verificationStatus: 'VERIFIED',
            },
        });

        // Create student 2
        const student2 = await prisma.user.create({
            data: {
                email: `student2-${Date.now()}@example.com`,
                password: 'HashedPassword123',
                role: 'STUDENT',
            },
        });
        await prisma.studentProfile.create({
            data: {
                userId: student2.id,
                fullName: 'Bob Student',
                branch: 'ETE',
                rollNo: `R2-${Date.now()}`,
                dob: new Date('2004-02-02'),
                cgpa: 7.5,
                verificationStatus: 'PROCESSING',
            },
        });

        return { admin, superAdmin, student1, student2 };
    };

    describe('GET /api/v1/admin/students', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/admin/students', ['ADMIN', 'SUPER_ADMIN']);
        });

        it('should successfully get all students', async () => {
            const { admin } = await setupAdminAndStudents();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .get('/api/v1/admin/students')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.students).toBeInstanceOf(Array);
            expect(res.body.data.students.length).toBeGreaterThanOrEqual(2);
        });

        it('should filter students by branch', async () => {
            const { admin } = await setupAdminAndStudents();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .get('/api/v1/admin/students?branch=CSE')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            const branches = res.body.data.students.map((s: any) => s.profile?.branch);
            expect(branches.every((b: string) => b === 'CSE')).toBe(true);
        });
    });

    describe('GET /api/v1/admin/students/:id', () => {
        it('should check auth guard', async () => {
            await expectAuthGuarded(app, 'get', '/api/v1/admin/students/1', ['ADMIN', 'SUPER_ADMIN']);
        });

        it('should fetch single student details', async () => {
            const { admin, student1 } = await setupAdminAndStudents();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .get(`/api/v1/admin/students/${student1.id}`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe(student1.email);
            expect(res.body.data.profile.fullName).toBe('Alice Student');
        });

        it('should return 404 for non-existent student', async () => {
            const { admin } = await setupAdminAndStudents();
            const cookie = await getAuthCookie('ADMIN', admin.id, admin.email);

            const res = await request(app)
                .get('/api/v1/admin/students/99999')
                .set('Cookie', [cookie]);

            expect(res.status).toBe(404);
        });
    });

    describe('DELETE /api/v1/admin/students/:id', () => {
        it('should check auth guard (requires SUPER_ADMIN)', async () => {
            await expectAuthGuarded(app, 'delete', '/api/v1/admin/students/1', ['SUPER_ADMIN']);
        });

        it('should soft delete/deactivate student account', async () => {
            const { superAdmin, student2 } = await setupAdminAndStudents();
            const cookie = await getAuthCookie('SUPER_ADMIN', superAdmin.id, superAdmin.email);

            const res = await request(app)
                .delete(`/api/v1/admin/students/${student2.id}`)
                .set('Cookie', [cookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify database soft delete / deactivated
            const dbUser = await prisma.user.findUnique({ where: { id: student2.id } });
            expect(dbUser!.deletedAt).not.toBeNull();
        });
    });
});
