import axiosClient from "../../api/axiosClient";


// ============================================================
// PERFORMANCE CARD SERVICE
// ============================================================

const PerformanceCardService = {

  // ==========================================================
  // CREATE PERFORMANCE CARD
  // ==========================================================

  createPerformanceCard: async (request) => {

    const response =
      await axiosClient.post(
        "/performance-cards",
        request
      );

    return response.data;
  },


  // ==========================================================
  // GET PERFORMANCE CARD BY ID
  // ==========================================================

  getPerformanceCard: async (performanceCardId) => {

    const response =
      await axiosClient.get(
        `/performance-cards/${performanceCardId}`
      );

    return response.data;
  },


  // ==========================================================
  // GET PLAYER PERFORMANCE CARD FOR BATCH
  // ==========================================================

  getPlayerPerformanceCard: async (
    batchId,
    playerId
  ) => {

    const response =
      await axiosClient.get(
        `/performance-cards/batch/${batchId}/player/${playerId}`
      );

    return response.data;
  },


  // ==========================================================
  // GET ALL PERFORMANCE CARDS OF BATCH
  // ==========================================================

  getBatchPerformanceCards: async (
    batchId
  ) => {

    const response =
      await axiosClient.get(
        `/performance-cards/batch/${batchId}`
      );

    return response.data;
  },


  // ==========================================================
  // GET PLAYER PERFORMANCE HISTORY
  // ==========================================================

  getPlayerPerformanceHistory: async (
    playerId
  ) => {

    const response =
      await axiosClient.get(
        `/performance-cards/player/${playerId}`
      );

    return response.data;
  },

};

export default PerformanceCardService;