// //src/services/socketService.ts
// import { io, Socket } from "socket.io-client";

// let socket: Socket | null = null;

// export const getSocket = () => {
//   if (!socket) {
//     const socketUrl =
//       import.meta.env.VITE_SOCKET_URL ||
//       import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
//       "http://localhost:5000";

//     socket = io(socketUrl, {
//       withCredentials: true,
//       transports: ["websocket", "polling"],
//     });
//   }

//   return socket;
// };

// export const disconnectSocket = () => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// };


// import { io, Socket } from "socket.io-client";

// let socket: Socket | null = null;

// export const getSocket = () => {
//   if (!socket) {
//     const socketUrl =
//       import.meta.env.VITE_SOCKET_URL ||
//       import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
//       "http://localhost:5000";

//     const token = localStorage.getItem("nexus_token");

//     socket = io(socketUrl, {
//       withCredentials: true,
//       transports: ["websocket", "polling"],
//       auth: {
//         token,
//       },
//     });
//   }

//   return socket;
// };

// export const disconnectSocket = () => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// };

// src/services/socketService.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentSocketToken: string | null = null;

const getSocketUrl = () => {
  return (
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
    "http://localhost:5000"
  );
};

export const getSocket = () => {
  const socketUrl = getSocketUrl();
  const latestToken = localStorage.getItem("nexus_token");

  // If user changed/login changed token, destroy old socket.
  // This prevents mobile from staying connected as the old user.
  if (socket && currentSocketToken !== latestToken) {
    console.log("Socket token changed. Recreating socket.");

    socket.removeAllListeners();
    socket.disconnect();

    socket = null;
    currentSocketToken = null;
  }

  if (!socket) {
    currentSocketToken = latestToken;

    socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],

      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,

      forceNew: false,
      multiplex: true,

      auth: {
        token: latestToken,
      },
    });

    socket.on("connect", () => {
      console.log("Socket connected as:", socket?.id);
    });

    socket.on("connect_error", (error) => {
      console.log("Socket connect error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentSocketToken = null;
  }
};