
import axiosClient from "../../api/axiosClient";

const PlayerSelfAttendanceService = {

  // ==========================================================
  // GET LOGGED-IN PLAYER ACTIVE BATCHES
  // ==========================================================

  getMyBatches: async () => {
    const response = await axiosClient.get(
      "/player-attendance/me/batches"
    );

    return response.data;
  },

  // ==========================================================
  // GET TODAY'S ATTENDANCE
  // ==========================================================

  getTodayAttendance: async (batchId) => {
    const response = await axiosClient.get(
      `/player-attendance/me/batches/${batchId}/today`
    );

    return response.data;
  },

  // ==========================================================
  // GET ATTENDANCE HISTORY
  // ==========================================================

  getAttendanceHistory: async (batchId) => {
    const response = await axiosClient.get(
      `/player-attendance/me/batches/${batchId}/history`
    );

    return response.data;
  },

  // ==========================================================
  // PLAYER PUNCH IN
  // ==========================================================

  punchIn: async (batchId) => {
    const response = await axiosClient.post(
      `/player-attendance/batches/${batchId}/attendance/punch-in`
    );

    return response.data;
  },

  // ==========================================================
  // PLAYER PUNCH OUT
  // ==========================================================

  punchOut: async (batchId) => {
    const response = await axiosClient.post(
      `/player-attendance/batches/${batchId}/attendance/punch-out`
    );

    return response.data;
  },

  // ==========================================================
  // SUBMIT PLAYER INJURY REPORT
  // ==========================================================

  sendInjuryReport: async (reportData) => {
    const response = await axiosClient.post(
      "/injury-reports",
      reportData
    );

    return response.data;
  }

};

export default PlayerSelfAttendanceService;