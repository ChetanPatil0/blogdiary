import api from "./api";

export const getActivities = async (limit = 20,page = 1) => {
  const response = await api.get("/activities", {
    params: { limit , page}
  });

  return response.data;
};

export const getUnreadActivitesCount = async () => {
  const response = await api.get("/activities/unread-count");
console.log('unread count api : ',response)
 return response.data.data.unreadCount ?? 0;
};


export const markActivityAsRead = async (activityId) => {
  const response = await api.patch(`/activities/${activityId}/read`);
  return response.data;
};


export const clearActivities = async () => {
  const response = await api.delete("/activities/clear-all");
  return response.data;
};