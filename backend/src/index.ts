import { app } from "./app.js";
import { serverConfig } from "./configs/index.js";
import { sendEmailFromQueueViaWorker } from "./workers/notification.worker.js";

// Start the background notification worker
sendEmailFromQueueViaWorker();
console.log(`hello from server`);


const port = process.env.PORT || 6001;

app.listen(serverConfig.PORT, () => {
  console.log(`Server is running at http://localhost:${serverConfig.PORT}`);
});
