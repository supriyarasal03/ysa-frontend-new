
import axiosClient from "../../api/axiosClient";

import attendancePunchAxiosClient
  from "../../api/attendancePunchAxiosClient";


const InnventoryManagerService = {

  // ==========================================================
  // GET TODAY'S ATTENDANCE
  // ==========================================================

  getTodayAttendance: async () => {

    const res = await axiosClient.get(
      "/employee-attendance/today"
    );

    return res.data;
  },


  // ==========================================================
  // GET MY ATTENDANCE HISTORY
  // ==========================================================

  getMyAttendance: async () => {

    const res = await axiosClient.get(
      "/employee-attendance/my"
    );

    return res.data;
  },


  // ==========================================================
  // PUNCH IN
  // ACADEMY WI-FI CLIENT
  // ==========================================================

  punchIn: async () => {

    const res =
      await attendancePunchAxiosClient.post(
        "/employee-attendance/punch-in"
      );

    return res.data;
  },


  // ==========================================================
  // PUNCH OUT
  // ACADEMY WI-FI CLIENT
  // ==========================================================

  punchOut: async () => {

    const res =
      await attendancePunchAxiosClient.post(
        "/employee-attendance/punch-out"
      );

    return res.data;
  },


  // ==========================================================
  // GET SPORTS
  // USED FOR FINANCIAL REPORT FILTER
  // ==========================================================

  getSports: async () => {

    const res = await axiosClient.get("/sport");

    return res.data;
  },


  // ==========================================================
  // DAILY INVENTORY FINANCIAL REPORT
  // ==========================================================

  getDailyFinancialReport: async (date, sportId) => {

    const params = { date };

    if (sportId) {
      params.sportId = sportId;
    }

    const res = await axiosClient.get(
      "/inventory-reports/daily",
      { params }
    );

    return res.data;
  },


  // ==========================================================
  // MONTHLY INVENTORY FINANCIAL REPORT
  // ==========================================================

  getMonthlyFinancialReport: async (
    year,
    month,
    sportId
  ) => {

    const params = { year, month };

    if (sportId) {
      params.sportId = sportId;
    }

    const res = await axiosClient.get(
      "/inventory-reports/monthly",
      { params }
    );

    return res.data;
  },


  // ==========================================================
  // YEARLY INVENTORY FINANCIAL REPORT
  // ==========================================================

  getYearlyFinancialReport: async (year, sportId) => {

    const params = { year };

    if (sportId) {
      params.sportId = sportId;
    }

    const res = await axiosClient.get(
      "/inventory-reports/yearly",
      { params }
    );

    return res.data;
  },


  // ==========================================================
  // CUSTOM DATE-RANGE INVENTORY FINANCIAL REPORT
  // ==========================================================

  getCustomFinancialReport: async (
    startDate,
    endDate,
    sportId
  ) => {

    const params = {
      startDate,
      endDate
    };

    if (sportId) {
      params.sportId = sportId;
    }

    const res = await axiosClient.get(
      "/inventory-reports/custom",
      { params }
    );

    return res.data;
  },

};


export default InnventoryManagerService;