import api from "../../api/axiosClient";

const salaryService = {

    // Calculate salary for selected employee/month
    calculateSalary: async (data) => {
        const response = await api.post(
            "/salary/calculate",
            data
        );

        return response.data;
    },

    // Get salary for one employee/month
    getSalary: async (userId, month, year) => {
        const response = await api.get(
            `/salary/employee/${userId}`,
            {
                params: {
                    month,
                    year
                }
            }
        );

        return response.data;
    },

    // Get employee salary history
    getEmployeeHistory: async (userId) => {
        const response = await api.get(
            `/salary/employee/${userId}/history`
        );

        return response.data;
    },

    // Get all salary history
    getAllSalaryHistory: async () => {
        const response = await api.get(
            "/salary/history"
        );

        return response.data;
    },

    // Monthly salary PDF
    getSalaryPdf: async (userId, month, year) => {
        const response = await api.get(
            `/salary/employee/${userId}/pdf`,
            {
                params: {
                    month,
                    year
                },
                responseType: "blob"
            }
        );

        return response.data;
    },

    // Salary history PDF
    getSalaryHistoryPdf: async (userId) => {
        const response = await api.get(
            `/salary/employee/${userId}/history/pdf`,
            {
                responseType: "blob"
            }
        );

        return response.data;
    }
};

export default salaryService;