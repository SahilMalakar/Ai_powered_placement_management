import { app } from "./app.js";

console.log(`hello from server`);


const port = process.env.PORT || 6001;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/api`);
});
