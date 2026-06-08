const Collaboration = require("./collaboration.model");
const User = require("../users/user.model");
const { createNotification } = require("../notifications/notification.service");

const populateCollaboration = [
  {
    path: "sender",
    select:
      "name email role avatarUrl isOnline startupName industry location investmentInterests investmentStage",
  },
  {
    path: "receiver",
    select:
      "name email role avatarUrl isOnline startupName industry location investmentInterests investmentStage",
  },
];

const createCollaboration = async (req, res) => {
  try {
    const { receiver, message } = req.body;

    if (!receiver || !message) {
      return res.status(400).json({
        success: false,
        message: "Receiver and message are required",
      });
    }

    if (receiver === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a collaboration request to yourself",
      });
    }

    const receiverUser = await User.findById(receiver);

    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: "Receiver user not found",
      });
    }

    if (receiverUser.role === req.user.role) {
      return res.status(400).json({
        success: false,
        message:
          "Collaboration requests are only allowed between investors and entrepreneurs",
      });
    }

    const existingCollaboration = await Collaboration.findOne({
      $or: [
        {
          sender: req.user._id,
          receiver,
        },
        {
          sender: receiver,
          receiver: req.user._id,
        },
      ],
      status: { $in: ["pending", "accepted"] },
    });

    if (existingCollaboration) {
      return res.status(409).json({
        success: false,
        message:
          existingCollaboration.status === "accepted"
            ? "You are already connected with this user"
            : "A collaboration request is already pending between these users",
      });
    }

    const collaboration = await Collaboration.create({
      sender: req.user._id,
      receiver,
      message,
      status: "pending",
    });

    await createNotification({
      recipient: receiver,
      sender: req.user._id,
      type: "collaboration_request",
      title: "New collaboration request",
      message: `${req.user.name} sent you a collaboration request`,
      entityType: "collaboration",
      entityId: collaboration._id,
    });

    const populatedCollaboration = await Collaboration.findById(
      collaboration._id,
    ).populate(populateCollaboration);

    return res.status(201).json({
      success: true,
      message: "Collaboration request sent successfully",
      collaboration: populatedCollaboration,
    });
  } catch (error) {
    console.error("CREATE COLLABORATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send collaboration request",
      error: error.message,
    });
  }
};

const getMyCollaborations = async (req, res) => {
  try {
    const collaborations = await Collaboration.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate(populateCollaboration)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: collaborations.length,
      collaborations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get collaborations",
      error: error.message,
    });
  }
};

const getSentCollaborations = async (req, res) => {
  try {
    const collaborations = await Collaboration.find({
      sender: req.user._id,
    })
      .populate(populateCollaboration)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: collaborations.length,
      collaborations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get sent collaborations",
      error: error.message,
    });
  }
};

const getReceivedCollaborations = async (req, res) => {
  try {
    const collaborations = await Collaboration.find({
      receiver: req.user._id,
    })
      .populate(populateCollaboration)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: collaborations.length,
      collaborations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get received collaborations",
      error: error.message,
    });
  }
};

const getCollaborationStatusWithUser = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const collaboration = await Collaboration.findOne({
      $or: [
        {
          sender: req.user._id,
          receiver: otherUserId,
        },
        {
          sender: otherUserId,
          receiver: req.user._id,
        },
      ],
    })
      .populate(populateCollaboration)
      .sort({ createdAt: -1 });

    if (!collaboration) {
      return res.status(200).json({
        success: true,
        status: "none",
        direction: null,
        collaboration: null,
      });
    }

    const direction =
      collaboration.sender._id.toString() === req.user._id.toString()
        ? "sent"
        : "received";

    return res.status(200).json({
      success: true,
      status: collaboration.status,
      direction,
      collaboration,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get collaboration status",
      error: error.message,
    });
  }
};

const acceptCollaboration = async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: "Collaboration request not found",
      });
    }

    if (collaboration.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the receiver can accept this request",
      });
    }

    if (collaboration.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending collaboration requests can be accepted",
      });
    }

    collaboration.status = "accepted";
    await collaboration.save();

    await createNotification({
      recipient: collaboration.sender,
      sender: req.user._id,
      type: "collaboration_accepted",
      title: "Collaboration accepted",
      message: `${req.user.name} accepted your collaboration request`,
      entityType: "collaboration",
      entityId: collaboration._id,
    });

    const populatedCollaboration = await Collaboration.findById(
      collaboration._id,
    ).populate(populateCollaboration);

    return res.status(200).json({
      success: true,
      message: "Collaboration request accepted",
      collaboration: populatedCollaboration,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to accept collaboration",
      error: error.message,
    });
  }
};

const rejectCollaboration = async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: "Collaboration request not found",
      });
    }

    if (collaboration.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the receiver can reject this request",
      });
    }

    if (collaboration.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending collaboration requests can be rejected",
      });
    }

    collaboration.status = "rejected";
    await collaboration.save();

    await createNotification({
      recipient: collaboration.sender,
      sender: req.user._id,
      type: "collaboration_rejected",
      title: "Collaboration rejected",
      message: `${req.user.name} rejected your collaboration request`,
      entityType: "collaboration",
      entityId: collaboration._id,
    });

    const populatedCollaboration = await Collaboration.findById(
      collaboration._id,
    ).populate(populateCollaboration);

    return res.status(200).json({
      success: true,
      message: "Collaboration request rejected",
      collaboration: populatedCollaboration,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reject collaboration",
      error: error.message,
    });
  }
};

const cancelCollaboration = async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: "Collaboration request not found",
      });
    }

    if (collaboration.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the sender can cancel this request",
      });
    }

    if (collaboration.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending collaboration requests can be cancelled",
      });
    }

    collaboration.status = "cancelled";
    await collaboration.save();

    await createNotification({
      recipient: collaboration.receiver,
      sender: req.user._id,
      type: "collaboration_cancelled",
      title: "Collaboration cancelled",
      message: `${req.user.name} cancelled the collaboration request`,
      entityType: "collaboration",
      entityId: collaboration._id,
    });

    const populatedCollaboration = await Collaboration.findById(
      collaboration._id,
    ).populate(populateCollaboration);

    return res.status(200).json({
      success: true,
      message: "Collaboration request cancelled",
      collaboration: populatedCollaboration,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to cancel collaboration",
      error: error.message,
    });
  }
};

module.exports = {
  createCollaboration,
  getMyCollaborations,
  getSentCollaborations,
  getReceivedCollaborations,
  getCollaborationStatusWithUser,
  acceptCollaboration,
  rejectCollaboration,
  cancelCollaboration,
};