//src/components/meetings/MeetingCard.tsx
import React from "react";
import { Calendar, Clock, Video } from "lucide-react";
import toast from "react-hot-toast";
import { Meeting } from "../../types";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { acceptMeeting, cancelMeeting, rejectMeeting } from "../../services/meetingService";

interface MeetingCardProps {
  meeting: Meeting;
  onUpdated: () => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onUpdated }) => {
  const { user } = useAuth();

  const isReceiver = meeting.requestedTo._id === user?.id;
  const otherUser =
    meeting.requestedBy._id === user?.id ? meeting.requestedTo : meeting.requestedBy;

  const handleAction = async (action: "accept" | "reject" | "cancel") => {
    try {
      if (action === "accept") {
        await acceptMeeting(meeting._id);
        toast.success("Meeting accepted");
      }

      if (action === "reject") {
        await rejectMeeting(meeting._id);
        toast.success("Meeting rejected");
      }

      if (action === "cancel") {
        await cancelMeeting(meeting._id);
        toast.success("Meeting cancelled");
      }

      onUpdated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const badgeVariant =
    meeting.status === "accepted"
      ? "success"
      : meeting.status === "rejected"
      ? "error"
      : meeting.status === "cancelled"
      ? "warning"
      : "secondary";

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
      <div className="flex justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">{meeting.title}</h3>
            <Badge variant={badgeVariant as any} size="sm">
              {meeting.status}
            </Badge>
          </div>

          <p className="text-sm text-gray-600 mt-1">
            With {otherUser.name} ({otherUser.role})
          </p>

          {meeting.description && (
            <p className="text-sm text-gray-500 mt-2">{meeting.description}</p>
          )}

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Calendar size={16} />
              {meeting.date}
            </span>

            <span className="inline-flex items-center gap-1">
              <Clock size={16} />
              {meeting.startTime} - {meeting.endTime}
            </span>
          </div>
        </div>

        <img
          src={otherUser.avatarUrl}
          alt={otherUser.name}
          className="w-10 h-10 rounded-full"
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {meeting.status === "pending" && isReceiver && (
          <>
            <Button size="sm" variant="success" onClick={() => handleAction("accept")}>
              Accept
            </Button>

            <Button size="sm" variant="error" onClick={() => handleAction("reject")}>
              Reject
            </Button>
          </>
        )}

        {meeting.status === "pending" && (
          <Button size="sm" variant="outline" onClick={() => handleAction("cancel")}>
            Cancel
          </Button>
        )}

        {meeting.status === "accepted" && meeting.meetingLink && (
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Video size={16} />}
            onClick={() => toast("Video page will be added in Commit 6")}
          >
            Join Call
          </Button>
        )}
      </div>
    </div>
  );
};