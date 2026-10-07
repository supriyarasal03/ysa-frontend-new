import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
} from "@mui/material";

import {
  BarChart3,
  Package,
  UserPlus,
  ClipboardCheck,
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
      path: "/admin/reports/inventory",
      category: "Inventory",
    },
    {
      title: "Player Admission Report",
      description:
        "View player admission, enrollment and registration details.",
      icon: UserPlus,
      path: "/admin/reports/player-admission",
      category: "Players",
    },
    {
      title: "Batch Attendance Report",
      description:
        "View player attendance details for academy batches.",
      icon: ClipboardCheck,
      path: "/admin/reports/batch-attendance",
      category: "Attendance",
    },
  ];

  const handleReportClick = (path) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
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
              fontSize: {
                xs: "28px",
                md: "34px",
              },
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.5px",
              mb: 0.7,
            }}
          >
            Reports
          </Typography>

          <Typography
            sx={{
              fontSize: "15px",
              color: "#64748b",
            }}
          >
            Access and manage academy reports from one place.
          </Typography>
        </Box>

        <Chip
          label={`${reports.length} Reports`}
          sx={{
            display: {
              xs: "none",
              sm: "flex",
            },
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

      {/* ================= REPORT CARDS ================= */}

      <Grid container spacing={3}>
        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <Grid
              item
              xs={12}
              sm={6}
              lg={4}
              key={report.title}
            >
              <Card
                onClick={() => handleReportClick(report.path)}
                sx={{
                  position: "relative",
                  height: "100%",
                  minHeight: 225,
                  cursor: "pointer",
                  borderRadius: "18px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  boxShadow:
                    "0 2px 6px rgba(15, 23, 42, 0.04)",
                  overflow: "hidden",

                  transition:
                    "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",

                  "&:hover": {
                    transform: "translateY(-6px)",
                    borderColor: "#bfdbfe",
                    boxShadow:
                      "0 14px 30px rgba(15, 23, 42, 0.10)",

                    "& .report-arrow": {
                      transform: "translate(3px, -3px)",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                    },

                    "& .report-icon": {
                      transform: "scale(1.05)",
                    },
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    "&:last-child": {
                      pb: 3,
                    },
                  }}
                >
                  {/* Top row */}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 3,
                    }}
                  >
                    {/* Icon */}

                    <Box
                      className="report-icon"
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: "15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                        color: "#2563eb",
                        transition: "transform 0.25s ease",
                      }}
                    >
                      <Icon size={28} strokeWidth={2} />
                    </Box>

                    {/* Arrow */}

                    <Box
                      className="report-arrow"
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#64748b",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        transition:
                          "all 0.25s ease",
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

                  {/* Title */}

                  <Typography
                    sx={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#0f172a",
                      mb: 1,
                    }}
                  >
                    {report.title}
                  </Typography>

                  {/* Description */}

                  <Typography
                    sx={{
                      fontSize: "14px",
                      lineHeight: 1.7,
                      color: "#64748b",
                      maxWidth: 390,
                    }}
                  >
                    {report.description}
                  </Typography>

                  {/* Bottom action */}

                  <Box
                    sx={{
                      mt: 3,
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
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Reports;