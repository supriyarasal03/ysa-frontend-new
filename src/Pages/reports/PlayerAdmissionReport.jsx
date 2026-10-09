import React, { useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";

import {
  Users,
  IndianRupee,
  WalletCards,
  Clock3,
  Stethoscope,
  Package,
  RefreshCw,
  Eye,
  Download,
} from "lucide-react";

import {
  getPlayerAdmissionReport,
  viewPlayerAdmissionReportPdf,
  downloadPlayerAdmissionReportPdf,
} from "./report";

import { getSports } from "../batch/batchService";


// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};


const formatDate = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return date;
  }

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


// ============================================================
// COMPONENT
// ============================================================

const PlayerAdmissionReport = () => {

  // ==========================================================
  // FILTER STATES
  // ==========================================================

  const [period, setPeriod] = useState("DAILY");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [sportId, setSportId] = useState("");

  const [sports, setSports] = useState([]);


  // ==========================================================
  // REPORT STATES
  // ==========================================================

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(false);

  const [sportsLoading, setSportsLoading] = useState(false);

  const [error, setError] = useState("");


  // ==========================================================
  // LOAD SPORTS
  // ==========================================================

  useEffect(() => {
    loadSports();
  }, []);







const loadSports = async () => {
  try {
    setSportsLoading(true);

    const response = await getSports();

    const data =
      response?.data ??
      response ??
      [];

    setSports(
      Array.isArray(data)
        ? data
        : []
    );

  } catch (err) {
    console.error(
      "Failed to load sports:",
      err
    );
  } finally {
    setSportsLoading(false);
  }
};



  // ==========================================================
  // LOAD REPORT
  // ==========================================================

  const loadReport = async () => {

    try {

      setLoading(true);

      setError("");

      const data = await getPlayerAdmissionReport({
        period,
        startDate: period === "CUSTOM" ? startDate : undefined,
        endDate: period === "CUSTOM" ? endDate : undefined,
        sportId: sportId || undefined,
      });

      setReport(data);

    } catch (err) {

      console.error("Player admission report error:", err);

      setError(
        err?.response?.data?.message ||
        "Unable to load player admission report."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // INITIAL REPORT
  // ==========================================================

  useEffect(() => {

    loadReport();

  }, []);


  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const handleReset = () => {

    setPeriod("DAILY");

    setStartDate("");

    setEndDate("");

    setSportId("");

    setTimeout(() => {
      loadReport();
    }, 0);
  };


  // ==========================================================
  // SUMMARY CARDS
  // ==========================================================

  const summaryCards = [

    {
      title: "Total Players",
      value: report?.totalPlayers ?? 0,
      icon: Users,
      format: "number",
    },

    {
      title: "Course Fees",
      value: report?.courseFees ?? 0,
      icon: IndianRupee,
      format: "currency",
    },

    {
      title: "Inventory Fees",
      value: report?.inventoryFees ?? 0,
      icon: Package,
      format: "currency",
    },

    {
      title: "Physiotherapy Fees",
      value: report?.physiotherapyFees ?? 0,
      icon: Stethoscope,
      format: "currency",
    },

    {
      title: "Total Payable",
      value: report?.totalPayable ?? 0,
      icon: WalletCards,
      format: "currency",
    },

    {
      title: "Fees Collected",
      value: report?.feesCollected ?? 0,
      icon: IndianRupee,
      format: "currency",
    },

    {
      title: "Pending Fees",
      value: report?.pendingFees ?? 0,
      icon: Clock3,
      format: "currency",
    },

  ];


  // ==========================================================
  // RENDER
  // ==========================================================

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

      {/* ====================================================
          HEADER
      ==================================================== */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          flexDirection: {
            xs: "column",
            md: "row",
          },
          gap: 2,
          mb: 4,
        }}
      >

        <Box>

          <Typography
            sx={{
              fontSize: {
                xs: "26px",
                md: "34px",
              },
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.5px",
              mb: 0.7,
            }}
          >
            Player Admission Report
          </Typography>

          <Typography
            sx={{
              fontSize: "15px",
              color: "#64748b",
            }}
          >
            View player admissions, sport-wise collection and
            current fee details.
          </Typography>

        </Box>


        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >

          <Button
            variant="outlined"
            startIcon={<Eye size={17} />}
            onClick={() =>
              viewPlayerAdmissionReportPdf({
                period,
                startDate:
                  period === "CUSTOM"
                    ? startDate
                    : undefined,
                endDate:
                  period === "CUSTOM"
                    ? endDate
                    : undefined,
                sportId: sportId || undefined,
              })
            }
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            View PDF
          </Button>


          <Button
            variant="contained"
            startIcon={<Download size={17} />}
            onClick={() =>
              downloadPlayerAdmissionReportPdf({
                period,
                startDate:
                  period === "CUSTOM"
                    ? startDate
                    : undefined,
                endDate:
                  period === "CUSTOM"
                    ? endDate
                    : undefined,
                sportId: sportId || undefined,
              })
            }
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
            }}
          >
            Download PDF
          </Button>

        </Box>

      </Box>


      {/* ====================================================
          FILTER CARD
      ==================================================== */}

      <Card
        sx={{
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
          mb: 3,
        }}
      >

        <CardContent>

          <Grid
  container
  spacing={2}
  sx={{
    alignItems: "center",
  }}
>
            {/* PERIOD */}

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>

              <FormControl fullWidth size="small">

                <InputLabel>Period</InputLabel>

                <Select
                  value={period}
                  label="Period"
                  onChange={(e) =>
                    setPeriod(e.target.value)
                  }
                >

                  <MenuItem value="DAILY">
                    Daily
                  </MenuItem>

                  <MenuItem value="MONTHLY">
                    Monthly
                  </MenuItem>

                  <MenuItem value="YEARLY">
                    Yearly
                  </MenuItem>

                  <MenuItem value="CUSTOM">
                    Custom
                  </MenuItem>

                </Select>

              </FormControl>

            </Grid>


            {/* SPORT */}

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>

              <FormControl fullWidth size="small">

                <InputLabel>Sport</InputLabel>

                <Select
                  value={sportId}
                  label="Sport"
                  onChange={(e) =>
                    setSportId(e.target.value)
                  }
                >

                  <MenuItem value="">
                    All Sports
                  </MenuItem>

                  {sports.map((sport) => (

                    <MenuItem
                      key={sport.id}
                      value={sport.id}
                    >
                     {sport.sportsName ||
  sport.sportName ||
  sport.name ||
  "Sport"}
                    </MenuItem>

                  ))}

                </Select>

              </FormControl>

            </Grid>


            {/* START DATE */}

            {period === "CUSTOM" && (

             <Grid size={{ xs: 12, sm: 6, md: 2 }}>

                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

              </Grid>

            )}


            {/* END DATE */}

            {period === "CUSTOM" && (

             <Grid size={{ xs: 12, sm: 6, md: 2 }}>

                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

              </Grid>

            )}


            {/* GENERATE */}

           <Grid size={{ xs: 12, md: 2 }}>

              <Button
                fullWidth
                variant="contained"
                startIcon={
                  loading
                    ? <CircularProgress
                        size={17}
                        color="inherit"
                      />
                    : <RefreshCw size={17} />
                }
                disabled={
                  loading ||
                  (
                    period === "CUSTOM" &&
                    (!startDate || !endDate)
                  )
                }
                onClick={loadReport}
                sx={{
                  height: 40,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "none",
                }}
              >
                {loading
                  ? "Loading..."
                  : "Generate"}
              </Button>

            </Grid>


            {/* RESET */}

           <Grid size={{ xs: 12, md: 1 }}>

              <Button
                fullWidth
                variant="text"
                onClick={handleReset}
                disabled={loading}
                sx={{
                  height: 40,
                  borderRadius: "10px",
                  textTransform: "none",
                  color: "#64748b",
                }}
              >
                Reset
              </Button>

            </Grid>

          </Grid>

        </CardContent>

      </Card>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (

        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: "12px",
          }}
        >
          {error}
        </Alert>

      )}


      {/* ====================================================
          SUMMARY
      ==================================================== */}

      {report && (

        <Grid
          container
          spacing={2}
          sx={{ mb: 4 }}
        >

          {summaryCards.map((card) => {

            const Icon = card.icon;

            const displayValue =
              card.format === "currency"
                ? formatCurrency(card.value)
                : Number(card.value || 0).toLocaleString(
                    "en-IN"
                  );


            return (

            <Grid
  size={{ xs: 12, sm: 6, md: 3, lg: 3 }}
  key={card.title}
>

                <Card
                  sx={{
                    height: "100%",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 2px 6px rgba(15, 23, 42, 0.04)",
                  }}
                >

                  <CardContent>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >

                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#64748b",
                        }}
                      >
                        {card.title}
                      </Typography>

                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#eff6ff",
                          color: "#2563eb",
                        }}
                      >
                        <Icon size={19} />
                      </Box>

                    </Box>


                    <Typography
                      sx={{
                        fontSize: "24px",
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {displayValue}
                    </Typography>

                  </CardContent>

                </Card>

              </Grid>

            );

          })}

        </Grid>

      )}


      {/* ====================================================
          SPORT-WISE SUMMARY
      ==================================================== */}

      {report && (

        <Card
          sx={{
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 2px 6px rgba(15, 23, 42, 0.04)",
            mb: 3,
          }}
        >

          <CardContent sx={{ p: 3 }}>

            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#0f172a",
                mb: 0.5,
              }}
            >
              Sport-wise Collection
            </Typography>

            <Typography
              sx={{
                fontSize: "14px",
                color: "#64748b",
                mb: 3,
              }}
            >
              Admission and fee collection summary by sport.
            </Typography>


            <Divider sx={{ mb: 2 }} />


            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
              }}
            >

              <Table size="small">

                <TableHead>

                  <TableRow
                    sx={{
                      backgroundColor: "#f8fafc",
                    }}
                  >

                    <TableCell sx={{ fontWeight: 700 }}>
                      Sport
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      Players
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      Course Fees
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      Inventory
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      Physio
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      Total Payable
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      Collected
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      Pending
                    </TableCell>

                  </TableRow>

                </TableHead>


                <TableBody>

                  {(report.sportSummary || []).length === 0 ? (

                    <TableRow>

                      <TableCell
                        colSpan={8}
                        align="center"
                        sx={{
                          py: 5,
                          color: "#64748b",
                        }}
                      >
                        No sport-wise data available.
                      </TableCell>

                    </TableRow>

                  ) : (

                    report.sportSummary.map(
                      (sport, index) => (

                        <TableRow key={index}>

                          <TableCell>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: "#0f172a",
                              }}
                            >
                              {sport.sportName || "-"}
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            {sport.totalPlayers ?? 0}
                          </TableCell>

                          <TableCell align="right">
                            {formatCurrency(
                              sport.courseFees
                            )}
                          </TableCell>

                          <TableCell align="right">
                            {formatCurrency(
                              sport.inventoryFees
                            )}
                          </TableCell>

                          <TableCell align="right">
                            {formatCurrency(
                              sport.physiotherapyFees
                            )}
                          </TableCell>

                          <TableCell align="right">
                            {formatCurrency(
                              sport.totalPayable
                            )}
                          </TableCell>

                          <TableCell align="right">
                            {formatCurrency(
                              sport.feesCollected
                            )}
                          </TableCell>

                          <TableCell align="right">

                            <Chip
                              label={formatCurrency(
                                sport.pendingFees
                              )}
                              size="small"
                              sx={{
                                backgroundColor:
                                  "#fff7ed",
                                color: "#c2410c",
                                fontWeight: 600,
                              }}
                            />

                          </TableCell>

                        </TableRow>

                      )
                    )

                  )}

                </TableBody>

              </Table>

            </TableContainer>

          </CardContent>

        </Card>

      )}


      {/* ====================================================
          PLAYER DETAILS
      ==================================================== */}

      {report && (

        <Card
          sx={{
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 2px 6px rgba(15, 23, 42, 0.04)",
          }}
        >

          <CardContent sx={{ p: 3 }}>

            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#0f172a",
                mb: 0.5,
              }}
            >
              Player Admission Details
            </Typography>

            <Typography
              sx={{
                fontSize: "14px",
                color: "#64748b",
                mb: 3,
              }}
            >
              Current enrollment and fee details for each player.
            </Typography>


            <Divider sx={{ mb: 2 }} />


            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
              }}
            >

              <Table
                size="small"
                sx={{
                  minWidth: 1200,
                }}
              >

                <TableHead>

                  <TableRow
                    sx={{
                      backgroundColor: "#f8fafc",
                    }}
                  >

                    <TableCell sx={{ fontWeight: 700 }}>
                      Player
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      Sport
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      Batch
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      Admission Date
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      Course Fee
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      Inventory
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      Physio
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      Total
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      Paid
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      Pending
                    </TableCell>

                  </TableRow>

                </TableHead>


                <TableBody>

                  {(report.players || []).length === 0 ? (

                    <TableRow>

                      <TableCell
                        colSpan={10}
                        align="center"
                        sx={{
                          py: 5,
                          color: "#64748b",
                        }}
                      >
                        No player admission records found.
                      </TableCell>

                    </TableRow>

                  ) : (

                    report.players.map(
                      (player, index) => (

                        <TableRow
                          key={
                            player.playerId ||
                            index
                          }
                          hover
                        >

                          <TableCell>

                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: "#0f172a",
                              }}
                            >
                              {player.playerName || "-"}
                            </Typography>

                          </TableCell>


                          <TableCell>
                            {player.sportName || "-"}
                          </TableCell>


                          <TableCell>
                            {player.batchName || "-"}
                          </TableCell>


                          <TableCell>
                            {formatDate(
                              player.admissionDate
                            )}
                          </TableCell>


                          <TableCell align="right">
                            {formatCurrency(
                              player.courseFee
                            )}
                          </TableCell>


                          <TableCell align="right">
                            {formatCurrency(
                              player.inventoryFee
                            )}
                          </TableCell>


                          <TableCell align="right">
                            {formatCurrency(
                              player.physiotherapyFee
                            )}
                          </TableCell>


                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 600,
                            }}
                          >
                            {formatCurrency(
                              player.totalPayable
                            )}
                          </TableCell>


                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 600,
                              color: "#15803d",
                            }}
                          >
                            {formatCurrency(
                              player.paidAmount
                            )}
                          </TableCell>


                          <TableCell align="right">

                            <Chip
                              label={formatCurrency(
                                player.pendingAmount
                              )}
                              size="small"
                              sx={{
                                backgroundColor:
                                  Number(
                                    player.pendingAmount ||
                                    0
                                  ) > 0
                                    ? "#fff7ed"
                                    : "#f0fdf4",

                                color:
                                  Number(
                                    player.pendingAmount ||
                                    0
                                  ) > 0
                                    ? "#c2410c"
                                    : "#15803d",

                                fontWeight: 600,
                              }}
                            />

                          </TableCell>

                        </TableRow>

                      )
                    )

                  )}

                </TableBody>

              </Table>

            </TableContainer>

          </CardContent>

        </Card>

      )}

    </Box>
  );
};

export default PlayerAdmissionReport;