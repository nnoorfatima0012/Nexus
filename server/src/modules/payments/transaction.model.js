//server/src/modules/payments/transaction.model.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["deposit", "withdraw", "transfer"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "USD",
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    provider: {
      type: String,
      enum: ["stripe", "paypal_mock", "wallet"],
      default: "wallet",
    },

    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    failureReason: {
      type: String,
      default: "",
    },

    reference: {
      type: String,
      required: true,
      unique: true,
    },

    stripeSessionId: {
      type: String,
      default: "",
    },

    stripePaymentIntentId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);