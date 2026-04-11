import { app } from './server.js';
import { serverConfig } from './configs/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { InternalServerError } from './utils/errors/httpErrors.js';
import { sendEmailFromQueueViaWorker } from './workers/notification.worker.js';
import { initializeAtsWorker } from './workers/ats.worker.js';
import { initializeResumeWorker } from './workers/resume.worker.js';
import { initializeDocumentWorker } from './workers/document.worker.js';
import { initializeVerificationWorker } from './workers/verification.worker.js';

// Start the background notification worker
try {
    sendEmailFromQueueViaWorker();
    initializeAtsWorker();
    initializeResumeWorker();
    initializeDocumentWorker();
    initializeVerificationWorker();
    console.log(`Successfully initialized background workers`);
} catch (error) {
    console.log(error);
    throw new InternalServerError('Failed to start background workers');
}

app.use(errorMiddleware);

// testing ci for 2nd time

app.listen(serverConfig.PORT, () => {
    console.log(`Server is running at http://localhost:${serverConfig.PORT}`);
});
