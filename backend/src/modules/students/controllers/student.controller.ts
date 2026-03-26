import { sendSuccess } from "../../../utils/ApiResonse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { UnauthorizedError } from "../../../utils/errors/httpErrors.js";
import { HTTP_STATUS } from "../../../utils/httpStatus.js";
import { createStudentProfileService, getStudentProfileService, updateStudentProfile } from "../services/student.service.js";



//  Returns the full merged data: User + Profile + Relations + Semesters

export const getStudentProfileController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized")
    }

    const userId = req.user.userId;
    const result = await getStudentProfileService(userId);

    return sendSuccess(
        res,
        result,
        "Profile fetched successfully",
        HTTP_STATUS.OK
    );
});

export const createStudentProfileController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized")
    }

    const userId = req.user.userId;

    const studentProfile = await createStudentProfileService(userId, req.body);

    return sendSuccess(
        res,
        studentProfile,
        "Profile created successfully",
        HTTP_STATUS.CREATED)
})

export const updateProfileController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized")
    }

    const userId = req.user.userId;
    const result = await updateStudentProfile(userId, req.body);

    return sendSuccess(
        res,
        result,
        "Profile updated successfully",
        HTTP_STATUS.OK
    );
});