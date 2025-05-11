import { app } from "./app.js";
import dotenv from "dotenv";
import { connection } from "./database/connection.js";
import cron from "node-cron"; // Import cron for scheduling
import { updatePostStatus } from "./utils/updatePostStatus.js"; // Import the function
import http from "http"; // Import http module
import { Server } from "socket.io"; // Import Socket.IO

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

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: `${process.env.FRONTEND_URL}`, 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD", "TRACE", "CONNECT"],
    credentials: true,
  },
});

// Track active users
let activeUsers = [];

// Handle Socket.IO connections
io.on("connection", (socket) => {

  // Add new user to activeUsers
  socket.on("new-user-add", (newUserId) => {

    // Check if the user is already in the activeUsers array
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
    }

    // Emit the list of active users to all clients
    io.emit("get-users", activeUsers);
  });

  // Handle joining a group
  socket.on("join-group", (chatId) => {
    socket.join(chatId); // Join the group room
  });

  // Handle sending a group message
  socket.on("send-group-message", (data) => {
    const { chatId, message } = data;

    // Broadcast the message to all members of the group
    io.to(chatId).emit("receive-group-message", message);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {

    // Remove the disconnected user from activeUsers
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);

    // Emit the updated list of active users to all clients
    io.emit("get-users", activeUsers);
  });
});
cron.schedule("* * * * *", async () => {
  try {
    await updatePostStatus();
  } catch (error) {
    console.error("Cron job failed:", error);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("SERVER IS RUNNING ON PORT ", PORT);
});
process.on("uncaughtException", (err) => {
  console.log("!!! ERROR !!! ", err);
  console.log("SHUTTING DOWN THE SERVER!!!"); 
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("SHUTTING DOWN THE SERVER!!!");
  server.close(() => {
    process.exit(1);
  });
});