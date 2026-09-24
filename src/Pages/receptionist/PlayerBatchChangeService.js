import axiosClient from "../../api/axiosClient";

// =========================================================
// PLAYER BATCH CHANGE SERVICE
// =========================================================

const PlayerBatchChangeService = {

  // =======================================================
  // FIND PLAYER BY USERNAME
  // =======================================================

  getPlayerByUsername: async (username) => {

    const response = await axiosClient.get(
      `/player-batch-change/username/${encodeURIComponent(username)}`
    );

    return response.data;
  },


  // =======================================================
  // GET AVAILABLE BATCHES
  //
  // Backend already filters:
  // - Same sport
  // - Same coach
  // - Active batches
  // - Available capacity
  // =======================================================

  getAvailableBatches: async (playerId) => {

    const response = await axiosClient.get(
      `/player-batch-change/${playerId}/available-batches`
    );

    return response.data;
  },


  // =======================================================
  // CHANGE PLAYER BATCH
  //
  // IMPORTANT:
  // Only batchId is sent.
  //
  // Backend keeps:
  // - Sport
  // - Coach
  // - Fees
  // - Discount
  // - Payment plan
  // - Payments
  // - Installments
  //
  // unchanged.
  // =======================================================

  changePlayerBatch: async (playerId, batchId) => {

    const response = await axiosClient.put(
      `/player-batch-change/${playerId}`,
      {
        batchId: batchId,
      }
    );

    return response.data;
  },
};


export default PlayerBatchChangeService;