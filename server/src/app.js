
//server/src/app.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const helmet = require("helmet");

const {
  generalLimiter,
  sanitizeRequestBody,
} = require("./middleware/security.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const meetingRoutes = require("./modules/meetings/meeting.routes");
const documentRoutes = require("./modules/documents/document.routes");

const notificationRoutes = require("./modules/notifications/notification.routes");

const messageRoutes = require("./modules/messages/message.routes");

const paymentRoutes = require("./modules/payments/payment.routes");
const { stripeWebhook } = require("./modules/payments/payment.controller");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);


app.post(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

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


app.use(helmet());
app.use(generalLimiter);
app.use(express.json());
app.use(sanitizeRequestBody);
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
app.use("/api/meetings", meetingRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);

module.exports = app;