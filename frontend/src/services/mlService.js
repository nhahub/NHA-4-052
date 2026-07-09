import api from "./api";

const mlService = {
  /**
   * Search for foods by name in the nutrition dataset.
   * @param {string} query - search text (min 2 chars)
   * @param {number} [limit=10]
   * @returns {Promise<{ results: Array }>}
   */
  async searchFoods(query, limit = 10) {
    const res = await api.get(`/ml/foods?q=${encodeURIComponent(query)}&limit=${limit}`);
    return res.data;
  },

  /**
   * Predict the food category from nutritional features.
   * @param {object} features - object with feature column keys
   * @returns {Promise<{ predicted_category: string }>}
   */
  async predict(features) {
    const res = await api.post("/ml/predict", features);
    return res.data;
  },

  /**
   * Find similar foods from the dataset.
   * @param {object} features - nutritional features
   * @param {number} [topK=3]
   * @returns {Promise<{ results: Array }>}
   */
  async getSimilarFoods(features, topK = 3) {
    const res = await api.post("/ml/similar-foods", {
      features,
      top_k: topK,
    });
    return res.data;
  },
};

export default mlService;
