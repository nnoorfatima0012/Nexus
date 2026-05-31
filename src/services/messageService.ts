import API from "./api";
import { MessageUser, NexusConversation, NexusMessage } from "../types";

export const getConversations = async (): Promise<{
  success: boolean;
  count: number;
  conversations: NexusConversation[];
}> => {
  const response = await API.get("/messages/conversations");
  return response.data;
};

export const getMessagesWithUser = async (
  userId: string,
): Promise<{
  success: boolean;
  count: number;
  otherUser: MessageUser;
  messages: NexusMessage[];
}> => {
  const response = await API.get(`/messages/${userId}`);
  return response.data;
};

export const markMessagesAsRead = async (userId: string) => {
  const response = await API.patch(`/messages/${userId}/read`);
  return response.data;
};