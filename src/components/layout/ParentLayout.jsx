import React, { useState } from "react";

import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";


const ParentLayout = () => {

  // Closed by default (mobile). On desktop (lg+) it is always visible via CSS.
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const navigate = useNavigate();


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {

    localStorage.removeItem("token");

    navigate("/login");

  };


  // ==========================================================
  // NAVIGATION ITEMS
  // ==========================================================

  const navigationItems = [

    {
      name: "Dashboard",
      path: "/parent",
      icon: LayoutDashboard,
    },

    {
      name: "Injury Mail",
      path: "/parent/injury-mail",
      icon: LayoutDashboard,
    },

  ];


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="flex h-screen bg-gray-50 font-sans">


      {/* =====================================================
          SIDEBAR
          Mobile  : hidden, slides in when menu button clicked
          Desktop : always visible, fixed (does not scroll)
      ===================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 flex-col
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

        <div className="flex shrink-0 items-center justify-between border-b border-slate-700/50 px-6 py-5">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold shadow-md">

              Y

            </div>

            <div className="min-w-0">

              <h1 className="text-base font-semibold tracking-wide">
                Yashashree Sports
              </h1>

              <p className="text-xs text-slate-400">
                Parent Panel
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
            NAVIGATION
            (scrolls inside the sidebar only on very short screens)
        =================================================== */}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">

          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">

            Overview

          </p>


          {navigationItems.map((item) => {

            const Icon = item.icon;

            return (

              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/parent"}
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
            LOGOUT (pinned to bottom)
        =================================================== */}

        <div className="shrink-0 border-t border-slate-700/50 p-4">

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

        <header className="sticky top-0 z-30 flex items-center border-b border-gray-200 bg-white px-4 py-4 sm:px-6">

          <div className="flex min-w-0 items-center gap-3">

            {/* THREE LINE BUTTON - top left on mobile */}

            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="shrink-0 rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            >

              <Menu className="h-6 w-6" />

            </button>


            <div className="min-w-0">

              <h2 className="break-words text-lg font-semibold leading-snug text-gray-900 sm:text-2xl">

                Welcome, Parent

              </h2>

              <p className="mt-1 text-sm text-gray-500">

                Monitor your child's progress

              </p>

            </div>

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


export default ParentLayout;