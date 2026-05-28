//src/components/video/CallControls.tsx
import React from "react";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { Button } from "../ui/Button";

interface CallControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
}) => {
  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant={isAudioEnabled ? "outline" : "warning"}
        size="lg"
        onClick={onToggleAudio}
      >
        {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
      </Button>

      <Button
        variant={isVideoEnabled ? "outline" : "warning"}
        size="lg"
        onClick={onToggleVideo}
      >
        {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
      </Button>

      <Button variant="error" size="lg" onClick={onEndCall}>
        <PhoneOff size={20} />
      </Button>
    </div>
  );
};