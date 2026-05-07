import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config();

const port = process.env.PORT || 3333;

app.listen(port, () => {
  console.log(`ATENDE+ API running on http://localhost:${port}`);
});
