// server/src/modules/video/socket.js
const jwt = require("jsonwebtoken");
const User = require("../users/user.model");
const Meeting = require("../meetings/meeting.model");

// const getMeetingDateTime = (date, time) => {
//   return new Date(`${date}T${time}:00`);
// };

// const isMeetingTimeAllowed = (meeting) => {
//   const now = new Date();

//   const startDateTime = getMeetingDateTime(meeting.date, meeting.startTime);
//   const endDateTime = getMeetingDateTime(meeting.date, meeting.endTime);

//   // 10 minutes early entry allowed
//   const allowedStart = new Date(startDateTime.getTime() - 10 * 60 * 1000);

//   // 15 minutes grace after meeting end
//   const allowedEnd = new Date(endDateTime.getTime() + 15 * 60 * 1000);

//   return now >= allowedStart && now <= allowedEnd;
// };

const MEETING_TIMEZONE_OFFSET = process.env.MEETING_TIMEZONE_OFFSET || "+05:00";

const normalizeMeetingDate = (date) => {
  if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }

  return String(date).slice(0, 10);
};

const getMeetingDateTime = (date, time) => {
  const meetingDate = normalizeMeetingDate(date);

  return new Date(`${meetingDate}T${time}:00${MEETING_TIMEZONE_OFFSET}`);
};

const isMeetingTimeAllowed = (meeting) => {
  const now = new Date();

  const startDateTime = getMeetingDateTime(meeting.date, meeting.startTime);
  const endDateTime = getMeetingDateTime(meeting.date, meeting.endTime);

  // 10 minutes early entry allowed
  const allowedStart = new Date(startDateTime.getTime() - 10 * 60 * 1000);

  // 15 minutes grace after meeting end
  const allowedEnd = new Date(endDateTime.getTime() + 15 * 60 * 1000);

  console.log("Meeting time check:", {
    nowUTC: now.toISOString(),
    meetingDate: meeting.date,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
    allowedStartUTC: allowedStart.toISOString(),
    allowedEndUTC: allowedEnd.toISOString(),
    timezoneOffset: MEETING_TIMEZONE_OFFSET,
    isAllowed: now >= allowedStart && now <= allowedEnd,
  });

  return now >= allowedStart && now <= allowedEnd;
};

const setupVideoSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication failed:", error.message);
      next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, socket.user?.name);

    socket.on("join-room", async ({ roomId }) => {
      try {
        const meeting = await Meeting.findById(roomId);

        if (!meeting) {
          socket.emit("join-error", {
            message: "Meeting not found",
          });
          return;
        }

        if (meeting.status !== "accepted") {
          socket.emit("join-error", {
            message: "Meeting must be accepted before joining video call",
          });
          return;
        }

        const isParticipant =
          meeting.requestedBy.toString() === socket.user._id.toString() ||
          meeting.requestedTo.toString() === socket.user._id.toString();

        if (!isParticipant) {
          socket.emit("join-error", {
            message: "You are not allowed to join this meeting",
          });
          return;
        }

        if (!isMeetingTimeAllowed(meeting)) {
          socket.emit("join-error", {
            message: `Video call is only available from ${meeting.startTime} to ${meeting.endTime} on ${meeting.date}`,
          });
          return;
        }

        socket.join(roomId);

        socket.to(roomId).emit("user-joined", {
          socketId: socket.id,
          userId: socket.user._id,
          userName: socket.user.name,
        });

        socket.emit("joined-room", {
          roomId,
          socketId: socket.id,
        });

        console.log(`${socket.user.name} joined video room ${roomId}`);
      } catch (error) {
        console.error("Failed to join video room:", error);

        socket.emit("join-error", {
          message: "Failed to join video room",
        });
      }
    });

    socket.on("offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("offer", {
        offer,
        from: socket.id,
      });
    });

    socket.on("answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("answer", {
        answer,
        from: socket.id,
      });
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice-candidate", {
        candidate,
        from: socket.id,
      });
    });

    socket.on("toggle-audio", ({ roomId, isAudioEnabled }) => {
      socket.to(roomId).emit("user-toggle-audio", {
        socketId: socket.id,
        isAudioEnabled,
      });
    });

    socket.on("toggle-video", ({ roomId, isVideoEnabled }) => {
      socket.to(roomId).emit("user-toggle-video", {
        socketId: socket.id,
        isVideoEnabled,
      });
    });

    socket.on("leave-room", ({ roomId }) => {
      socket.leave(roomId);

      socket.to(roomId).emit("user-left", {
        socketId: socket.id,
      });

      console.log(`${socket.user?.name} left video room ${roomId}`);
    });

    socket.on("disconnecting", () => {
      socket.rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          socket.to(roomId).emit("user-left", {
            socketId: socket.id,
          });
        }
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", socket.id, reason);
    });
  });
};

module.exports = setupVideoSocket;