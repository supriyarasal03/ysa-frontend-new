import api from "../../api/axiosClient";

// ======================================================
// COMMON REPORT API SERVICE
// ======================================================


// ======================================================
// BATCH REPORT
// ======================================================

// Get all batches for Batch Report
export const getAllBatchesForReport = async () => {
  const response = await api.get("/batches");

  return response.data?.data ?? response.data;
};


// ======================================================
// BATCH REPORT PDF
// ======================================================

// View Batch Report PDF
export const viewBatchReportPdf = async (batchId) => {
  const response = await api.get(
    `/reports/batch/${batchId}/pdf`,
    {
      responseType: "blob",
    }
  );

  const pdfBlob = new Blob(
    [response.data],
    { type: "application/pdf" }
  );

  const pdfUrl =
    window.URL.createObjectURL(pdfBlob);

  window.open(pdfUrl, "_blank");

  setTimeout(() => {
    window.URL.revokeObjectURL(pdfUrl);
  }, 1000);
};


// Download Batch Report PDF
export const downloadBatchReportPdf = async (batchId) => {
  const response = await api.get(
    `/reports/batch/${batchId}/pdf`,
    {
      responseType: "blob",
    }
  );

  const pdfBlob = new Blob(
    [response.data],
    { type: "application/pdf" }
  );

  const pdfUrl =
    window.URL.createObjectURL(pdfBlob);

  const link =
    document.createElement("a");

  link.href = pdfUrl;

  link.download =
    `batch-report-${batchId}.pdf`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  window.URL.revokeObjectURL(pdfUrl);
};


// ======================================================
// INVENTORY REPORT
// ======================================================

// Get Inventory Report
//
// Supported periods:
// DAILY
// MONTHLY
// YEARLY
// CUSTOM
//
// Optional:
// sportId
// startDate
// endDate
// ======================================================

export const getInventoryReport = async ({
  period = "DAILY",
  startDate,
  endDate,
  sportId,
} = {}) => {

  const params = {
    period,
  };


  if (startDate) {
    params.startDate = startDate;
  }


  if (endDate) {
    params.endDate = endDate;
  }


  if (sportId) {
    params.sportId = sportId;
  }


  const response = await api.get(
    "/reports/inventory",
    {
      params,
    }
  );


  return response.data?.data ?? response.data;
};


// ======================================================
// INVENTORY REPORT PDF - VIEW
// ======================================================

export const viewInventoryReportPdf = async ({
  period = "DAILY",
  startDate,
  endDate,
  sportId,
} = {}) => {

  const params = {
    period,
  };


  if (startDate) {
    params.startDate = startDate;
  }


  if (endDate) {
    params.endDate = endDate;
  }


  if (sportId) {
    params.sportId = sportId;
  }


  const response = await api.get(
    "/reports/inventory/pdf",
    {
      params,
      responseType: "blob",
    }
  );


  const pdfBlob = new Blob(
    [response.data],
    {
      type: "application/pdf",
    }
  );


  const pdfUrl =
    window.URL.createObjectURL(pdfBlob);


  window.open(
    pdfUrl,
    "_blank"
  );


  setTimeout(() => {
    window.URL.revokeObjectURL(pdfUrl);
  }, 1000);
};


// ======================================================
// INVENTORY REPORT PDF - DOWNLOAD
// ======================================================

export const downloadInventoryReportPdf = async ({
  period = "DAILY",
  startDate,
  endDate,
  sportId,
} = {}) => {

  const params = {
    period,
  };


  if (startDate) {
    params.startDate = startDate;
  }


  if (endDate) {
    params.endDate = endDate;
  }


  if (sportId) {
    params.sportId = sportId;
  }


  const response = await api.get(
    "/reports/inventory/pdf",
    {
      params,
      responseType: "blob",
    }
  );


  const pdfBlob = new Blob(
    [response.data],
    {
      type: "application/pdf",
    }
  );


  const pdfUrl =
    window.URL.createObjectURL(pdfBlob);


  const link =
    document.createElement("a");


  link.href = pdfUrl;


  const periodName =
    period.toLowerCase();


  link.download =
    `inventory-report-${periodName}.pdf`;


  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  window.URL.revokeObjectURL(pdfUrl);
};