
import axiosClient from "../../api/axiosClient";

const ParentService = {

  // =========================================================
  // GET MY CHILDREN
  // GET /api/parent/students
  // =========================================================

  getMyStudents: async () => {
    const response = await axiosClient.get("/parent/students");
    return response.data;
  },

  // =========================================================
  // GET STUDENT ATTENDANCE SUMMARY
  // GET /api/parent/students/{playerId}/attendance
  // =========================================================

  getStudentAttendance: async (playerId) => {
    const response = await axiosClient.get(
      `/parent/students/${playerId}/attendance`
    );

    return response.data;
  },

  // =========================================================
  // GET STUDENT ATTENDANCE HISTORY
  // GET /api/parent/students/{playerId}/attendance/history
  // =========================================================

  getStudentAttendanceHistory: async (playerId) => {
    const response = await axiosClient.get(
      `/parent/students/${playerId}/attendance/history`
    );

    return response.data;
  },

  // =========================================================
  // GET STUDENT PERFORMANCE
  // GET /api/parent/students/{playerId}/performance
  // =========================================================

  getStudentPerformance: async (playerId) => {
    const response = await axiosClient.get(
      `/parent/students/${playerId}/performance`
    );

    return response.data;
  },

  // =========================================================
  // SUBMIT INJURY REPORT FOR CHILD
  // POST /api/injury-reports
  // =========================================================

  sendInjuryReport: async (payload) => {
    const response = await axiosClient.post(
      "/injury-reports",
      payload
    );

    return response.data;
  },

};

export default ParentService;