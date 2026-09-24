import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarCheck2,
  ClipboardCheck,
  History,
  Calendar,
  LogOut,
  Menu,
  X,
  Clock,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import CoachAttendanceService from "../../Pages/coach/CoachAttendanceService.js";


const CoachLayout = () => {

  // ==========================================================
  // STATES
  // ==========================================================

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [todayAttendance, setTodayAttendance] =
    useState(null);

  const [attendanceLoading, setAttendanceLoading] =
    useState(true);

  const navigate = useNavigate();


  // ==========================================================
  // GET LOGGED-IN USERNAME
  // ==========================================================

  const getLoggedInUsername = () => {

    try {

      const token =
        localStorage.getItem("token");

      if (!token) {
        return "Coach";
      }

      const payload =
        JSON.parse(
          atob(
            token
              .split(".")[1]
              .replace(/-/g, "+")
              .replace(/_/g, "/")
          )
        );

      return payload?.sub || "Coach";

    } catch (error) {

      console.error(
        "Unable to read username:",
        error
      );

      return "Coach";
    }
  };


  const username =
    getLoggedInUsername();


  // ==========================================================
  // LOAD TODAY ATTENDANCE
  // ==========================================================

  const loadTodayAttendance = async () => {

    try {

      const response =
        await CoachAttendanceService.getTodayAttendance();

      if (response?.data) {

        setTodayAttendance(response.data);

      } else {

        setTodayAttendance(response);

      }

    } catch (error) {

      if (error?.response?.status === 404) {

        setTodayAttendance(null);

      } else {

        console.error(
          "Attendance loading error:",
          error
        );

      }

    } finally {

      setAttendanceLoading(false);

    }

  };


  // ==========================================================
  // INITIAL ATTENDANCE LOAD
  // ==========================================================

  useEffect(() => {

    loadTodayAttendance();

  }, []);


  // ==========================================================
  // ATTENDANCE UPDATE EVENT
  // ==========================================================

  useEffect(() => {

    const handleAttendanceUpdated = () => {

      loadTodayAttendance();

    };

    window.addEventListener(
      "attendanceUpdated",
      handleAttendanceUpdated
    );

    return () => {

      window.removeEventListener(
        "attendanceUpdated",
        handleAttendanceUpdated
      );

    };

  }, []);


  // ==========================================================
  // PUNCH IN / PUNCH OUT
  //
  // Punch In -> Punch Out -> Hide
  // ==========================================================

  const handleAttendance = async () => {

    if (attendanceLoading) {
      return;
    }


    try {

      setAttendanceLoading(true);

      let response;


      // ======================================================
      // PUNCH OUT
      // ======================================================

      if (
        todayAttendance?.punchInTime &&
        !todayAttendance?.punchOutTime
      ) {

        response =
          await CoachAttendanceService.punchOut();

      }


      // ======================================================
      // PUNCH IN
      // ======================================================

      else if (!todayAttendance) {

        response =
          await CoachAttendanceService.punchIn();

      }


      // ======================================================
      // ALREADY COMPLETED
      // ======================================================

      else {

        return;

      }


      // ======================================================
      // UPDATE SIDEBAR STATE IMMEDIATELY
      // ======================================================

      if (response?.data) {

        setTodayAttendance(response.data);

      } else {

        setTodayAttendance(response);

      }


      // ======================================================
      // UPDATE ATTENDANCE PAGE
      // ======================================================

      window.dispatchEvent(
        new Event("attendanceUpdated")
      );


    } catch (error) {

      console.error(
        "Attendance action error:",
        error
      );


      // ======================================================
      // ACADEMY WI-FI / NETWORK ERROR
      // ======================================================

      if (
        error?.code === "ERR_NETWORK" ||
        error?.code === "ECONNABORTED" ||
        error?.code === "ETIMEDOUT" ||
        error?.message === "Network Error" ||
        error?.response?.status === 403
      ) {

        window.alert(
          "Attendance can only be marked from Academy Wi-Fi.\n\n" +
          "Please connect to Academy Wi-Fi and try again."
        );

      } else {

        const message =
          error?.response?.data?.message ||
          "Unable to mark attendance. Please try again.";

        window.alert(message);

      }


      // ======================================================
      // REFRESH STATE AFTER ERROR
      // ======================================================

      await loadTodayAttendance();

    } finally {

      setAttendanceLoading(false);

    }

  };


  // ==========================================================
  // ATTENDANCE BUTTON VISIBILITY
  //
  // Punch In -> Punch Out -> Hide after Punch Out
  // ==========================================================

  const shouldShowAttendanceButton = () => {

    if (attendanceLoading) {
      return true;
    }


    // --------------------------------------------------------
    // No attendance yet
    // --------------------------------------------------------

    if (!todayAttendance) {
      return true;
    }


    // --------------------------------------------------------
    // Show only when punched in but not punched out
    // --------------------------------------------------------

    return !!(
      todayAttendance.punchInTime &&
      !todayAttendance.punchOutTime
    );

  };


  // ==========================================================
  // ATTENDANCE BUTTON TEXT
  // ==========================================================

  const getAttendanceButtonText = () => {

    if (attendanceLoading) {

      return "Processing...";

    }


    if (!todayAttendance) {

      return "Punch In";

    }


    if (
      todayAttendance.punchInTime &&
      !todayAttendance.punchOutTime
    ) {

      return "Punch Out";

    }


    return "Punch In";

  };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {

    localStorage.removeItem("token");

    navigate("/login");

  };


  // ==========================================================
  // NAVIGATION
  // Same visual structure as Admin Layout
  // ==========================================================

  const navigationItems = [

    

    


    {
      name: "Player Attendance Management",
      path: "/coach/player-attendance",
      icon: ClipboardCheck,
    },


    {
      name: "Player Attendance Records",
      path: "/coach/Playee-attendance-history",
      icon: History,
    },



    {
  name: "Leave",
  path: "/coach/leave-requests",
  icon: Calendar,
},



{
  name:"History Batches",

  path:"/coach/history-batches",
  icon:Calendar,

},



{
  name:"Performace Cards",
  path:"/coach/performance-card",
  icon:Calendar,

}


  ];


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#f3f6fa",
        display: "flex",
      }}
    >

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        style={{
          width: sidebarOpen ? "270px" : "80px",
          background: "#0d172c",
          color: "#fff",
          minHeight: "100vh",
          transition: "width 0.2s ease",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >

        {/* ==================================================
            LOGO
        =================================================== */}

        <div
          style={{
            padding: "28px 24px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >

          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#2864e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "700",
              flexShrink: 0,
            }}
          >
            Y
          </div>


          {sidebarOpen && (

            <div>

              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                Yashashree Sports
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#8ca1c0",
                  marginTop: "4px",
                }}
              >
                {username || "Coach Panel"}
              </div>

            </div>

          )}

        </div>


        {/* ==================================================
            ATTENDANCE BUTTON

            Punch In
                ↓
            Punch Out
                ↓
            Hidden
        =================================================== */}

        {sidebarOpen &&
          shouldShowAttendanceButton() && (

          <div
            style={{
              padding: "18px 16px 0",
            }}
          >

            <button
              type="button"
              onClick={handleAttendance}
              disabled={attendanceLoading}
              style={{
                width: "60%",
                border: "none",
                borderRadius: "10px",
                padding: "12px 14px",
                background: "#1d2a40",
                color: "#fff",
                cursor: attendanceLoading
                  ? "not-allowed"
                  : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                fontSize: "15px",
                fontWeight: "600",
                opacity: attendanceLoading
                  ? 0.7
                  : 1,
              }}
            >

              <Clock size={19} />

              {getAttendanceButtonText()}

            </button>

          </div>

        )}


        {/* ==================================================
            SIDEBAR MENU
        =================================================== */}

        <nav
          style={{
            padding: "24px 16px",
            flex: 1,
          }}
        >

          <div
            style={{
              color: "#7184a3",
              fontSize: "12px",
              marginBottom: "14px",
              paddingLeft: sidebarOpen
                ? "20px"
                : "0",
              textAlign: sidebarOpen
                ? "left"
                : "center",
            }}
          >

            {sidebarOpen ? "OVERVIEW" : "•••"}

          </div>


          {navigationItems.map((item) => {

            const Icon = item.icon;

            return (

              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/coach"}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: sidebarOpen
                    ? "flex-start"
                    : "center",
                  gap: "14px",
                  padding: "14px 18px",
                  marginBottom: "7px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  color: isActive
                    ? "#fff"
                    : "#c4d0e2",
                  background: isActive
                    ? "#2864e8"
                    : "transparent",
                  fontSize: "15px",
                  fontWeight: isActive
                    ? "600"
                    : "500",
                })}
              >

                <Icon size={21} />

                {sidebarOpen && item.name}

              </NavLink>

            );

          })}

        </nav>


        {/* ==================================================
            LOGOUT
        =================================================== */}

        <div
          style={{
            padding: "18px 16px 24px",
            borderTop:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              border: "none",
              borderRadius: "10px",
              padding: "14px",
              background: "#1d2a40",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarOpen
                ? "flex-start"
                : "center",
              gap: "12px",
              fontSize: "15px",
              fontWeight: "500",
            }}
          >

            <LogOut size={20} />

            {sidebarOpen && "Logout"}

          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN AREA
      ====================================================== */}

      <main
        style={{
          marginLeft: sidebarOpen
            ? "270px"
            : "80px",
          width: "100%",
          minHeight: "100vh",
          transition: "margin-left 0.2s ease",
        }}
      >

        {/* ==================================================
            HEADER
        =================================================== */}

        <header
          style={{
            height: "82px",
            background: "#fff",
            borderBottom: "1px solid #e8edf3",
            display: "flex",
            alignItems: "center",
            padding: "0 30px",
            boxSizing: "border-box",
            gap: "18px",
          }}
        >

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(
                (previous) => !previous
              )
            }
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >

            {sidebarOpen ? (

              <X
                size={23}
                color="#596b84"
              />

            ) : (

              <Menu
                size={23}
                color="#596b84"
              />

            )}

          </button>


          <div>

            <h2
              style={{
                margin: 0,
                color: "#07152f",
                fontSize: "30px",
                fontWeight: "600",
              }}
            >
              Welcome, {username || "Coach"}
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#71849e",
                fontSize: "14px",
              }}
            >
              Manage your coaching and daily operations
            </p>

          </div>

        </header>


        {/* ==================================================
            PAGE CONTENT
        =================================================== */}

        <Outlet />

      </main>

    </div>

  );

};


export default CoachLayout;