import React, { useEffect, useState } from "react";
import {
  Outlet,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  CalendarDays,
  History,
  LogOut,
  Calendar,
  Menu,
  Bell,
  X,
  Clock,
} from "lucide-react";

import InnventoryManagerService
  from "../../Pages/innventoty-manager/InnventoryManagerService";


const InventoryManagerLayout = () => {

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [todayAttendance, setTodayAttendance] =
    useState(null);

  const [attendanceActionLoading, setAttendanceActionLoading] =
    useState(false);

  const navigate = useNavigate();


  // ==========================================================
  // GET LOGGED-IN USER DETAILS
  // ==========================================================

  const getUserDetails = () => {

    let username =
      localStorage.getItem("username") ||
      localStorage.getItem("userName") ||
      "";

    let email =
      localStorage.getItem("email") ||
      "";

    /*
     * If username/email are not stored separately,
     * try to read them from the JWT payload.
     */

    const token = localStorage.getItem("token");

    if (token) {

      try {

        const payload =
          JSON.parse(
            atob(
              token
                .split(".")[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/")
            )
          );

        username =
          username ||
          payload.username ||
          payload.sub ||
          "";

        email =
          email ||
          payload.email ||
          "";

      } catch (error) {

  

      }

    }

    return {
      username,
      email,
    };

  };


  const userDetails = getUserDetails();

  const displayName =
    userDetails.username || "Inventory Manager";

  const displayEmail =
    userDetails.email || "";


  const getInitials = (name) => {

    if (!name) {
      return "IM";
    }

    const words =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 1) {

      return words[0]
        .substring(0, 2)
        .toUpperCase();

    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();

  };


  const userInitials =
    getInitials(displayName);


  // ==========================================================
  // LOAD TODAY'S ATTENDANCE
  // ==========================================================

  const loadTodayAttendance = async () => {

    try {

      const response =
        await InnventoryManagerService.getTodayAttendance();

      setTodayAttendance(response || null);

    } catch (error) {

      /*
       * No record for today should not break
       * the dashboard layout.
       */

      setTodayAttendance(null);

    }

  };


  // ==========================================================
  // LOAD ATTENDANCE ON LAYOUT LOAD
  // ==========================================================

  useEffect(() => {

    loadTodayAttendance();

  }, []);


  // ==========================================================
  // PUNCH IN
  // ==========================================================

  const handlePunchIn = async () => {

    if (attendanceActionLoading) {
      return;
    }

    setAttendanceActionLoading(true);

    try {

      const response =
        await InnventoryManagerService.punchIn();

      setTodayAttendance(response);

      window.alert(
        response?.message ||
        "Punch in successful."
      );

      window.dispatchEvent(
        new Event("attendance-updated")
      );

    } catch (error) {

      /*
       * Academy Wi-Fi / network errors are expected
       * when attendance is attempted outside the academy.
       */

      if (
        error?.code === "ERR_NETWORK" ||
        error?.code === "ECONNABORTED" ||
        error?.code === "ETIMEDOUT" ||
        error?.message === "Network Error"
      ) {

        window.alert(
          "Please connect to Academy Wi-Fi."
        );

      } else if (error?.response?.status === 403) {

        window.alert(
          "Attendance can only be marked from Academy Wi-Fi."
        );

      } else {

        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to punch in.";

        window.alert(message);

      }

      await loadTodayAttendance();

    } finally {

      setAttendanceActionLoading(false);

    }

  };


  // ==========================================================
  // PUNCH OUT
  // ==========================================================

  const handlePunchOut = async () => {

    if (attendanceActionLoading) {
      return;
    }

    setAttendanceActionLoading(true);

    try {

      const response =
        await InnventoryManagerService.punchOut();

      setTodayAttendance(response);

      window.alert(
        response?.message ||
        "Punch out successful."
      );

      window.dispatchEvent(
        new Event("attendance-updated")
      );

    } catch (error) {

      /*
       * Academy Wi-Fi / network errors are expected
       * when attendance is attempted outside the academy.
       */

      if (
        error?.code === "ERR_NETWORK" ||
        error?.code === "ECONNABORTED" ||
        error?.code === "ETIMEDOUT" ||
        error?.message === "Network Error"
      ) {

        window.alert(
          "Please connect to Academy Wi-Fi."
        );

      } else if (error?.response?.status === 403) {

        window.alert(
          "Attendance can only be marked from Academy Wi-Fi."
        );

      } else {

        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to punch out.";

        window.alert(message);

      }

      await loadTodayAttendance();

    } finally {

      setAttendanceActionLoading(false);

    }

  };


  // ==========================================================
  // DYNAMIC ATTENDANCE ACTION
  // ==========================================================

  const handleAttendanceAction = () => {

    if (!todayAttendance) {

      handlePunchIn();

      return;

    }


    if (
      todayAttendance.punchInTime &&
      !todayAttendance.punchOutTime
    ) {

      handlePunchOut();

      return;

    }


    if (
      todayAttendance.punchInTime &&
      todayAttendance.punchOutTime
    ) {

      window.alert(
        "Attendance already completed for today."
      );

    }

  };


  // ==========================================================
  // ATTENDANCE BUTTON
  // ==========================================================

  const attendanceCompleted =
    Boolean(
      todayAttendance?.punchInTime &&
      todayAttendance?.punchOutTime
    );

  const attendanceButtonText =
    todayAttendance?.punchInTime &&
    !todayAttendance?.punchOutTime
      ? "Punch Out"
      : "Punch In";

  // ==========================================================
  // NAVIGATION ITEMS
  // ==========================================================

  const navItems = [

 

    {
      name: "Inventory Management",
      path: "/inventory",
      icon: Package,
      end: false,
    },

    {
      name: "Inventory Transaction History",
      path: "/innventory/history",
      icon: History,
      end: false,
    },



    {

      name:"Innventory Report",
      path:"/innventoty/innventory-stock",
     icon: History,
      end: false,


    },

   
    
    {
  name: "Leave",
  path: "/inventoty/leave",
  icon: Calendar,
},



    {
  name: "Player Innventory Purcahse",
  path: "innventory/player-inventoty-purcahse",
  icon: Calendar,
}






  ];


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("userName");
    localStorage.removeItem("email");

    navigate("/login");

  };


  // ==========================================================
  // RETURN
  // ==========================================================

  return (

    <div className="flex h-screen bg-gray-50 font-sans">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72
          bg-[#0f172a] text-white
          transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
          lg:static lg:translate-x-0
        `}
      >


        {/* ===================================================
            BRAND
        =================================================== */}

        <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold shadow-md">

              Y

            </div>

            <div>

              <h1 className="text-base font-semibold tracking-wide">
                Yashree Sports
              </h1>

              <p className="text-xs text-slate-400">
                {displayName}
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >

            <X className="h-5 w-5" />

          </button>

        </div>


        {/* ===================================================
            ATTENDANCE ACTION
        =================================================== */}

        {!attendanceCompleted && (

          <div className="border-b border-slate-700/50 px-4 py-4">

            <button
              type="button"
              onClick={handleAttendanceAction}
              disabled={attendanceActionLoading}
              className="
                flex w-full items-center
                justify-center gap-2
                rounded-xl
                bg-slate-800
                py-3
                text-sm font-semibold
                text-white
                shadow-md
                shadow-slate-900/30
                transition-all
                duration-200
                hover:bg-slate-700
                hover:shadow-lg
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              <Clock className="h-5 w-5" />

              {attendanceActionLoading
                ? "Processing..."
                : attendanceButtonText}

            </button>

          </div>

        )}

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="space-y-1 px-3 py-6">

          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">

            Overview

          </p>


          {navItems.map((item) => {

            const Icon = item.icon;

            return (

              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() =>
                  setSidebarOpen(false)
                }
                className={({ isActive }) =>
                  `
                  flex items-center gap-3
                  rounded-xl px-3 py-2.5
                  text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                  `
                }
              >

                <Icon className="h-5 w-5 shrink-0" />

                <span>
                  {item.name}
                </span>

              </NavLink>

            );

          })}

        </nav>


        {/* ===================================================
            BOTTOM USER SECTION
        =================================================== */}

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700/50 p-4">

          <div className="mb-3 flex items-center gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">

              {userInitials}

            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-medium">

                {displayName}

              </p>

              {displayEmail && (

                <p className="truncate text-xs text-slate-400">

                  {displayEmail}

                </p>

              )}

            </div>

          </div>


          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex w-full items-center
              justify-center gap-2
              rounded-xl bg-slate-800
              py-2.5 text-sm font-medium
              transition-colors
              hover:bg-slate-700
            "
          >

            <LogOut className="h-4 w-4" />

            Logout

          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">


        {/* ===================================================
            TOP HEADER
        =================================================== */}

        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 sm:px-6">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            >

              <Menu className="h-5 w-5" />

            </button>


            <div>

              <h2 className="text-lg font-semibold text-gray-900">

                Inventory Manager Dashboard

              </h2>

              <p className="text-sm text-gray-500">

                Manage academy inventory

              </p>

            </div>

          </div>


          {/* Notification */}

          <div className="flex items-center gap-3">

            <button
              type="button"
              className="relative rounded-xl p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Notifications"
            >

              <Bell className="h-5 w-5" />

              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />

            </button>

          </div>

        </header>


        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">

          <Outlet />

        </main>

      </div>


      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (

        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />

      )}

    </div>

  );

};


export default InventoryManagerLayout;
