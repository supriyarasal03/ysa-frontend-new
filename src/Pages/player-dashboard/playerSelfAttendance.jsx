import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  UserRound,
  Mail,
  Trophy,
  LogIn,
  LogOut,
  CheckCircle2,
  History,
  RefreshCw,
  AlertCircle
} from "lucide-react";

import PlayerSelfAttendanceService from "./playerserviceSelf";


const PlayerSelfAttendance = () => {

  // ==========================================================
  // STATES
  // ==========================================================

  const [batches, setBatches] = useState([]);

  const [selectedBatchId, setSelectedBatchId] = useState("");

  const [todayAttendance, setTodayAttendance] = useState(null);

  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");


  // ==========================================================
  // LOAD PLAYER BATCHES
  // ==========================================================

  useEffect(() => {
    loadBatches();
  }, []);


  // ==========================================================
  // LOAD BATCHES
  // ==========================================================

  const loadBatches = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await PlayerSelfAttendanceService.getMyBatches();

      if (response?.success) {

        const batchData = response.data || [];

        setBatches(batchData);

        if (batchData.length > 0) {

          setSelectedBatchId(
            String(batchData[0].batchId)
          );
        }

      } else {

        setError(
          response?.message ||
          "Unable to load your batches."
        );
      }

    } catch (err) {

      console.error(
        "Error loading player batches:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Unable to load your batches."
      );

    } finally {

      setLoading(false);
    }
  };


  // ==========================================================
  // LOAD TODAY + HISTORY WHEN BATCH CHANGES
  // ==========================================================

  useEffect(() => {

    if (!selectedBatchId) {
      return;
    }

    loadAttendanceData();

  }, [selectedBatchId]);


  // ==========================================================
  // LOAD ATTENDANCE DATA
  // ==========================================================

  const loadAttendanceData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        todayResponse,
        historyResponse
      ] = await Promise.all([

        PlayerSelfAttendanceService
          .getTodayAttendance(
            selectedBatchId
          ),

        PlayerSelfAttendanceService
          .getAttendanceHistory(
            selectedBatchId
          )
      ]);


      if (todayResponse?.success) {

        setTodayAttendance(
          todayResponse.data
        );

      } else {

        setTodayAttendance(null);

        setError(
          todayResponse?.message ||
          "Unable to load today's attendance."
        );
      }


      if (historyResponse?.success) {

        setAttendanceHistory(
          historyResponse.data || []
        );
      }

    } catch (err) {

      console.error(
        "Error loading attendance:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Unable to load attendance information."
      );

    } finally {

      setLoading(false);
    }
  };


  // ==========================================================
  // PUNCH IN
  // ==========================================================

  const handlePunchIn = async () => {

    if (!selectedBatchId) {
      return;
    }

    try {

      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      const response =
        await PlayerSelfAttendanceService.punchIn(
          selectedBatchId
        );

      if (response?.success) {

        setSuccessMessage(
          response.message ||
          "You have punched in successfully."
        );

        await loadAttendanceData();

      } else {

        setError(
          response?.message ||
          "Punch in failed."
        );
      }

    } catch (err) {

      console.error(
        "Punch in error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Unable to punch in."
      );

    } finally {

      setActionLoading(false);
    }
  };


  // ==========================================================
  // PUNCH OUT
  // ==========================================================

  const handlePunchOut = async () => {

    if (!selectedBatchId) {
      return;
    }

    try {

      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      const response =
        await PlayerSelfAttendanceService.punchOut(
          selectedBatchId
        );

      if (response?.success) {

        setSuccessMessage(
          response.message ||
          "You have punched out successfully."
        );

        await loadAttendanceData();

      } else {

        setError(
          response?.message ||
          "Punch out failed."
        );
      }

    } catch (err) {

      console.error(
        "Punch out error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Unable to punch out."
      );

    } finally {

      setActionLoading(false);
    }
  };


  // ==========================================================
  // FORMAT TIME
  // ==========================================================

  const formatTime = (time) => {

    if (!time) {
      return "--";
    }

    const parts = time.split(":");

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    const period = hours >= 12 ? "PM" : "AM";

    const displayHour =
      hours % 12 || 12;

    return `${displayHour}:${String(
      minutes
    ).padStart(2, "0")} ${period}`;
  };


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {

    if (!date) {
      return "--";
    }

    const parsedDate =
      new Date(`${date}T00:00:00`);

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };


  // ==========================================================
  // FORMAT DAY
  // ==========================================================

  const formatDay = (day) => {

    if (!day) {
      return "--";
    }

    return (
      day.charAt(0).toUpperCase() +
      day.slice(1).toLowerCase()
    );
  };


  // ==========================================================
  // SELECTED BATCH
  // ==========================================================

  const selectedBatch =
    batches.find(
      batch =>
        String(batch.batchId) ===
        String(selectedBatchId)
    );


  // ==========================================================
  // ATTENDANCE STATUS
  // ==========================================================

  const hasPunchedIn =
    !!todayAttendance?.punchInTime;

  const hasPunchedOut =
    !!todayAttendance?.punchOutTime;


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading && batches.length === 0) {

    return (
      <div style={styles.loadingContainer}>
        <RefreshCw
          size={28}
          className="spin"
        />

        <p>Loading your attendance...</p>
      </div>
    );
  }


  // ==========================================================
  // NO BATCH
  // ==========================================================

  if (!loading && batches.length === 0) {

    return (
      <div style={styles.page}>

        <div style={styles.emptyCard}>

          <AlertCircle size={40} />

          <h2>No Active Batch</h2>

          <p>
            You currently do not have an active
            batch assigned to you.
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div style={styles.page}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>
            My Attendance
          </h1>

          <p style={styles.subtitle}>
            Track your daily training attendance
          </p>

        </div>

        <div style={styles.headerIcon}>
          <CalendarDays size={28} />
        </div>

      </div>


      {/* ======================================================
          BATCH SELECTOR
      ====================================================== */}

      {batches.length > 1 && (

        <div style={styles.batchSelectorCard}>

          <label style={styles.label}>
            Select Batch
          </label>

          <select
            value={selectedBatchId}
            onChange={(e) =>
              setSelectedBatchId(
                e.target.value
              )
            }
            style={styles.select}
          >

            {batches.map(batch => (

              <option
                key={batch.batchId}
                value={batch.batchId}
              >
                {batch.sportName || "Sport"}
                {" - "}
                {batch.batchName || "Batch"}
              </option>

            ))}

          </select>

        </div>
      )}


      {/* ======================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {successMessage && (

        <div style={styles.successMessage}>

          <CheckCircle2 size={20} />

          <span>
            {successMessage}
          </span>

        </div>
      )}


      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (

        <div style={styles.errorMessage}>

          <AlertCircle size={20} />

          <span>
            {error}
          </span>

        </div>
      )}


      {/* ======================================================
          BATCH INFORMATION
      ====================================================== */}

      {selectedBatch && (

        <div style={styles.batchCard}>

          <div style={styles.batchHeader}>

            <div style={styles.sportIcon}>
              <Trophy size={25} />
            </div>

            <div>

              <h2 style={styles.batchName}>
                {selectedBatch.batchName ||
                  "My Batch"}
              </h2>

              <p style={styles.sportName}>
                {selectedBatch.sportName ||
                  "Sports Academy"}
              </p>

            </div>

          </div>


          <div style={styles.infoGrid}>

            <InfoItem
              icon={<UserRound size={19} />}
              label="Coach"
              value={
                selectedBatch.coachName ||
                "Not assigned"
              }
            />

            <InfoItem
              icon={<Mail size={19} />}
              label="Coach Email"
              value={
                selectedBatch.coachEmail ||
                "Email not available"
              }
            />

            <InfoItem
              icon={<Clock3 size={19} />}
              label="Training Time"
              value={
                `${formatTime(
                  selectedBatch.batchStartTime
                )} - ${formatTime(
                  selectedBatch.batchEndTime
                )}`
              }
            />

            <InfoItem
              icon={<CalendarDays size={19} />}
              label="Training Days"
              value={
                selectedBatch.trainingDays ||
                "Not configured"
              }
            />

            <InfoItem
              icon={<CalendarDays size={19} />}
              label="Batch Period"
              value={
                `${formatDate(
                  selectedBatch.batchStartDate
                )} - ${formatDate(
                  selectedBatch.batchEndDate
                )}`
              }
            />

          </div>

        </div>
      )}


      {/* ======================================================
          TODAY'S ATTENDANCE
      ====================================================== */}

      <div style={styles.todayCard}>

        <div style={styles.sectionHeader}>

          <div>

            <h2 style={styles.sectionTitle}>
              Today's Attendance
            </h2>

            <p style={styles.sectionSubtitle}>
              {formatDate(
                todayAttendance?.attendanceDate ||
                new Date().toISOString().split("T")[0]
              )}
            </p>

          </div>


          <div
            style={{
              ...styles.statusBadge,
              ...(hasPunchedIn
                ? styles.presentBadge
                : styles.pendingBadge)
            }}
          >

            {hasPunchedIn
              ? "PRESENT"
              : "NOT MARKED"}

          </div>

        </div>


        {/* ====================================================
            ATTENDANCE TIMES
        ==================================================== */}

        <div style={styles.timeGrid}>

          <div style={styles.timeBox}>

            <div style={styles.timeIcon}>
              <LogIn size={21} />
            </div>

            <div>

              <span style={styles.timeLabel}>
                Punch In
              </span>

              <strong style={styles.timeValue}>
                {formatTime(
                  todayAttendance?.punchInTime
                )}
              </strong>

            </div>

          </div>


          <div style={styles.timeBox}>

            <div style={styles.timeIcon}>
              <LogOut size={21} />
            </div>

            <div>

              <span style={styles.timeLabel}>
                Punch Out
              </span>

              <strong style={styles.timeValue}>
                {formatTime(
                  todayAttendance?.punchOutTime
                )}
              </strong>

            </div>

          </div>

        </div>


        {/* ====================================================
            ACTION BUTTONS
        ==================================================== */}

        <div style={styles.actionArea}>

          {!hasPunchedIn && (

            <button
              type="button"
              onClick={handlePunchIn}
              disabled={actionLoading}
              style={{
                ...styles.actionButton,
                ...styles.punchInButton,
                ...(actionLoading
                  ? styles.disabledButton
                  : {})
              }}
            >

              <LogIn size={20} />

              {actionLoading
                ? "Processing..."
                : "Punch In"}

            </button>
          )}


          {hasPunchedIn && !hasPunchedOut && (

            <button
              type="button"
              onClick={handlePunchOut}
              disabled={actionLoading}
              style={{
                ...styles.actionButton,
                ...styles.punchOutButton,
                ...(actionLoading
                  ? styles.disabledButton
                  : {})
              }}
            >

              <LogOut size={20} />

              {actionLoading
                ? "Processing..."
                : "Punch Out"}

            </button>
          )}


          {hasPunchedOut && (

            <div style={styles.completedMessage}>

              <CheckCircle2 size={21} />

              <span>
                Today's attendance completed
              </span>

            </div>
          )}

        </div>

      </div>


      {/* ======================================================
          ATTENDANCE SUMMARY
      ====================================================== */}

      <div style={styles.summaryCard}>

        <div style={styles.summaryIcon}>
          <CheckCircle2 size={27} />
        </div>

        <div>

          <p style={styles.summaryLabel}>
            Attendance Percentage
          </p>

          <h2 style={styles.summaryValue}>
            {todayAttendance?.attendancePercentage ??
              selectedBatch?.attendancePercentage ??
              0}
            %
          </h2>

        </div>

      </div>


      {/* ======================================================
          ATTENDANCE HISTORY
      ====================================================== */}

      <div style={styles.historyCard}>

        <div style={styles.historyHeader}>

          <div>

            <h2 style={styles.sectionTitle}>
              Attendance History
            </h2>

            <p style={styles.sectionSubtitle}>
              Your previous training attendance
            </p>

          </div>

          <History size={24} />

        </div>


        {attendanceHistory.length === 0 ? (

          <div style={styles.noHistory}>

            <History size={35} />

            <p>
              No attendance history available.
            </p>

          </div>

        ) : (

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    Date
                  </th>

                  <th style={styles.th}>
                    Day
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>

                  <th style={styles.th}>
                    Punch In
                  </th>

                  <th style={styles.th}>
                    Punch Out
                  </th>

                </tr>

              </thead>

              <tbody>

                {attendanceHistory.map(
                  (record, index) => (

                    <tr
                      key={
                        `${record.attendanceDate}-${index}`
                      }
                    >

                      <td style={styles.td}>
                        {formatDate(
                          record.attendanceDate
                        )}
                      </td>

                      <td style={styles.td}>
                        {formatDay(
                          record.day
                        )}
                      </td>

                      <td style={styles.td}>

                        <span
                          style={{
                            ...styles.historyStatus,
                            ...(record.status ===
                            "LATE_MARKED"
                              ? styles.lateStatus
                              : styles.onTimeStatus)
                          }}
                        >
                          {record.status ||
                            "PRESENT"}
                        </span>

                      </td>

                      <td style={styles.td}>
                        {formatTime(
                          record.punchInTime
                        )}
                      </td>

                      <td style={styles.td}>
                        {formatTime(
                          record.punchOutTime
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* ======================================================
          RESPONSIVE CSS
      ====================================================== */}

      <style>
        {`
          .spin {
            animation: playerAttendanceSpin 1s linear infinite;
          }

          @keyframes playerAttendanceSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 768px) {

            .player-attendance-info-grid {
              grid-template-columns: 1fr !important;
            }

            .player-attendance-time-grid {
              grid-template-columns: 1fr !important;
            }

            .player-attendance-table {
              min-width: 650px;
            }
          }
        `}
      </style>

    </div>
  );
};


// ==========================================================
// INFO ITEM COMPONENT
// ==========================================================

const InfoItem = ({
  icon,
  label,
  value
}) => {

  return (
    <div
      style={styles.infoItem}
      className="player-attendance-info-item"
    >

      <div style={styles.infoIcon}>
        {icon}
      </div>

      <div>

        <span style={styles.infoLabel}>
          {label}
        </span>

        <strong style={styles.infoValue}>
          {value}
        </strong>

      </div>

    </div>
  );
};


// ==========================================================
// STYLES
// ==========================================================

const styles = {

  page: {
    minHeight: "100vh",
    padding: "28px",
    background: "#f5f7fb",
    boxSizing: "border-box"
  },

  loadingContainer: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    color: "#475569"
  },

  emptyCard: {
    maxWidth: "500px",
    margin: "100px auto",
    padding: "40px",
    background: "#ffffff",
    borderRadius: "18px",
    textAlign: "center",
    color: "#64748b",
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 750,
    color: "#172033"
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "15px"
  },

  headerIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e8eefc",
    color: "#3156b8"
  },

  batchSelectorCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "18px",
    boxShadow: "0 5px 20px rgba(15, 23, 42, 0.06)"
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 650,
    color: "#475569",
    marginBottom: "8px"
  },

  select: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d8dee9",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#172033",
    fontSize: "14px",
    outline: "none"
  },

  successMessage: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px 16px",
    marginBottom: "18px",
    background: "#ecfdf3",
    color: "#087443",
    border: "1px solid #b7ebcc",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 600
  },

  errorMessage: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px 16px",
    marginBottom: "18px",
    background: "#fff1f2",
    color: "#be123c",
    border: "1px solid #fecdd3",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 600
  },

  batchCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 7px 25px rgba(15, 23, 42, 0.07)"
  },

  batchHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "22px"
  },

  sportIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eef2ff",
    color: "#4f46e5"
  },

  batchName: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#172033"
  },

  sportName: {
    margin: "4px 0 0",
    fontSize: "14px",
    color: "#64748b"
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px"
  },

  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "14px",
    borderRadius: "12px",
    background: "#f8fafc"
  },

  infoIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e9eefb",
    color: "#3156b8",
    flexShrink: 0
  },

  infoLabel: {
    display: "block",
    fontSize: "11px",
    color: "#94a3b8",
    marginBottom: "3px"
  },

  infoValue: {
    display: "block",
    fontSize: "13px",
    color: "#334155"
  },

  todayCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 7px 25px rgba(15, 23, 42, 0.07)"
  },

  sectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "22px"
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#172033"
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    fontSize: "13px",
    color: "#64748b"
  },

  statusBadge: {
    padding: "7px 12px",
    borderRadius: "30px",
    fontSize: "11px",
    fontWeight: 750,
    letterSpacing: "0.5px"
  },

  presentBadge: {
    background: "#dcfce7",
    color: "#15803d"
  },

  pendingBadge: {
    background: "#fef3c7",
    color: "#a16207"
  },

  timeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px"
  },

  timeBox: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "18px",
    background: "#f8fafc",
    borderRadius: "14px"
  },

  timeIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e8eefc",
    color: "#3156b8"
  },

  timeLabel: {
    display: "block",
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "4px"
  },

  timeValue: {
    display: "block",
    fontSize: "18px",
    color: "#172033"
  },

  actionArea: {
    marginTop: "22px",
    display: "flex",
    justifyContent: "center"
  },

  actionButton: {
    minWidth: "220px",
    padding: "13px 24px",
    border: "none",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "0.2s ease"
  },

  punchInButton: {
    background: "#2563eb"
  },

  punchOutButton: {
    background: "#dc2626"
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed"
  },

  completedMessage: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "12px 18px",
    background: "#ecfdf3",
    color: "#087443",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 650
  },

  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "22px",
    marginBottom: "20px",
    background: "#ffffff",
    borderRadius: "18px",
    boxShadow: "0 7px 25px rgba(15, 23, 42, 0.07)"
  },

  summaryIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#dcfce7",
    color: "#15803d"
  },

  summaryLabel: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b"
  },

  summaryValue: {
    margin: "3px 0 0",
    fontSize: "25px",
    color: "#172033"
  },

  historyCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 7px 25px rgba(15, 23, 42, 0.07)"
  },

  historyHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "20px",
    color: "#475569"
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "650px"
  },

  th: {
    textAlign: "left",
    padding: "13px 12px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 700,
    borderBottom: "1px solid #e2e8f0"
  },

  td: {
    padding: "14px 12px",
    color: "#334155",
    fontSize: "13px",
    borderBottom: "1px solid #edf1f5"
  },

  historyStatus: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: 750
  },

  onTimeStatus: {
    background: "#dcfce7",
    color: "#15803d"
  },

  lateStatus: {
    background: "#fef3c7",
    color: "#a16207"
  },

  noHistory: {
    minHeight: "160px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    gap: "8px"
  }
};


export default PlayerSelfAttendance;