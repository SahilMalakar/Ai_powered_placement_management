import { NotFoundError } from "../../../utils/errors/httpErrors.js";
import { getApplicantByJobIdRepository } from "../repositories/application.repository.js";
import { getJobById } from "../repositories/job.repository.js";

export const getJobApplicantsService = async (jodId:number) => {
    const job = await getJobById(jodId);
    if (!job) {
        throw new NotFoundError(`Job Not Found`)
    }
    return await getApplicantByJobIdRepository(jodId);
}