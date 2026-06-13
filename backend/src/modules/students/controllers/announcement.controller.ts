import { sendSuccess } from "../../../shared/utils/ApiResonse.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";
import { UnauthorizedError } from "../../../shared/utils/errors/httpErrors.js";
import { HTTP_STATUS } from "../../../shared/utils/httpStatus.js";
import { getStudentAnnouncementsService } from "../services/announcement.service.js";

/**
 * Controller to fetch active admin broadcasts targeted to the student's cohort.
 */
export const getStudentAnnouncementsController = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new UnauthorizedError("Unauthorized");
  }

  const userId = req.user.userId;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const data = await getStudentAnnouncementsService(userId, { page, limit });

  return sendSuccess(
    res,
    data,
    "Announcements history fetched successfully.",
    HTTP_STATUS.OK
  );
});
