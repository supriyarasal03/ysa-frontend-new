import api from "../../api/axiosClient";

// ======================================================
// COMMON REPORT API SERVICE
// ======================================================

// Get all batches for Batch Report
export const getAllBatchesForReport = async () => {
  const response = await api.get("/batches");

  // Supports ApiResponse wrapper as well as direct array
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

  const pdfUrl = window.URL.createObjectURL(pdfBlob);

  window.open(pdfUrl, "_blank");

  // Release object URL after browser has opened it
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

  const pdfUrl = window.URL.createObjectURL(pdfBlob);

  const link = document.createElement("a");

  link.href = pdfUrl;
  link.download = `batch-report-${batchId}.pdf`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);

  window.URL.revokeObjectURL(pdfUrl);
};