//server/src/middleware/security.middleware.js
const rateLimit = require("express-rate-limit");
const xss = require("xss");

const sanitizeValue = (value) => {
  if (typeof value === "string") {
    return xss(value.trim());
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    return sanitizeObject(value);
  }

  return value;
};

const sanitizeObject = (object) => {
  const cleanObject = {};

  Object.keys(object).forEach((key) => {
    // Prevent NoSQL injection keys like $ne, $gt and dotted keys like profile.name
    if (key.startsWith("$") || key.includes(".")) {
      return;
    }

    cleanObject[key] = sanitizeValue(object[key]);
  });

  return cleanObject;
};

const sanitizeRequestBody = (req, res, next) => {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts, please try again later",
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  sanitizeRequestBody,
};