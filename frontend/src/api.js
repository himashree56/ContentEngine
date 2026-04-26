import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export const api = {
  /**
   * POST /generate — enqueue a campaign generation task.
   * @param {string} userBrief
   * @param {string|null} textModel
   * @returns {Promise<{task_id: string, status: string}>}
   */
  generateCampaign: (userBrief, textModel = null) =>
    axios
      .post(`${BASE_URL}/generate`, {
        user_brief: userBrief,
        text_model: textModel,
      })
      .then((r) => r.data),

  /**
   * GET /status/:taskId — poll task status.
   * @param {string} taskId
   */
  getStatus: (taskId) =>
    axios.get(`${BASE_URL}/status/${taskId}`).then((r) => r.data),

  /**
   * GET /health — backend liveness probe.
   */
  health: () => axios.get(`${BASE_URL}/health`).then((r) => r.data),
};
