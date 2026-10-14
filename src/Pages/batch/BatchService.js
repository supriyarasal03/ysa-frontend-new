import api from "../../api/axiosClient";

// ==========================================================
// COMMON ERROR HANDLER
// ==========================================================

const handleApiError = (error, fallbackMessage) => {
  const backend = error.response?.data;

  const err = new Error(
    backend?.message || fallbackMessage
  );

  err.data = backend?.data ?? null;
  err.response = error.response;

  throw err;
};

// ==========================================================
// ADD BATCH
// ==========================================================

export const addBatch = async (payload) => {
  try {
    const res = await api.post(
      "/batches",
      payload
    );

    return res.data;
  } catch (error) {
    handleApiError(
      error,
      "Failed to create batch"
    );
  }
};

// ==========================================================
// UPDATE BATCH
// ==========================================================

export const updateBatch = async (
  id,
  payload
) => {
  try {
    const res = await api.put(
      `/batches/${id}`,
      payload
    );

    return res.data;
  } catch (error) {
    handleApiError(
      error,
      "Failed to update batch"
    );
  }
};

// ==========================================================
// GET BATCH BY ID
// ==========================================================

export const getBatchById = async (id) => {
  try {
    const res = await api.get(
      `/batches/${id}`
    );

    return res.data;
  } catch (error) {
    handleApiError(
      error,
      "Failed to fetch batch"
    );
  }
};

// ==========================================================
// GET ALL BATCHES
// ==========================================================

export const getAllBatches = async () => {
  try {
    const res = await api.get(
      "/batches"
    );

    return res.data;
  } catch (error) {
    handleApiError(
      error,
      "Failed to fetch batches"
    );
  }
};

// ==========================================================
// DEACTIVATE BATCH
// ==========================================================

export const deactivateBatch = async (id) => {
  try {
    const res = await api.delete(
      `/batches/${id}`
    );

    return res.data;
  } catch (error) {
    handleApiError(
      error,
      "Failed to deactivate batch"
    );
  }
};

// ==========================================================
// ACTIVATE BATCH
// ==========================================================

export const activateBatch = async (id) => {
  try {
    const res = await api.put(
      `/batches/${id}/activate`
    );

    return res.data;
  } catch (error) {
    handleApiError(
      error,
      "Failed to activate batch"
    );
  }
};

// ==========================================================
// GET SPORTS
// ==========================================================

export const getSports = async () => {
  try {
    const res = await api.get(
      "/sport"
    );

    return res.data;
  } catch (error) {
    handleApiError(
      error,
      "Failed to fetch sports"
    );
  }
};

// ==========================================================
// GET AVAILABLE COACHES
// ==========================================================

export const getAvailableCoaches = async ({
  sportId,
  startDate,
  endDate,
  startTime,
  endTime,
  trainingDays,
  excludeBatchId = null,
}) => {
  try {
    // Backend BatchController requires all of these
    // parameters for /available-coaches.
    const params = {
      sportId,
      startDate,
      endDate,
      startTime,
      endTime,
      trainingDays,
    };

    // Used while editing an existing batch.
    // This is included only when a batch id exists.
    if (
      excludeBatchId !== null &&
      excludeBatchId !== undefined
    ) {
      params.excludeBatchId =
        excludeBatchId;
    }

    const res = await api.get(
      "/batches/available-coaches",
      {
        params,
      }
    );

    return res.data;
  } catch (error) {
    handleApiError(
      error,
      "Failed to fetch available coaches"
    );
  }
};




// ==========================================================
// PERMANENTLY DELETE BATCH
// ==========================================================

export const deleteBatch = async (id) => {
  try {
    const res = await api.delete(
      `/batches/${id}/delete`
    );

    return res.data;
  } catch (error) {
    handleApiError(
      error,
      "Failed to permanently delete batch"
    );
  }
};
