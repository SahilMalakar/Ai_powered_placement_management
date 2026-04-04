import { app } from "./app.js";
import { serverConfig } from "./configs/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { InternalServerError } from "./utils/errors/httpErrors.js";
import { sendEmailFromQueueViaWorker } from "./workers/notification.worker.js";
import { initializeAtsWorker } from "./workers/ats.worker.js";

// Start the background notification worker
try {
  sendEmailFromQueueViaWorker();
  initializeAtsWorker();
  console.log(`Successfully initialized background workers`);
} catch (error) {
  console.log(error);
  throw new InternalServerError("Failed to start background workers"); 
}

app.use(errorMiddleware);


app.listen(serverConfig.PORT, () => {
  console.log(`Server is running at http://localhost:${serverConfig.PORT}`);
});
