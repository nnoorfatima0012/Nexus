import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Send } from "lucide-react";

import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import {
  createCollaborationRequest,
  getCollaborationStatusWithUser,
} from "../../services/collaborationService";
import { NexusCollaboration } from "../../types";

interface RequestCollaborationButtonProps {
  receiverId: string;
  receiverName: string;
  className?: string;
  fullWidth?: boolean;
}

export const RequestCollaborationButton: React.FC<
  RequestCollaborationButtonProps
> = ({ receiverId, receiverName, className = "", fullWidth = false }) => {
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState(
    `Hi ${receiverName}, I am interested in exploring a collaboration opportunity with you.`,
  );
  const [status, setStatus] = useState<
    "none" | "pending" | "accepted" | "rejected" | "cancelled"
  >("none");
  const [direction, setDirection] = useState<"sent" | "received" | null>(null);
  const [collaboration, setCollaboration] =
    useState<NexusCollaboration | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStatus = async () => {
    if (!receiverId || !user) return;

    try {
      setIsChecking(true);

      const data = await getCollaborationStatusWithUser(receiverId);

      setStatus(data.status);
      setDirection(data.direction);
      setCollaboration(data.collaboration);
    } catch (error) {
      console.error("Failed to check collaboration status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [receiverId, user?.id]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please write a short message");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = await createCollaborationRequest({
        receiver: receiverId,
        message: message.trim(),
      });

      setStatus("pending");
      setDirection("sent");
      setCollaboration(data.collaboration);
      setIsModalOpen(false);

      toast.success("Collaboration request sent");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to send collaboration request";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonText = () => {
    if (isChecking) return "Checking...";

    if (status === "accepted") return "Connected";

    if (status === "pending" && direction === "sent") return "Request Sent";

    if (status === "pending" && direction === "received") {
      return "Request Pending";
    }

    return "Request Collaboration";
  };

  const isDisabled =
    isChecking || status === "accepted" || status === "pending" || isSubmitting;

  return (
    <>
      <Button
        leftIcon={<Send size={18} />}
        disabled={isDisabled}
        onClick={() => setIsModalOpen(true)}
        className={className}
        fullWidth={fullWidth}
      >
        {getButtonText()}
      </Button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Request Collaboration
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Send a collaboration request to {receiverName}.
              </p>
            </div>

            <div className="p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Write your collaboration message..."
              />
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};