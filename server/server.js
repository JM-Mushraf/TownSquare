import { app } from "./app.js";
import dotenv from "dotenv";
import { connection } from "./database/connection.js";
import cron from "node-cron";
import { updatePostStatus } from "./utils/updatePostStatus.js"; // Adjust the import path as necessary

// Load environment variables
dotenv.config();

// Connect to the database
connection()
  .then(() => {
    console.log("DATABASE CONNECTION ESTABLISHED");
  })
  .catch((e) => {
    console.log(e);
  });

// Schedule the task to run daily at midnight
cron.schedule("* * * * *", async () => {
  console.log("Cron job triggered at:", new Date().toISOString());
  try {
    await updatePostStatus();
    console.log("Cron job completed successfully.");
  } catch (error) {
    console.error("Cron job failed:", error);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("SERVER IS RUNNING ON PORT ", PORT);
  console.log("Cron job scheduled for daily at midnight.");
});