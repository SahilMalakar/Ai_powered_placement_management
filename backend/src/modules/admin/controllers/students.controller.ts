import { sendSuccess } from '../../../utils/ApiResonse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { BadRequestError, UnauthorizedError } from '../../../utils/errors/httpErrors.js';
import { HTTP_STATUS } from '../../../utils/httpStatus.js';
import { getAllStudentService, getStudentByIdService } from '../services/student.service.js';
import { getAllStudentsQuerySchema } from '../../../types/admin/student.js';

/**
 * Controller to fetch all students with filtering and pagination.
 * Accessible only by ADMIN and SUPER_ADMIN.
 */
export const getAllStudentsController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    // 1. Validate query parameters
    const result = getAllStudentsQuerySchema.safeParse(req.query);

    if (!result.success) {
        const message = result.error.issues
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
        throw new BadRequestError(`Invalid query parameters: ${message}`);
    }

    // 2. Call service with validated data
    const data = await getAllStudentService(result.data);

    // 3. Return response
    return sendSuccess(
        res,
        data,
        'Students fetched successfully',
        HTTP_STATUS.OK
    );
});


export const getStudentByIdController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const { id: studentId } = req.params;
    const data = await getStudentByIdService(Number(studentId))

    return sendSuccess(
        res,
        data,
        'Student fetched successfully',
        HTTP_STATUS.OK
    )
})