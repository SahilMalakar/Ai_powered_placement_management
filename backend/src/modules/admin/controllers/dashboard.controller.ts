import { sendSuccess } from '../../../utils/ApiResonse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { UnauthorizedError } from '../../../utils/errors/httpErrors.js';
import { HTTP_STATUS } from '../../../utils/httpStatus.js';
import { getDashboardStatsService } from '../services/dashboard.service.js';

export const getDashboardStatsController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const stats = await getDashboardStatsService();
    return sendSuccess(
        res,
        stats,
        'Dashboard stats fetched successfully',
        HTTP_STATUS.OK
    );
});
