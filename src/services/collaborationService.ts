import API from "./api";
import { NexusCollaboration } from "../types";

export interface CreateCollaborationPayload {
  receiver: string;
  message: string;
}

export const createCollaborationRequest = async (
  payload: CreateCollaborationPayload,
): Promise<{
  success: boolean;
  message: string;
  collaboration: NexusCollaboration;
}> => {
  const response = await API.post("/collaborations", payload);
  return response.data;
};

export const getMyCollaborations = async (): Promise<{
  success: boolean;
  count: number;
  collaborations: NexusCollaboration[];
}> => {
  const response = await API.get("/collaborations");
  return response.data;
};

export const getSentCollaborations = async (): Promise<{
  success: boolean;
  count: number;
  collaborations: NexusCollaboration[];
}> => {
  const response = await API.get("/collaborations/sent");
  return response.data;
};

export const getReceivedCollaborations = async (): Promise<{
  success: boolean;
  count: number;
  collaborations: NexusCollaboration[];
}> => {
  const response = await API.get("/collaborations/received");
  return response.data;
};

export const getCollaborationStatusWithUser = async (
  userId: string,
): Promise<{
  success: boolean;
  status: "none" | "pending" | "accepted" | "rejected" | "cancelled";
  direction: "sent" | "received" | null;
  collaboration: NexusCollaboration | null;
}> => {
  const response = await API.get(`/collaborations/user/${userId}/status`);
  return response.data;
};

export const acceptCollaboration = async (
  collaborationId: string,
): Promise<{
  success: boolean;
  message: string;
  collaboration: NexusCollaboration;
}> => {
  const response = await API.patch(`/collaborations/${collaborationId}/accept`);
  return response.data;
};

export const rejectCollaboration = async (
  collaborationId: string,
): Promise<{
  success: boolean;
  message: string;
  collaboration: NexusCollaboration;
}> => {
  const response = await API.patch(`/collaborations/${collaborationId}/reject`);
  return response.data;
};

export const cancelCollaboration = async (
  collaborationId: string,
): Promise<{
  success: boolean;
  message: string;
  collaboration: NexusCollaboration;
}> => {
  const response = await API.patch(`/collaborations/${collaborationId}/cancel`);
  return response.data;
};