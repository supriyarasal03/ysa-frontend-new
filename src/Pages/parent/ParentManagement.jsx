import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  Users,
  User,
  Calendar,
  Dumbbell,
  GraduationCap,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import ParentService from "./parentService";


const ParentManagement = () => {

  // ==========================================================
  // STATES
  // ==========================================================

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [expandedStudent, setExpandedStudent] = useState(null);


  // ==========================================================
  // LOAD MY STUDENTS
  // ==========================================================

  const loadStudents = async () => {

    try {

      setLoading(true);

      setError("");

      const data = await ParentService.getMyStudents();

      setStudents(Array.isArray(data) ? data : []);

    } catch (error) {

      console.error(
        "Parent students loading error:",
        error
      );

      setError(
        error?.response?.data?.message ||
        "Unable to load student information."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadStudents();

  }, []);


  // ==========================================================
  // SEARCH STUDENTS
  // ==========================================================

  const filteredStudents = useMemo(() => {

    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return students;
    }

    return students.filter((student) => {

      const fullName =
        `${student.firstName || ""} ${student.lastName || ""}`
          .toLowerCase();

      const sport =
        (student.sportName || "").toLowerCase();

      const batch =
        (student.batchName || "").toLowerCase();

      const coach =
        (student.coachName || "").toLowerCase();

      const email =
        (student.playerEmail || "").toLowerCase();

      const mobile =
        (student.playerMobileNo || "").toLowerCase();

      return (
        fullName.includes(search) ||
        sport.includes(search) ||
        batch.includes(search) ||
        coach.includes(search) ||
        email.includes(search) ||
        mobile.includes(search)
      );

    });

  }, [students, searchTerm]);


  // ==========================================================
  // TOGGLE STUDENT DETAILS
  // ==========================================================

  const toggleStudentDetails = (playerId) => {

    setExpandedStudent((previous) =>
      previous === playerId
        ? null
        : playerId
    );

  };


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
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
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div
        style={{
          padding: "30px",
          minHeight: "calc(100vh - 82px)",
        }}
      >

        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "50px",
            textAlign: "center",
            border: "1px solid #e7edf5",
          }}
        >

          <RefreshCw
            size={32}
            color="#2864e8"
            style={{
              margin: "0 auto 14px",
              animation: "spin 1s linear infinite",
            }}
          />

          <p
            style={{
              margin: 0,
              color: "#71849e",
              fontSize: "15px",
            }}
          >
            Loading student information...
          </p>

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
          padding: "30px",
          minHeight: "calc(100vh - 82px)",
        }}
      >

        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "40px",
            textAlign: "center",
            border: "1px solid #f0d1d1",
          }}
        >

          <AlertCircle
            size={42}
            color="#dc3545"
            style={{
              margin: "0 auto 14px",
            }}
          />

          <h3
            style={{
              margin: "0 0 8px",
              color: "#26364d",
            }}
          >
            Unable to Load Students
          </h3>

          <p
            style={{
              margin: "0 0 20px",
              color: "#71849e",
            }}
          >
            {error}
          </p>

          <button
            type="button"
            onClick={loadStudents}
            style={{
              border: "none",
              borderRadius: "8px",
              background: "#2864e8",
              color: "#fff",
              padding: "11px 20px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Try Again
          </button>

        </div>

      </div>

    );

  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (

    <div
      style={{
        padding: "30px",
        minHeight: "calc(100vh - 82px)",
        boxSizing: "border-box",
      }}
    >

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >

        <div>

          <h1
            style={{
              margin: 0,
              color: "#07152f",
              fontSize: "28px",
              fontWeight: "600",
            }}
          >
            My Children
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#71849e",
              fontSize: "14px",
            }}
          >
            View information about your registered children.
          </p>

        </div>


        {/* STUDENT COUNT */}

        <div
          style={{
            background: "#fff",
            border: "1px solid #e4eaf2",
            borderRadius: "10px",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >

          <Users
            size={20}
            color="#2864e8"
          />

          <span
            style={{
              color: "#52647d",
              fontSize: "14px",
            }}
          >
            Children
          </span>

          <strong
            style={{
              color: "#07152f",
              fontSize: "18px",
            }}
          >
            {students.length}
          </strong>

        </div>

      </div>


      {/* ======================================================
          SEARCH
      ======================================================= */}

      <div
        style={{
          background: "#fff",
          border: "1px solid #e4eaf2",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "24px",
        }}
      >

        <div
          style={{
            position: "relative",
            maxWidth: "520px",
          }}
        >

          <Search
            size={19}
            color="#8291a8"
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search by name, sport, batch, coach..."
            style={{
              width: "100%",
              height: "44px",
              boxSizing: "border-box",
              border: "1px solid #dbe3ee",
              borderRadius: "8px",
              padding: "0 14px 0 42px",
              outline: "none",
              fontSize: "14px",
              color: "#26364d",
              background: "#fff",
            }}
          />

        </div>

      </div>


      {/* ======================================================
          NO STUDENTS
      ======================================================= */}

      {students.length === 0 ? (

        <div
          style={{
            background: "#fff",
            border: "1px solid #e4eaf2",
            borderRadius: "14px",
            padding: "60px 30px",
            textAlign: "center",
          }}
        >

          <Users
            size={48}
            color="#9aa9bd"
            style={{
              margin: "0 auto 16px",
            }}
          />

          <h3
            style={{
              margin: "0 0 8px",
              color: "#26364d",
            }}
          >
            No Children Found
          </h3>

          <p
            style={{
              margin: 0,
              color: "#71849e",
              fontSize: "14px",
            }}
          >
            No students are currently linked to your account.
          </p>

        </div>

      ) : filteredStudents.length === 0 ? (

        <div
          style={{
            background: "#fff",
            border: "1px solid #e4eaf2",
            borderRadius: "14px",
            padding: "50px 30px",
            textAlign: "center",
          }}
        >

          <Search
            size={42}
            color="#9aa9bd"
            style={{
              margin: "0 auto 14px",
            }}
          />

          <h3
            style={{
              margin: "0 0 8px",
              color: "#26364d",
            }}
          >
            No Matching Student
          </h3>

          <p
            style={{
              margin: 0,
              color: "#71849e",
              fontSize: "14px",
            }}
          >
            Try searching with a different name, sport,
            batch or coach.
          </p>

        </div>

      ) : (

        /* =====================================================
           STUDENT CARDS
        ====================================================== */

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "20px",
          }}
        >

          {filteredStudents.map((student) => {

            const isExpanded =
              expandedStudent === student.playerId;

            const fullName =
              `${student.firstName || ""} ${student.lastName || ""}`
                .trim();


            return (

              <div
                key={student.playerId}
                style={{
                  background: "#fff",
                  border: "1px solid #e4eaf2",
                  borderRadius: "14px",
                  overflow: "hidden",
                  boxShadow:
                    "0 2px 8px rgba(26, 46, 78, 0.04)",
                }}
              >

                {/* =================================================
                    CARD HEADER
                ================================================= */}

                <div
                  style={{
                    padding: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "15px",
                    borderBottom:
                      "1px solid #edf1f6",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      minWidth: 0,
                    }}
                  >

                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        background: "#e9f0ff",
                        color: "#2864e8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >

                      <User size={25} />

                    </div>


                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >

                      <h3
                        style={{
                          margin: 0,
                          color: "#07152f",
                          fontSize: "18px",
                          fontWeight: "600",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fullName || "Student"}
                      </h3>


                      <p
                        style={{
                          margin: "5px 0 0",
                          color: "#71849e",
                          fontSize: "13px",
                        }}
                      >
                        Player ID: {student.playerId}
                      </p>

                    </div>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      toggleStudentDetails(
                        student.playerId
                      )
                    }
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      border: "1px solid #dfe6ef",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >

                    {isExpanded ? (
                      <ChevronUp
                        size={20}
                        color="#596b84"
                      />
                    ) : (
                      <ChevronDown
                        size={20}
                        color="#596b84"
                      />
                    )}

                  </button>

                </div>


                {/* =================================================
                    BASIC INFORMATION
                ================================================= */}

                <div
                  style={{
                    padding: "18px 20px",
                  }}
                >

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(2, minmax(0, 1fr))",
                      gap: "14px",
                    }}
                  >

                    {/* SPORT */}

                    <InfoItem
                      icon={<Dumbbell size={17} />}
                      label="Sport"
                      value={student.sportName}
                    />


                    {/* BATCH */}

                    <InfoItem
                      icon={<GraduationCap size={17} />}
                      label="Batch"
                      value={student.batchName}
                    />


                    {/* COACH */}

                    <InfoItem
                      icon={<User size={17} />}
                      label="Coach"
                      value={student.coachName}
                    />


                    {/* AGE */}

                    <InfoItem
                      icon={<Calendar size={17} />}
                      label="Age"
                      value={
                        student.age != null
                          ? `${student.age} years`
                          : "-"
                      }
                    />

                  </div>


                  {/* =================================================
                      EXPANDED DETAILS
                  ================================================= */}

                  {isExpanded && (

                    <div
                      style={{
                        marginTop: "20px",
                        paddingTop: "18px",
                        borderTop:
                          "1px solid #edf1f6",
                      }}
                    >

                      <h4
                        style={{
                          margin: "0 0 15px",
                          color: "#26364d",
                          fontSize: "15px",
                          fontWeight: "600",
                        }}
                      >
                        Student Information
                      </h4>


                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(2, minmax(0, 1fr))",
                          gap: "15px",
                        }}
                      >

                        {/* DATE OF BIRTH */}

                        <InfoItem
                          icon={<Calendar size={17} />}
                          label="Date of Birth"
                          value={formatDate(
                            student.dateOfBirth
                          )}
                        />


                        {/* GENDER */}

                        <InfoItem
                          icon={<User size={17} />}
                          label="Gender"
                          value={student.gender}
                        />


                        {/* MOBILE */}

                        <InfoItem
                          icon={<Phone size={17} />}
                          label="Mobile"
                          value={
                            student.playerMobileNo
                          }
                        />


                        {/* EMAIL */}

                        <InfoItem
                          icon={<Mail size={17} />}
                          label="Email"
                          value={
                            student.playerEmail
                          }
                        />


                        {/* BATCH ID */}

                        <InfoItem
                          icon={<GraduationCap size={17} />}
                          label="Batch ID"
                          value={student.batchId}
                        />


                        {/* COACH ID */}

                        <InfoItem
                          icon={<User size={17} />}
                          label="Coach ID"
                          value={student.coachId}
                        />

                        {/* COACH EMAIL */}

                        <InfoItem
                          icon={<Mail size={17} />}
                          label="Coach Email"
                          value={student.coachEmail}
                        />


                        {/* BATCH START */}

                        <InfoItem
                          icon={<Calendar size={17} />}
                          label="Batch Start"
                          value={formatDate(
                            student.batchStartDate
                          )}
                        />


                        {/* BATCH END */}

                        <InfoItem
                          icon={<Calendar size={17} />}
                          label="Batch End"
                          value={formatDate(
                            student.batchEndDate
                          )}
                        />


                        {/* TRAINING DAYS */}

                        <InfoItem
                          icon={<Calendar size={17} />}
                          label="Training Days"
                          value={
                            student.trainingDays
                          }
                        />

                      </div>

                    </div>

                  )}

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                  style={{
                    background: "#f8fafc",
                    padding: "12px 20px",
                    borderTop:
                      "1px solid #edf1f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#71849e",
                    }}
                  >
                    Sport
                  </span>

                  <span
                    style={{
                      background: "#e9f0ff",
                      color: "#2864e8",
                      borderRadius: "20px",
                      padding: "5px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {student.sportName || "Not Assigned"}
                  </span>

                </div>

              </div>

            );

          })}

        </div>

      )}

    </div>

  );

};


// ============================================================
// INFO ITEM COMPONENT
// ============================================================

const InfoItem = ({
  icon,
  label,
  value,
}) => {

  return (

    <div
      style={{
        minWidth: 0,
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          color: "#8090a7",
          fontSize: "12px",
          marginBottom: "5px",
        }}
      >

        {icon}

        <span>
          {label}
        </span>

      </div>


      <div
        style={{
          color: "#26364d",
          fontSize: "13px",
          fontWeight: "500",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={value || "-"}
      >
        {value || "-"}
      </div>

    </div>

  );

};


export default ParentManagement;