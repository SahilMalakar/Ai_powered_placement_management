import { 
    createMessageRepository, 
    getStudentsByBranchesRepository,
    getAdminByIdRepository,
    getAdminMessagesHistoryRepository,
    updateMessageStatusRepository,
} from "../repositories/message.repository.js";
import { addBulkEmailsToQueue } from "../../../queues/notification.queue.js";
import type { Branch } from "../../../prisma/generated/prisma/enums.js";
import type { GetAdminMessagesHistoryQueryInput } from "../../../types/admin/message.js";

/**
 * Smart URL parser to deduce a contextual CTA button label for student emails.
 * Handles query strings, hash anchors, and all primary Google Workspace apps.
 */
const getButtonLabelForLink = (url?: string): string => {
    if (!url) return 'View Details';
    
    const lowerUrl = url.toLowerCase();
    
    // Edge Case Fix: Strip query parameters (?) and hashes (#) to get the clean file path for suffix matching
    const cleanUrlPath = (lowerUrl.split('?')[0] || '').split('#')[0] || '';
    
    // 1. Google Sheets, Excel spreadsheets, or CSV downloads
    if (
        lowerUrl.includes('docs.google.com/spreadsheets') || 
        lowerUrl.includes('sheets.new') || 
        cleanUrlPath.endsWith('.csv') ||
        cleanUrlPath.endsWith('.xlsx') ||
        cleanUrlPath.endsWith('.xls')
    ) {
        return 'Open Spreadsheet';
    }
    
    // 2. Google Forms Surveys
    if (
        lowerUrl.includes('docs.google.com/forms') || 
        lowerUrl.includes('forms.gle')
    ) {
        return 'Open Google Form';
    }
    
    // 3. Google Docs (Word Documents)
    if (
        lowerUrl.includes('docs.google.com/document') || 
        lowerUrl.includes('docs.new') || 
        cleanUrlPath.endsWith('.docx') ||
        cleanUrlPath.endsWith('.doc')
    ) {
        return 'Open Google Doc';
    }
    
    // 4. Google Slides (Presentations)
    if (
        lowerUrl.includes('docs.google.com/presentation') || 
        lowerUrl.includes('slides.new') || 
        cleanUrlPath.endsWith('.pptx') ||
        cleanUrlPath.endsWith('.ppt')
    ) {
        return 'Open Presentation';
    }
    
    // 5. Google Drive Shared Files or Folders
    if (
        lowerUrl.includes('drive.google.com') || 
        lowerUrl.includes('shared-drive')
    ) {
        return 'Access Google Drive';
    }
    
    // 6. PDF Documents
    if (cleanUrlPath.endsWith('.pdf')) {
        return 'View PDF Document';
    }
    
    return 'View Details';
};

export const sendAdminMessageService = async (params: {
    message: string;
    link?: string;
    branches: Branch[];
    adminUserId: number;
}) => {
    // 1. Fetch admin details to get the sender's full name for signature
    const admin = await getAdminByIdRepository(params.adminUserId);

    const senderName = admin?.profile?.fullName || 'Placement Cell Admin';

    // 2. Save the notification message in the database (defaults to 'QUEUED' status)
    const savedMessage = await createMessageRepository({
        message: params.message,
        branches: params.branches,
        createdById: params.adminUserId,
        ...(params.link !== undefined ? { link: params.link } : {}),
    });

    // 3. Find students belonging to the target branches
    const targetStudents = await getStudentsByBranchesRepository(params.branches);

    if (targetStudents.length > 0) {
        // 4. Map target students to bulk email queue jobs with dynamic link label
        const emailJobs = targetStudents.map((student) => ({
            to: student.email,
            subject: 'Important Update from Training & Placement Cell',
            templateId: 'admin-broadcast',
            params: {
                studentName: student.profile?.fullName || 'Student',
                message: params.message,
                link: params.link || '',
                hasLink: !!params.link,
                linkLabel: getButtonLabelForLink(params.link),
                senderName,
            },
        }));

        // 5. Add bulk emails to queue in chunked batches (robustness for thousands of students)
        try {
            const CHUNK_SIZE = 200;
            for (let i = 0; i < emailJobs.length; i += CHUNK_SIZE) {
                const chunk = emailJobs.slice(i, i + CHUNK_SIZE);
                await addBulkEmailsToQueue(chunk);
            }
            await updateMessageStatusRepository(savedMessage.id, 'COMPLETED');
            savedMessage.status = 'COMPLETED';
        } catch (error) {
            console.error(`❌ Redis Queue Insertion Failed for announcement ID ${savedMessage.id}:`, error);
            // Robust rollback/failover status flag
            await updateMessageStatusRepository(savedMessage.id, 'FAILED');
            savedMessage.status = 'FAILED';
            throw error; // Re-throw to express error handler
        }
    } else {
        // If there are no target students, mark as COMPLETED immediately
        await updateMessageStatusRepository(savedMessage.id, 'COMPLETED');
        savedMessage.status = 'COMPLETED';
    }

    return {
        message: savedMessage,
        recipientCount: targetStudents.length,
    };
};

export const getAdminMessagesHistoryService = async (query: GetAdminMessagesHistoryQueryInput) => {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const { messages, totalCount } = await getAdminMessagesHistoryRepository({
        skip,
        take: limit,
    });

    return {
        messages,
        pagination: {
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
        },
    };
};
