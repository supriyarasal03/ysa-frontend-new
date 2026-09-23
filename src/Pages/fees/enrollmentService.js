import api from "../../api/axiosClient";

const enrollmentService = {

  // =========================================================
  // GET ALL ENROLLMENTS
  // =========================================================

  getAll: async () => {
    try {
      const response = await api.get(
        "/player-enrollment"
      );

      return response.data;

    } catch (error) {

      const backend =
        error.response?.data;

      const err = new Error(
        backend?.message ||
          "Failed to fetch player enrollments"
      );

      err.data =
        backend?.data ?? null;

      err.response =
        error.response;

      throw err;
    }
  },


  // =========================================================
  // GET ENROLLMENT BY ID
  // =========================================================

  getById: async (id) => {

    try {

      const response =
        await api.get(
          `/player-enrollment/${id}`
        );

      return response.data;

    } catch (error) {

      const backend =
        error.response?.data;

      const err = new Error(
        backend?.message ||
          "Failed to fetch enrollment"
      );

      err.data =
        backend?.data ?? null;

      err.response =
        error.response;

      throw err;
    }
  },


  // =========================================================
  // GET ENROLLMENTS BY PLAYER
  // =========================================================

  getByPlayer: async (playerId) => {

    try {

      const response =
        await api.get(
          `/player-enrollment/player/${playerId}`
        );

      return response.data;

    } catch (error) {

      const backend =
        error.response?.data;

      const err = new Error(
        backend?.message ||
          "Failed to fetch player enrollments"
      );

      err.data =
        backend?.data ?? null;

      err.response =
        error.response;

      throw err;
    }
  },


  // =========================================================
  // GET ALL SPORTS
  // Used for receptionist fee report filter
  // =========================================================

  getAllSports: async () => {

    try {

      const response =
        await api.get(
          "/sport"
        );

      return response.data;

    } catch (error) {

      const backend =
        error.response?.data;

      const err = new Error(
        backend?.message ||
          "Failed to fetch sports"
      );

      err.data =
        backend?.data ?? null;

      err.response =
        error.response;

      throw err;
    }
  },


  // =========================================================
  // GET SPORT-WISE FEE REPORT
  //
  // GET /api/payment/fee-report/sport/{sportId}?year=2026
  // =========================================================

  getSportFeeReport: async (
    sportId,
    year
  ) => {

    try {

      const response =
        await api.get(
          `/payment/fee-report/sport/${sportId}`,
          {
            params: {
              year
            }
          }
        );

      return response.data;

    } catch (error) {

      const backend =
        error.response?.data;

      const err = new Error(
        backend?.message ||
          "Failed to fetch sport fee report"
      );

      err.data =
        backend?.data ?? null;

      err.response =
        error.response;

      throw err;
    }
  },


  // =========================================================
  // GET ALL SPORTS FEE REPORT
  //
  // GET /api/payment/fee-report/all?year=2026
  // =========================================================

  getAllSportsFeeReport: async (
    year
  ) => {

    try {

      const response =
        await api.get(
          "/payment/fee-report/all",
          {
            params: {
              year
            }
          }
        );

      return response.data;

    } catch (error) {

      const backend =
        error.response?.data;

      const err = new Error(
        backend?.message ||
          "Failed to fetch all sports fee report"
      );

      err.data =
        backend?.data ?? null;

      err.response =
        error.response;

      throw err;
    }
  }

};


export default enrollmentService;