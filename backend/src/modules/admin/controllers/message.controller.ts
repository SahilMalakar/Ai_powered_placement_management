import { sendSuccess } from '../../../utils/ApiResonse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { BadRequestError, UnauthorizedError } from '../../../utils/errors/httpErrors.js';
import { HTTP_STATUS } from '../../../utils/httpStatus.js';
import { createAdminMessageSchema, getAdminMessagesHistoryQuerySchema } from '../../../types/admin/message.js';
import { sendAdminMessageService, getAdminMessagesHistoryService } from '../services/message.service.js';

/**
 * Controller to create and broadcast a branch-specific notification.
 * Accessible only by ADMIN and SUPER_ADMIN.
 */
export const sendAdminMessageController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    // 1. Validate request body against schema
    const result = createAdminMessageSchema.safeParse(req.body);

    if (!result.success) {
        const message = result.error.issues
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
        throw new BadRequestError(`Invalid payload: ${message}`);
    }

    // 2. Extract validated payload
    const { message: msgContent, link, branches } = result.data;

    // 3. Dispatch to service layer
    const data = await sendAdminMessageService({
        message: msgContent,
        branches,
        adminUserId: req.user.userId,
        ...(link !== undefined ? { link } : {}),
    });

    // 4. Custom message for UX if no student recipients found in branches
    const successMsg = data.recipientCount === 0 
        ? 'Announcement logged successfully, but no active student profiles were found in targeted branches.'
        : `Broadcast queued successfully for ${data.recipientCount} student(s) in targeted branch(es).`;

    // 5. Send success response
    return sendSuccess(
        res,
        data,
        successMsg,
        HTTP_STATUS.CREATED
    );
});

/**
 * Controller to get notification broadcast history.
 * Accessible only by ADMIN and SUPER_ADMIN.
 */
export const getAdminMessagesHistoryController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    // 1. Validate pagination query parameters
    const result = getAdminMessagesHistoryQuerySchema.safeParse(req.query);

    if (!result.success) {
        const message = result.error.issues
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
        throw new BadRequestError(`Invalid query parameters: ${message}`);
    }

    const data = await getAdminMessagesHistoryService(result.data);

    return sendSuccess(
        res,
        data,
        'Admin announcement history fetched successfully.',
        HTTP_STATUS.OK
    );
});
