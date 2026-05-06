import type { GetAllStudentsQueryInput } from "../../../types/admin/student.js";
import { NotFoundError } from "../../../utils/errors/httpErrors.js";
import { getAllStudentRepository, getStudentByIdRepository } from "../repositories/students.repository.js";


export const getAllStudentService = async (query: GetAllStudentsQueryInput) => {
    // get all the students from the database
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const { search, branch, cgpa, backlogAllowed, verificationStatus } = query;

    const { students, totalCount } = await getAllStudentRepository({
        skip,
        search,
        branch,
        cgpa,
        backlogAllowed,
        verificationStatus,
        page,
        limit,
    })

    return {
        students,
        pagination: {
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
        }
    }
}

export const getStudentByIdService = async(studentId:number)=>{
    const student = await getStudentByIdRepository(studentId);

    if (!student) {
        throw new NotFoundError("Student not Found")
    }

    return student
}