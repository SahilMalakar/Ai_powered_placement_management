import { app } from './server.js';
import { serverConfig } from './configs/index.js';
import { errorMiddleware } from './shared/middlewares/error.middleware.js';
import { InternalServerError } from './shared/utils/errors/httpErrors.js';
import { sendEmailFromQueueViaWorker } from './shared/workers/notification.worker.js';
import { initializeAtsWorker } from './shared/workers/ats.worker.js';
import { initializeResumeWorker } from './shared/workers/resume.worker.js';
import { initializeDocumentWorker } from './shared/workers/document.worker.js';
import { initializeVerificationWorker } from './shared/workers/verification.worker.js';
import { initializeExportWorker } from './shared/workers/export.worker.js';
import { clearUploadsDirectory } from './shared/utils/fileHandler/cleanup.js';

// Cleanup and Worker initialization
try {
    // Clear temp files from previous sessions
    clearUploadsDirectory();
    sendEmailFromQueueViaWorker();
    initializeAtsWorker();
    initializeResumeWorker();
    initializeDocumentWorker();
    initializeVerificationWorker();
    initializeExportWorker();
    console.log(`Successfully initialized background workers`);
} catch (error) {
    console.log(error);
    throw new InternalServerError('Failed to start background workers');
}

app.use(errorMiddleware);

app.listen(serverConfig.PORT, () => {
    console.log(`Server is running at http://localhost:${serverConfig.PORT}`);
});
