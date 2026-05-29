// //server/src/modules/video/socket.js
// const setupVideoSocket = (io) => {
//   io.on("connection", (socket) => {
//     console.log("Socket connected:", socket.id);

//     socket.on("join-room", ({ roomId, userId, userName }) => {
//       socket.join(roomId);

//       socket.to(roomId).emit("user-joined", {
//         socketId: socket.id,
//         userId,
//         userName,
//       });

//       socket.emit("joined-room", {
//         roomId,
//         socketId: socket.id,
//       });
//     });

//     socket.on("offer", ({ roomId, offer }) => {
//       socket.to(roomId).emit("offer", {
//         offer,
//         from: socket.id,
//       });
//     });

//     socket.on("answer", ({ roomId, answer }) => {
//       socket.to(roomId).emit("answer", {
//         answer,
//         from: socket.id,
//       });
//     });

//     socket.on("ice-candidate", ({ roomId, candidate }) => {
//       socket.to(roomId).emit("ice-candidate", {
//         candidate,
//         from: socket.id,
//       });
//     });

//     socket.on("toggle-audio", ({ roomId, isAudioEnabled }) => {
//       socket.to(roomId).emit("user-toggle-audio", {
//         socketId: socket.id,
//         isAudioEnabled,
//       });
//     });

//     socket.on("toggle-video", ({ roomId, isVideoEnabled }) => {
//       socket.to(roomId).emit("user-toggle-video", {
//         socketId: socket.id,
//         isVideoEnabled,
//       });
//     });

//     socket.on("leave-room", ({ roomId }) => {
//       socket.leave(roomId);

//       socket.to(roomId).emit("user-left", {
//         socketId: socket.id,
//       });
//     });

//     socket.on("disconnect", () => {
//       console.log("Socket disconnected:", socket.id);
//     });
//   });
// };

// module.exports = setupVideoSocket;

const jwt = require("jsonwebtoken");
const User = require("../users/user.model");
const Meeting = require("../meetings/meeting.model");

const getMeetingDateTime = (date, time) => {
  return new Date(`${date}T${time}:00`);
};

const isMeetingTimeAllowed = (meeting) => {
  const now = new Date();

  const startDateTime = getMeetingDateTime(meeting.date, meeting.startTime);
  const endDateTime = getMeetingDateTime(meeting.date, meeting.endTime);

  // 10 minutes early entry allowed
  const allowedStart = new Date(startDateTime.getTime() - 10 * 60 * 1000);

  // 15 minutes grace after meeting end
  const allowedEnd = new Date(endDateTime.getTime() + 15 * 60 * 1000);

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
      next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

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
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = setupVideoSocket;