//src/components/video/VideoRoom.tsx
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getSocket } from "../../services/socketService";
import { CallControls } from "./CallControls";

interface VideoRoomProps {
  roomId: string;
}

const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const VideoRoom: React.FC<VideoRoomProps> = ({ roomId }) => {
  const { user } = useAuth();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const [isJoined, setIsJoined] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [remoteUserConnected, setRemoteUserConnected] = useState(false);

  const createPeerConnection = () => {
    const socket = getSocket();

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const peerConnection = new RTCPeerConnection(rtcConfig);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current as MediaStream);
      });
    }

    peerConnection.ontrack = async (event) => {
      const [remoteStream] = event.streams;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        await remoteVideoRef.current.play().catch(() => {});
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
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  };

  const startCall = async () => {
    try {
      const socket = getSocket();

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = localStream;
      console.log("Local stream tracks:", localStream.getTracks());
      console.log("Video tracks:", localStream.getVideoTracks());

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        await localVideoRef.current.play().catch(() => {});
      }

      console.log("Joining room:", {
        roomId,
        userId: user?.id,
        userName: user?.name,
      });

      socket.emit("join-room", {
        roomId,
        userId: user?.id,
        userName: user?.name,
      });

      setIsJoined(true);
      toast.success("Joined video room");
    } catch (error) {
      console.error(error);
      toast.error("Camera or microphone permission denied");
    }
  };

  const handleEndCall = () => {
    const socket = getSocket();

    socket.emit("leave-room", { roomId });

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnectionRef.current?.close();

    localStreamRef.current = null;
    peerConnectionRef.current = null;

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

    socket.on("joined-room", ({ roomId }) => {
      console.log("Joined room confirmed:", roomId);
    });

    socket.on("user-joined", async ({ userName }) => {
      console.log("Remote user joined:", userName);
      setRemoteUserConnected(true);

      const peerConnection = createPeerConnection();
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit("offer", {
        roomId,
        offer,
      });
    });

    socket.on("offer", async ({ offer }) => {
      console.log("Offer received");

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
    });

    socket.on("answer", async ({ answer }) => {
      console.log("Answer received");

      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        if (peerConnectionRef.current && candidate) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate),
          );
        }
      } catch (error) {
        console.error("Failed to add ICE candidate", error);
      }
    });

    socket.on("user-left", () => {
      setRemoteUserConnected(false);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      toast("Remote user left the call");
    });

    return () => {
      socket.off("joined-room");
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-left");
    };
  }, [roomId]);

  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      peerConnectionRef.current?.close();
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
                    videoElement.play().catch(() => {});
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
