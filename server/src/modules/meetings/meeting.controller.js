// //server/src/modules/meetings/meeting.controller.js
// const Meeting = require("./meeting.model");
// const User = require("../users/user.model");

// const populateMeeting = [
//   { path: "requestedBy", select: "name email role avatarUrl" },
//   { path: "requestedTo", select: "name email role avatarUrl" },
// ];

// const hasTimeConflict = async ({ userId, date, startTime, endTime }) => {
//   const conflict = await Meeting.findOne({
//     date,
//     status: { $in: ["pending", "accepted"] },
//     $or: [{ requestedBy: userId }, { requestedTo: userId }],
//     startTime: { $lt: endTime },
//     endTime: { $gt: startTime },
//   });

//   return !!conflict;
// };

// const createMeeting = async (req, res) => {
//   try {
//     const { title, description, requestedTo, date, startTime, endTime } =
//       req.body;

//     if (!title || !requestedTo || !date || !startTime || !endTime) {
//       return res.status(400).json({
//         success: false,
//         message: "Title, requestedTo, date, startTime and endTime are required",
//       });
//     }

//     if (requestedTo === req.user._id.toString()) {
//       return res.status(400).json({
//         success: false,
//         message: "You cannot schedule a meeting with yourself",
//       });
//     }

//     if (startTime >= endTime) {
//       return res.status(400).json({
//         success: false,
//         message: "End time must be after start time",
//       });
//     }

//     const targetUser = await User.findById(requestedTo);

//     if (!targetUser) {
//       return res.status(404).json({
//         success: false,
//         message: "Requested user not found",
//       });
//     }

//     const requesterConflict = await hasTimeConflict({
//       userId: req.user._id,
//       date,
//       startTime,
//       endTime,
//     });

//     if (requesterConflict) {
//       return res.status(409).json({
//         success: false,
//         message: "You already have a meeting in this time slot",
//       });
//     }

//     const receiverConflict = await hasTimeConflict({
//       userId: requestedTo,
//       date,
//       startTime,
//       endTime,
//     });

//     if (receiverConflict) {
//       return res.status(409).json({
//         success: false,
//         message: "Selected user already has a meeting in this time slot",
//       });
//     }

//     const meeting = await Meeting.create({
//       title,
//       description: description || "",
//       requestedBy: req.user._id,
//       requestedTo,
//       date,
//       startTime,
//       endTime,
//       meetingLink: "",
//     });

//     await createNotification({
//       recipient: meeting.requestedBy,
//       sender: req.user._id,
//       type: "meeting_rejected",
//       title: "Meeting rejected",
//       message: `${req.user.name} rejected your meeting request: ${meeting.title}`,
//       entityType: "meeting",
//       entityId: meeting._id,
//     });

//     const populatedMeeting = await Meeting.findById(meeting._id).populate(
//       populateMeeting,
//     );

//     return res.status(201).json({
//       success: true,
//       message: "Meeting scheduled successfully",
//       meeting: populatedMeeting,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to schedule meeting",
//       error: error.message,
//     });
//   }
// };

// const getMyMeetings = async (req, res) => {
//   try {
//     const meetings = await Meeting.find({
//       $or: [{ requestedBy: req.user._id }, { requestedTo: req.user._id }],
//     })
//       .populate(populateMeeting)
//       .sort({ date: 1, startTime: 1 });

//     return res.status(200).json({
//       success: true,
//       count: meetings.length,
//       meetings,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to get meetings",
//       error: error.message,
//     });
//   }
// };

// const getMeetingById = async (req, res) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id).populate(
//       populateMeeting,
//     );

//     if (!meeting) {
//       return res.status(404).json({
//         success: false,
//         message: "Meeting not found",
//       });
//     }

//     const isParticipant =
//       meeting.requestedBy._id.toString() === req.user._id.toString() ||
//       meeting.requestedTo._id.toString() === req.user._id.toString();

//     if (!isParticipant) {
//       return res.status(403).json({
//         success: false,
//         message: "You are not allowed to view this meeting",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       meeting,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to get meeting",
//       error: error.message,
//     });
//   }
// };

// const acceptMeeting = async (req, res) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id);

//     if (!meeting) {
//       return res.status(404).json({
//         success: false,
//         message: "Meeting not found",
//       });
//     }

//     if (meeting.requestedTo.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: "Only the requested user can accept this meeting",
//       });
//     }

//     meeting.status = "accepted";
//     meeting.meetingLink = `/video/${meeting._id}`;
//     await meeting.save();

//     const populatedMeeting = await Meeting.findById(meeting._id).populate(
//       populateMeeting,
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Meeting accepted successfully",
//       meeting: populatedMeeting,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to accept meeting",
//       error: error.message,
//     });
//   }
// };

// const rejectMeeting = async (req, res) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id);

//     if (!meeting) {
//       return res.status(404).json({
//         success: false,
//         message: "Meeting not found",
//       });
//     }

//     if (meeting.requestedTo.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: "Only the requested user can reject this meeting",
//       });
//     }

//     meeting.status = "rejected";
//     await meeting.save();

//     const populatedMeeting = await Meeting.findById(meeting._id).populate(
//       populateMeeting,
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Meeting rejected successfully",
//       meeting: populatedMeeting,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to reject meeting",
//       error: error.message,
//     });
//   }
// };

// const cancelMeeting = async (req, res) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id);

//     if (!meeting) {
//       return res.status(404).json({
//         success: false,
//         message: "Meeting not found",
//       });
//     }

//     const isParticipant =
//       meeting.requestedBy.toString() === req.user._id.toString() ||
//       meeting.requestedTo.toString() === req.user._id.toString();

//     if (!isParticipant) {
//       return res.status(403).json({
//         success: false,
//         message: "You are not allowed to cancel this meeting",
//       });
//     }

//     meeting.status = "cancelled";
//     await meeting.save();

//     const recipient =
//       meeting.requestedBy.toString() === req.user._id.toString()
//         ? meeting.requestedTo
//         : meeting.requestedBy;

//     await createNotification({
//       recipient,
//       sender: req.user._id,
//       type: "meeting_cancelled",
//       title: "Meeting cancelled",
//       message: `${req.user.name} cancelled the meeting: ${meeting.title}`,
//       entityType: "meeting",
//       entityId: meeting._id,
//     });

//     const populatedMeeting = await Meeting.findById(meeting._id).populate(populateMeeting);

//     return res.status(200).json({
//       success: true,
//       message: "Meeting cancelled successfully",
//       meeting,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to cancel meeting",
//       error: error.message,
//     });
//   }
// };

// module.exports = {
//   createMeeting,
//   getMyMeetings,
//   getMeetingById,
//   acceptMeeting,
//   rejectMeeting,
//   cancelMeeting,
// };


// server/src/modules/meetings/meeting.controller.js
const Meeting = require("./meeting.model");
const User = require("../users/user.model");
const { createNotification } = require("../notifications/notification.service");

const populateMeeting = [
  { path: "requestedBy", select: "name email role avatarUrl" },
  { path: "requestedTo", select: "name email role avatarUrl" },
];

const hasTimeConflict = async ({ userId, date, startTime, endTime }) => {
  const conflict = await Meeting.findOne({
    date,
    status: { $in: ["pending", "accepted"] },
    $or: [{ requestedBy: userId }, { requestedTo: userId }],
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  });

  return !!conflict;
};

const createMeeting = async (req, res) => {
  try {
    const { title, description, requestedTo, date, startTime, endTime } =
      req.body;

    if (!title || !requestedTo || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Title, requestedTo, date, startTime and endTime are required",
      });
    }

    if (requestedTo === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot schedule a meeting with yourself",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    const targetUser = await User.findById(requestedTo);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Requested user not found",
      });
    }

    const requesterConflict = await hasTimeConflict({
      userId: req.user._id,
      date,
      startTime,
      endTime,
    });

    if (requesterConflict) {
      return res.status(409).json({
        success: false,
        message: "You already have a meeting in this time slot",
      });
    }

    const receiverConflict = await hasTimeConflict({
      userId: requestedTo,
      date,
      startTime,
      endTime,
    });

    if (receiverConflict) {
      return res.status(409).json({
        success: false,
        message: "Selected user already has a meeting in this time slot",
      });
    }

    const meeting = await Meeting.create({
      title,
      description: description || "",
      requestedBy: req.user._id,
      requestedTo,
      date,
      startTime,
      endTime,
      meetingLink: "",
    });

    await createNotification({
      recipient: requestedTo,
      sender: req.user._id,
      type: "meeting_request",
      title: "New meeting request",
      message: `${req.user.name} requested a meeting: ${meeting.title}`,
      entityType: "meeting",
      entityId: meeting._id,
    });

    const populatedMeeting = await Meeting.findById(meeting._id).populate(
      populateMeeting,
    );

    return res.status(201).json({
      success: true,
      message: "Meeting scheduled successfully",
      meeting: populatedMeeting,
    });
  } catch (error) {
    console.error("CREATE MEETING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to schedule meeting",
      error: error.message,
    });
  }
};

const getMyMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ requestedBy: req.user._id }, { requestedTo: req.user._id }],
    })
      .populate(populateMeeting)
      .sort({ date: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: meetings.length,
      meetings,
    });
  } catch (error) {
    console.error("GET MEETINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get meetings",
      error: error.message,
    });
  }
};

const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id).populate(
      populateMeeting,
    );

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    const isParticipant =
      meeting.requestedBy._id.toString() === req.user._id.toString() ||
      meeting.requestedTo._id.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this meeting",
      });
    }

    return res.status(200).json({
      success: true,
      meeting,
    });
  } catch (error) {
    console.error("GET MEETING BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get meeting",
      error: error.message,
    });
  }
};

const acceptMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    if (meeting.requestedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the requested user can accept this meeting",
      });
    }

    meeting.status = "accepted";
    meeting.meetingLink = `/video/${meeting._id}`;
    await meeting.save();

    await createNotification({
      recipient: meeting.requestedBy,
      sender: req.user._id,
      type: "meeting_accepted",
      title: "Meeting accepted",
      message: `${req.user.name} accepted your meeting request: ${meeting.title}`,
      entityType: "meeting",
      entityId: meeting._id,
    });

    const populatedMeeting = await Meeting.findById(meeting._id).populate(
      populateMeeting,
    );

    return res.status(200).json({
      success: true,
      message: "Meeting accepted successfully",
      meeting: populatedMeeting,
    });
  } catch (error) {
    console.error("ACCEPT MEETING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to accept meeting",
      error: error.message,
    });
  }
};

const rejectMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    if (meeting.requestedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the requested user can reject this meeting",
      });
    }

    meeting.status = "rejected";
    await meeting.save();

    await createNotification({
      recipient: meeting.requestedBy,
      sender: req.user._id,
      type: "meeting_rejected",
      title: "Meeting rejected",
      message: `${req.user.name} rejected your meeting request: ${meeting.title}`,
      entityType: "meeting",
      entityId: meeting._id,
    });

    const populatedMeeting = await Meeting.findById(meeting._id).populate(
      populateMeeting,
    );

    return res.status(200).json({
      success: true,
      message: "Meeting rejected successfully",
      meeting: populatedMeeting,
    });
  } catch (error) {
    console.error("REJECT MEETING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject meeting",
      error: error.message,
    });
  }
};

const cancelMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    const isParticipant =
      meeting.requestedBy.toString() === req.user._id.toString() ||
      meeting.requestedTo.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this meeting",
      });
    }

    meeting.status = "cancelled";
    await meeting.save();

    const recipient =
      meeting.requestedBy.toString() === req.user._id.toString()
        ? meeting.requestedTo
        : meeting.requestedBy;

    await createNotification({
      recipient,
      sender: req.user._id,
      type: "meeting_cancelled",
      title: "Meeting cancelled",
      message: `${req.user.name} cancelled the meeting: ${meeting.title}`,
      entityType: "meeting",
      entityId: meeting._id,
    });

    const populatedMeeting = await Meeting.findById(meeting._id).populate(
      populateMeeting,
    );

    return res.status(200).json({
      success: true,
      message: "Meeting cancelled successfully",
      meeting: populatedMeeting,
    });
  } catch (error) {
    console.error("CANCEL MEETING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel meeting",
      error: error.message,
    });
  }
};

module.exports = {
  createMeeting,
  getMyMeetings,
  getMeetingById,
  acceptMeeting,
  rejectMeeting,
  cancelMeeting,
};