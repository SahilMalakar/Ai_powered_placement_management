import request from 'supertest';
import { expect } from 'vitest';
import type { Express } from 'express';
import { getAuthCookie } from './auth.js';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
type RoleType = 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';

export const expectAuthGuarded = async (
    app: Express,
    method: HttpMethod,
    path: string,
    allowedRoles: RoleType[]
) => {
    // 1. Check that request with no token returns 401
    const noTokenRes = await request(app)[method](path);
    expect(noTokenRes.status).toBe(401);

    // 2. Check that roles not in allowedRoles return 403
    const allRoles: RoleType[] = ['STUDENT', 'ADMIN', 'SUPER_ADMIN'];
    const forbiddenRoles = allRoles.filter(role => !allowedRoles.includes(role));

    for (const role of forbiddenRoles) {
        const cookie = await getAuthCookie(role);
        const forbiddenRes = await request(app)[method](path)
            .set('Cookie', [cookie]);
        expect(forbiddenRes.status).toBe(403);
    }
};
