// //src/components/meetings/MeetingCard.tsx
// import React from "react";
// import { Calendar, Clock, Video } from "lucide-react";
// import toast from "react-hot-toast";
// import { Meeting } from "../../types";
// import { Button } from "../ui/Button";
// import { Badge } from "../ui/Badge";
// import { useAuth } from "../../context/AuthContext";
// import {
//   acceptMeeting,
//   cancelMeeting,
//   rejectMeeting,
// } from "../../services/meetingService";
// import { useNavigate } from "react-router-dom";

// interface MeetingCardProps {
//   meeting: Meeting;
//   onUpdated: () => void;
// }

// export const MeetingCard: React.FC<MeetingCardProps> = ({
//   meeting,
//   onUpdated,
// }) => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const isReceiver = meeting.requestedTo._id === user?.id;
//   const otherUser =
//     meeting.requestedBy._id === user?.id
//       ? meeting.requestedTo
//       : meeting.requestedBy;

//   const handleAction = async (action: "accept" | "reject" | "cancel") => {
//     try {
//       if (action === "accept") {
//         await acceptMeeting(meeting._id);
//         toast.success("Meeting accepted");
//       }

//       if (action === "reject") {
//         await rejectMeeting(meeting._id);
//         toast.success("Meeting rejected");
//       }

//       if (action === "cancel") {
//         await cancelMeeting(meeting._id);
//         toast.success("Meeting cancelled");
//       }

//       onUpdated();
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || "Action failed");
//     }
//   };

//   const badgeVariant =
//     meeting.status === "accepted"
//       ? "success"
//       : meeting.status === "rejected"
//         ? "error"
//         : meeting.status === "cancelled"
//           ? "warning"
//           : "secondary";

//   return (
//     <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
//       <div className="flex justify-between gap-4">
//         <div>
//           <div className="flex items-center gap-2">
//             <h3 className="text-sm font-semibold text-gray-900">
//               {meeting.title}
//             </h3>
//             <Badge variant={badgeVariant as any} size="sm">
//               {meeting.status}
//             </Badge>
//           </div>

//           <p className="text-sm text-gray-600 mt-1">
//             With {otherUser.name} ({otherUser.role})
//           </p>

//           {meeting.description && (
//             <p className="text-sm text-gray-500 mt-2">{meeting.description}</p>
//           )}

//           <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
//             <span className="inline-flex items-center gap-1">
//               <Calendar size={16} />
//               {meeting.date}
//             </span>

//             <span className="inline-flex items-center gap-1">
//               <Clock size={16} />
//               {meeting.startTime} - {meeting.endTime}
//             </span>
//           </div>
//         </div>

//         <img
//           src={otherUser.avatarUrl}
//           alt={otherUser.name}
//           className="w-10 h-10 rounded-full"
//         />
//       </div>

//       <div className="flex flex-wrap gap-2 mt-4">
//         {meeting.status === "pending" && isReceiver && (
//           <>
//             <Button
//               size="sm"
//               variant="success"
//               onClick={() => handleAction("accept")}
//             >
//               Accept
//             </Button>

//             <Button
//               size="sm"
//               variant="error"
//               onClick={() => handleAction("reject")}
//             >
//               Reject
//             </Button>
//           </>
//         )}

//         {meeting.status === "pending" && (
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => handleAction("cancel")}
//           >
//             Cancel
//           </Button>
//         )}

//         {meeting.status === "accepted" && meeting.meetingLink && (
//           <Button
//             size="sm"
//             variant="primary"
//             leftIcon={<Video size={16} />}
//             onClick={() => navigate(meeting.meetingLink)}
//           >
//             Join Call
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// };
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Video } from "lucide-react";
import toast from "react-hot-toast";

import { Meeting } from "../../types";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useAuth } from "../../context/AuthContext";
import {
  acceptMeeting,
  cancelMeeting,
  rejectMeeting,
} from "../../services/meetingService";

interface MeetingCardProps {
  meeting: Meeting;
  onUpdated: () => void;
}

type CallAvailabilityState =
  | "available"
  | "tooEarly"
  | "expired"
  | "notAccepted"
  | "invalid";

const getMeetingDateTime = (date: string, time: string) => {
  return new Date(`${date}T${time}:00`);
};

const getCallAvailability = (
  status: Meeting["status"],
  date: string,
  startTime: string,
  endTime: string,
  now: Date,
): {
  canJoin: boolean;
  state: CallAvailabilityState;
  buttonLabel: string;
  helperText: string;
} => {
  if (status !== "accepted") {
    return {
      canJoin: false,
      state: "notAccepted",
      buttonLabel: "Join unavailable",
      helperText: "Video call becomes available after the meeting is accepted.",
    };
  }

  const startDateTime = getMeetingDateTime(date, startTime);
  const endDateTime = getMeetingDateTime(date, endTime);

  if (
    Number.isNaN(startDateTime.getTime()) ||
    Number.isNaN(endDateTime.getTime())
  ) {
    return {
      canJoin: false,
      state: "invalid",
      buttonLabel: "Invalid schedule",
      helperText: "This meeting has invalid date or time information.",
    };
  }

  // Must match backend rule:
  // 10 minutes before start allowed, 15 minutes after end allowed.
  const allowedStart = new Date(startDateTime.getTime() - 10 * 60 * 1000);
  const allowedEnd = new Date(endDateTime.getTime() + 15 * 60 * 1000);

  if (now < allowedStart) {
    return {
      canJoin: false,
      state: "tooEarly",
      buttonLabel: `Available at ${startTime}`,
      helperText: `Video room opens 10 minutes before the meeting starts.`,
    };
  }

  if (now > allowedEnd) {
    return {
      canJoin: false,
      state: "expired",
      buttonLabel: "Meeting expired",
      helperText: "This meeting time has passed, so the video room is closed.",
    };
  }

  return {
    canJoin: true,
    state: "available",
    buttonLabel: "Join Call",
    helperText: "Video room is open now.",
  };
};

const getStatusBadgeVariant = (status: Meeting["status"]) => {
  if (status === "accepted") return "success";
  if (status === "rejected") return "error";
  if (status === "cancelled") return "warning";
  return "secondary";
};

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  onUpdated,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const isRequester = meeting.requestedBy._id === user?.id;
  const isReceiver = meeting.requestedTo._id === user?.id;

  const otherUser = isRequester ? meeting.requestedTo : meeting.requestedBy;

  const callAvailability = getCallAvailability(
    meeting.status,
    meeting.date,
    meeting.startTime,
    meeting.endTime,
    now,
  );

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

  const renderMeetingMessage = () => {
    if (meeting.status === "pending" && isReceiver) {
      return (
        <p className="text-xs mt-2 text-warning-600">
          Action required: accept or reject this meeting request.
        </p>
      );
    }

    if (meeting.status === "pending" && isRequester) {
      return (
        <p className="text-xs mt-2 text-gray-500">
          Waiting for {meeting.requestedTo.name} to accept this meeting.
        </p>
      );
    }

    if (meeting.status === "accepted") {
      return (
        <p
          className={`text-xs mt-2 ${
            callAvailability.canJoin
              ? "text-success-600"
              : callAvailability.state === "expired"
              ? "text-error-600"
              : "text-warning-600"
          }`}
        >
          {callAvailability.helperText}
        </p>
      );
    }

    if (meeting.status === "rejected") {
      return (
        <p className="text-xs mt-2 text-error-600">
          This meeting request was rejected.
        </p>
      );
    }

    if (meeting.status === "cancelled") {
      return (
        <p className="text-xs mt-2 text-warning-600">
          This meeting was cancelled.
        </p>
      );
    }

    return null;
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
      <div className="flex justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">
              {meeting.title}
            </h3>

            <Badge
              variant={getStatusBadgeVariant(meeting.status) as any}
              size="sm"
            >
              {meeting.status}
            </Badge>

            {meeting.status === "accepted" &&
              callAvailability.state === "expired" && (
                <Badge variant="error" size="sm">
                  Expired
                </Badge>
              )}

            {meeting.status === "accepted" &&
              callAvailability.state === "available" && (
                <Badge variant="success" size="sm">
                  Live
                </Badge>
              )}
          </div>

          <p className="text-sm text-gray-600 mt-1">
            With {otherUser.name} ({otherUser.role})
          </p>

          {meeting.description && (
            <p className="text-sm text-gray-500 mt-2">
              {meeting.description}
            </p>
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

          {renderMeetingMessage()}
        </div>

        <img
          src={otherUser.avatarUrl}
          alt={otherUser.name}
          className="w-10 h-10 rounded-full shrink-0"
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {meeting.status === "pending" && isReceiver && (
          <>
            <Button
              size="sm"
              variant="success"
              onClick={() => handleAction("accept")}
            >
              Accept
            </Button>

            <Button
              size="sm"
              variant="error"
              onClick={() => handleAction("reject")}
            >
              Reject
            </Button>
          </>
        )}

        {meeting.status === "pending" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction("cancel")}
          >
            Cancel
          </Button>
        )}

        {meeting.status === "accepted" && meeting.meetingLink && (
          <Button
            size="sm"
            variant={callAvailability.canJoin ? "primary" : "outline"}
            leftIcon={<Video size={16} />}
            disabled={!callAvailability.canJoin}
            onClick={() => {
              if (callAvailability.canJoin) {
                navigate(meeting.meetingLink);
              }
            }}
          >
            {callAvailability.buttonLabel}
          </Button>
        )}

        {meeting.status === "accepted" &&
          !callAvailability.canJoin &&
          callAvailability.state === "expired" && (
            <Button size="sm" variant="ghost" disabled>
              Call closed
            </Button>
          )}
      </div>
    </div>
  );
};