import React, { useState } from "react";

import PlayerBatchChangeService
  from "./PlayerBatchChangeService";


// =========================================================
// RECEPTIONIST CHANGE BATCH
// =========================================================

const ReceptionistChangeBatch = () => {

  // =======================================================
  // SEARCH
  // =======================================================

  const [username, setUsername] = useState("");

  const [searchLoading, setSearchLoading] =
    useState(false);


  // =======================================================
  // PLAYER
  // =======================================================

  const [player, setPlayer] = useState(null);

  const [playerId, setPlayerId] =
    useState(null);


  // =======================================================
  // CURRENT ENROLLMENT / BATCH
  // =======================================================

  const [currentBatch, setCurrentBatch] =
    useState(null);


  // =======================================================
  // AVAILABLE BATCHES
  // =======================================================

  const [availableBatches, setAvailableBatches] =
    useState([]);

  const [selectedBatchId, setSelectedBatchId] =
    useState("");


  // =======================================================
  // LOADING
  // =======================================================

  const [changeLoading, setChangeLoading] =
    useState(false);


  // =======================================================
  // MESSAGES
  // =======================================================

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // =======================================================
  // SEARCH PLAYER
  // =======================================================

  const handleSearch = async () => {

    const trimmedUsername =
      username.trim();


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!trimmedUsername) {

      setError("Please enter player username.");

      return;
    }


    // -----------------------------------------------------
    // RESET OLD DATA
    // -----------------------------------------------------

    setError("");

    setSuccess("");

    setPlayer(null);

    setPlayerId(null);

    setCurrentBatch(null);

    setAvailableBatches([]);

    setSelectedBatchId("");


    try {

      setSearchLoading(true);


      // ===================================================
      // FIND PLAYER
      // ===================================================

      const playerResponse =
        await PlayerBatchChangeService
          .getPlayerByUsername(
            trimmedUsername
          );


      console.log(
        "Player lookup response:",
        playerResponse
      );


      // ---------------------------------------------------
      // SUPPORT COMMON RESPONSE STRUCTURES
      // ---------------------------------------------------

      const playerData =
        playerResponse?.data ||
        playerResponse;


      if (!playerData) {

        throw new Error(
          "Player not found."
        );
      }


      // ---------------------------------------------------
      // GET PLAYER ID
      // ---------------------------------------------------

      const foundPlayerId =
        playerData?.playerId ??
        playerData?.id ??
        playerData?.player?.id;


      if (!foundPlayerId) {

        throw new Error(
          "Player ID was not returned by the server."
        );
      }


      setPlayerId(foundPlayerId);

      setPlayer(playerData);


      // ===================================================
      // GET AVAILABLE BATCHES
      // ===================================================

      const batchesResponse =
        await PlayerBatchChangeService
          .getAvailableBatches(
            foundPlayerId
          );


      console.log(
        "Available batches:",
        batchesResponse
      );


      const batches =
        Array.isArray(batchesResponse)
          ? batchesResponse
          : (
              batchesResponse?.data ||
              []
            );


      setAvailableBatches(batches);


      // ---------------------------------------------------
      // FIND CURRENT BATCH
      // ---------------------------------------------------

      const current =
        batches.find(
          (batch) =>
            batch.currentBatch === true ||
            batch.isCurrentBatch === true
        );


      setCurrentBatch(current || null);


      // ---------------------------------------------------
      // IF BACKEND PLAYER RESPONSE HAS CURRENT BATCH
      // ---------------------------------------------------

      if (!current) {

        const responseCurrentBatch =
          playerData?.currentBatch ||
          playerData?.batch;

        if (responseCurrentBatch) {

          setCurrentBatch(
            responseCurrentBatch
          );
        }
      }


      // ---------------------------------------------------
      // NO OTHER BATCH AVAILABLE
      // ---------------------------------------------------

      const otherBatches =
        batches.filter(
          (batch) =>
            !(
              batch.currentBatch === true ||
              batch.isCurrentBatch === true
            )
        );


      if (otherBatches.length === 0) {

        setError(
          "No other available batch found for this player."
        );
      }

    } catch (err) {

      console.error(
        "Error finding player batch:",
        err
      );


      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to find player."
      );

    } finally {

      setSearchLoading(false);
    }
  };


  // =======================================================
  // CHANGE BATCH
  // =======================================================

  const handleChangeBatch = async () => {

    if (!playerId) {

      setError(
        "Please search for a player first."
      );

      return;
    }


    if (!selectedBatchId) {

      setError(
        "Please select a new batch."
      );

      return;
    }


    // -----------------------------------------------------
    // FIND SELECTED BATCH
    // -----------------------------------------------------

    const selectedBatch =
      availableBatches.find(
        (batch) =>
          String(batch.batchId ?? batch.id) ===
          String(selectedBatchId)
      );


    if (!selectedBatch) {

      setError(
        "Selected batch not found."
      );

      return;
    }


    // -----------------------------------------------------
    // DO NOT ALLOW CURRENT BATCH
    // -----------------------------------------------------

    if (
      selectedBatch.currentBatch === true ||
      selectedBatch.isCurrentBatch === true
    ) {

      setError(
        "Please select a different batch."
      );

      return;
    }


    try {

      setChangeLoading(true);

      setError("");

      setSuccess("");


      // ===================================================
      // CHANGE ONLY BATCH
      // ===================================================

      const response =
        await PlayerBatchChangeService
          .changePlayerBatch(
            playerId,
            selectedBatchId
          );


      console.log(
        "Batch change response:",
        response
      );


      // ===================================================
      // SUCCESS
      // ===================================================

      setSuccess(
        response?.message ||
        "Player batch changed successfully."
      );


      // ---------------------------------------------------
      // Update current batch on screen
      // ---------------------------------------------------

      const newCurrentBatch = {
        ...selectedBatch,
        currentBatch: true,
        isCurrentBatch: true,
      };


      setCurrentBatch(
        newCurrentBatch
      );


      // ---------------------------------------------------
      // Remove old current flag and set new one
      // ---------------------------------------------------

      setAvailableBatches(
        (previousBatches) =>
          previousBatches.map(
            (batch) => {

              const batchId =
                batch.batchId ?? batch.id;


              if (
                String(batchId) ===
                String(selectedBatchId)
              ) {

                return {
                  ...batch,
                  currentBatch: true,
                  isCurrentBatch: true,
                };
              }


              return {
                ...batch,
                currentBatch: false,
                isCurrentBatch: false,
              };
            }
          )
      );


      setSelectedBatchId("");

    } catch (err) {

      console.error(
        "Error changing player batch:",
        err
      );


      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to change player batch."
      );

    } finally {

      setChangeLoading(false);
    }
  };


  // =======================================================
  // FORMAT TRAINING DAYS
  // =======================================================

  const formatTrainingDays = (days) => {

    if (!days) {
      return "-";
    }


    if (Array.isArray(days)) {

      return days.join(", ");
    }


    return String(days);
  };


  // =======================================================
  // FORMAT TIME
  // =======================================================
const formatTime = (time) => {

  if (!time) {
    return "-";
  }

  const timeString = String(time);

  const parts = timeString.split(":");

  if (parts.length < 2) {
    return timeString;
  }

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  if (Number.isNaN(hours)) {
    return timeString;
  }

  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
};


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <div
      style={{
        padding: "24px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >

      {/* ===================================================
          PAGE TITLE
      =================================================== */}

      <div
        style={{
          marginBottom: "24px",
        }}
      >

        <h2
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          Change Player Batch
        </h2>

        <p
          style={{
            marginTop: "8px",
            color: "#6b7280",
          }}
        >
          Search a player by username and change only the
          player's training batch.
        </p>

      </div>


      {/* ===================================================
          SEARCH CARD
      =================================================== */}

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >

        <label
          style={{
            display: "block",
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          Player Username
        </label>


        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >

          <input
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            onKeyDown={(event) => {

              if (event.key === "Enter") {
                handleSearch();
              }

            }}
            placeholder="Enter player username"
            disabled={searchLoading}
            style={{
              flex: "1",
              minWidth: "260px",
              height: "44px",
              padding: "0 14px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              outline: "none",
              fontSize: "14px",
            }}
          />


          <button
            type="button"
            onClick={handleSearch}
            disabled={searchLoading}
            style={{
              height: "44px",
              padding: "0 24px",
              border: "none",
              borderRadius: "8px",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: "600",
              cursor: searchLoading
                ? "not-allowed"
                : "pointer",
              opacity: searchLoading
                ? 0.7
                : 1,
            }}
          >
            {searchLoading
              ? "Searching..."
              : "Search Player"}
          </button>

        </div>

      </div>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            borderRadius: "8px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>

      )}


      {/* ===================================================
          SUCCESS
      =================================================== */}

      {success && (

        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            borderRadius: "8px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#15803d",
          }}
        >
          {success}
        </div>

      )}


      {/* ===================================================
          PLAYER INFORMATION
      =================================================== */}

      {player && (

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >

          <h3
            style={{
              marginTop: 0,
              marginBottom: "18px",
              fontSize: "20px",
            }}
          >
            Player Information
          </h3>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >

            <InfoItem
              label="Username"
              value={
                player?.username ||
                player?.user?.username ||
                username
              }
            />


            <InfoItem
              label="Player Name"
              value={
                player?.playerName ||
                player?.name ||
                [
                  player?.firstName,
                  player?.lastName,
                ]
                  .filter(Boolean)
                  .join(" ") ||
                "-"
              }
            />


            <InfoItem
              label="Sport"
              value={
                player?.sportName ||
                player?.sport?.sportsName ||
                player?.sport?.name ||
                currentBatch?.sportName ||
                "-"
              }
            />


            <InfoItem
              label="Coach"
              value={
                player?.coachName ||
                player?.coach?.name ||
                currentBatch?.coachName ||
                "-"
              }
            />

          </div>

        </div>

      )}


      {/* ===================================================
          CURRENT BATCH
      =================================================== */}

      {player && currentBatch && (

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >

          <h3
            style={{
              marginTop: 0,
              marginBottom: "18px",
              fontSize: "20px",
            }}
          >
            Current Batch
          </h3>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              alignItems: "start",
            }}
          >

            <InfoItem
              label="Batch"
              value={
                currentBatch.batchName ||
                "-"
              }
            />


            <InfoItem
              label="Training Days"
              value={
                formatTrainingDays(
                  currentBatch.trainingDays
                )
              }
            />


            <InfoItem
              label="Start Time"
              value={
                formatTime(
                  currentBatch.startTime
                )
              }
            />


            <InfoItem
              label="End Time"
              value={
                formatTime(
                  currentBatch.endTime
                )
              }
            />

          </div>

        </div>

      )}


      {/* ===================================================
          AVAILABLE BATCHES
      =================================================== */}

      {player && availableBatches.length > 0 && (

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "20px",
          }}
        >

          <h3
            style={{
              marginTop: 0,
              marginBottom: "8px",
              fontSize: "20px",
            }}
          >
            Available Batches
          </h3>


          <p
            style={{
              marginTop: 0,
              marginBottom: "20px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Only active batches for the player's current
            sport and coach are shown.
          </p>


          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >

            {availableBatches
              .filter(
                (batch) =>
                  !(
                    batch.currentBatch === true ||
                    batch.isCurrentBatch === true
                  )
              )
              .map((batch) => {

                const batchId =
                  batch.batchId ?? batch.id;


                return (

                  <label
                    key={batchId}
                    style={{
                      display: "block",
                      border:
                        String(selectedBatchId) ===
                        String(batchId)
                          ? "2px solid #2563eb"
                          : "1px solid #e5e7eb",
                      borderRadius: "10px",
                      padding: "16px",
                      cursor: "pointer",
                      background:
                        String(selectedBatchId) ===
                        String(batchId)
                          ? "#eff6ff"
                          : "#ffffff",
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >

                      <input
                        type="radio"
                        name="newBatch"
                        value={batchId}
                        checked={
                          String(selectedBatchId) ===
                          String(batchId)
                        }
                        onChange={() =>
                          setSelectedBatchId(
                            String(batchId)
                          )
                        }
                        style={{
                          marginTop: "4px",
                        }}
                      />


                      <div
                        style={{
                          flex: 1,
                        }}
                      >

                        <div
                          style={{
                            fontWeight: "700",
                            fontSize: "16px",
                            marginBottom: "10px",
                          }}
                        >
                          {batch.batchName || "-"}
                        </div>


                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "12px",
                            fontSize: "14px",
                            alignItems: "start",
                          }}
                        >

                          <div>
                            <strong>
                              Sport:
                            </strong>{" "}
                            {batch.sportName || "-"}
                          </div>


                          <div>
                            <strong>
                              Coach:
                            </strong>{" "}
                            {batch.coachName || "-"}
                          </div>


                          <div>
                            <strong>
                              Days:
                            </strong>{" "}
                            {formatTrainingDays(
                              batch.trainingDays
                            )}
                          </div>


                          <div>
                            <strong>
                              Time:
                            </strong>{" "}
                            {formatTime(
                              batch.startTime
                            )}{" "}
                            -{" "}
                            {formatTime(
                              batch.endTime
                            )}
                          </div>


                          <div>
                            <strong>
                              Seats:
                            </strong>{" "}
                            {batch.availableSeats ??
                              "-"}
                          </div>

                        </div>

                      </div>

                    </div>

                  </label>

                );
              })}

          </div>


          {/* =================================================
              CHANGE BUTTON
          ================================================= */}

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >

            <button
              type="button"
              onClick={handleChangeBatch}
              disabled={
                !selectedBatchId ||
                changeLoading
              }
              style={{
                height: "44px",
                padding: "0 24px",
                border: "none",
                borderRadius: "8px",
                background:
                  !selectedBatchId ||
                  changeLoading
                    ? "#9ca3af"
                    : "#16a34a",
                color: "#ffffff",
                fontWeight: "600",
                cursor:
                  !selectedBatchId ||
                  changeLoading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {changeLoading
                ? "Changing..."
                : "Change Batch"}
            </button>

          </div>

        </div>

      )}

    </div>
  );
};


// =========================================================
// INFO ITEM
// =========================================================

const InfoItem = ({
  label,
  value,
}) => {

  return (

    <div
      style={{
        minWidth: 0,
        overflow: "hidden",
      }}
    >

      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>


      <div
        style={{
          fontSize: "15px",
          fontWeight: "600",
          color: "#111827",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
          lineHeight: "1.5",
        }}
      >
        {value || "-"}
      </div>

    </div>
  );
};


export default ReceptionistChangeBatch;