//server/src/modules/payments/payment.routes.js
const express = require("express");

const {
  getWallet,
  getTransactions,
  createStripeCheckoutSession,
  confirmStripeCheckoutSession,
  withdraw,
  transfer,
} = require("./payment.controller");

const { protect } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/wallet", getWallet);
router.get("/transactions", getTransactions);

router.post("/stripe/create-checkout-session", createStripeCheckoutSession);
router.get("/stripe/confirm-session/:sessionId", confirmStripeCheckoutSession);

router.post("/withdraw", withdraw);
router.post("/transfer", transfer);

module.exports = router;