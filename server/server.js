// //server/server.js
// require("dotenv").config();

// const app = require("./src/app");
// const connectDB = require("./src/config/db");

// const PORT = process.env.PORT || 5000;

// connectDB();

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./src/app");
const connectDB = require("./src/config/db");
const setupVideoSocket = require("./src/modules/video/socket");
const setupMessageSocket = require("./src/modules/messages/message.socket");
const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

setupVideoSocket(io);
setupMessageSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});