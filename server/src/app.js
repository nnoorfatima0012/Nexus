// const express = require("express");
// const cors = require("cors");
// const morgan = require("morgan");
// const cookieParser = require("cookie-parser");

// const authRoutes = require("./modules/auth/auth.routes");
// const userRoutes = require("./modules/users/user.routes");

// const app = express();

// app.use(cors({
//   origin: process.env.CLIENT_URL || "http://localhost:5173",
//   credentials: true
// }));

// app.use(express.json());
// app.use(cookieParser());
// app.use(morgan("dev"));

// app.get("/api/health", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Nexus backend is running"
//   });
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);

// module.exports = app;

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests from Postman, Thunder Client, curl, etc.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Nexus backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

module.exports = app;