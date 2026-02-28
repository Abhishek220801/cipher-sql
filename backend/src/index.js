import "dotenv/config";
import fs from "fs/promises"
import connectDB from "./lib/mongo.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || "dbs";

(async () => {
  try {
    await connectDB();
    await fs.mkdir(DB_PATH, { recursive: true });
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server running error:", error);
    process.exit(1);
  }
})();
