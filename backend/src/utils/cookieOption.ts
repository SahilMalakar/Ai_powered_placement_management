export const cookieOption = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
} as const;

export const accessTokenCookieOptions = {
    ...cookieOption,
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
} as const;

export const refreshTokenCookieOptions = {
    ...cookieOption,
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
} as const;
