import React, {
  useEffect,
  useState,
} from "react";

import {
  getMyHistoryBatches,
  getHistoryBatchStudents,
} from "./CoachService";

import PerformanceCardModal
  from "../performanceCard/PerformanceCardModal";


// ============================================================
// HISTORY BATCHES
// ============================================================

const HistoryBatches = () => {

  // ==========================================================
  // HISTORY BATCHES
  // ==========================================================

  const [batches, setBatches] =
    useState([]);


  // ==========================================================
  // PAGE LOADING
  // ==========================================================

  const [loading, setLoading] =
    useState(true);


  // ==========================================================
  // PAGE ERROR
  // ==========================================================

  const [error, setError] =
    useState("");


  // ==========================================================
  // STUDENTS
  //
  // Object structure:
  //
  // {
  //    23: [students],
  //    24: [students]
  // }
  // ==========================================================

  const [batchStudents, setBatchStudents] =
    useState({});


  // ==========================================================
  // STUDENT LOADING
  // ==========================================================

  const [studentsLoading, setStudentsLoading] =
    useState({});


  // ==========================================================
  // STUDENT ERROR
  // ==========================================================

  const [studentsError, setStudentsError] =
    useState({});


  // ==========================================================
  // WHICH BATCH STUDENTS ARE VISIBLE
  // ==========================================================

  const [expandedBatchId, setExpandedBatchId] =
    useState(null);


  // ==========================================================
  // PERFORMANCE CARD MODAL
  // ==========================================================

  const [performanceCardOpen, setPerformanceCardOpen] =
    useState(false);


  const [selectedPlayer, setSelectedPlayer] =
    useState(null);


  const [selectedBatch, setSelectedBatch] =
    useState(null);


  // ==========================================================
  // FETCH HISTORY BATCHES
  // ==========================================================

  const fetchHistoryBatches = async () => {

    try {

      setLoading(true);

      setError("");


      const response =
        await getMyHistoryBatches();


      setBatches(
        response?.data ?? []
      );


    } catch (error) {

      console.error(
        "Failed to fetch history batches:",
        error
      );


      setError(
        error?.message ||
        "Failed to load history batches."
      );


    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // LOAD ON PAGE OPEN
  // ==========================================================

  useEffect(() => {

    fetchHistoryBatches();

  }, []);


  // ==========================================================
  // FETCH STUDENTS OF HISTORY BATCH
  // ==========================================================

  const fetchBatchStudents = async (
    batchId
  ) => {

    try {

      setStudentsLoading(
        (previous) => ({
          ...previous,
          [batchId]: true,
        })
      );


      setStudentsError(
        (previous) => ({
          ...previous,
          [batchId]: "",
        })
      );


      const response =
        await getHistoryBatchStudents(
          batchId
        );


      const students =
        response?.data ?? [];


      setBatchStudents(
        (previous) => ({
          ...previous,
          [batchId]: students,
        })
      );


    } catch (error) {

      console.error(
        `Failed to fetch students for batch ${batchId}:`,
        error
      );


      setStudentsError(
        (previous) => ({
          ...previous,
          [batchId]:
            error?.message ||
            "Failed to load students.",
        })
      );


    } finally {

      setStudentsLoading(
        (previous) => ({
          ...previous,
          [batchId]: false,
        })
      );

    }

  };


  // ==========================================================
  // TOGGLE STUDENTS
  // ==========================================================

  const handleViewStudents = async (
    batch
  ) => {

    const batchId =
      batch.id;


    // --------------------------------------------------------
    // If currently open, close it
    // --------------------------------------------------------

    if (
      expandedBatchId === batchId
    ) {

      setExpandedBatchId(null);

      return;
    }


    // --------------------------------------------------------
    // Open selected batch
    // --------------------------------------------------------

    setExpandedBatchId(
      batchId
    );


    // --------------------------------------------------------
    // If students already loaded, don't call API again
    // --------------------------------------------------------

    if (
      Object.prototype.hasOwnProperty.call(
        batchStudents,
        batchId
      )
    ) {

      return;
    }


    await fetchBatchStudents(
      batchId
    );

  };


  // ==========================================================
  // OPEN PERFORMANCE CARD
  // ==========================================================

  const handleOpenPerformanceCard = (
    player,
    batch
  ) => {

    setSelectedPlayer(
      player
    );


    setSelectedBatch(
      batch
    );


    setPerformanceCardOpen(
      true
    );

  };


  // ==========================================================
  // CLOSE PERFORMANCE CARD
  // ==========================================================

  const handleClosePerformanceCard = () => {

    setPerformanceCardOpen(
      false
    );


    setSelectedPlayer(
      null
    );


    setSelectedBatch(
      null
    );

  };


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (
    date
  ) => {

    if (!date) {

      return "-";
    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return date;
    }


    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // ==========================================================
  // FORMAT TIME
  // ==========================================================

  const formatTime = (
    time
  ) => {

    if (!time) {

      return "-";
    }


    const [
      hours,
      minutes,
    ] = time.split(":");


    const date =
      new Date();


    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );


    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );

  };


  // ==========================================================
  // GET PLAYER ID
  // ==========================================================

  const getPlayerId = (
    student
  ) => {

    return (
      student?.playerId ??
      student?.id
    );

  };


  // ==========================================================
  // GET PLAYER NAME
  // ==========================================================

  const getPlayerName = (
    student
  ) => {

    if (
      student?.studentName
    ) {

      return student.studentName;
    }


    if (
      student?.playerName
    ) {

      return student.playerName;
    }


    const name =
      `${student?.firstName || ""} ${
        student?.lastName || ""
      }`.trim();


    return name || "Unknown Player";

  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div
        style={{
          minHeight: "100%",
          padding: "30px",
          background: "#f8fafc",
        }}
      >

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >

          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >

            <div
              style={{
                fontSize: "16px",
                color: "#64748b",
              }}
            >
              Loading history batches...
            </div>

          </div>

        </div>

      </div>

    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (

      <div
        style={{
          minHeight: "100%",
          padding: "30px",
          background: "#f8fafc",
        }}
      >

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >

          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >

            <div
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#dc2626",
                marginBottom: "10px",
              }}
            >
              Unable to load history batches
            </div>


            <div
              style={{
                color: "#64748b",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>


            <button
              type="button"
              onClick={fetchHistoryBatches}
              style={{
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>

          </div>

        </div>

      </div>

    );

  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div
      style={{
        minHeight: "100%",
        padding: "30px",
        background: "#f8fafc",
      }}
    >

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >

          <div>

            <h1
              style={{
                margin: 0,
                fontSize: "30px",
                fontWeight: "700",
                color: "#0f172a",
              }}
            >
              History Batches
            </h1>


            <p
              style={{
                margin: "8px 0 0",
                color: "#64748b",
                fontSize: "15px",
              }}
            >
              View your completed batches and generate
              player performance cards.
            </p>

          </div>


          {/* =================================================
              TOTAL COUNT
          ================================================= */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#ffffff",
              padding: "12px 18px",
              borderRadius: "10px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >

            <span
              style={{
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Completed Batches
            </span>


            <span
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#0f172a",
              }}
            >
              {batches.length}
            </span>

          </div>

        </div>


        {/* ==================================================
            NO HISTORY
        ================================================== */}

        {batches.length === 0 ? (

          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "60px 30px",
              textAlign: "center",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >

            <div
              style={{
                fontSize: "48px",
                marginBottom: "15px",
              }}
            >
              📚
            </div>


            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "20px",
                color: "#0f172a",
              }}
            >
              No History Batches
            </h2>


            <p
              style={{
                margin: 0,
                color: "#64748b",
              }}
            >
              You don't have any completed batches yet.
            </p>

          </div>

        ) : (

          /* =================================================
             BATCH GRID
          ================================================= */

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >

            {batches.map(
              (batch) => {

                const batchId =
                  batch.id;


                const students =
                  batchStudents[
                    batchId
                  ] || [];


                const isExpanded =
                  expandedBatchId ===
                  batchId;


                const isStudentsLoading =
                  studentsLoading[
                    batchId
                  ];


                const studentError =
                  studentsError[
                    batchId
                  ];


                return (

                  <div
                    key={batchId}
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      padding: "22px",
                      boxShadow:
                        "0 4px 20px rgba(0,0,0,0.06)",
                      border:
                        "1px solid #e2e8f0",
                    }}
                  >

                    {/* ======================================
                        BATCH HEADER
                    ====================================== */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "12px",
                        marginBottom: "20px",
                      }}
                    >

                      <div>

                        <div
                          style={{
                            fontSize: "19px",
                            fontWeight: "700",
                            color: "#0f172a",
                          }}
                        >
                          {
                            batch.batchName ||
                            "Unnamed Batch"
                          }
                        </div>


                        <div
                          style={{
                            marginTop: "5px",
                            fontSize: "13px",
                            color: "#64748b",
                          }}
                        >
                          Batch ID: #{batch.id}
                        </div>

                      </div>


                      {/* ====================================
                          COMPLETED STATUS
                      ==================================== */}

                      <span
                        style={{
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          padding:
                            "6px 10px",
                          borderRadius:
                            "20px",
                          background:
                            "#dcfce7",
                          color:
                            "#166534",
                          fontSize:
                            "12px",
                          fontWeight:
                            "700",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        COMPLETED
                      </span>

                    </div>


                    {/* ======================================
                        BATCH DETAILS
                    ====================================== */}

                    <div
                      style={{
                        display: "grid",
                        gap: "14px",
                      }}
                    >

                      {/* SPORT */}

                      <div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#94a3b8",
                            marginBottom:
                              "4px",
                          }}
                        >
                          Sport
                        </div>


                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "#334155",
                          }}
                        >
                          {
                            batch.sportName ||
                            "-"
                          }
                        </div>

                      </div>


                      {/* DATE */}

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "1fr 1fr",
                          gap: "15px",
                        }}
                      >

                        <div>

                          <div
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#94a3b8",
                              marginBottom:
                                "4px",
                            }}
                          >
                            Start Date
                          </div>


                          <div
                            style={{
                              fontSize:
                                "14px",
                              fontWeight:
                                "600",
                              color:
                                "#334155",
                            }}
                          >
                            {formatDate(
                              batch.startDate
                            )}
                          </div>

                        </div>


                        <div>

                          <div
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#94a3b8",
                              marginBottom:
                                "4px",
                            }}
                          >
                            End Date
                          </div>


                          <div
                            style={{
                              fontSize:
                                "14px",
                              fontWeight:
                                "600",
                              color:
                                "#334155",
                            }}
                          >
                            {formatDate(
                              batch.endDate
                            )}
                          </div>

                        </div>

                      </div>


                      {/* TIME */}

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "1fr 1fr",
                          gap: "15px",
                        }}
                      >

                        <div>

                          <div
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#94a3b8",
                              marginBottom:
                                "4px",
                            }}
                          >
                            Training Time
                          </div>


                          <div
                            style={{
                              fontSize:
                                "14px",
                              fontWeight:
                                "600",
                              color:
                                "#334155",
                            }}
                          >
                            {formatTime(
                              batch.startTime
                            )}{" "}
                            -{" "}
                            {formatTime(
                              batch.endTime
                            )}
                          </div>

                        </div>

                      </div>


                      {/* TRAINING DAYS */}

                      <div>

                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#94a3b8",
                            marginBottom:
                              "4px",
                          }}
                        >
                          Training Days
                        </div>


                        <div
                          style={{
                            fontSize:
                              "14px",
                            fontWeight:
                              "600",
                            color:
                              "#334155",
                          }}
                        >
                          {
                            batch.trainingDays ||
                            "-"
                          }
                        </div>

                      </div>

                    </div>


                    {/* ======================================
                        VIEW STUDENTS BUTTON
                    ====================================== */}

                    <button
                      type="button"
                      onClick={() =>
                        handleViewStudents(
                          batch
                        )
                      }
                      style={{
                        width: "100%",
                        marginTop: "22px",
                        padding:
                          "11px 16px",
                        border: "none",
                        borderRadius:
                          "9px",
                        background:
                          isExpanded
                            ? "#1d4ed8"
                            : "#2563eb",
                        color:
                          "#ffffff",
                        fontSize:
                          "14px",
                        fontWeight:
                          "600",
                        cursor:
                          "pointer",
                      }}
                    >
                      {isExpanded
                        ? "Hide Students"
                        : "View Students"}
                    </button>


                    {/* ======================================
                        STUDENTS SECTION
                    ====================================== */}

                    {isExpanded && (

                      <div
                        style={{
                          marginTop:
                            "18px",
                          paddingTop:
                            "18px",
                          borderTop:
                            "1px solid #e2e8f0",
                        }}
                      >

                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            marginBottom:
                              "12px",
                          }}
                        >

                          <div
                            style={{
                              fontSize:
                                "15px",
                              fontWeight:
                                "700",
                              color:
                                "#0f172a",
                            }}
                          >
                            Students
                          </div>


                          {!isStudentsLoading && (

                            <span
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#64748b",
                              }}
                            >
                              {
                                students.length
                              }{" "}
                              student
                              {
                                students.length ===
                                1
                                  ? ""
                                  : "s"
                              }
                            </span>

                          )}

                        </div>


                        {/* ==================================
                            STUDENT LOADING
                        ================================== */}

                        {isStudentsLoading && (

                          <div
                            style={{
                              padding:
                                "20px",
                              textAlign:
                                "center",
                              color:
                                "#64748b",
                              background:
                                "#f8fafc",
                              borderRadius:
                                "10px",
                            }}
                          >
                            Loading students...
                          </div>

                        )}


                        {/* ==================================
                            STUDENT ERROR
                        ================================== */}

                        {!isStudentsLoading &&
                          studentError && (

                            <div
                              style={{
                                padding:
                                  "14px",
                                color:
                                  "#b91c1c",
                                background:
                                  "#fef2f2",
                                border:
                                  "1px solid #fecaca",
                                borderRadius:
                                  "10px",
                                fontSize:
                                  "13px",
                              }}
                            >

                              {studentError}

                              <button
                                type="button"
                                onClick={() =>
                                  fetchBatchStudents(
                                    batchId
                                  )
                                }
                                style={{
                                  display:
                                    "block",
                                  marginTop:
                                    "10px",
                                  border:
                                    "none",
                                  background:
                                    "transparent",
                                  color:
                                    "#2563eb",
                                  fontWeight:
                                    "600",
                                  cursor:
                                    "pointer",
                                  padding:
                                    0,
                                }}
                              >
                                Try Again
                              </button>

                            </div>

                          )}


                        {/* ==================================
                            NO STUDENTS
                        ================================== */}

                        {!isStudentsLoading &&
                          !studentError &&
                          students.length ===
                            0 && (

                            <div
                              style={{
                                padding:
                                  "20px",
                                textAlign:
                                  "center",
                                color:
                                  "#64748b",
                                background:
                                  "#f8fafc",
                                borderRadius:
                                  "10px",
                                fontSize:
                                  "13px",
                              }}
                            >
                              No students found
                              in this batch.
                            </div>

                          )}


                        {/* ==================================
                            STUDENT LIST
                        ================================== */}

                        {!isStudentsLoading &&
                          !studentError &&
                          students.length >
                            0 && (

                            <div
                              style={{
                                display:
                                  "grid",
                                gap:
                                  "10px",
                              }}
                            >

                              {students.map(
                                (
                                  student,
                                  index
                                ) => {

                                  const playerId =
                                    getPlayerId(
                                      student
                                    );


                                  const playerName =
                                    getPlayerName(
                                      student
                                    );


                                  return (

                                    <div
                                      key={
                                        playerId ||
                                        index
                                      }
                                      style={{
                                        display:
                                          "flex",
                                        alignItems:
                                          "center",
                                        justifyContent:
                                          "space-between",
                                        gap:
                                          "12px",
                                        padding:
                                          "13px",
                                        border:
                                          "1px solid #e2e8f0",
                                        borderRadius:
                                          "10px",
                                        background:
                                          "#ffffff",
                                      }}
                                    >

                                      <div
                                        style={{
                                          minWidth:
                                            0,
                                        }}
                                      >

                                        <div
                                          style={{
                                            fontSize:
                                              "14px",
                                            fontWeight:
                                              "600",
                                            color:
                                              "#0f172a",
                                            wordBreak:
                                              "break-word",
                                          }}
                                        >
                                          {
                                            playerName
                                          }
                                        </div>


                                        <div
                                          style={{
                                            marginTop:
                                              "3px",
                                            fontSize:
                                              "12px",
                                            color:
                                              "#64748b",
                                          }}
                                        >
                                          Player ID:{" "}
                                          {
                                            playerId ??
                                            "-"
                                          }
                                        </div>

                                      </div>


                                      {/* =================================
                                          PERFORMANCE CARD BUTTON
                                      ================================= */}

                                      <button
                                        type="button"
                                        disabled={
                                          !playerId
                                        }
                                        onClick={() =>
                                          handleOpenPerformanceCard(
                                            student,
                                            batch
                                          )
                                        }
                                        style={{
                                          flexShrink:
                                            0,
                                          border:
                                            "none",
                                          borderRadius:
                                            "8px",
                                          padding:
                                            "9px 12px",
                                          background:
                                            playerId
                                              ? "#0f766e"
                                              : "#cbd5e1",
                                          color:
                                            "#ffffff",
                                          fontSize:
                                            "12px",
                                          fontWeight:
                                            "700",
                                          cursor:
                                            playerId
                                              ? "pointer"
                                              : "not-allowed",
                                        }}
                                      >
                                        Performance Card
                                      </button>

                                    </div>

                                  );

                                }
                              )}

                            </div>

                          )}

                      </div>

                    )}

                  </div>

                );

              }
            )}

          </div>

        )}

      </div>


      {/* ======================================================
          PERFORMANCE CARD MODAL
      ====================================================== */}

      <PerformanceCardModal
        open={
          performanceCardOpen
        }
        player={
          selectedPlayer
        }
        batch={
          selectedBatch
        }
        onClose={
          handleClosePerformanceCard
        }
      />

    </div>

  );

};


export default HistoryBatches;