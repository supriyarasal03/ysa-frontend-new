import React from "react";
import { Box, Card, CardActionArea, Typography, Chip } from "@mui/material";

import {
  BarChart3,
  Package,
  UserPlus,
  ClipboardCheck,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const Reports = () => {
  const navigate = useNavigate();

  const reports = [
    {
      title: "Batch Report",
      description:
        "View batch details, assigned coaches, players and batch information.",
      icon: BarChart3,
      path: "/admin/batch-reports",
      category: "Academy",
    },
    {
      title: "Inventory Report",
      description:
        "View inventory items, available stock and inventory information.",
      icon: Package,
      path: "/admin/innventory-reports",
      category: "Inventory",
    },
    {
      title: "Player Admission Report",
      description:
        "View player admission, enrollment and registration details.",
      icon: UserPlus,
      path: "/admin/reports/player-admission-reports",
      category: "Players",
    },
    {
      title: "Employee Salary Report",
      description:
        "View employee salary details, payment records and salary reports.",
      icon: ClipboardCheck,
      path: "/admin/staff-salary-reports",
      category: "Employees",
    },
    {
      title: "Profit Loss Report",
      description:
        "View the overall profit and loss summary of the academy.",
      icon: TrendingUp,
      path: "/admin/reports/profitloss",
      category: "Finance",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100%",
        p: { xs: 2, sm: 3, md: 4 },
        backgroundColor: "#f8fafc",
      }}
    >
      {/* ================= HEADER ================= */}

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          mb: 4,
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: "28px", md: "34px" },
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.5px",
              mb: 0.7,
            }}
          >
            Reports
          </Typography>

          <Typography sx={{ fontSize: "15px", color: "#64748b" }}>
            Access and manage academy reports from one place.
          </Typography>
        </Box>

        <Chip
          label={`${reports.length} Reports`}
          sx={{
            display: { xs: "none", sm: "flex" },
            height: 34,
            px: 1,
            borderRadius: "10px",
            backgroundColor: "#eff6ff",
            color: "#2563eb",
            fontWeight: 600,
            border: "1px solid #dbeafe",
          }}
        />
      </Box>

      {/* ================= REPORT CARDS =================
          CSS grid: every column has equal width and every
          row has equal height, so all cards stay the same size.
      ================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gridAutoRows: "1fr",
          gap: 3,
        }}
      >
        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <Card
              key={report.title}
              sx={{
                height: "100%",
                borderRadius: "18px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
                overflow: "hidden",
                transition:
                  "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  borderColor: "#bfdbfe",
                  boxShadow: "0 14px 30px rgba(15, 23, 42, 0.10)",
                  "& .report-arrow": {
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    borderColor: "#2563eb",
                  },
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(report.path)}
                sx={{
                  height: "100%",
                  minHeight: 260,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  justifyContent: "flex-start",
                  p: 3,
                }}
              >
                {/* Top row: icon + arrow */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      flexShrink: 0,
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                      color: "#2563eb",
                    }}
                  >
                    <Icon size={28} strokeWidth={2} />
                  </Box>

                  <Box
                    className="report-arrow"
                    sx={{
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <ArrowUpRight size={19} />
                  </Box>
                </Box>

                {/* Category */}
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#2563eb",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    mb: 0.8,
                  }}
                >
                  {report.category}
                </Typography>

                {/* Title: fixed 2-line area so all titles align */}
                <Typography
                  sx={{
                    fontSize: "19px",
                    fontWeight: 700,
                    color: "#0f172a",
                    lineHeight: 1.35,
                    mb: 1,
                    minHeight: "52px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {report.title}
                </Typography>

                {/* Description: clamped to 3 lines */}
                <Typography
                  sx={{
                    fontSize: "14px",
                    lineHeight: 1.65,
                    color: "#64748b",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {report.description}
                </Typography>

                {/* Footer pinned to the bottom */}
                <Box
                  sx={{
                    mt: "auto",
                    pt: 2,
                    borderTop: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#475569",
                    }}
                  >
                    Open Report
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#2563eb",
                    }}
                  >
                    View →
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default Reports;
