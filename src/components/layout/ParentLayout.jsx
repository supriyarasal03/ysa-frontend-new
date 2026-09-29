import React, { useState } from "react";

import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";


const ParentLayout = () => {

  const [sidebarOpen, setSidebarOpen] = useState(true);

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

    path:"/parent/injury-mail",
    icon: LayoutDashboard,

  },

 
];

  // ==========================================================
  // RENDER
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

        {/* =================================================
            LOGO
        ================================================= */}

        <div
          style={{
            padding: "28px 24px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            borderBottom:
              "1px solid rgba(255,255,255,0.08)",
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
                Parent Panel
              </div>

            </div>

          )}

        </div>


        {/* =================================================
            SIDEBAR MENU
        ================================================= */}

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
                end={item.path === "/parent"}
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


        {/* =================================================
            LOGOUT
        ================================================= */}

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

        {/* =================================================
            HEADER
        ================================================= */}

        <header
          style={{
            height: "82px",
            background: "#fff",
            borderBottom:
              "1px solid #e8edf3",

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

            <Menu
              size={23}
              color="#596b84"
            />

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
              Welcome, Parent
            </h2>


            <p
              style={{
                margin: "5px 0 0",
                color: "#71849e",
                fontSize: "14px",
              }}
            >
              Monitor your child's progress
            </p>

          </div>

        </header>


        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <Outlet />

      </main>

    </div>

  );

};


export default ParentLayout;    