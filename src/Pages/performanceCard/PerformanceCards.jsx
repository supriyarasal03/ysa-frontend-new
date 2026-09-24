import React, {
  useEffect,
  useState,
} from "react";

import {
  getMyHistoryBatches,
  getHistoryBatchStudents,
  getPerformanceCard,
} from "../coach/CoachService";

import PerformanceCardView
  from "./PerformanceCardView";


// ============================================================
// PERFORMANCE CARDS PAGE
// ============================================================

const PerformanceCards = () => {

  // ==========================================================
  // BATCHES
  // ==========================================================

  const [batches, setBatches] =
    useState([]);


  // ==========================================================
  // SELECTED BATCH
  // ==========================================================

  const [selectedBatchId, setSelectedBatchId] =
    useState("");


  // ==========================================================
  // STUDENTS
  // ==========================================================

  const [students, setStudents] =
    useState([]);


  // ==========================================================
  // SELECTED STUDENT
  // ==========================================================

  const [selectedPlayerId, setSelectedPlayerId] =
    useState("");


  // ==========================================================
  // PERFORMANCE CARD
  // ==========================================================

  const [card, setCard] =
    useState(null);


  // ==========================================================
  // LOADING STATES
  // ==========================================================

  const [loadingBatches, setLoadingBatches] =
    useState(true);

  const [loadingStudents, setLoadingStudents] =
    useState(false);

  const [loadingCard, setLoadingCard] =
    useState(false);


  // ==========================================================
  // ERROR
  // ==========================================================

  const [error, setError] =
    useState("");


  // ==========================================================
  // LOAD HISTORY BATCHES
  // ==========================================================

  useEffect(() => {

    const loadBatches = async () => {

      try {

        setLoadingBatches(true);
        setError("");

        const response =
          await getMyHistoryBatches();

        const data =
          response?.data ?? [];

        setBatches(data);

        // Automatically select first batch
        if (data.length > 0) {

          setSelectedBatchId(
            String(data[0].id)
          );

        }

      } catch (err) {

        console.error(
          "Failed to load history batches:",
          err
        );

        setError(
          err?.message ||
          "Failed to load completed batches."
        );

      } finally {

        setLoadingBatches(false);

      }

    };

    loadBatches();

  }, []);


  // ==========================================================
  // LOAD STUDENTS WHEN BATCH CHANGES
  // ==========================================================

  useEffect(() => {

    if (!selectedBatchId) {

      setStudents([]);
      setSelectedPlayerId("");
      setCard(null);

      return;
    }


    const loadStudents = async () => {

      try {

        setLoadingStudents(true);
        setError("");

        setStudents([]);
        setSelectedPlayerId("");
        setCard(null);


        const response =
          await getHistoryBatchStudents(
            selectedBatchId
          );


        const data =
          response?.data ?? [];


        setStudents(data);


      } catch (err) {

        console.error(
          "Failed to load students:",
          err
        );

        setError(
          err?.message ||
          "Failed to load batch students."
        );

      } finally {

        setLoadingStudents(false);

      }

    };


    loadStudents();

  }, [selectedBatchId]);


  // ==========================================================
  // LOAD PERFORMANCE CARD
  // ==========================================================

  useEffect(() => {

    if (
      !selectedBatchId ||
      !selectedPlayerId
    ) {

      setCard(null);

      return;
    }


    const loadCard = async () => {

      try {

        setLoadingCard(true);
        setError("");

        setCard(null);


        const response =
          await getPerformanceCard(
            selectedBatchId,
            selectedPlayerId
          );


        setCard(
          response?.data ??
          response ??
          null
        );


      } catch (err) {

        console.error(
          "Failed to load performance card:",
          err
        );


        // ----------------------------------------------------
        // 404 means card has not been generated
        // ----------------------------------------------------

        if (
          err.response?.status === 404
        ) {

          setCard(null);

          return;
        }


        setError(
          err?.message ||
          "Failed to load performance card."
        );

      } finally {

        setLoadingCard(false);

      }

    };


    loadCard();

  }, [
    selectedBatchId,
    selectedPlayerId,
  ]);


  // ==========================================================
  // SELECTED BATCH OBJECT
  // ==========================================================

  const selectedBatch =
    batches.find(
      (batch) =>
        String(batch.id) ===
        String(selectedBatchId)
    );


  // ==========================================================
  // SELECTED PLAYER OBJECT
  // ==========================================================

  const selectedPlayer =
    students.find(
      (student) =>
        String(
          student.playerId
        ) ===
        String(selectedPlayerId)
    );


  // ==========================================================
  // PLAYER NAME
  // ==========================================================

  const getPlayerName = (
    player
  ) => {

    if (!player) {
      return "-";
    }


    if (player.playerName) {
      return player.playerName;
    }


    return (
      `${player.firstName || ""} ${
        player.lastName || ""
      }`
        .trim()
    ) || "Unknown Player";

  };


  // ==========================================================
  // LOADING BATCHES
  // ==========================================================

  if (loadingBatches) {

    return (

      <div
        style={styles.page}
      >

        <div
          style={styles.loading}
        >
          Loading performance cards...
        </div>

      </div>

    );

  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div
      style={styles.page}
    >

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div
        style={styles.header}
      >

        <div>

          <h1
            style={styles.title}
          >
            Performance Cards
          </h1>

          <p
            style={styles.subtitle}
          >
            View performance cards generated for
            completed batches.
          </p>

        </div>

      </div>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (

        <div
          style={styles.error}
        >
          {error}
        </div>

      )}


      {/* ====================================================
          FILTER SECTION
      ==================================================== */}

      <div
        style={styles.filterCard}
      >

        {/* ==================================================
            BATCH
        ================================================== */}

        <div
          style={styles.field}
        >

          <label
            style={styles.label}
          >
            Completed Batch
          </label>

          <select
            value={selectedBatchId}
            onChange={(event) =>
              setSelectedBatchId(
                event.target.value
              )
            }
            style={styles.select}
          >

            <option value="">
              Select Batch
            </option>

            {batches.map(
              (batch) => (

                <option
                  key={batch.id}
                  value={batch.id}
                >
                  {batch.batchName}
                </option>

              )
            )}

          </select>

        </div>


        {/* ==================================================
            STUDENT
        ================================================== */}

        <div
          style={styles.field}
        >

          <label
            style={styles.label}
          >
            Player
          </label>

          <select
            value={selectedPlayerId}
            onChange={(event) =>
              setSelectedPlayerId(
                event.target.value
              )
            }
            disabled={
              loadingStudents ||
              !selectedBatchId
            }
            style={styles.select}
          >

            <option value="">
              {loadingStudents
                ? "Loading players..."
                : "Select Player"}
            </option>

            {students.map(
              (student) => (

                <option
                  key={
                    student.playerId
                  }
                  value={
                    student.playerId
                  }
                >
                  {
                    getPlayerName(
                      student
                    )
                  }
                </option>

              )
            )}

          </select>

        </div>

      </div>


      {/* ====================================================
          BATCH INFORMATION
      ==================================================== */}

      {selectedBatch && (

        <div
          style={styles.batchInfo}
        >

          <div>

            <span
              style={styles.infoLabel}
            >
              Batch
            </span>

            <strong>
              {
                selectedBatch.batchName
              }
            </strong>

          </div>


          <div>

            <span
              style={styles.infoLabel}
            >
              Sport
            </span>

            <strong>
              {
                selectedBatch.sportName ||
                "-"
              }
            </strong>

          </div>


          <div>

            <span
              style={styles.infoLabel}
            >
              Start Date
            </span>

            <strong>
              {
                selectedBatch.startDate ||
                "-"
              }
            </strong>

          </div>


          <div>

            <span
              style={styles.infoLabel}
            >
              End Date
            </span>

            <strong>
              {
                selectedBatch.endDate ||
                "-"
              }
            </strong>

          </div>

        </div>

      )}


      {/* ====================================================
          CARD LOADING
      ==================================================== */}

      {loadingCard && (

        <div
          style={styles.loading}
        >
          Loading performance card...
        </div>

      )}


      {/* ====================================================
          NO PLAYER SELECTED
      ==================================================== */}

      {!loadingCard &&
        !selectedPlayerId && (

          <div
            style={styles.empty}
          >

            <div
              style={styles.emptyTitle}
            >
              Select a player
            </div>

            <div
              style={styles.emptyText}
            >
              Select a completed batch and player
              to view the performance card.
            </div>

          </div>

        )}


      {/* ====================================================
          PLAYER SELECTED BUT NO CARD
      ==================================================== */}

      {!loadingCard &&
        selectedPlayerId &&
        !card && (

          <div
            style={styles.empty}
          >

            <div
              style={styles.emptyTitle}
            >
              Performance Card Not Available
            </div>

            <div
              style={styles.emptyText}
            >
              No performance card has been generated
              for{" "}
              <strong>
                {
                  getPlayerName(
                    selectedPlayer
                  )
                }
              </strong>{" "}
              in this batch.
            </div>

          </div>

        )}


      {/* ====================================================
          PERFORMANCE CARD
      ==================================================== */}
{!loadingCard &&
  card && (

    <div
      style={styles.cardContainer}
    >

      <PerformanceCardView
        card={card}
        onClose={() => {
          setSelectedPlayerId("");
          setCard(null);
        }}
      />

    </div>

)}



    </div>

  );

};


// ============================================================
// STYLES
// ============================================================

const styles = {

  page: {
    minHeight: "100%",
    padding: "30px",
    background: "#f8fafc",
  },


  header: {
    maxWidth: "1200px",
    margin: "0 auto 25px",
  },


  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "700",
    color: "#0f172a",
  },


  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "15px",
  },


  filterCard: {
    maxWidth: "1200px",
    margin: "0 auto 20px",
    padding: "22px",
    background: "#ffffff",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },


  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },


  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
  },


  select: {
    width: "100%",
    minHeight: "44px",
    padding: "0 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "14px",
    outline: "none",
  },


  batchInfo: {
    maxWidth: "1200px",
    margin: "0 auto 20px",
    padding: "20px",
    background: "#ffffff",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
  },


  infoLabel: {
    display: "block",
    marginBottom: "6px",
    color: "#94a3b8",
    fontSize: "12px",
  },


  loading: {
    maxWidth: "1200px",
    margin: "20px auto",
    padding: "40px",
    textAlign: "center",
    background: "#ffffff",
    borderRadius: "14px",
    color: "#64748b",
  },


  error: {
    maxWidth: "1200px",
    margin: "0 auto 20px",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
  },


  empty: {
    maxWidth: "1200px",
    margin: "20px auto",
    padding: "60px 30px",
    textAlign: "center",
    background: "#ffffff",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
  },


  emptyTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "8px",
  },


  emptyText: {
    color: "#64748b",
    fontSize: "14px",
  },


  cardContainer: {
    maxWidth: "1200px",
    margin: "20px auto",
  },

};


export default PerformanceCards;