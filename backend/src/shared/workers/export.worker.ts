import { Worker, Job } from 'bullmq';
import { EXPORT_QUEUE_NAME, type ExportJobPayload } from '../queues/export.queue.js';
import { getStudentsForExportRepository, getApplicationsForExportRepository } from '../../modules/admin/repositories/export.repository.js';
import { uploadBufferToCloudinary } from '../utils/fileHandler/cloudinary.js';
import { CACHE_KEYS } from '../utils/cacheKeys.js';
import { getRedisConnection, getRedisConnectionForCaching } from '../../infra/redis.config.js';

function toCsv(headers: string[], rows: Record<string, any>[]): string {
    const escape = (val: any) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
    };
    const headerLine = headers.map(escape).join(',');
    const dataLines = rows.map(row =>
        headers.map(h => escape(row[h])).join(',')
    );
    return [headerLine, ...dataLines].join('\n');
}

export const initializeExportWorker = () => {
    const exportWorker = new Worker(
        EXPORT_QUEUE_NAME,
        async (job: Job<ExportJobPayload>) => {
            const { type, requestedBy, ...filters } = job.data;
            console.log(`[Export Worker] Processing CSV export job ${job.id} of type ${type} for admin ${requestedBy}...`);

            const cacheClient = getRedisConnectionForCaching();
            const cacheKey = CACHE_KEYS.EXPORT_JOB(job.id!);

            try {
                let csvString = '';
                let filename = '';

                if (type === 'students') {
                    const students = await getStudentsForExportRepository(filters);
                    const headers = ['Full Name', 'Roll Number', 'Email', 'Branch', 'CGPA', 'Has Backlog', 'Verification Status'];
                    const rows = students.map(s => ({
                        'Full Name': s.profile?.fullName ?? '',
                        'Roll Number': s.profile?.rollNo ?? '',
                        'Email': s.email,
                        'Branch': s.profile?.branch ?? '',
                        'CGPA': s.profile?.cgpa ?? '',
                        'Has Backlog': s.profile?.backlog ? 'Yes' : 'No',
                        'Verification Status': s.profile?.verificationStatus ?? 'NOT_VERIFIED',
                    }));
                    csvString = toCsv(headers, rows);
                    filename = `students_export_${job.id}.csv`;
                } else if (type === 'applications') {
                    const applications = await getApplicationsForExportRepository(filters);
                    const headers = ['Job Title', 'Company', 'Student Name', 'Roll Number', 'Student Email', 'Branch', 'CGPA', 'Application Status', 'Applied Date'];
                    const rows = applications.map(app => ({
                        'Job Title': app.job.title,
                        'Company': app.job.company,
                        'Student Name': app.user.profile?.fullName ?? '',
                        'Roll Number': app.user.profile?.rollNo ?? '',
                        'Student Email': app.user.email,
                        'Branch': app.user.profile?.branch ?? '',
                        'CGPA': app.user.profile?.cgpa ?? '',
                        'Application Status': app.status,
                        'Applied Date': app.createdAt.toISOString(),
                    }));
                    csvString = toCsv(headers, rows);
                    filename = `applications_export_${job.id}.csv`;
                }

                // 2. Upload raw CSV buffer to Cloudinary
                const buffer = Buffer.from(csvString, 'utf-8');
                console.log(`[Export Worker] Uploading CSV buffer (${buffer.length} bytes) to Cloudinary...`);
                const uploadRes = await uploadBufferToCloudinary(buffer, 'csv_exports', 'raw');

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
