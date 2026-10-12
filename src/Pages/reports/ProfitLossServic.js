
import axiosClient from "../../api/axiosClient";

const PROFIT_LOSS_URL = "/profit-loss/report";

const generateProfitLossReport = async (startDate, endDate) => {
  if (!startDate || !endDate) {
    throw new Error("Start date and end date are required.");
  }

  if (startDate > endDate) {
    throw new Error("Start date cannot be after end date.");
  }

  const response = await axiosClient.post(PROFIT_LOSS_URL, {
    startDate,
    endDate,
  });

  return response.data;
};

const ProfitLossService = {
  generateProfitLossReport,
};

export default ProfitLossService;
