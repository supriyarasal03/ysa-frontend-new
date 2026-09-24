import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";

import styles from "./performanceCardStyles";

// ============================================================
// PERFORMANCE CARD VIEW
// ============================================================

const PerformanceCardView = ({
  card,
  onClose,
}) => {
  const cardRef = useRef(null);

  const [downloading, setDownloading] = useState(false);

  // ==========================================================
  // GET SPORT THEME
  // ==========================================================

  const getSportTheme = (sportName) => {
    const sport = String(sportName || "").toLowerCase();

    if (sport.includes("cricket")) {
      return {
        primary: "#0f766e",
        secondary: "#16a34a",
        light: "#ecfdf5",
        accent: "#f59e0b",
        title: "#064e3b",
        icon: "🏏",
      };
    }

    if (sport.includes("football")) {
      return {
        primary: "#166534",
        secondary: "#22c55e",
        light: "#f0fdf4",
        accent: "#84cc16",
        title: "#14532d",
        icon: "⚽",
      };
    }

    if (sport.includes("hockey")) {
      return {
        primary: "#c2410c",
        secondary: "#f97316",
        light: "#fff7ed",
        accent: "#ea580c",
        title: "#7c2d12",
        icon: "🏑",
      };
    }

    if (sport.includes("badminton")) {
      return {
        primary: "#7e22ce",
        secondary: "#a855f7",
        light: "#faf5ff",
        accent: "#ec4899",
        title: "#581c87",
        icon: "🏸",
      };
    }

    if (sport.includes("tennis")) {
      return {
        primary: "#ca8a04",
        secondary: "#eab308",
        light: "#fefce8",
        accent: "#84cc16",
        title: "#713f12",
        icon: "🎾",
      };
    }

    if (sport.includes("basketball")) {
      return {
        primary: "#c2410c",
        secondary: "#f97316",
        light: "#fff7ed",
        accent: "#fb923c",
        title: "#7c2d12",
        icon: "🏀",
      };
    }

    return {
      primary: "#1d4ed8",
      secondary: "#2563eb",
      light: "#eff6ff",
      accent: "#60a5fa",
      title: "#1e3a8a",
      icon: "🏆",
    };
  };

  // ==========================================================
  // DOWNLOAD PERFORMANCE CARD
  // ==========================================================

  const handleDownload = async () => {
    if (!cardRef.current || downloading) {
      return;
    }

    try {
      setDownloading(true);

      const canvas = await html2canvas(
        cardRef.current,
        {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        }
      );

      const playerName =
        card.playerName ||
        "Player";

      const sportName =
        card.sportName ||
        "Sport";

      const safePlayerName =
        String(playerName)
          .trim()
          .replace(/[^a-zA-Z0-9]+/g, "_");

      const safeSportName =
        String(sportName)
          .trim()
          .replace(/[^a-zA-Z0-9]+/g, "_");

      const fileName =
        `${safePlayerName}_${safeSportName}_Performance_Card.png`;

      const link =
        document.createElement("a");

      link.download = fileName;

      link.href =
        canvas.toDataURL(
          "image/png",
          1.0
        );

      link.click();

    } catch (error) {

      console.error(
        "Failed to download performance card:",
        error
      );

      alert(
        "Unable to download performance card."
      );

    } finally {

      setDownloading(false);

    }
  };

  // ==========================================================
  // CARD VALIDATION
  // ==========================================================

  if (!card) {

    return (
      <div style={styles.content}>

        <div style={styles.error}>
          Performance card data is not available.
        </div>

      </div>
    );
  }

  // ==========================================================
  // SKILLS
  // ==========================================================

  const skills =
    Array.isArray(card.skills)
      ? [...card.skills].sort(
          (a, b) =>
            (a.displayOrder || 0) -
            (b.displayOrder || 0)
        )
      : [];

  // ==========================================================
  // SPORT THEME
  // ==========================================================

  const theme =
    getSportTheme(
      card.sportName
    );

  return (

    <div
      style={{
        ...styles.content,
        backgroundColor: "#f1f5f9",
      }}
    >

      {/* ======================================================
          ACTUAL CARD
          Everything inside this element is downloaded.
      ====================================================== */}

      <div
        ref={cardRef}
        style={{
          ...styles.card,
          borderColor: theme.primary,
        }}
      >

        {/* ====================================================
            DECORATIVE TOP BORDER
        ==================================================== */}

        <div
          style={{
            height: "8px",
            background:
              `linear-gradient(
                90deg,
                ${theme.primary},
                ${theme.secondary},
                ${theme.accent}
              )`,
          }}
        />

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          style={{
            ...styles.cardHeader,
            background:
              `linear-gradient(
                135deg,
                ${theme.light},
                #ffffff
              )`,
            borderBottomColor:
              theme.primary,
          }}
        >

          {/* Decorative sport icon */}

          <div
            style={{
              ...styles.sportIcon,
              borderColor:
                theme.primary,
              backgroundColor:
                "#ffffff",
            }}
          >
            {theme.icon}
          </div>

          <div
            style={{
              ...styles.academyName,
              color: theme.primary,
            }}
          >
            YASHREE SPORTS ACADEMY
          </div>

          <h2
            style={{
              ...styles.cardTitle,
              color: theme.title,
            }}
          >
            PLAYER PERFORMANCE CARD
          </h2>

          <p
            style={
              styles.cardSubtitle
            }
          >
            Player Performance Evaluation
          </p>

        </div>


        {/* ====================================================
            PLAYER INFORMATION
        ==================================================== */}

        <div
          style={
            styles.cardBody
          }
        >

          <div
            style={
              styles.infoGrid
            }
          >

            <InfoBox
              label="Player Name"
              value={
                card.playerName
              }
              theme={theme}
            />

            <InfoBox
              label="Sport"
              value={
                card.sportName
              }
              theme={theme}
            />

            <InfoBox
              label="Batch"
              value={
                card.batchName
              }
              theme={theme}
            />

            <InfoBox
              label="Coach"
              value={
                card.coachName
              }
              theme={theme}
            />

          </div>


          {/* ==================================================
              BATCH DATES
          ================================================== */}

          <div
            style={
              styles.dateRow
            }
          >

            <span>

              Start:{" "}

              <strong>
                {formatDate(
                  card.batchStartDate
                )}
              </strong>

            </span>

            <span>

              End:{" "}

              <strong>
                {formatDate(
                  card.batchEndDate
                )}
              </strong>

            </span>

          </div>


          {/* ==================================================
              PERFORMANCE TABLE
          ================================================== */}

          <div
            style={{
              ...styles.performanceSection,
              borderColor:
                theme.primary,
            }}
          >

            <table
              style={
                styles.performanceTable
              }
            >

              <thead>

                <tr>

                  <th
                    style={{
                      ...styles.tableHeader,
                      backgroundColor:
                        theme.primary,
                    }}
                  >
                    Skill / Category
                  </th>

                  <th
                    style={{
                      ...styles.tableHeader,
                      backgroundColor:
                        theme.primary,
                      textAlign:
                        "center",
                    }}
                  >
                    Marks (Out of 10)
                  </th>

                </tr>

              </thead>


              <tbody>

                {skills.map(
                  (
                    skill,
                    index
                  ) => (

                    <tr
                      key={
                        skill.id ||
                        index
                      }
                    >

                      <td
                        style={
                          styles.tableCell
                        }
                      >
                        {skill.skillName}
                      </td>

                      <td
                        style={{
                          ...styles.tableCell,
                          textAlign:
                            "center",
                          fontWeight:
                            "700",
                          color:
                            theme.primary,
                        }}
                      >
                        {formatMarks(
                          skill.marks
                        )}
                      </td>

                    </tr>

                  )
                )}


                {/* ============================================
                    OVERALL
                ============================================ */}

                <tr
                  style={{
                    ...styles.overallRow,
                    backgroundColor:
                      theme.light,
                  }}
                >

                  <td
                    style={{
                      ...styles.tableCell,
                      fontWeight:
                        "800",
                      fontSize:
                        "15px",
                    }}
                  >
                    Overall Performance
                  </td>

                  <td
                    style={{
                      ...styles.tableCell,
                      textAlign:
                        "center",
                      fontWeight:
                        "900",
                      fontSize:
                        "18px",
                      color:
                        theme.primary,
                    }}
                  >

                    {formatMarks(
                      card.overallPerformance
                    )}

                    {" / 10"}

                  </td>

                </tr>

              </tbody>

            </table>

          </div>


          {/* ==================================================
              COACH REMARKS
          ================================================== */}

          {card.coachRemarks && (

            <div
              style={{
                ...styles.remarksBox,
                backgroundColor:
                  theme.light,
                borderColor:
                  theme.primary,
              }}
            >

              <div
                style={{
                  ...styles.remarksTitle,
                  color:
                    theme.primary,
                }}
              >
                Coach Remarks
              </div>

              <div
                style={
                  styles.remarksText
                }
              >
                {card.coachRemarks}
              </div>

            </div>

          )}


          {/* ==================================================
              SIGNATURE
          ================================================== */}

          <div
            style={
              styles.signatureArea
            }
          >

            <div
              style={
                styles.signatureLine
              }
            />

            <div
              style={{
                ...styles.signatureLabel,
                color:
                  theme.primary,
              }}
            >
              Coach Signature
            </div>

          </div>

        </div>


        {/* ====================================================
            BOTTOM DECORATION
        ==================================================== */}

        <div
          style={{
            height: "7px",
            background:
              `linear-gradient(
                90deg,
                ${theme.accent},
                ${theme.secondary},
                ${theme.primary}
              )`,
          }}
        />

      </div>


      {/* ======================================================
          ACTION BUTTONS
          These are NOT part of downloaded card.
      ====================================================== */}

      <div
        style={
          styles.actionBar
        }
      >

        <button
          type="button"
          onClick={
            handleDownload
          }
          disabled={
            downloading
          }
          style={{
            ...styles.downloadButton,
            backgroundColor:
              theme.primary,
            opacity:
              downloading
                ? 0.7
                : 1,
          }}
        >

          {downloading
            ? "Preparing Card..."
            : "↓ Download Performance Card"}

        </button>


        <button
          type="button"
          onClick={
            onClose
          }
          style={
            styles.cancelButton
          }
        >
          Close
        </button>

      </div>

    </div>

  );
};


// ============================================================
// INFO BOX
// ============================================================

const InfoBox = ({
  label,
  value,
  theme,
}) => (

  <div
    style={{
      ...styles.infoBox,
      borderTop:
        `3px solid ${theme.primary}`,
    }}
  >

    <div
      style={
        styles.infoLabel
      }
    >
      {label}
    </div>

    <div
      style={
        styles.infoValue
      }
    >
      {value || "-"}
    </div>

  </div>

);


// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (
  value
) => {

  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


// ============================================================
// FORMAT MARKS
// ============================================================

const formatMarks = (
  value
) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return value;
  }

  return number.toFixed(2);
};


export default PerformanceCardView;