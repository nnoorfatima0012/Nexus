//src/services/meetingService.ts
import API from "./api";
import { Meeting } from "../types";

export interface CreateMeetingPayload {
  title: string;
  description?: string;
  requestedTo: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const createMeeting = async (payload: CreateMeetingPayload) => {
  const response = await API.post("/meetings", payload);
  return response.data;
};

export const getMyMeetings = async (): Promise<{
  success: boolean;
  count: number;
  meetings: Meeting[];
}> => {
  const response = await API.get("/meetings");
  return response.data;
};

export const acceptMeeting = async (meetingId: string) => {
  const response = await API.patch(`/meetings/${meetingId}/accept`);
  return response.data;
};

export const rejectMeeting = async (meetingId: string) => {
  const response = await API.patch(`/meetings/${meetingId}/reject`);
  return response.data;
};

export const cancelMeeting = async (meetingId: string) => {
  const response = await API.patch(`/meetings/${meetingId}/cancel`);
  return response.data;
};