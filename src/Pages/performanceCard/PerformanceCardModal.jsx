import React, {
  useEffect,
  useState,
} from "react";

import PerformanceCardForm
  from "./PerformanceCardForm";

import PerformanceCardView
  from "./PerformanceCardView";

import PerformanceCardService
  from "./PerformanceCardService";

import styles
  from "./performanceCardStyles";


// ============================================================
// PERFORMANCE CARD MODAL
// ============================================================

const PerformanceCardModal = ({
  open,
  player,
  batch,
  onClose,
}) => {

  const [card, setCard] =
    useState(null);


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState("");


  // ==========================================================
  // RESET WHEN MODAL OPENS
  // ==========================================================

  useEffect(() => {

    if (!open) {

      setCard(null);

      setError("");

      setLoading(false);

    }

  }, [open]);


  // ==========================================================
  // ESC KEY
  // ==========================================================

  useEffect(() => {

    if (!open) {
      return;
    }


    const handleKeyDown = (
      event
    ) => {

      if (
        event.key === "Escape"
      ) {

        onClose?.();
      }

    };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [
    open,
    onClose,
  ]);


  // ==========================================================
  // LOAD EXISTING CARD
  // ==========================================================

  useEffect(() => {

    if (
      !open ||
      !player?.id ||
      !batch?.id
    ) {

      return;
    }


    let cancelled = false;


    const loadExistingCard =
      async () => {

        try {

          setLoading(true);

          setError("");


          const response =
            await PerformanceCardService
              .getPlayerPerformanceCard(
                batch.id,
                player.id
              );


          if (cancelled) {
            return;
          }


          const existingCard =
            response?.data ||
            response;


          if (
            existingCard &&
            existingCard.id
          ) {

            setCard(
              existingCard
            );
          }

        } catch (err) {

          /*
           * 404 / no existing card is normal.
           * The coach should see the form.
           */

          if (
            err?.response?.status !== 404
          ) {

            console.error(
              "Error loading performance card:",
              err
            );

            if (!cancelled) {

              setError(
                err?.response?.data?.message ||
                "Unable to load performance card."
              );
            }
          }

        } finally {

          if (!cancelled) {

            setLoading(false);
          }

        }

      };


    loadExistingCard();


    return () => {

      cancelled = true;

    };

  }, [
    open,
    player?.id,
    batch?.id,
  ]);


  // ==========================================================
  // SUCCESS
  // ==========================================================

  const handleSuccess = (
    createdCard
  ) => {

    setError("");

    setCard(
      createdCard
    );

  };


  // ==========================================================
  // CLOSE
  // ==========================================================

  const handleClose = () => {

    if (loading) {
      return;
    }


    onClose?.();

  };


  // ==========================================================
  // DON'T RENDER
  // ==========================================================

  if (!open) {
    return null;
  }


  return (

    <div
      style={styles.overlay}
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {

          handleClose();
        }

      }}
    >

      <div
        style={styles.modal}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          style={styles.modalHeader}
        >

          <h2
            style={styles.modalTitle}
          >
            {card
              ? "Performance Card"
              : "Generate Performance Card"}
          </h2>


          <button
            type="button"
            onClick={handleClose}
            style={styles.closeButton}
            disabled={loading}
            aria-label="Close"
          >
            ×
          </button>

        </div>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (

          <div
            style={{
              padding:
                "16px 24px 0",
            }}
          >

            <div
              style={styles.error}
            >
              {error}
            </div>

          </div>

        )}


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && !card ? (

          <div
            style={{
              padding: "50px 24px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Loading performance card...
          </div>

        ) : card ? (

          /* =================================================
             VIEW GENERATED CARD
          ================================================= */

          <PerformanceCardView
            card={card}
            onClose={handleClose}
          />

        ) : (

          /* =================================================
             CREATE FORM
          ================================================= */

          <PerformanceCardForm
            player={player}
            batch={batch}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />

        )}

      </div>

    </div>

  );
};


export default PerformanceCardModal;