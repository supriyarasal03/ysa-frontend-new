import axiosClient from "../../api/axiosClient";

// ============================================================
// CREATE
// ============================================================

export const addPhysiotherapist = async (formData) => {
  const response = await axiosClient.post(
    "/physiotherapists",
    formData
  );

  return response.data;
};


// ============================================================
// GET ALL
// ============================================================

export const getAllPhysiotherapists = async () => {
  const response = await axiosClient.get(
    "/physiotherapists"
  );

  return response.data;
};


// ============================================================
// GET BY ID
// ============================================================

export const getPhysiotherapistById = async (id) => {
  const response = await axiosClient.get(
    `/physiotherapists/${id}`
  );

  return response.data;
};


// ============================================================
// UPDATE
// ============================================================

export const updatePhysiotherapist = async (
  id,
  formData
) => {
  const response = await axiosClient.put(
    `/physiotherapists/${id}`,
    formData
  );

  return response.data;
};


// ============================================================
// ACTIVATE
// ============================================================

export const activatePhysiotherapist = async (id) => {
  const response = await axiosClient.put(
    `/physiotherapists/${id}/activate`
  );

  return response.data;
};


// ============================================================
// DEACTIVATE
// ============================================================

export const deactivatePhysiotherapist = async (id) => {
  const response = await axiosClient.put(
    `/physiotherapists/${id}/deactivate`
  );

  return response.data;
};


// ============================================================
// GET DOCUMENT
// ============================================================

export const getPhysiotherapistDocument = async (
  id,
  documentType
) => {
  const response = await axiosClient.get(
    `/physiotherapists/${id}/documents/${documentType}`,
    {
      responseType: "blob",
    }
  );

  return response.data;
};


// ============================================================
// DOCUMENT URL
// ============================================================

export const getPhysiotherapistDocumentUrl = (
  id,
  documentType
) => {
  return `/api/physiotherapists/${id}/documents/${documentType}`;
};


// ============================================================
// ERROR MESSAGE HELPER
// ============================================================

export const getPhysiotherapistErrorMessage = (
  error
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong."
  );
};


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  addPhysiotherapist,
  getAllPhysiotherapists,
  getPhysiotherapistById,
  updatePhysiotherapist,
  activatePhysiotherapist,
  deactivatePhysiotherapist,
  getPhysiotherapistDocument,
  getPhysiotherapistDocumentUrl,
  getPhysiotherapistErrorMessage,
};