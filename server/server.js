import { app } from "./app.js";
import dotenv from "dotenv";
import { connection } from "./database/connection.js";
import cron from "node-cron"; // Import cron for scheduling
import { updatePostStatus } from "./utils/updatePostStatus.js"; // Import the function

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
cron.schedule("0 0 * * *", updatePostStatus); // Runs every day at 00:00

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("SERVER IS RUNNING ON PORT ", PORT);
});