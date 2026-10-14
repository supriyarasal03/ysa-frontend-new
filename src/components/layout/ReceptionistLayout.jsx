import React, { useEffect, useState } from "react";
import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Users,
  CreditCard,
  Calendar,
  LogOut,
  Menu,
  X,
  Bell,
  Clock,
  UserPlus,
  Mail,
  ArrowRightLeft,
} from "lucide-react";
import ReceptionistAttendanceService from "../../Pages/receptionist/ReceptionistAttendanceService";

// ============================================================
// CONSTANTS
// ============================================================

const MOBILE_BREAKPOINT = 768;

const SIDEBAR_WIDTH = 270;
const SIDEBAR_COLLAPSED_WIDTH = 80;

// ============================================================
// HOOK: IS MOBILE SCREEN
// ============================================================

const useIsMobile = () => {
  const getValue = () =>
    typeof window !== "undefined" &&
    window.innerWidth < MOBILE_BREAKPOINT;

  const [isMobile, setIsMobile] = useState(getValue);

  useEffect(() => {
    const handleResize = () => setIsMobile(getValue());

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

// ============================================================
// COMPONENT
// ============================================================

const ReceptionistLayout = () => {
  const isMobile = useIsMobile();

  // Desktop: sidebar open (expanded) by default.
  // Mobile: sidebar hidden by default.
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= MOBILE_BREAKPOINT
  );

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceActionLoading, setAttendanceActionLoading] =
    useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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
  // SCREEN SIZE CHANGE
  // Mobile  -> hide sidebar
  // Desktop -> show sidebar
  // ==========================================================

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // ==========================================================
  // CLOSE SIDEBAR AFTER NAVIGATION ON MOBILE
  // ==========================================================

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // ==========================================================
  // LOCK PAGE SCROLL WHILE MOBILE DRAWER IS OPEN
  // ==========================================================

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [isMobile, sidebarOpen]);

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
        await ReceptionistAttendanceService.getTodayAttendance();

      setTodayAttendance(response);
    } catch (error) {
      if (error?.response?.status === 404) {
        setTodayAttendance(null);
      } else {
        console.error("Today's attendance loading error:", error);
      }
    } finally {
      setAttendanceLoading(false);
    }
  };

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

      if (!todayAttendance) {
        // No record yet -> punch in
        await ReceptionistAttendanceService.punchIn();
      } else if (
        todayAttendance.punchInTime &&
        !todayAttendance.punchOutTime
      ) {
        // Already punched in -> punch out
        await ReceptionistAttendanceService.punchOut();
      } else {
        // Already punched out
        return;
      }

      await loadTodayAttendance();

      // Tell the attendance page to refresh
      window.dispatchEvent(new Event("attendanceUpdated"));
    } catch (error) {
      console.error("Attendance action error:", error);

      const message =
        error?.response?.data?.message ||
        "Attendance action failed.";

      alert(message);

      await loadTodayAttendance();
    } finally {
      setAttendanceActionLoading(false);
    }
  };

  // Punch In -> Punch Out -> Hide
  const shouldShowAttendanceButton = () => {
    if (attendanceLoading) return true;
    if (!todayAttendance) return true;

    return !!(
      todayAttendance.punchInTime &&
      !todayAttendance.punchOutTime
    );
  };

  const getAttendanceButtonText = () => {
    if (attendanceActionLoading) return "Processing...";
    if (attendanceLoading) return "Punch In";
    if (!todayAttendance) return "Punch In";

    if (
      todayAttendance.punchInTime &&
      !todayAttendance.punchOutTime
    ) {
      return "Punch Out";
    }

    return "Punch In";
  };

  // ==========================================================
  // LAYOUT VALUES
  // ==========================================================

  // On mobile the labels are always shown inside the drawer.
  const showLabels = isMobile ? true : sidebarOpen;

  const desktopSidebarWidth = sidebarOpen
    ? SIDEBAR_WIDTH
    : SIDEBAR_COLLAPSED_WIDTH;

  const sidebarWidth = isMobile
    ? "min(290px, 85vw)"
    : `${desktopSidebarWidth}px`;

  const mainMarginLeft = isMobile ? 0 : desktopSidebarWidth;

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
          MOBILE BACKDROP
          Click outside the drawer to close it.
      ==================================================== */}

      {isMobile && (
        <div
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7, 21, 47, 0.55)",
            zIndex: 999,
            opacity: sidebarOpen ? 1 : 0,
            pointerEvents: sidebarOpen ? "auto" : "none",
            transition: "opacity 0.25s ease",
          }}
        />
      )}

      {/* ====================================================
          SIDEBAR
          Desktop: fixed, collapsible
          Mobile : full-height slide-in drawer
      ==================================================== */}

      <aside
        style={{
          width: sidebarWidth,

          background: "#0d172c",
          color: "#fff",

          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,

          // 100dvh avoids the mobile-browser address-bar gap
          // that leaves empty space under the Logout button.
          height: "100dvh",

          display: "flex",
          flexDirection: "column",

          zIndex: 1000,
          overflow: "hidden",

          transform:
            isMobile && !sidebarOpen
              ? "translateX(-100%)"
              : "translateX(0)",

          transition: "transform 0.28s ease, width 0.2s ease",

          boxShadow:
            isMobile && sidebarOpen
              ? "8px 0 30px rgba(0,0,0,0.35)"
              : "none",
        }}
      >
        {/* ==================================================
            LOGO
        ================================================== */}

        <div
          style={{
            padding: isMobile ? "20px 18px" : "28px 24px",
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
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
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

          {/* CLOSE BUTTON (mobile only) */}
          {isMobile && (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              style={{
                border: "none",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* ==================================================
            NAVIGATION (scrolls when there are many items)
        ================================================== */}

        <nav
          style={{
            padding: "20px 14px",
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "thin",
            overscrollBehavior: "contain",
          }}
        >
          {/* ATTENDANCE BUTTON */}

          {shouldShowAttendanceButton() && (
            <div style={{ marginBottom: "22px" }}>
              <button
                type="button"
                onClick={handleAttendance}
                disabled={attendanceActionLoading}
                title={!showLabels ? getAttendanceButtonText() : undefined}
                style={{
                  width: showLabels ? "70%" : "100%",
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
                  opacity: attendanceActionLoading ? 0.7 : 1,
                }}
              >
                <Clock size={19} style={{ flexShrink: 0 }} />

                {showLabels && getAttendanceButtonText()}
              </button>
            </div>
          )}

          {/* OVERVIEW */}

          <div
            style={{
              color: "#7184a3",
              fontSize: "12px",
              marginBottom: "14px",
              paddingLeft: showLabels ? "20px" : "0",
              textAlign: showLabels ? "left" : "center",
            }}
          >
            {showLabels ? "OVERVIEW" : "•••"}
          </div>

          {/* NAV ITEMS */}

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/receptionist"}
                title={!showLabels ? item.name : undefined}
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
                  color: isActive ? "#fff" : "#c4d0e2",
                  background: isActive
                    ? "#2864e8"
                    : "transparent",
                  fontSize: "15px",
                  fontWeight: isActive ? "600" : "500",
                  flexShrink: 0,
                })}
              >
                <Icon size={21} style={{ flexShrink: 0 }} />

                {showLabels && (
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ==================================================
            LOGOUT (always pinned at the very bottom)
        ================================================== */}

        <div
          style={{
            padding: "16px 14px",

            // keeps the button clear of the phone's home bar
            paddingBottom: "max(20px, env(safe-area-inset-bottom))",

            borderTop: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
            background: "#0d172c",
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
              justifyContent: showLabels ? "flex-start" : "center",
              gap: "12px",
              fontSize: "15px",
              fontWeight: "500",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "#263750";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "#1d2a40";
            }}
          >
            <LogOut size={20} />

            {showLabels && "Logout"}
          </button>
        </div>
      </aside>

      {/* ====================================================
          MAIN CONTENT
      ==================================================== */}

      <main
        style={{
          marginLeft: `${mainMarginLeft}px`,

          // minWidth: 0 stops wide pages from pushing the
          // layout sideways on small screens.
          flex: 1,
          minWidth: 0,

          minHeight: "100vh",
          transition: "margin-left 0.2s ease",
        }}
      >
        {/* ==================================================
            STICKY HEADER
            Menu (3-line) button is the first item.
        ================================================== */}

        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 900,

            height: isMobile ? "68px" : "82px",

            background: "#fff",
            borderBottom: "1px solid #e8edf3",

            display: "flex",
            alignItems: "center",

            padding: isMobile ? "0 14px" : "0 30px",
            boxSizing: "border-box",

            gap: isMobile ? "12px" : "18px",
          }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen((previous) => !previous)}
            aria-label="Toggle menu"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "8px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Menu size={isMobile ? 26 : 23} color="#596b84" />
          </button>

          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                color: "#07152f",
                fontSize: isMobile ? "18px" : "30px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Receptionist Dashboard
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                color: "#71849e",
                fontSize: isMobile ? "12px" : "14px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Manage players, fees & daily operations
            </p>
          </div>

          <div style={{ marginLeft: "auto", flexShrink: 0 }}>
            <button
              type="button"
              aria-label="Notifications"
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
              <Bell size={21} color="#596b84" />
            </button>
          </div>
        </header>

        {/* ==================================================
            PAGE CONTENT
        ================================================== */}

        <div
          style={{
            padding: isMobile ? "16px 14px" : "24px 30px",
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ReceptionistLayout;
