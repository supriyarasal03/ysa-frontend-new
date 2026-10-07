import axiosClient from "../../api/axiosClient"; 
 
const PlayerService = { 
 
  // ========================================================= 
  // GET ALL PLAYERS 
  // ========================================================= 
 
  getAll: async () => { 
    const res = await axiosClient.get("/player"); 
    return res.data; 
  }, 
 
 
  // ========================================================= 
  // GET PLAYER BY ID 
  // ========================================================= 
 
  getById: async (id) => { 
    const res = await axiosClient.get(`/player/${id}`); 
    return res.data; 
  }, 
 
 
  // ========================================================= 
  // GET ALL SPORTS 
  // ========================================================= 
 
  getSports: async () => { 
    const res = await axiosClient.get("/sport"); 
    return res.data; 
  }, 

// =========================================================
// GET ACTIVE PHYSIOTHERAPISTS
// =========================================================

getActivePhysiotherapists: async () => {
  const res = await axiosClient.get("/physiotherapists/active");
  return res.data;
},
 
  // ========================================================= 
  // OLD CREATE PLAYER 
  // ========================================================= 
 
  create: async (formData) => { 
    const res = await axiosClient.post( 
      "/player", 
      formData, 
      { 
        headers: { 
          "Content-Type": "multipart/form-data", 
        }, 
      } 
    ); 
 
    return res.data; 
  }, 
 
 
  // ========================================================= 
  // ONE FORM PLAYER REGISTRATION 
  // PLAYER + ENROLLMENT + INSTALLMENTS + PAYMENT 
  // ========================================================= 
 
  register: async (formData) => { 
    const res = await axiosClient.post( 
      "/player/register", 
      formData, 
      { 
        headers: { 
          "Content-Type": "multipart/form-data", 
        }, 
      } 
    ); 
 
    return res.data; 
  }, 
 
 
  // ========================================================= 
  // UPDATE PLAYER 
  // ========================================================= 
 
  update: async (id, formData) => { 
    const res = await axiosClient.put( 
      `/player/${id}`, 
      formData, 
      { 
        headers: { 
          "Content-Type": "multipart/form-data", 
        }, 
      } 
    ); 
 
    return res.data; 
  }, 
 
 
 
 
 
    // ========================================================= 
  // EDIT PLAYER - GET AVAILABLE BATCHES 
  // ========================================================= 
  // Returns only batches that are valid for the player's 
  // current sport and available capacity. 
  // The current batch can also be returned when it is full. 
  // ========================================================= 
 
  getAvailableBatchesForChange: async (playerId) => { 
    const res = await axiosClient.get( 
      `/player-batch-change/${playerId}/available-batches` 
    ); 
 
    return res.data; 
  }, 
 
 
 
 
 
  // ========================================================= 
  // EDIT PLAYER - CHANGE BATCH / PAYMENT PLAN 
  // ========================================================= 
  // Changes only the enrollment batch/payment plan. 
  // Existing player information and payment history are preserved. 
  // ========================================================= 
 
  changeBatch: async (playerId, data) => { 
 
 
 
 
     
    const res = await axiosClient.put( 
      `/player-batch-change/${playerId}`, 
      data 
    ); 
 
    return res.data; 
  }, 
 
 
 
 
 
 
  // ========================================================= 
  // ACTIVATE PLAYER 
  // ========================================================= 
 
  activate: async (id) => { 
    const res = await axiosClient.put( 
      `/player/${id}/activate` 
    ); 
 
    return res.data; 
  }, 
 
 
  // ========================================================= 
  // DEACTIVATE PLAYER 
  // ========================================================= 
 
  deactivate: async (id) => { 
    const res = await axiosClient.put( 
      `/player/${id}/deactivate` 
    ); 
 
    return res.data; 
  }, 
 
 
  // ========================================================= 
  // GET PLAYER DOCUMENT AS BLOB 
  // ========================================================= 
  // Returns only the Blob. 
  // Use getPlayerDocument() when headers are also required. 
  // ========================================================= 
 
  getDocument: async (playerId, documentType) => { 
    const res = await axiosClient.get( 
      `/player/${playerId}/documents/${documentType}`, 
      { 
        responseType: "blob", 
      } 
    ); 
 
    return res.data; 
  }, 
 
 
  // ========================================================= 
  // GET PLAYER DOCUMENT RESPONSE 
  // ========================================================= 
  // Returns the complete Axios response. 
  // This is used by PlayerManagement for: 
  // - response.data (Blob) 
  // - response.headers (file name / content type) 
  // ========================================================= 
 
  getPlayerDocument: async (playerId, documentType) => { 
    const res = await axiosClient.get( 
      `/player/${playerId}/documents/${documentType}`, 
      { 
        responseType: "blob", 
      } 
    ); 
 
    return res; 
  }, 
 
 
  // ========================================================= 
  // GET DOCUMENT URL 
  // ========================================================= 
 
  getDocumentUrl: (playerId, documentType) => { 
    return `/api/player/${playerId}/documents/${documentType}`; 
  }, 
 
 
  // ========================================================= 
  // VIEW DOCUMENT 
  // ========================================================= 
 
  viewDocument: async (playerId, documentType) => { 
    const blob = await PlayerService.getDocument( 
      playerId, 
      documentType 
    ); 
 
    const blobUrl = window.URL.createObjectURL(blob); 
 
    window.open( 
      blobUrl, 
      "_blank", 
      "noopener,noreferrer" 
    ); 
 
    setTimeout(() => { 
      window.URL.revokeObjectURL(blobUrl); 
    }, 10000); 
  }, 
 
 
  // ========================================================= 
  // DOWNLOAD DOCUMENT 
  // ========================================================= 
 
  downloadDocument: async ( 
    playerId, 
    documentType, 
    fileName 
  ) => { 
    const blob = await PlayerService.getDocument( 
      playerId, 
      documentType 
    ); 
 
    const blobUrl = window.URL.createObjectURL(blob); 
 
    const link = document.createElement("a"); 
 
    link.href = blobUrl; 
 
    link.download = 
      fileName || 
      `${documentType}-${playerId}`; 
 
    document.body.appendChild(link); 
 
    link.click(); 
 
    document.body.removeChild(link); 
 
    setTimeout(() => { 
      window.URL.revokeObjectURL(blobUrl); 
    }, 1000); 
  }, 
 
 
  // ========================================================= 
  // GET PLAYER PHOTO AS BLOB URL 
  // ========================================================= 
 
  getPhotoUrl: async (playerId) => { 
    const blob = await PlayerService.getDocument( 
      playerId, 
      "photo" 
    ); 
 
    return window.URL.createObjectURL(blob); 
  }, 


  // =========================================================
  // GET ADMISSION RECEIPT
  // =========================================================

  getAdmissionReceipt: async (playerId) => {
    const res = await axiosClient.get(
      `/admission-receipts/player/${playerId}`
    );

    return res.data;
  },


  // =========================================================
  // GET ADMISSION RECEIPT PDF
  // =========================================================

  getAdmissionReceiptPdf: async (playerId) => {
    const res = await axiosClient.get(
      `/admission-receipts/player/${playerId}/pdf`,
      {
        responseType: "blob",
      }
    );

    return res;
  },


  // =========================================================
  // SEND WELCOME EMAIL + RECEIPT
  // =========================================================

  sendAdmissionReceiptEmail: async (playerId) => {
    const res = await axiosClient.post(
      `/admission-receipts/player/${playerId}/send-email`
    );

    return res.data;
  },

}; 
 
 
 
 
 
 
 
 
 
 
export default PlayerService;