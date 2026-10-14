import React, { useEffect, useState } from "react";
import {
  ClipboardCheck,
  History,
  Calendar,
  LogOut,
  Menu,
  Clock,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import CoachAttendanceService from "../../Pages/coach/CoachAttendanceService.js";


const MOBILE_BREAKPOINT = 768;

const CoachLayout = () => {

  // ==========================================================
  // STATES
  // ==========================================================

  const [isMobile, setIsMobile] =
    useState(window.innerWidth <= MOBILE_BREAKPOINT);

  // Mobile -> closed by default | Desktop -> open by default
  const [sidebarOpen, setSidebarOpen] =
    useState(window.innerWidth > MOBILE_BREAKPOINT);

  const [todayAttendance, setTodayAttendance] =
    useState(null);

  const [attendanceLoading, setAttendanceLoading] =
    useState(true);

  const navigate = useNavigate();


  // ==========================================================
  // RESPONSIVE HANDLING
  // ==========================================================

  useEffect(() => {

    const handleResize = () => {

      const mobile =
        window.innerWidth <= MOBILE_BREAKPOINT;

      setIsMobile((previous) => {

        if (previous !== mobile) {
          setSidebarOpen(!mobile);
        }

        return mobile;

      });

    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };

  }, []);


  // Lock page scroll behind the sidebar on mobile
  useEffect(() => {

    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };

  }, [isMobile, sidebarOpen]);


  // On mobile the sidebar always shows full labels when open
  const showLabels = isMobile ? true : sidebarOpen;


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


      // PUNCH OUT
      if (
        todayAttendance?.punchInTime &&
        !todayAttendance?.punchOutTime
      ) {

        response =
          await CoachAttendanceService.punchOut();

      }

      // PUNCH IN
      else if (!todayAttendance) {

        response =
          await CoachAttendanceService.punchIn();

      }

      // ALREADY COMPLETED
      else {

        return;

      }


      // UPDATE SIDEBAR STATE IMMEDIATELY
      if (response?.data) {

        setTodayAttendance(response.data);

      } else {

        setTodayAttendance(response);

      }


      // UPDATE ATTENDANCE PAGE
      window.dispatchEvent(
        new Event("attendanceUpdated")
      );


    } catch (error) {

      console.error(
        "Attendance action error:",
        error
      );


      // ACADEMY WI-FI / NETWORK ERROR
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


      // REFRESH STATE AFTER ERROR
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

    if (!todayAttendance) {
      return true;
    }

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
      name: "Player Injury Email",
      path: "/coach/player-mails",
      icon: Calendar,
    },

    {
      name: "History Batches",
      path: "/coach/history-batches",
      icon: Calendar,
    },

    {
      name: "Performace Cards",
      path: "/coach/performance-card",
      icon: Calendar,
    },

  ];


  // ==========================================================
  // SIDEBAR STYLE (desktop + mobile)
  // ==========================================================

  const sidebarStyle = isMobile
    ? {
        width: "270px",
        maxWidth: "82vw",
        transform: sidebarOpen
          ? "translateX(0)"
          : "translateX(-100%)",
        transition: "transform 0.25s ease",
        boxShadow: sidebarOpen
          ? "4px 0 24px rgba(0,0,0,0.35)"
          : "none",
        zIndex: 2000,
      }
    : {
        width: sidebarOpen ? "270px" : "80px",
        transition: "width 0.2s ease",
        zIndex: 1000,
      };


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
          MOBILE BACKDROP
      ====================================================== */}

      {isMobile && sidebarOpen && (

        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7, 21, 47, 0.55)",
            zIndex: 1500,
          }}
        />

      )}


      {/* =====================================================
          SIDEBAR (fixed / sticky - does not scroll with page)
      ====================================================== */}

      <aside
        style={{
          ...sidebarStyle,
          background: "#0d172c",
          color: "#fff",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          overflow: "hidden",
        }}
      >

        {/* LOGO */}

        <div
          style={{
            padding: "28px 24px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
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


          {showLabels && (

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


        {/* ATTENDANCE BUTTON */}

        {showLabels &&
          shouldShowAttendanceButton() && (

          <div
            style={{
              padding: "18px 16px 0",
              flexShrink: 0,
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


        {/* SIDEBAR MENU */}

        <nav
          style={{
            padding: "24px 16px",
            flex: 1,
            overflowY: "auto", // only scrolls if the phone screen is very short
          }}
        >

          <div
            style={{
              color: "#7184a3",
              fontSize: "12px",
              marginBottom: "14px",
              paddingLeft: showLabels
                ? "20px"
                : "0",
              textAlign: showLabels
                ? "left"
                : "center",
            }}
          >

            {showLabels ? "OVERVIEW" : "•••"}

          </div>


          {navigationItems.map((item) => {

            const Icon = item.icon;

            return (

              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/coach"}
                onClick={() => {
                  if (isMobile) {
                    setSidebarOpen(false);
                  }
                }}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: showLabels
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

                <Icon size={21} style={{ flexShrink: 0 }} />

                {showLabels && item.name}

              </NavLink>

            );

          })}

        </nav>


        {/* LOGOUT */}

        <div
          style={{
            padding: "18px 16px 24px",
            borderTop:
              "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
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
              justifyContent: showLabels
                ? "flex-start"
                : "center",
              gap: "12px",
              fontSize: "15px",
              fontWeight: "500",
            }}
          >

            <LogOut size={20} />

            {showLabels && "Logout"}

          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN AREA
      ====================================================== */}

      <main
        style={{
          marginLeft: isMobile
            ? "0"
            : sidebarOpen
              ? "270px"
              : "80px",
          flex: 1,
          width: "100%",
          minWidth: 0,
          minHeight: "100vh",
          transition: "margin-left 0.2s ease",
        }}
      >

        {/* HEADER */}

        <header
          style={{
            minHeight: isMobile ? "auto" : "82px",
            background: "#fff",
            borderBottom: "1px solid #e8edf3",
            display: "flex",
            alignItems: "center",
            padding: isMobile
              ? "16px 16px 18px"
              : "0 30px",
            boxSizing: "border-box",
            gap: isMobile ? "12px" : "18px",
          }}
        >

          {/* THREE LINE BUTTON (top-left) */}

          <button
            type="button"
            aria-label="Toggle sidebar"
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
              flexShrink: 0,
            }}
          >

            <Menu
              size={26}
              color="#596b84"
            />

          </button>


          <div style={{ minWidth: 0 }}>

            <h2
              style={{
                margin: 0,
                color: "#07152f",
                fontSize: isMobile ? "22px" : "30px",
                fontWeight: "600",
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}
            >
              Welcome, {username || "Coach"}
            </h2>

            <p
              style={{
                margin: isMobile ? "8px 0 0" : "5px 0 0",
                color: "#71849e",
                fontSize: isMobile ? "13px" : "14px",
                lineHeight: 1.4,
              }}
            >
              Manage your coaching and daily operations
            </p>

          </div>

        </header>


        {/* PAGE CONTENT */}

        <Outlet />

      </main>

    </div>

  );

};


export default CoachLayout;