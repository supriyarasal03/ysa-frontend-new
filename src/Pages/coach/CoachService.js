import api from "../../api/axiosClient";

// =========================================================
// GET ALL COACHES
// =========================================================

export const getAllCoaches = async () => {
  try {
    const res = await api.get("/coach");
    return res.data;
  } catch (error) {
    const backend = error.response?.data;

    const err = new Error(
      backend?.message || "Failed to fetch coaches"
    );

    err.data = backend?.data ?? null;
    err.response = error.response;

    throw err;
  }
};


// =========================================================
// GET COACH BY ID
// =========================================================

export const getCoachById = async (id) => {
  try {
    const res = await api.get(`/coach/${id}`);
    return res.data;
  } catch (error) {
    const backend = error.response?.data;

    const err = new Error(
      backend?.message || "Failed to fetch coach"
    );

    err.data = backend?.data ?? null;
    err.response = error.response;

    throw err;
  }
};


// =========================================================
// ADD COACH
// =========================================================

export const addCoach = async (formData) => {
  try {
    const res = await api.post(
      "/coach",
      formData
    );

    return res.data;
  } catch (error) {
    const backend = error.response?.data;

    const err = new Error(
      backend?.message || "Failed to create coach"
    );

    err.data = backend?.data ?? null;
    err.response = error.response;

    throw err;
  }
};


// =========================================================
// UPDATE COACH
// =========================================================

export const updateCoach = async (
  id,
  formData
) => {
  try {
    const res = await api.put(
      `/coach/${id}`,
      formData
    );

    return res.data;
  } catch (error) {
    const backend = error.response?.data;

    const err = new Error(
      backend?.message || "Failed to update coach"
    );

    err.data = backend?.data ?? null;
    err.response = error.response;

    throw err;
  }
};


// =========================================================
// UPDATE STATUS
// =========================================================

export const updateCoachStatus = async (
  id,
  status
) => {
  try {
    const res = await api.patch(
      `/coach/${id}/status`,
      null,
      {
        params: {
          status,
        },
      }
    );

    return res.data;
  } catch (error) {
    const backend = error.response?.data;

    const err = new Error(
      backend?.message ||
        "Failed to update coach status"
    );

    err.data = backend?.data ?? null;
    err.response = error.response;

    throw err;
  }
};


// =========================================================
// GET ALL SPORTS
// =========================================================

export const getAllSports = async () => {
  try {
    const res = await api.get("/sport");
    return res.data;
  } catch (error) {
    const backend = error.response?.data;

    const err = new Error(
      backend?.message ||
        "Failed to fetch sports"
    );

    err.data = backend?.data ?? null;
    err.response = error.response;

    throw err;
  }
};


// =========================================================
// VIEW COACH FILE
// =========================================================

export const viewCoachFile = async (path) => {
  try {
    const res = await api.get(
      "/coach/files/view",
      {
        params: {
          path,
        },
        responseType: "blob",
      }
    );

    return res.data;
  } catch (error) {
    throw new Error(
      "Unable to view file."
    );
  }
};


// =========================================================
// DOWNLOAD COACH FILE
// =========================================================

export const downloadCoachFile = async (
  path
) => {
  try {
    const res = await api.get(
      "/coach/files/download",
      {
        params: {
          path,
        },
        responseType: "blob",
      }
    );

    return res;
  } catch (error) {
    throw new Error(
      "Unable to download file."
    );
  }
};


// =========================================================
// ASSIGN COACH TO SPORT
// =========================================================

export const assignCoachToSport = async (
  sportId,
  coachId
) => {
  try {
    const res = await api.post(
      "/sport/assign-coach",
      {
        sportId,
        coachId,
      }
    );

    return res.data;
  } catch (error) {
    const backend = error.response?.data;

    const err = new Error(
      backend?.message ||
        "Failed to assign coach to sport"
    );

    err.data = backend?.data ?? null;
    err.response = error.response;

    throw err;
  }
};


// =========================================================
// GET ALL COACH-SPORT ASSIGNMENTS
// =========================================================

export const getCoachSportAssignments = async () => {
  try {
    const res = await api.get(
      "/sport/assignments"
    );

    return res.data;
  } catch (error) {
    const backend = error.response?.data;

    const err = new Error(
      backend?.message ||
        "Failed to fetch coach sport assignments"
    );

    err.data = backend?.data ?? null;
    err.response = error.response;

    throw err;
  }
};


// =========================================================
// DELETE COACH DOCUMENT
// =========================================================

export const deleteCoachFile = async (
  documentId
) => {
  try {

    if (
      documentId === undefined ||
      documentId === null ||
      String(documentId).trim() === ""
    ) {
      throw new Error(
        "Document ID is required."
      );
    }

    const res = await api.delete(
      `/coach/documents/${documentId}`
    );

    return res.data;

  } catch (error) {

    const backend = error.response?.data;

    const err = new Error(
      backend?.message ||
      "Failed to delete coach document."
    );

    err.data = backend?.data ?? null;
    err.response = error.response;

    throw err;
  }
};


// =========================================================
// UPDATE COACH SPORT ASSIGNMENT
// =========================================================

export const updateCoachSportAssignment = async (
  sportId,
  coachId
) => {
  try {
    const res = await api.put(
      "/sport/assign-coach",
      {
        sportId,
        coachId,
      }
    );

    return res.data;
  } catch (error) {
    const backend = error.response?.data;

    const err = new Error(
      backend?.message ||
        "Failed to update coach sport assignment"
    );

    err.data = backend?.data ?? null;
    err.response = error.response;

    throw err;
  }
};


// =========================================================
// REMOVE COACH SPORT ASSIGNMENT
// =========================================================

export const removeCoachSportAssignment = async (
  coachId
) => {
  try {
    const res = await api.delete(
      `/sport/assign-coach/${coachId}`
    );

    return res.data;
  } catch (error) {
    const backend = error.response?.data;

    const err = new Error(
      backend?.message ||
        "Failed to remove coach from sport"
    );

    err.data = backend?.data ?? null;
    err.response = error.response;

    throw err;
  }
};


// =========================================================
// GET MY COMPLETED / HISTORY BATCHES
// COACH DASHBOARD
// =========================================================

export const getMyHistoryBatches = async () => {
  try {
    const res = await api.get(
      "/coach-dashboard/batches/history"
    );

    return res.data;
  } catch (error) {
    const backend = error.response?.data;

    const err = new Error(
      backend?.message ||
        "Failed to fetch history batches"
    );

    err.data = backend?.data ?? null;
    err.response = error.response;

    throw err;
  }
};


// =========================================================
// GET STUDENTS OF HISTORY BATCH
// COACH DASHBOARD
// =========================================================

export const getHistoryBatchStudents = async (
  batchId
) => {
  try {
    const res = await api.get(
      `/coach-dashboard/batches/history/${batchId}/students`
    );

    return res.data;
  } catch (error) {
    const backend = error.response?.data;

    const err = new Error(
      backend?.message ||
        "Failed to fetch history batch students"
    );

    err.data = backend?.data ?? null;
    err.response = error.response;

    throw err;
  }
};




// =========================================================
// GET PERFORMANCE CARD BY BATCH AND PLAYER
// =========================================================

export const getPerformanceCard = async (
  batchId,
  playerId
) => {
  try {

    const res = await api.get(
      `/performance-cards/batch/${batchId}/player/${playerId}`
    );

    return res.data;

  } catch (error) {

    const backend = error.response?.data;

    const err = new Error(
      backend?.message ||
      "Failed to fetch performance card"
    );

    err.data = backend?.data ?? null;
    err.response = error.response;

    throw err;
  }
};


// =========================================================
// GET ALL PERFORMANCE CARDS FOR A BATCH
// =========================================================

export const getPerformanceCardsByBatch = async (
  batchId
) => {
  try {

    const res = await api.get(
      `/performance-cards/batch/${batchId}`
    );

    return res.data;

  } catch (error) {

    const backend = error.response?.data;

    const err = new Error(
      backend?.message ||
      "Failed to fetch performance cards"
    );

    err.data = backend?.data ?? null;
    err.response = error.response;

    throw err;
  }
};