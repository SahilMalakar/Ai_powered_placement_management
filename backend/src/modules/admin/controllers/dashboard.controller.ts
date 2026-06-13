import { sendSuccess } from '../../../shared/utils/ApiResonse.js';
import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { UnauthorizedError } from '../../../shared/utils/errors/httpErrors.js';
import { HTTP_STATUS } from '../../../shared/utils/httpStatus.js';
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
