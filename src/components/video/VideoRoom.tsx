
// src/components/video/VideoRoom.tsx
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getSocket } from "../../services/socketService";
import { CallControls } from "./CallControls";

interface VideoRoomProps {
  roomId: string;
}

const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const VideoRoom: React.FC<VideoRoomProps> = ({ roomId }) => {
  const { user } = useAuth();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const isJoinedRef = useRef(false);
  const isStartingRef = useRef(false);
  const hasShownJoinToastRef = useRef(false);

  const [isJoined, setIsJoined] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [remoteUserConnected, setRemoteUserConnected] = useState(false);

  const attachLocalStreamToVideo = async () => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      await localVideoRef.current.play().catch((error) => {
        console.log("Local video play error:", error);
      });
    }
  };

  const cleanupPeerConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const createPeerConnection = () => {
    const socket = getSocket();

    cleanupPeerConnection();

    const peerConnection = new RTCPeerConnection(rtcConfig);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current as MediaStream);
      });
    }

    peerConnection.ontrack = async (event) => {
      const [remoteStream] = event.streams;

      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        await remoteVideoRef.current.play().catch((error) => {
          console.log("Remote video play error:", error);
        });
      }

      setRemoteUserConnected(true);
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log("RTC state:", peerConnection.connectionState);

      if (
        peerConnection.connectionState === "failed" ||
        peerConnection.connectionState === "disconnected"
      ) {
        console.log("RTC connection unstable. Waiting for reconnect/rejoin...");
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  };

  const emitJoinRoom = () => {
    const socket = getSocket();

    console.log("Joining room:", {
      roomId,
      userId: user?.id,
      userName: user?.name,
      socketId: socket.id,
    });

    socket.emit("join-room", {
      roomId,
      userId: user?.id,
      userName: user?.name,
    });
  };

  const startCall = async () => {
    if (isStartingRef.current || isJoinedRef.current) return;

    try {
      isStartingRef.current = true;

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: true,
      });

      localStreamRef.current = localStream;

      console.log("Local stream tracks:", localStream.getTracks());
      console.log("Video tracks:", localStream.getVideoTracks());

      await attachLocalStreamToVideo();

      isJoinedRef.current = true;
      setIsJoined(true);

      emitJoinRoom();
    } catch (error) {
      console.error("Camera/mic error:", error);
      toast.error("Camera or microphone permission denied");
    } finally {
      isStartingRef.current = false;
    }
  };

  const handleEndCall = () => {
    const socket = getSocket();

    socket.emit("leave-room", { roomId });

    isJoinedRef.current = false;
    hasShownJoinToastRef.current = false;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    cleanupPeerConnection();

    localStreamRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setIsJoined(false);
    setRemoteUserConnected(false);
    toast.success("Call ended");
  };

  const handleToggleAudio = () => {
    const socket = getSocket();

    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsAudioEnabled(track.enabled);

      socket.emit("toggle-audio", {
        roomId,
        isAudioEnabled: track.enabled,
      });
    });
  };

  const handleToggleVideo = () => {
    const socket = getSocket();

    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsVideoEnabled(track.enabled);

      socket.emit("toggle-video", {
        roomId,
        isVideoEnabled: track.enabled,
      });
    });
  };

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);

      if (isJoinedRef.current) {
        console.log("Rejoining video room after reconnect:", roomId);
        emitJoinRoom();
      }
    };

    const handleDisconnect = (reason: string) => {
      console.log("Socket disconnected:", reason);
    };

    const handleConnectError = (error: Error) => {
      console.log("Socket connect error:", error.message);
    };

    const handleJoinedRoom = ({ roomId }: { roomId: string }) => {
      console.log("Joined room confirmed:", roomId);

      if (!hasShownJoinToastRef.current) {
        toast.success("Joined video room");
        hasShownJoinToastRef.current = true;
      }
    };

    const handleJoinError = ({ message }: { message: string }) => {
      console.log("Join error received:", message);
      toast.error(message);

      // Important:
      // Do NOT stop camera tracks here.
      // Mobile may briefly reconnect and receive temporary errors.
      // Closing tracks here causes the room to close after 2–4 seconds.
    };

    const handleUserJoined = async ({ userName }: { userName: string }) => {
      console.log("Remote user joined:", userName);
      setRemoteUserConnected(true);

      try {
        const peerConnection = createPeerConnection();
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit("offer", {
          roomId,
          offer,
        });
      } catch (error) {
        console.error("Failed to create/send offer:", error);
      }
    };

    const handleOffer = async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
      console.log("Offer received");

      try {
        const peerConnection = createPeerConnection();

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer),
        );

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit("answer", {
          roomId,
          answer,
        });
      } catch (error) {
        console.error("Failed to handle offer:", error);
      }
    };

    const handleAnswer = async ({
      answer,
    }: {
      answer: RTCSessionDescriptionInit;
    }) => {
      console.log("Answer received");

      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer),
          );
        }
      } catch (error) {
        console.error("Failed to handle answer:", error);
      }
    };

    const handleIceCandidate = async ({
      candidate,
    }: {
      candidate: RTCIceCandidateInit;
    }) => {
      try {
        if (peerConnectionRef.current && candidate) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate),
          );
        }
      } catch (error) {
        console.error("Failed to add ICE candidate:", error);
      }
    };

    const handleUserLeft = () => {
      console.log("Remote user left the call");

      setRemoteUserConnected(false);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      cleanupPeerConnection();

      toast("Remote user left the call");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    socket.on("joined-room", handleJoinedRoom);
    socket.on("join-error", handleJoinError);
    socket.on("user-joined", handleUserJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);

      socket.off("joined-room", handleJoinedRoom);
      socket.off("join-error", handleJoinError);
      socket.off("user-joined", handleUserJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-left", handleUserLeft);
    };
  }, [roomId, user?.id, user?.name]);

  useEffect(() => {
    return () => {
      isJoinedRef.current = false;

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      cleanupPeerConnection();

      localStreamRef.current = null;
    };
  }, []);

  return (
    <div className="space-y-6">
      {!isJoined && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Join room <span className="font-medium">{roomId}</span> to start the
            call.
          </p>

          <button
            onClick={startCall}
            className="px-5 py-2.5 rounded-md bg-primary-600 text-white hover:bg-primary-700"
          >
            Join Video Call
          </button>
        </div>
      )}

      {isJoined && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg overflow-hidden relative">
              <video
                ref={(videoElement) => {
                  localVideoRef.current = videoElement;

                  if (videoElement && localStreamRef.current) {
                    videoElement.srcObject = localStreamRef.current;
                    videoElement.play().catch((error) => {
                      console.log("Local video ref play error:", error);
                    });
                  }
                }}
                autoPlay
                muted
                playsInline
                className="w-full h-72 object-cover transform scale-x-[-1]"
              />

              <div className="absolute left-3 bottom-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                You
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg overflow-hidden relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-72 object-cover"
              />

              {!remoteUserConnected && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                  Waiting for another user...
                </div>
              )}

              <div className="absolute left-3 bottom-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                Remote User
              </div>
            </div>
          </div>

          <CallControls
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            onToggleAudio={handleToggleAudio}
            onToggleVideo={handleToggleVideo}
            onEndCall={handleEndCall}
          />
        </>
      )}
    </div>
  );
};