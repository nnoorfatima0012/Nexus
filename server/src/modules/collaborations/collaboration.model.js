const mongoose = require("mongoose");

const collaborationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Collaboration", collaborationSchema);