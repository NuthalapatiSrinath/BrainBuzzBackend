import { connectDB } from "../database/index.js";
import { config } from "../config/index.js";
import app from "./app.js"; // <-- use the app created in app.js

async function start() {
  try {
    await connectDB();
    const port = config?.app?.port ?? 3000;
    app.listen(port, () => console.log(`Service on port ${port}`));
  } catch (err) {
    console.log("failed to start:", err);
    process.exit(1);
  }
}

start();
