import React from "react";
import { useParams } from "react-router-dom";
import { Video } from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { VideoRoom } from "../../components/video/VideoRoom";

export const VideoCallPage: React.FC = () => {
  const { roomId } = useParams();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Video Call</h1>
        <p className="text-gray-600">
          Join a secure investor-startup video room.
        </p>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <Video size={20} className="text-primary-600" />
          <h2 className="text-lg font-medium text-gray-900">
            Room: {roomId || "Unknown"}
          </h2>
        </CardHeader>

        <CardBody>
          {roomId ? (
            <VideoRoom roomId={roomId} />
          ) : (
            <p className="text-sm text-gray-500">No video room selected.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};