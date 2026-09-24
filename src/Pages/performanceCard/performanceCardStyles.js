// ============================================================
// PERFORMANCE CARD STYLES
// ============================================================

const performanceCardStyles = {

  // ==========================================================
  // PAGE CONTENT
  // ==========================================================

  content: {
    width: "100%",
    boxSizing: "border-box",
    padding: "24px",
  },


  // ==========================================================
  // ACTUAL PERFORMANCE CARD
  // ==========================================================

  card: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    border: "2px solid #1d4ed8",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow:
      "0 18px 45px rgba(15, 23, 42, 0.12)",
    boxSizing: "border-box",
  },


  // ==========================================================
  // HEADER
  // ==========================================================

  cardHeader: {
    position: "relative",
    padding: "26px 30px 24px",
    textAlign: "center",
    borderBottom:
      "1px solid #dbeafe",
    boxSizing: "border-box",
  },


  sportIcon: {
    width: "58px",
    height: "58px",
    margin:
      "0 auto 10px",
    border:
      "2px solid #2563eb",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    boxSizing: "border-box",
  },


  academyName: {
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "2px",
    marginBottom: "8px",
  },


  cardTitle: {
    margin: 0,
    fontSize: "27px",
    lineHeight: "1.2",
    fontWeight: "900",
    letterSpacing: "0.5px",
  },


  cardSubtitle: {
    margin:
      "8px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },


  // ==========================================================
  // CARD BODY
  // ==========================================================

  cardBody: {
    padding: "26px 30px 30px",
    boxSizing: "border-box",
  },


  // ==========================================================
  // PLAYER INFORMATION
  // ==========================================================

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },


  infoBox: {
    padding: "13px 14px",
    border:
      "1px solid #dbe3ee",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
    minWidth: 0,
  },


  infoLabel: {
    fontSize: "10px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    marginBottom: "5px",
  },


  infoValue: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#0f172a",
    wordBreak: "break-word",
  },


  // ==========================================================
  // DATE ROW
  // ==========================================================

  dateRow: {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
    marginBottom: "20px",
    fontSize: "12px",
    color: "#64748b",
  },


  // ==========================================================
  // PERFORMANCE TABLE
  // ==========================================================

  performanceSection: {
    border:
      "1px solid #2563eb",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "20px",
  },


  performanceTable: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },


  tableHeader: {
    padding: "12px 14px",
    textAlign: "left",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.3px",
    borderBottom:
      "1px solid rgba(255,255,255,0.25)",
  },


  tableCell: {
    padding: "11px 14px",
    borderBottom:
      "1px solid #e2e8f0",
    fontSize: "13px",
    color: "#0f172a",
  },


  overallRow: {
    backgroundColor: "#eff6ff",
  },


  // ==========================================================
  // REMARKS
  // ==========================================================

  remarksBox: {
    padding: "15px 17px",
    marginTop: "18px",
    border:
      "1px solid #bfdbfe",
    borderRadius: "10px",
    boxSizing: "border-box",
  },


  remarksTitle: {
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    marginBottom: "7px",
  },


  remarksText: {
    fontSize: "13px",
    lineHeight: "1.6",
    color: "#334155",
    wordBreak: "break-word",
  },


  // ==========================================================
  // SIGNATURE
  // ==========================================================

  signatureArea: {
    width: "220px",
    marginTop: "42px",
    marginLeft: "auto",
    textAlign: "center",
  },


  signatureLine: {
    width: "100%",
    borderTop:
      "1px solid #334155",
    marginBottom: "7px",
  },


  signatureLabel: {
    fontSize: "11px",
    fontWeight: "700",
  },


  // ==========================================================
  // ACTION BAR
  // ==========================================================

  actionBar: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "10px",
    maxWidth: "900px",
    margin:
      "18px auto 0",
    flexWrap: "wrap",
  },


  // ==========================================================
  // DOWNLOAD BUTTON
  // ==========================================================

  downloadButton: {
    minHeight: "44px",
    padding:
      "0 20px",
    border: "none",
    borderRadius: "9px",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow:
      "0 5px 12px rgba(15, 23, 42, 0.15)",
  },


  // ==========================================================
  // CLOSE BUTTON
  // ==========================================================

  cancelButton: {
    minHeight: "44px",
    padding:
      "0 20px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },


  // ==========================================================
  // ERROR
  // ==========================================================

  error: {
    marginBottom: "16px",
    padding: "12px 14px",
    borderRadius: "8px",
    backgroundColor: "#fef2f2",
    border:
      "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: "14px",
  },


  // ==========================================================
  // FORM STYLES
  // Keep these because the same style file may be used by
  // PerformanceCardForm.
  // ==========================================================

  modal: {
    width: "100%",
    maxWidth: "850px",
    maxHeight: "92vh",
    overflowY: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    boxShadow:
      "0 20px 60px rgba(0, 0, 0, 0.25)",
  },


  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom:
      "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    backgroundColor: "#ffffff",
    zIndex: 2,
  },


  modalTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
  },


  closeButton: {
    width: "36px",
    height: "36px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    fontSize: "22px",
    cursor: "pointer",
  },


  sectionTitle: {
    margin:
      "0 0 14px",
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
  },


  skillHeader: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) 150px 44px",
    gap: "10px",
    alignItems: "center",
    padding: "10px 12px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#374151",
  },


  skillRow: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) 150px 44px",
    gap: "10px",
    alignItems: "center",
    marginTop: "10px",
  },


  input: {
    width: "100%",
    height: "42px",
    padding: "0 12px",
    border:
      "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
  },


  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "12px",
    border:
      "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },


  removeButton: {
    width: "42px",
    height: "42px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    cursor: "pointer",
    fontSize: "18px",
  },


  addButton: {
    marginTop: "14px",
    height: "40px",
    padding: "0 16px",
    border:
      "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontWeight: "600",
    cursor: "pointer",
  },


  remarksSection: {
    marginTop: "24px",
  },


  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "24px",
    paddingTop: "20px",
    borderTop:
      "1px solid #e5e7eb",
  },


  primaryButton: {
    height: "44px",
    padding: "0 22px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },


  disabledButton: {
    height: "44px",
    padding: "0 22px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#9ca3af",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "not-allowed",
  },


  success: {
    marginBottom: "16px",
    padding: "12px 14px",
    borderRadius: "8px",
    backgroundColor: "#f0fdf4",
    border:
      "1px solid #bbf7d0",
    color: "#15803d",
    fontSize: "14px",
  },


  overallBox: {
    marginTop: "24px",
    padding: "18px",
    borderRadius: "10px",
    backgroundColor: "#f8fafc",
    border:
      "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },


  overallLabel: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#374151",
  },


  overallValue: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#111827",
  },

};

export default performanceCardStyles;