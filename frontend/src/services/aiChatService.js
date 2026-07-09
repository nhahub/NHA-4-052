import api from './api';

const AI_CHAT_PREFIX = '/ai-chat';

const aiChatService = {
  getSessions: async () => {
    const response = await api.get(`${AI_CHAT_PREFIX}/sessions`);
    return response.data;
  },

  createSession: async (title) => {
    const response = await api.post(`${AI_CHAT_PREFIX}/sessions`, { title });
    return response.data;
  },

  getSession: async (sessionId) => {
    const response = await api.get(`${AI_CHAT_PREFIX}/sessions/${sessionId}`);
    return response.data;
  },

  deleteSession: async (sessionId) => {
    await api.delete(`${AI_CHAT_PREFIX}/sessions/${sessionId}`);
  },

  updateSessionTitle: async (sessionId, title) => {
    const response = await api.put(`${AI_CHAT_PREFIX}/sessions/${sessionId}/title`, { title });
    return response.data;
  },

  sendMessage: async (sessionId, message) => {
    const response = await api.post(`${AI_CHAT_PREFIX}/sessions/${sessionId}/message`, { message });
    return response.data;
  }
};

export default aiChatService;
