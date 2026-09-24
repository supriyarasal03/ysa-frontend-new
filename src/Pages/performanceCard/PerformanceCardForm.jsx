import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import PerformanceCardService
  from "./PerformanceCardService";

import styles
  from "./performanceCardStyles";


// ============================================================
// PERFORMANCE CARD FORM
// ============================================================

const PerformanceCardForm = ({
  player,
  batch,
  existingCard = null,
  onSuccess,
  onCancel,
}) => {

  // ==========================================================
  // SKILLS
  // ==========================================================

  const [skills, setSkills] = useState([
    {
      skillName: "Batting",
      marks: "",
    },
    {
      skillName: "Bowling",
      marks: "",
    },
    {
      skillName: "Fielding",
      marks: "",
    },
  ]);


  // ==========================================================
  // REMARKS
  // ==========================================================

  const [coachRemarks, setCoachRemarks] =
    useState("");


  // ==========================================================
  // LOADING
  // ==========================================================

  const [loading, setLoading] =
    useState(false);


  // ==========================================================
  // ERROR
  // ==========================================================

  const [error, setError] =
    useState("");


  // ==========================================================
  // GET ACTUAL PLAYER ID
  //
  // History API returns:
  //
  // playerId
  //
  // not:
  //
  // id
  // ==========================================================

  const playerId =
    player?.playerId ??
    player?.id;


  // ==========================================================
  // GET PLAYER NAME
  // ==========================================================

  const playerName =
    player?.playerName ||
    player?.studentName ||
    (
      `${player?.firstName || ""} ${
        player?.lastName || ""
      }`
        .trim()
    ) ||
    "-";


  // ==========================================================
  // GET SPORT NAME
  // ==========================================================

  const sportName =
    batch?.sportName ||
    player?.sportName ||
    player?.sport?.sportsName ||
    "-";


  // ==========================================================
  // GET BATCH NAME
  // ==========================================================

  const batchName =
    batch?.batchName ||
    "-";


  // ==========================================================
  // GET COACH NAME
  // ==========================================================

  const coachName =
    batch?.coachName ||
    player?.coachName ||
    "-";


  // ==========================================================
  // INITIALIZE EXISTING CARD
  // ==========================================================

  useEffect(() => {

    if (!existingCard) {
      return;
    }


    if (
      Array.isArray(existingCard.skills) &&
      existingCard.skills.length > 0
    ) {

      setSkills(
        [...existingCard.skills]
          .sort(
            (a, b) =>
              (a.displayOrder || 0) -
              (b.displayOrder || 0)
          )
          .map((skill) => ({
            skillName:
              skill.skillName || "",
            marks:
              skill.marks ?? "",
          }))
      );

    }


    setCoachRemarks(
      existingCard.coachRemarks || ""
    );

  }, [existingCard]);


  // ==========================================================
  // OVERALL PREVIEW
  // ==========================================================

  const overallPreview = useMemo(() => {

    const validMarks =
      skills
        .map((skill) =>
          Number(skill.marks)
        )
        .filter(
          (mark) =>
            Number.isFinite(mark) &&
            mark >= 0 &&
            mark <= 10
        );


    if (validMarks.length === 0) {
      return null;
    }


    const total =
      validMarks.reduce(
        (sum, mark) =>
          sum + mark,
        0
      );


    return (
      total / validMarks.length
    ).toFixed(2);

  }, [skills]);


  // ==========================================================
  // HANDLE SKILL CHANGE
  // ==========================================================

  const handleSkillChange = (
    index,
    field,
    value
  ) => {

    setSkills((previous) => {

      const updated = [
        ...previous,
      ];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });

  };


  // ==========================================================
  // ADD SKILL
  // ==========================================================

  const handleAddSkill = () => {

    setSkills((previous) => [
      ...previous,
      {
        skillName: "",
        marks: "",
      },
    ]);

  };


  // ==========================================================
  // REMOVE SKILL
  // ==========================================================

  const handleRemoveSkill = (
    index
  ) => {

    setSkills((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );

  };


  // ==========================================================
  // VALIDATE FORM
  // ==========================================================

  const validateForm = () => {

    // --------------------------------------------------------
    // PLAYER
    // --------------------------------------------------------

    if (!playerId) {

      return "Player information is missing.";
    }


    // --------------------------------------------------------
    // BATCH
    // --------------------------------------------------------

    if (!batch?.id) {

      return "Batch information is missing.";
    }


    // --------------------------------------------------------
    // SKILLS
    // --------------------------------------------------------

    if (!skills.length) {

      return "At least one skill is required.";
    }


    const normalizedNames =
      new Set();


    for (
      let index = 0;
      index < skills.length;
      index++
    ) {

      const skill =
        skills[index];


      const skillName =
        String(
          skill.skillName || ""
        ).trim();


      if (!skillName) {

        return `Please enter skill name for row ${
          index + 1
        }.`;
      }


      const marks =
        Number(skill.marks);


      if (
        !Number.isFinite(marks) ||
        marks < 0 ||
        marks > 10
      ) {

        return `Marks for "${skillName}" must be between 0 and 10.`;
      }


      const normalized =
        skillName.toLowerCase();


      if (
        normalizedNames.has(
          normalized
        )
      ) {

        return `Duplicate skill "${skillName}" is not allowed.`;
      }


      normalizedNames.add(
        normalized
      );

    }


    return "";
  };


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setError("");


    const validationError =
      validateForm();


    if (validationError) {

      setError(
        validationError
      );

      return;
    }


    try {

      setLoading(true);


      const request = {

        batchId:
          Number(batch.id),

        playerId:
          Number(playerId),

        skills:
          skills.map((skill) => ({
            skillName:
              skill.skillName.trim(),

            marks:
              Number(skill.marks),
          })),

        coachRemarks:
          coachRemarks.trim() || null,
      };


      console.log(
        "Performance Card Request:",
        request
      );


      const response =
        await PerformanceCardService
          .createPerformanceCard(
            request
          );


      const card =
        response?.data ||
        response;


      if (!card) {

        throw new Error(
          "Performance card was not returned by the server."
        );
      }


      if (onSuccess) {

        onSuccess(card);
      }

    } catch (err) {

      console.error(
        "Performance card creation error:",
        err
      );


      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to create performance card."
      );

    } finally {

      setLoading(false);
    }

  };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <form
      onSubmit={handleSubmit}
      style={styles.content}
    >

      {/* ====================================================
          PLAYER / BATCH INFORMATION
      ==================================================== */}

      <div style={styles.infoGrid}>

        <InfoBox
          label="Player"
          value={playerName}
        />

        <InfoBox
          label="Sport"
          value={sportName}
        />

        <InfoBox
          label="Batch"
          value={batchName}
        />

        <InfoBox
          label="Coach"
          value={coachName}
        />

      </div>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (

        <div style={styles.error}>
          {error}
        </div>

      )}


      {/* ====================================================
          PERFORMANCE
      ==================================================== */}

      <h3 style={styles.sectionTitle}>
        Performance
      </h3>


      <div style={styles.skillHeader}>

        <div>
          Skill / Category
        </div>

        <div>
          Marks (Out of 10)
        </div>

        <div />

      </div>


      {skills.map(
        (skill, index) => (

          <div
            key={index}
            style={styles.skillRow}
          >

            <input
              type="text"
              value={
                skill.skillName
              }
              onChange={(event) =>
                handleSkillChange(
                  index,
                  "skillName",
                  event.target.value
                )
              }
              placeholder="e.g. Batting"
              style={styles.input}
              disabled={loading}
            />


            <input
              type="number"
              min="0"
              max="10"
              step="0.01"
              value={
                skill.marks
              }
              onChange={(event) =>
                handleSkillChange(
                  index,
                  "marks",
                  event.target.value
                )
              }
              placeholder="0 - 10"
              style={styles.input}
              disabled={loading}
            />


            <button
              type="button"
              onClick={() =>
                handleRemoveSkill(
                  index
                )
              }
              disabled={
                loading ||
                skills.length === 1
              }
              style={{
                ...styles.removeButton,
                opacity:
                  skills.length === 1
                    ? 0.45
                    : 1,
                cursor:
                  skills.length === 1
                    ? "not-allowed"
                    : "pointer",
              }}
              title="Remove skill"
            >
              ×
            </button>

          </div>

        )
      )}


      <button
        type="button"
        onClick={handleAddSkill}
        disabled={loading}
        style={styles.addButton}
      >
        + Add Skill
      </button>


      {/* ====================================================
          OVERALL
      ==================================================== */}

      <div style={styles.overallBox}>

        <span style={styles.overallLabel}>
          Overall Performance
        </span>

        <span style={styles.overallValue}>
          {overallPreview !== null
            ? `${overallPreview} / 10`
            : "-"}
        </span>

      </div>


      {/* ====================================================
          REMARKS
      ==================================================== */}

      <div style={styles.remarksSection}>

        <h3 style={styles.sectionTitle}>
          Coach Remarks
        </h3>

        <textarea
          value={coachRemarks}
          onChange={(event) =>
            setCoachRemarks(
              event.target.value
            )
          }
          placeholder="Enter coach remarks..."
          style={styles.textarea}
          disabled={loading}
        />

      </div>


      {/* ====================================================
          FOOTER
      ==================================================== */}

      <div style={styles.footer}>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={styles.cancelButton}
        >
          Cancel
        </button>


        <button
          type="submit"
          disabled={loading}
          style={
            loading
              ? styles.disabledButton
              : styles.primaryButton
          }
        >
          {loading
            ? "Generating..."
            : "Generate Performance Card"}
        </button>

      </div>

    </form>

  );
};


// ============================================================
// INFO BOX
// ============================================================

const InfoBox = ({
  label,
  value,
}) => (

  <div style={styles.infoBox}>

    <div style={styles.infoLabel}>
      {label}
    </div>

    <div style={styles.infoValue}>
      {value || "-"}
    </div>

  </div>

);


export default PerformanceCardForm;