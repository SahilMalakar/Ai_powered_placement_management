import { generateToken } from '../../src/shared/utils/jwt/generateToken.js';

export const getAuthCookie = async (
    role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN',
    userId: number = 1,
    email: string = 'test@example.com'
): Promise<string> => {
    const token = await generateToken({ userId, role, email });
    return `token=${token}`;
};
