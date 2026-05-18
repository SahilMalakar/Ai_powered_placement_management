import { sendSuccess } from '../../../utils/ApiResonse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import {
    accessTokenCookieOptions,
    cookieOption,
    refreshTokenCookieOptions,
} from '../../../utils/cookieOption.js';
import { UnauthorizedError } from '../../../utils/errors/httpErrors.js';
import { HTTP_STATUS } from '../../../utils/httpStatus.js';
import {
    changePasswordService,
    forgetPasswordService,
    loginService,
    logoutService,
    meService,
    refreshTokenService,
    resetPasswordService,
    signupService,
} from '../services/auth.service.js';

export const signupController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await signupService({
        email,
        password,
    });

    res.cookie('token', accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    return sendSuccess(
        res,
        { user, token: accessToken },
        'Signup successful',
        HTTP_STATUS.CREATED
    );
});

export const loginController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { isUserExist, accessToken, refreshToken } = await loginService({
        email,
        password,
    });

    console.log('login token : ', accessToken);

    res.cookie('token', accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    return sendSuccess(
        res,
        {
            user: {
                id: isUserExist.id,
                email: isUserExist.email,
                role: isUserExist.role,
                isProfileCompleted: isUserExist.isProfileCompleted,
            },
            token: accessToken,
        },
        'Login successful',
        HTTP_STATUS.OK
    );
});

export const meController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const { userId } = req.user;

    const user = await meService(userId);

    return sendSuccess(res, user, 'User fetched successfully', HTTP_STATUS.OK);
});

export const logoutController = asyncHandler(async (req, res) => {
    await logoutService(req.user?.userId);

    res.clearCookie('token', cookieOption);
    res.clearCookie('refreshToken', cookieOption);

    return sendSuccess(res, null, 'Logged out successfully', HTTP_STATUS.OK);
});

export const changePasswordController = asyncHandler(async (req, res) => {
    // will add ownership-based authorization check (implicitly handled by req.user

    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const { userId } = req.user;

    const { oldPassword, newPassword } = req.body;

    await changePasswordService(userId, {
        oldPassword,
        newPassword,
    });

    return sendSuccess(
        res,
        null,
        'Password changed successfully',
        HTTP_STATUS.OK
    );
});

export const forgetPasswordController = asyncHandler(async (req, res) => {
    const { email } = req.body;
    await forgetPasswordService({ email });

    return sendSuccess(
        res,
        null,
        'If an account exists with this email, an OTP has been sent.',
        HTTP_STATUS.OK
    );
});

export const resetPasswordController = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    await resetPasswordService({ email, otp, newPassword });

    return sendSuccess(
        res,
        null,
        'Password reset successfully',
        HTTP_STATUS.OK
    );
});

export const refreshTokenController = asyncHandler(async (req, res) => {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
        throw new UnauthorizedError('Refresh token missing');
    }

    const { newAccessToken, newRefreshToken } =
        await refreshTokenService(oldRefreshToken);

    res.cookie('token', newAccessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);

    return sendSuccess(
        res,
        { token: newAccessToken },
        'Tokens refreshed successfully',
        HTTP_STATUS.OK
    );
});
