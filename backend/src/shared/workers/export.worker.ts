import { Worker, Job } from 'bullmq';
import { EXPORT_QUEUE_NAME, type ExportJobPayload } from '../queues/export.queue.js';
import { getStudentsForExportRepository, getApplicationsForExportRepository } from '../../modules/admin/repositories/export.repository.js';
import { uploadBufferToCloudinary } from '../utils/fileHandler/cloudinary.js';
import { CACHE_KEYS } from '../utils/cacheKeys.js';
import { getRedisConnection, getRedisConnectionForCaching } from '../../infra/redis.config.js';
import { STUDENT_EXPORT_FIELDS, APPLICATION_EXPORT_FIELDS } from '../types/admin/export.js';
import { format } from 'fast-csv';
import { prisma } from '../../prisma/prisma.js';

const formatDate = (value: string | Date | null | undefined): string => {
    if (!value) return '';
    const d = new Date(value as string | number);
    if (isNaN(d.getTime())) return String(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

async function buildCsvBuffer(
    headers: string[],
    rows: Record<string, any>[]
): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const csvStream = format({ headers, writeBOM: true });
        
        csvStream.on('data', (chunk: Buffer) => chunks.push(chunk));
        csvStream.on('end', () => resolve(Buffer.concat(chunks)));
        csvStream.on('error', reject);

        rows.forEach(row => csvStream.write(row));
        csvStream.end();
    });
}

const STUDENT_FIELD_MAP: Record<
    typeof STUDENT_EXPORT_FIELDS[number],
    { header: string; getValue: (student: any) => any }
> = {
    id: { header: 'ID', getValue: (s) => s.id },
    email: { header: 'Email', getValue: (s) => s.email },
    fullName: { header: 'Full Name', getValue: (s) => s.profile?.fullName ?? '' },
    rollNo: { header: 'Roll Number', getValue: (s) => s.profile?.rollNo ?? '' },
    branch: { header: 'Branch', getValue: (s) => s.profile?.branch ?? '' },
    degree: { header: 'Degree', getValue: (s) => s.profile?.degree ?? '' },
    cgpa: { header: 'CGPA', getValue: (s) => s.profile?.cgpa ?? '' },
    dob: { header: 'Date of Birth', getValue: (s) => formatDate(s.profile?.dob) },
    backlog: { header: 'Has Backlog', getValue: (s) => s.profile?.backlog ? 'Yes' : 'No' },
    backlogSubjects: { header: 'Backlog Subjects', getValue: (s) => s.profile?.backlogSubjects?.join(', ') ?? '' },
    verificationStatus: { header: 'Verification Status', getValue: (s) => s.profile?.verificationStatus ?? 'NOT_VERIFIED' },
    phoneNumber: { header: 'Phone Number', getValue: (s) => s.profile?.phoneNumber ? `\t${s.profile.phoneNumber}` : '' },
    graduationYear: { header: 'Graduation Year', getValue: (s) => s.profile?.graduationYear ?? '' },
    university: { header: 'University', getValue: (s) => s.profile?.university ?? '' },
    sgpa: { header: 'SGPA', getValue: () => '' },
    documents: { header: 'Documents', getValue: () => '' },
};

const APPLICATION_FIELD_MAP: Record<
    typeof APPLICATION_EXPORT_FIELDS[number],
    { header: string; getValue: (app: any) => any }
> = {
    jobTitle: { header: 'Job Title', getValue: (app) => app.job.title },
    company: { header: 'Company', getValue: (app) => app.job.company },
    studentName: { header: 'Student Name', getValue: (app) => app.user.profile?.fullName ?? '' },
    rollNo: { header: 'Roll Number', getValue: (app) => app.user.profile?.rollNo ?? '' },
    studentEmail: { header: 'Student Email', getValue: (app) => app.user.email },
    branch: { header: 'Branch', getValue: (app) => app.user.profile?.branch ?? '' },
    cgpa: { header: 'CGPA', getValue: (app) => app.user.profile?.cgpa ?? '' },
    applicationStatus: { header: 'Application Status', getValue: (app) => app.status },
    appliedDate: { header: 'Applied Date', getValue: (app) => formatDate(app.createdAt) },
};

export const initializeExportWorker = () => {
    const exportWorker = new Worker(
        EXPORT_QUEUE_NAME,
        async (job: Job<ExportJobPayload>) => {
            const { type, requestedBy, selectedIds, selectedFields, ...filters } = job.data;
            console.log(`[Export Worker] Processing CSV export job ${job.id} of type ${type} for admin ${requestedBy}...`);

            const cacheClient = getRedisConnectionForCaching();
            const cacheKey = CACHE_KEYS.EXPORT_JOB(job.id!);

            try {
                let buffer: Buffer;
                let rows: Record<string, any>[] = [];
                const filtersWithIds = { ...filters, selectedIds };

                if (type === 'students') {
                    const students = await getStudentsForExportRepository(filtersWithIds);
                    
                    const allowedFields = STUDENT_EXPORT_FIELDS;
                    const fields = (selectedFields && selectedFields.length > 0)
                        ? selectedFields.filter(f => (allowedFields as readonly string[]).includes(f))
                        : allowedFields;

                    const headers = fields.flatMap(f => {
                        if (f === 'sgpa') return Array.from({ length: 8 }, (_, i) => `Sem${i + 1}_SGPA`);
                        if (f === 'documents') return Array.from({ length: 8 }, (_, i) => `Sem${i + 1}_Marksheet`);
                        return [STUDENT_FIELD_MAP[f as typeof STUDENT_EXPORT_FIELDS[number]].header];
                    });
                    rows = students.map(s => {
                        const row: Record<string, any> = {};
                        fields.forEach(f => {
                            if (f === 'sgpa') {
                                for (let sem = 1; sem <= 8; sem++) {
                                    const semResult = s.semesters?.find((sr: any) => sr.semester === sem);
                                    row[`Sem${sem}_SGPA`] = semResult ? String(semResult.sgpa) : '';
                                }
                            } else if (f === 'documents') {
                                for (let sem = 1; sem <= 8; sem++) {
                                    const doc = s.documents?.find((d: any) => d.semester === sem);
                                    row[`Sem${sem}_Marksheet`] = doc?.url ?? '';
                                }
                            } else {
                                const fieldKey = f as typeof STUDENT_EXPORT_FIELDS[number];
                                row[STUDENT_FIELD_MAP[fieldKey].header] = STUDENT_FIELD_MAP[fieldKey].getValue(s);
                            }
                        });
                        return row;
                    });

                    buffer = await buildCsvBuffer(headers, rows);
                } else if (type === 'applications') {
                    const applications = await getApplicationsForExportRepository(filtersWithIds);
                    
                    const allowedFields = APPLICATION_EXPORT_FIELDS;
                    const fields = (selectedFields && selectedFields.length > 0)
                        ? selectedFields.filter(f => (allowedFields as readonly string[]).includes(f))
                        : allowedFields;

                    const headers = fields.map(f => APPLICATION_FIELD_MAP[f as typeof APPLICATION_EXPORT_FIELDS[number]].header);
                    rows = applications.map(app => {
                        const row: Record<string, any> = {};
                        fields.forEach(f => {
                            const fieldKey = f as typeof APPLICATION_EXPORT_FIELDS[number];
                            row[APPLICATION_FIELD_MAP[fieldKey].header] = APPLICATION_FIELD_MAP[fieldKey].getValue(app);
                        });
                        return row;
                    });

                    buffer = await buildCsvBuffer(headers, rows);
                } else {
                    throw new Error(`Invalid export type: ${type}`);
                }

                const filename = `${type}_export_${job.id || Date.now()}.csv`;

                // 2. Upload raw CSV buffer to Cloudinary
                console.log(`[Export Worker] Uploading CSV buffer (${buffer.length} bytes) to Cloudinary as ${filename}...`);
                const uploadRes = await uploadBufferToCloudinary(buffer, 'csv_exports', 'raw', filename);

                // Persist export log to DB
                const { type: _t, requestedBy: _r, selectedIds: _sId, selectedFields: _sF, ...filterFields } = job.data;
                await prisma.exportLog.create({
                    data: {
                        exportedBy: requestedBy,
                        type,
                        fileUrl: uploadRes.secure_url,
                        filters: filterFields as any,
                        selectedIds: selectedIds ?? [],
                        recordCount: rows.length,
                    },
                });

                // 3. Cache completed state in Redis (Expires in 1 hour)
                const result = {
                    status: 'completed',
                    downloadUrl: uploadRes.secure_url,
                    createdAt: new Date().toISOString(),
                };
                await cacheClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);
                console.log(`[Export Worker] ✅ Job ${job.id} successfully processed. File uploaded to Cloudinary:`, uploadRes.secure_url);
            } catch (err: any) {
                console.error(`[Export Worker] ❌ Job ${job.id} failed with error:`, err);
                const errorResult = {
                    status: 'failed',
                    error: err instanceof Error ? err.message : 'Unknown export failure',
                    createdAt: new Date().toISOString(),
                };
                await cacheClient.set(cacheKey, JSON.stringify(errorResult), 'EX', 3600);
                throw err;
            }
        },
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            connection: getRedisConnection() as any,
            concurrency: 2,
        }
    );

    exportWorker.on('failed', (job, error) => {
        console.error(`❌ Export job ${job?.id} failed:`, error.message);
    });

    exportWorker.on('completed', (job) => {
        console.log(`✅ Export job ${job.id} completed successfully`);
    });

    console.log(`[Export Worker] Initialized worker for queue: ${EXPORT_QUEUE_NAME}`);
};
