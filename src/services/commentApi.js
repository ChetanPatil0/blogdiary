import api from "./api";

export const getComments = async (blogId, page = 1, limit = 10) => {
  const response = await api.get(`/blogs/${blogId}/comments`, {
    params: { page, limit }
  });
  return response.data;
};

export const createComment = async (blogId, content, parent = null) => {


  const payload = parent ? { content, parent } : { content };

  const response = await api.post(`/blogs/${blogId}/comments`, payload);
  return response.data;
};

export const updateComment = async (blogId, commentId, content) => {
  const response = await api.put(`/blogs/${blogId}/comments/${commentId}`, {
    content
  });
  return response.data;
};

export const deleteComment = async (blogId, commentId) => {
  const response = await api.delete(`/blogs/${blogId}/comments/${commentId}`);
  return response.data;
};

export const toggleCommentReaction = async (blogId, commentId, reactionType) => {
  if (!['like', 'dislike'].includes(reactionType)) {
    throw new Error('Invalid reaction type');
  }

  const response = await api.post(`/blogs/${blogId}/comments/${commentId}/like-dislike`, {
    type: reactionType
  });

  return response.data;
};