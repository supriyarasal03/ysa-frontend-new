import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  LogOut,
  Menu,
  Bell,
  Clock,
  UserPlus,
  Mail,
  ArrowRightLeft,
} from "lucide-react";
import ReceptionistAttendanceService from "../../Pages/receptionist/ReceptionistAttendanceService";


const ReceptionistLayout = () => {

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [todayAttendance, setTodayAttendance] =
    useState(null);

  const [attendanceLoading, setAttendanceLoading] =
    useState(true);

  const [attendanceActionLoading, setAttendanceActionLoading] =
    useState(false);

  const navigate = useNavigate();


  // ==========================================================
  // NAVIGATION ITEMS
  // ==========================================================

  const navItems = [


    {
      name: "Players",
      path: "/receptionist/players",
      icon: Users,
    },

    {
      name: "Fees Collection",
      path: "/receptionist/fees",
      icon: CreditCard,
    },


    {
  name: "Leave",
  path: "/receptionist/leave",
  icon: Calendar,
},


{
  name: "Player Enquiries",
  path: "/receptionist/player-enquiries",
  icon: UserPlus,
},



{
  name: "Contact Enquiries",
  path: "/receptionist/ContactEnquiries",
  icon: Mail,
},



{
  name: "Batch Change",
  path: "/receptionist/batch-change",
  icon: ArrowRightLeft,
},

  ];


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");

  };


  // ==========================================================
  // LOAD TODAY ATTENDANCE
  // ==========================================================

  const loadTodayAttendance = async () => {

    try {

      setAttendanceLoading(true);

      const response =
        await ReceptionistAttendanceService
          .getTodayAttendance();

      setTodayAttendance(response);

    } catch (error) {

      if (error?.response?.status === 404) {

        setTodayAttendance(null);

      } else {

        console.error(
          "Today's attendance loading error:",
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
  // ==========================================================

  const handleAttendance = async () => {

    try {

      setAttendanceActionLoading(true);


      // ------------------------------------------------------
      // NO RECORD
      // ------------------------------------------------------

      if (!todayAttendance) {

        await ReceptionistAttendanceService.punchIn();

      }


      // ------------------------------------------------------
      // PUNCH OUT
      // ------------------------------------------------------

      else if (
        todayAttendance.punchInTime &&
        !todayAttendance.punchOutTime
      ) {

        await ReceptionistAttendanceService.punchOut();

      }


      // ------------------------------------------------------
      // AFTER PUNCH OUT
      // ------------------------------------------------------

      else {

        return;

      }


      // ------------------------------------------------------
      // REFRESH SIDEBAR STATE
      // ------------------------------------------------------

      await loadTodayAttendance();


      // ------------------------------------------------------
      // TELL ATTENDANCE PAGE TO REFRESH
      // ------------------------------------------------------

      window.dispatchEvent(
        new Event("attendanceUpdated")
      );


    } catch (error) {

      console.error(
        "Attendance action error:",
        error
      );


      // ------------------------------------------------------
      // SHOW BACKEND MESSAGE
      // ------------------------------------------------------

      const message =
        error?.response?.data?.message ||
        "Attendance action failed.";

      alert(message);


      // ------------------------------------------------------
      // REFRESH STATE
      // ------------------------------------------------------

      await loadTodayAttendance();


    } finally {

      setAttendanceActionLoading(false);

    }

  };


  // ==========================================================
  // BUTTON VISIBILITY
  // Punch In -> Punch Out -> Hide
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
  // BUTTON TEXT
  // ==========================================================

  const getAttendanceButtonText = () => {

    if (attendanceActionLoading) {

      return "Processing...";

    }

    if (attendanceLoading) {

      return "Punch In";

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


      {/* ====================================================
          SIDEBAR
      ==================================================== */}

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
        ================================================== */}

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
                Yashree Sports
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#8ca1c0",
                  marginTop: "4px",
                }}
              >
                Receptionist Panel
              </div>

            </div>
          )}

        </div>


        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <nav
          style={{
            padding: "24px 16px",
            flex: 1,
            overflowY: "auto",
          }}
        >


          {/* =================================================
              ATTENDANCE BUTTON
              ABOVE OVERVIEW
          ================================================= */}

          {shouldShowAttendanceButton() && (

            <div
              style={{
                padding: "18px 0 0",
                marginBottom: "24px",
              }}
            >

              <button
                onClick={handleAttendance}
                disabled={attendanceActionLoading}
                style={{
                  width: "60%",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  background: "#1d2a40",
                  color: "#fff",
                  cursor: attendanceActionLoading
                    ? "not-allowed"
                    : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  fontSize: "15px",
                  fontWeight: "600",
                  opacity: attendanceActionLoading
                    ? 0.7
                    : 1,
                }}
              >

                <Clock size={19} />

                {getAttendanceButtonText()}

              </button>

            </div>

          )}


          {/* =================================================
              OVERVIEW
          ================================================= */}

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


          {/* =================================================
              NAV ITEMS
          ================================================= */}

          {navItems.map((item) => {

            const Icon = item.icon;

            return (

              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/receptionist"}
                onClick={() => setSidebarOpen(false)}
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
            BOTTOM USER SECTION
        ================================================== */}

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


      {/* ====================================================
          MAIN CONTENT
      ==================================================== */}

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
            TOP HEADER
        ================================================== */}

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
            <Menu size={23} color="#596b84" />
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
              Receptionist Dashboard
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#71849e",
                fontSize: "14px",
              }}
            >
              Manage players, fees & daily operations
            </p>

          </div>


          <div
            style={{
              marginLeft: "auto",
            }}
          >

            <button
              type="button"
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
              <Bell
                size={21}
                color="#596b84"
              />
            </button>

          </div>

        </header>


        {/* ==================================================
            PAGE CONTENT
        ================================================== */}

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 30px",
            boxSizing: "border-box",
          }}
        >

          <Outlet />

        </div>

      </main>


      {/* ====================================================
          MOBILE OVERLAY
      ==================================================== */}

      {sidebarOpen && (

        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />

      )}

    </div>

  );

};


export default ReceptionistLayout;