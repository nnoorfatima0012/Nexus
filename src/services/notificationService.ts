import API from "./api";
import { NexusNotification } from "../types";

export const getNotifications = async (): Promise<{
  success: boolean;
  count: number;
  unreadCount: number;
  notifications: NexusNotification[];
}> => {
  const response = await API.get("/notifications");
  return response.data;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await API.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await API.patch("/notifications/read-all");
  return response.data;
};

export const deleteNotification = async (id: string) => {
  const response = await API.delete(`/notifications/${id}`);
  return response.data;
};