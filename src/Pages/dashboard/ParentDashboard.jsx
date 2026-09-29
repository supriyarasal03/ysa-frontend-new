import React, { useEffect, useState } from "react";

import {
  Users,
  User,
  Calendar,
  Dumbbell,
  GraduationCap,
  ClipboardCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Mail,
} from "lucide-react";

import ParentService from "../parent/parentService";


const ParentDashboard = () => {

  // ==========================================================
  // STATES
  // ==========================================================

  const [students, setStudents] = useState([]);

  const [studentAttendance, setStudentAttendance] = useState({});

  const [studentHistory, setStudentHistory] = useState({});

  const [loading, setLoading] = useState(true);

  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [error, setError] = useState("");


  // ==========================================================
  // LOAD STUDENTS
  // ==========================================================

  const loadStudents = async () => {

    try {

      setLoading(true);
      setError("");

      const data =
        await ParentService.getMyStudents();

      setStudents(
        Array.isArray(data) ? data : []
      );

    } catch (error) {

      console.error(
        "Parent students loading error:",
        error
      );

      setError(
        error?.response?.data?.message ||
        "Unable to load your children."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // LOAD ATTENDANCE FOR ALL CHILDREN
  // ==========================================================

  const loadAllAttendance = async (studentList) => {

    if (!studentList || studentList.length === 0) {
      return;
    }

    try {

      setAttendanceLoading(true);

      const attendanceResults = {};
      const historyResults = {};


      await Promise.all(

        studentList.map(async (student) => {

          const playerId = student.playerId;

          try {

            const [
              attendance,
              history,
            ] = await Promise.all([

              ParentService.getStudentAttendance(
                playerId
              ),

              ParentService.getStudentAttendanceHistory(
                playerId
              ),

            ]);


            attendanceResults[playerId] =
              attendance;

            historyResults[playerId] =
              Array.isArray(history)
                ? history
                : [];

          } catch (error) {

            console.error(
              `Attendance loading failed for player ${playerId}:`,
              error
            );

            attendanceResults[playerId] = null;

            historyResults[playerId] = [];

          }

        })

      );


      setStudentAttendance(
        attendanceResults
      );

      setStudentHistory(
        historyResults
      );

    } finally {

      setAttendanceLoading(false);

    }

  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        setLoading(true);

        setError("");

        const data =
          await ParentService.getMyStudents();

        const studentList =
          Array.isArray(data) ? data : [];

        setStudents(studentList);

        await loadAllAttendance(
          studentList
        );

      } catch (error) {

        console.error(
          "Parent dashboard loading error:",
          error
        );

        setError(
          error?.response?.data?.message ||
          "Unable to load parent dashboard."
        );

      } finally {

        setLoading(false);

      }

    };


    loadDashboard();

  }, []);


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {

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
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {

    try {

      setLoading(true);
      setError("");

      const data =
        await ParentService.getMyStudents();

      const studentList =
        Array.isArray(data) ? data : [];

      setStudents(studentList);

      await loadAllAttendance(
        studentList
      );

    } catch (error) {

      console.error(
        "Parent dashboard refresh error:",
        error
      );

      setError(
        error?.response?.data?.message ||
        "Unable to refresh dashboard."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div
        style={{
          padding: "30px",
          minHeight:
            "calc(100vh - 82px)",
        }}
      >

        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "60px",
            textAlign: "center",
            border:
              "1px solid #e4eaf2",
          }}
        >

          <RefreshCw
            size={34}
            color="#2864e8"
            style={{
              margin:
                "0 auto 15px",
            }}
          />

          <p
            style={{
              margin: 0,
              color: "#71849e",
              fontSize: "15px",
            }}
          >
            Loading parent dashboard...
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
          minHeight:
            "calc(100vh - 82px)",
        }}
      >

        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "50px",
            textAlign: "center",
            border:
              "1px solid #f0d1d1",
          }}
        >

          <AlertCircle
            size={44}
            color="#dc3545"
            style={{
              margin:
                "0 auto 15px",
            }}
          />

          <h3
            style={{
              margin:
                "0 0 8px",
              color: "#26364d",
            }}
          >
            Unable to Load Dashboard
          </h3>

          <p
            style={{
              margin:
                "0 0 20px",
              color: "#71849e",
            }}
          >
            {error}
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            style={{
              border: "none",
              borderRadius: "8px",
              background: "#2864e8",
              color: "#fff",
              padding:
                "11px 20px",
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
  // NO CHILDREN
  // ==========================================================

  if (students.length === 0) {

    return (

      <div
        style={{
          padding: "30px",
          minHeight:
            "calc(100vh - 82px)",
        }}
      >

        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "60px",
            textAlign: "center",
            border:
              "1px solid #e4eaf2",
          }}
        >

          <Users
            size={48}
            color="#9aa9bd"
            style={{
              margin:
                "0 auto 15px",
            }}
          />

          <h2
            style={{
              margin:
                "0 0 8px",
              color: "#26364d",
            }}
          >
            No Children Found
          </h2>

          <p
            style={{
              margin: 0,
              color: "#71849e",
            }}
          >
            No students are currently
            linked to your account.
          </p>

        </div>

      </div>

    );

  }


  // ==========================================================
  // MAIN DASHBOARD
  // ==========================================================

  return (

    <div
      style={{
        padding: "30px",
        minHeight:
          "calc(100vh - 82px)",
        boxSizing: "border-box",
      }}
    >

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "28px",
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
            Parent Dashboard
          </h1>

          <p
            style={{
              margin:
                "7px 0 0",
              color: "#71849e",
              fontSize: "14px",
            }}
          >
            Monitor your children's
            training and attendance.
          </p>

        </div>


        {/* CHILD COUNT */}

        <div
          style={{
            background: "#fff",
            border:
              "1px solid #e4eaf2",
            borderRadius: "10px",
            padding:
              "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >

          <Users
            size={21}
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
          CHILDREN
      ======================================================= */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >

        {students.map((student) => {

          const playerId =
            student.playerId;

          const fullName =
            `${student.firstName || ""} ${student.lastName || ""}`
              .trim();

          const attendance =
            studentAttendance[playerId];

          const history =
            studentHistory[playerId] || [];


          return (

            <div
              key={playerId}
              style={{
                background: "#fff",
                border:
                  "1px solid #e4eaf2",
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow:
                  "0 2px 8px rgba(26,46,78,0.04)",
              }}
            >

              {/* =================================================
                  STUDENT HEADER
              ================================================= */}

              <div
                style={{
                  padding: "22px 24px",
                  borderBottom:
                    "1px solid #edf1f6",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >

                  <div
                    style={{
                      width: "54px",
                      height: "54px",
                      borderRadius: "50%",
                      background:
                        "#e9f0ff",
                      color: "#2864e8",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      flexShrink: 0,
                    }}
                  >

                    <User size={26} />

                  </div>


                  <div>

                    <h2
                      style={{
                        margin: 0,
                        color: "#07152f",
                        fontSize: "21px",
                        fontWeight: "600",
                      }}
                    >
                      {fullName ||
                        "Student"}
                    </h2>

                    <p
                      style={{
                        margin:
                          "5px 0 0",
                        color:
                          "#71849e",
                        fontSize: "14px",
                      }}
                    >
                      Player ID:{" "}
                      {playerId}
                    </p>

                  </div>

                </div>


                {/* SPORT */}

                <div
                  style={{
                    background:
                      "#e9f0ff",
                    color: "#2864e8",
                    padding:
                      "8px 15px",
                    borderRadius:
                      "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "7px",
                  }}
                >

                  <Dumbbell size={16} />

                  {student.sportName ||
                    "Sport not assigned"}

                </div>

              </div>


              {/* =================================================
                  STUDENT INFORMATION
              ================================================= */}

              <div
                style={{
                  padding: "22px 24px",
                }}
              >

                <h3
                  style={{
                    margin:
                      "0 0 16px",
                    color: "#26364d",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Student & Batch Information
                </h3>


                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(190px, 1fr))",
                    gap: "18px",
                  }}
                >

                  <InfoCard
                    icon={
                      <Dumbbell size={18} />
                    }
                    label="Sport"
                    value={
                      student.sportName
                    }
                  />

                  <InfoCard
                    icon={
                      <GraduationCap
                        size={18}
                      />
                    }
                    label="Batch"
                    value={
                      student.batchName
                    }
                  />

                  <InfoCard
                    icon={
                      <User size={18} />
                    }
                    label="Coach"
                    value={
                      student.coachName
                    }
                  />

                  <InfoCard
                    icon={
                      <Mail size={18} />
                    }
                    label="Coach Email"
                    value={
                      student.coachEmail || "Not available"
                    }
                  />

                  <InfoCard
                    icon={
                      <Calendar
                        size={18}
                      />
                    }
                    label="Batch Start"
                    value={formatDate(
                      student.batchStartDate
                    )}
                  />

                  <InfoCard
                    icon={
                      <Calendar
                        size={18}
                      />
                    }
                    label="Batch End"
                    value={formatDate(
                      student.batchEndDate
                    )}
                  />

                  <InfoCard
                    icon={
                      <Calendar
                        size={18}
                      />
                    }
                    label="Training Days"
                    value={
                      student.trainingDays
                    }
                  />

                </div>

              </div>


              {/* =================================================
                  ATTENDANCE
              ================================================= */}

              <div
                style={{
                  background:
                    "#f8fafc",
                  padding:
                    "22px 24px",
                  borderTop:
                    "1px solid #edf1f6",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    marginBottom:
                      "18px",
                    gap: "15px",
                    flexWrap:
                      "wrap",
                  }}
                >

                  <div>

                    <h3
                      style={{
                        margin: 0,
                        color:
                          "#26364d",
                        fontSize:
                          "18px",
                        fontWeight:
                          "600",
                      }}
                    >
                      Attendance
                    </h3>

                    <p
                      style={{
                        margin:
                          "5px 0 0",
                        color:
                          "#71849e",
                        fontSize:
                          "13px",
                      }}
                    >
                      Complete attendance
                      record for this child
                    </p>

                  </div>


                  {attendanceLoading && (

                    <RefreshCw
                      size={19}
                      color="#2864e8"
                    />

                  )}

                </div>


                {/* ATTENDANCE SUMMARY */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "14px",
                    marginBottom:
                      "22px",
                  }}
                >

                  <AttendanceCard
                    title="Total Training Days"
                    value={
                      attendance?.totalTrainingDays ??
                      0
                    }
                    icon={
                      <Calendar size={21} />
                    }
                  />

                  <AttendanceCard
                    title="Present"
                    value={
                      attendance?.presentDays ??
                      0
                    }
                    icon={
                      <CheckCircle
                        size={21}
                      />
                    }
                  />

                  <AttendanceCard
                    title="Absent"
                    value={
                      attendance?.absentDays ??
                      0
                    }
                    icon={
                      <XCircle size={21} />
                    }
                  />

                  <AttendanceCard
                    title="Attendance"
                    value={
                      attendance?.attendancePercentage !=
                      null
                        ? `${attendance.attendancePercentage}%`
                        : "0%"
                    }
                    icon={
                      <ClipboardCheck
                        size={21}
                      />
                    }
                  />

                </div>


                {/* =================================================
                    ATTENDANCE HISTORY
                ================================================= */}

                <div
                  style={{
                    background: "#fff",
                    border:
                      "1px solid #e4eaf2",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >

                  <div
                    style={{
                      padding:
                        "16px 18px",
                      borderBottom:
                        "1px solid #edf1f6",
                    }}
                  >

                    <h4
                      style={{
                        margin: 0,
                        color:
                          "#26364d",
                        fontSize:
                          "15px",
                        fontWeight:
                          "600",
                      }}
                    >
                      Attendance History
                    </h4>

                  </div>


                  <div
                    style={{
                      overflowX:
                        "auto",
                    }}
                  >

                    <table
                      style={{
                        width: "100%",
                        borderCollapse:
                          "collapse",
                        minWidth:
                          "700px",
                      }}
                    >

                      <thead>

                        <tr
                          style={{
                            background:
                              "#f8fafc",
                          }}
                        >

                          <TableHeader>
                            Date
                          </TableHeader>

                          <TableHeader>
                            Day
                          </TableHeader>

                          <TableHeader>
                            Status
                          </TableHeader>

                          <TableHeader>
                            Punch In
                          </TableHeader>

                          <TableHeader>
                            Punch Out
                          </TableHeader>

                        </tr>

                      </thead>


                      <tbody>

                        {history.length === 0 ? (

                          <tr>

                            <td
                              colSpan="5"
                              style={{
                                padding:
                                  "30px",
                                textAlign:
                                  "center",
                                color:
                                  "#71849e",
                                fontSize:
                                  "14px",
                              }}
                            >
                              No attendance
                              records found.
                            </td>

                          </tr>

                        ) : (

                          history.map(
                            (
                              record,
                              index
                            ) => (

                              <tr
                                key={`${playerId}-${record.attendanceDate}-${index}`}
                                style={{
                                  borderTop:
                                    "1px solid #edf1f6",
                                }}
                              >

                                <TableCell>
                                  {formatDate(
                                    record.attendanceDate
                                  )}
                                </TableCell>

                                <TableCell>
                                  {record.day ||
                                    "-"}
                                </TableCell>

                                <TableCell>

                                  <span
                                    style={{
                                      display:
                                        "inline-flex",
                                      alignItems:
                                        "center",
                                      gap: "5px",
                                      padding:
                                        "5px 10px",
                                      borderRadius:
                                        "20px",
                                      fontSize:
                                        "12px",
                                      fontWeight:
                                        "600",
                                      background:
                                        record.status ===
                                        "PRESENT"
                                          ? "#e8f7ee"
                                          : "#fdecec",
                                      color:
                                        record.status ===
                                        "PRESENT"
                                          ? "#21874b"
                                          : "#d33a3a",
                                    }}
                                  >

                                    {record.status ===
                                    "PRESENT" ? (

                                      <CheckCircle
                                        size={14}
                                      />

                                    ) : (

                                      <XCircle
                                        size={14}
                                      />

                                    )}

                                    {record.status ||
                                      "-"}

                                  </span>

                                </TableCell>

                                <TableCell>
                                  {record.punchInTime ||
                                    "-"}
                                </TableCell>

                                <TableCell>
                                  {record.punchOutTime ||
                                    "-"}
                                </TableCell>

                              </tr>

                            )
                          )

                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

};


// ============================================================
// INFO CARD
// ============================================================

const InfoCard = ({
  icon,
  label,
  value,
}) => {

  return (

    <div
      style={{
        background: "#f8fafc",
        border:
          "1px solid #e7edf5",
        borderRadius: "10px",
        padding: "14px",
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          color: "#8090a7",
          fontSize: "12px",
          marginBottom: "7px",
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
          fontSize: "14px",
          fontWeight: "600",
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </div>

    </div>

  );

};


// ============================================================
// ATTENDANCE CARD
// ============================================================

const AttendanceCard = ({
  title,
  value,
  icon,
}) => {

  return (

    <div
      style={{
        background: "#fff",
        border:
          "1px solid #e4eaf2",
        borderRadius: "10px",
        padding: "16px",
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: "10px",
        }}
      >

        <div>

          <p
            style={{
              margin: 0,
              color: "#8090a7",
              fontSize: "12px",
            }}
          >
            {title}
          </p>

          <p
            style={{
              margin:
                "7px 0 0",
              color: "#07152f",
              fontSize: "22px",
              fontWeight: "700",
            }}
          >
            {value}
          </p>

        </div>


        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "9px",
            background:
              "#e9f0ff",
            color: "#2864e8",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
          }}
        >
          {icon}
        </div>

      </div>

    </div>

  );

};


// ============================================================
// TABLE HEADER
// ============================================================

const TableHeader = ({
  children,
}) => {

  return (

    <th
      style={{
        padding:
          "12px 16px",
        textAlign: "left",
        color: "#71849e",
        fontSize: "12px",
        fontWeight: "600",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>

  );

};


// ============================================================
// TABLE CELL
// ============================================================

const TableCell = ({
  children,
}) => {

  return (

    <td
      style={{
        padding:
          "13px 16px",
        color: "#26364d",
        fontSize: "13px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>

  );

};


export default ParentDashboard;