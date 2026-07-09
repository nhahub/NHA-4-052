import api from "./api";

const metricsService = {
  getMetrics: async (range = "7D") => {
    const response = await api.get(`/metrics?range=${range}`);
    return response.data;
  },
};

export default metricsService;
