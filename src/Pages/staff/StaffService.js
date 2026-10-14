import api from "../../api/axiosClient";

export const addstaff = async (formData) => {
  try {
    const response = await api.post("/staff", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    if (error.response) throw error.response.data;
    throw { success: false, message: "Unable to connect to the server." };
  }
};

export const updateStaff = async (id, formData) => {
  try {
    const response = await api.put(`/staff/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    if (error.response) throw error.response.data;
    throw { success: false, message: "Unable to connect to the server." };
  }
};

export const getAllStaff = async (status = "ALL") => {
  try {
    let url = "/staff";
    if (status && status !== "ALL") url += `?status=${status}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    if (error.response) throw error.response.data;
    throw { success: false, message: "Unable to connect to the server." };
  }
};

export const getStaffById = async (id) => {
  try {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) throw error.response.data;
    throw { success: false, message: "Unable to connect to the server." };
  }
};

export const updateStaffStatus = async (id, status) => {
  try {
    const response = await api.patch(`/staff/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  } catch (error) {
    if (error.response) throw error.response.data;
    throw { success: false, message: "Unable to connect to the server." };
  }
};

export const deactivateStaff = async (id) => {
  try {
    const response = await api.patch(`/staff/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) throw error.response.data;
    throw { success: false, message: "Unable to connect to the server." };
  }
};





export const getStaffDocument = async (staffId, documentType) => {
  try {
    const response = await api.get(
      `/staff/${staffId}/documents/${documentType}`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  } catch (error) {
    console.error("Document fetch error:", error);

    if (error.response) {
      throw error;
    }

    throw new Error("Unable to connect to the server.");
  }
};


export const downloadStaffDocument = async (
  staffId,
  documentType
) => {
  try {
    const response = await api.get(
      `/staff/${staffId}/documents/${documentType}/download`,
      {
        responseType: "blob",
      }
    );

    return response.data;

  } catch (error) {
    console.error("Document download error:", error);

    if (error.response) {
      throw error;
    }

    throw new Error("Unable to connect to the server.");
  }
};






export const deleteStaff = async (id) => {
  try {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) throw error.response.data;
    throw {
      success: false,
      message: "Unable to connect to the server.",
    };
  }
};
