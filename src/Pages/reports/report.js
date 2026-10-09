import api from "../../api/axiosClient";

// ==================== BATCH REPORT ====================

export const getAllBatchesForReport = async () => {
  const response = await api.get("/batches");
  return response.data?.data ?? response.data;
};

export const viewBatchReportPdf = async (batchId) => {
  const response = await api.get(
    `/reports/batch/${batchId}/pdf`,
    {
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data], {
      type: "application/pdf",
    })
  );

  window.open(url, "_blank");

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
};

export const downloadBatchReportPdf = async (batchId) => {
  const response = await api.get(
    `/reports/batch/${batchId}/pdf`,
    {
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data], {
      type: "application/pdf",
    })
  );

  const link = document.createElement("a");

  link.href = url;
  link.download = `batch-report-${batchId}.pdf`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
};


// ==================== INVENTORY REPORT ====================

export const getInventoryReport = async ({
  period = "DAILY",
  startDate,
  endDate,
  sportId,
} = {}) => {
  const params = { period };

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (sportId) params.sportId = sportId;

  const response = await api.get(
    "/reports/inventory",
    { params }
  );

  return response.data?.data ?? response.data;
};

export const viewInventoryReportPdf = async ({
  period = "DAILY",
  startDate,
  endDate,
  sportId,
} = {}) => {
  const params = { period };

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (sportId) params.sportId = sportId;

  const response = await api.get(
    "/reports/inventory/pdf",
    {
      params,
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data], {
      type: "application/pdf",
    })
  );

  window.open(url, "_blank");

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
};

export const downloadInventoryReportPdf = async ({
  period = "DAILY",
  startDate,
  endDate,
  sportId,
} = {}) => {
  const params = { period };

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (sportId) params.sportId = sportId;

  const response = await api.get(
    "/reports/inventory/pdf",
    {
      params,
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data], {
      type: "application/pdf",
    })
  );

  const link = document.createElement("a");

  link.href = url;
  link.download = `inventory-report-${period.toLowerCase()}.pdf`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);




   








};




// ==================== PLAYER ADMISSION REPORT ====================

export const getPlayerAdmissionReport = async ({
  period = "DAILY",
  startDate,
  endDate,
  sportId,
} = {}) => {
  const params = {
    period,
  };

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (sportId) params.sportId = sportId;

  const response = await api.get(
    "/reports/player-admission",
    {
      params,
    }
  );

  return response.data?.data ?? response.data;
};


export const viewPlayerAdmissionReportPdf = async ({
  period = "DAILY",
  startDate,
  endDate,
  sportId,
} = {}) => {
  const params = {
    period,
  };

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (sportId) params.sportId = sportId;

  const response = await api.get(
    "/reports/player-admission/pdf",
    {
      params,
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data], {
      type: "application/pdf",
    })
  );

  window.open(url, "_blank");

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
};


export const downloadPlayerAdmissionReportPdf = async ({
  period = "DAILY",
  startDate,
  endDate,
  sportId,
} = {}) => {
  const params = {
    period,
  };

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (sportId) params.sportId = sportId;

  const response = await api.get(
    "/reports/player-admission/pdf",
    {
      params,
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data], {
      type: "application/pdf",
    })
  );

  const link = document.createElement("a");

  link.href = url;

  link.download =
    `player-admission-report-${period.toLowerCase()}.pdf`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
};










