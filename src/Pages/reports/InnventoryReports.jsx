import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  BarChart3,
  ChevronLeft,
  Download,
  Eye,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import api from "../../api/axiosClient";


// ======================================================
// HELPERS
// ======================================================

const formatMoney = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};


const formatDate = (date) => {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


// ======================================================
// SUMMARY CARD
// ======================================================

const SummaryCard = ({ title, value, icon, valueColor }) => {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        height: "100%",
      }}
    >
      <CardContent>

      <Stack
  direction="row"
  sx={{
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
        
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
            >
              {title}
            </Typography>

            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                mt: 1,
                color: valueColor || "inherit",
              }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f1f5f9",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};


// ======================================================
// INVENTORY REPORT
// ======================================================

const InventoryReports = () => {

  const [period, setPeriod] = useState("DAILY");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [sportId, setSportId] = useState("");

  const [sports, setSports] = useState([]);

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(false);

  const [pdfLoading, setPdfLoading] = useState(false);

  const [error, setError] = useState("");


  // ======================================================
  // LOAD SPORTS
  // ======================================================

  useEffect(() => {

    const loadSports = async () => {

      try {

       const response = await api.get("/sport");

        const data =
          response.data?.data ??
          response.data ??
          [];

        setSports(
          Array.isArray(data) ? data : []
        );

      } catch (err) {

        console.error(
          "Failed to load sports:",
          err
        );

        setSports([]);

      }

    };

    loadSports();

  }, []);


  // ======================================================
  // BUILD PARAMETERS
  // ======================================================

  const getParams = () => {

    const params = {
      period,
    };


    if (period === "CUSTOM") {

      if (!startDate || !endDate) {

        throw new Error(
          "Please select both start date and end date."
        );

      }

      params.startDate = startDate;

      params.endDate = endDate;

    }


    if (sportId) {

      params.sportId = sportId;

    }


    return params;
  };


  // ======================================================
  // GET REPORT
  // ======================================================

  const fetchReport = async () => {

    try {

      setLoading(true);

      setError("");


      const params = getParams();


      const response = await api.get(
        "/reports/inventory",
        {
          params,
        }
      );


      const data =
        response.data?.data ??
        response.data;


      setReport(data);

    } catch (err) {

      console.error(
        "Inventory report error:",
        err
      );

      setError(
        err.message ||
        err.response?.data?.message ||
        "Failed to load inventory report."
      );

    } finally {

      setLoading(false);

    }

  };


  // ======================================================
  // INITIAL REPORT
  // ======================================================

  useEffect(() => {

    fetchReport();

  }, []);


  // ======================================================
  // VIEW PDF
  // ======================================================

  const handleViewPdf = async () => {

    try {

      setPdfLoading(true);

      setError("");


      const params = getParams();


      const response = await api.get(
        "/reports/inventory/pdf",
        {
          params,
          responseType: "blob",
        }
      );


      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );


      const url =
        window.URL.createObjectURL(blob);


      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );


      setTimeout(() => {

        window.URL.revokeObjectURL(url);

      }, 1000);


    } catch (err) {

      console.error(
        "View inventory PDF error:",
        err
      );

      setError(
        err.message ||
        "Unable to open inventory report PDF."
      );

    } finally {

      setPdfLoading(false);

    }

  };


  // ======================================================
  // DOWNLOAD PDF
  // ======================================================

  const handleDownloadPdf = async () => {

    try {

      setPdfLoading(true);

      setError("");


      const params = getParams();


      const response = await api.get(
        "/reports/inventory/pdf",
        {
          params,
          responseType: "blob",
        }
      );


      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );


      const url =
        window.URL.createObjectURL(blob);


      const link =
        document.createElement("a");


      link.href = url;


      link.download =
        `inventory-report-${period.toLowerCase()}.pdf`;


      document.body.appendChild(link);


      link.click();


      document.body.removeChild(link);


      window.URL.revokeObjectURL(url);


    } catch (err) {

      console.error(
        "Download inventory PDF error:",
        err
      );

      setError(
        err.message ||
        "Unable to download inventory report PDF."
      );

    } finally {

      setPdfLoading(false);

    }

  };


  // ======================================================
  // RESET
  // ======================================================

  const handleReset = () => {

    setPeriod("DAILY");

    setStartDate("");

    setEndDate("");

    setSportId("");

    setError("");

  };


  // ======================================================
  // REPORT PERIOD
  // ======================================================

  const getReportPeriod = () => {

    if (!report) return "";


    if (
      report.startDate &&
      report.endDate
    ) {

      return `${formatDate(
        report.startDate
      )} - ${formatDate(
        report.endDate
      )}`;

    }


    if (period === "DAILY") {

      return "Today";

    }


    if (period === "MONTHLY") {

      return "This Month";

    }


    if (period === "YEARLY") {

      return "This Year";

    }


    return "Custom Date Range";

  };


  // ======================================================
  // SPORT SUMMARY
  // ======================================================

  const sportSummary =
    Array.isArray(report?.sportSummary)
      ? report.sportSummary
      : [];


  // ======================================================
  // UI
  // ======================================================

  return (

    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f6f8fb",
        p: {
          xs: 2,
          md: 3,
        },
      }}
    >

      {/* ================= HEADER ================= */}

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
          mb: 3,
        }}
      >

        <Stack
  direction="row"
  spacing={1.5}
  sx={{
    alignItems: "center",
  }}
>

          <IconButton
            onClick={() =>
              window.history.back()
            }
            sx={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
            }}
          >

            <ChevronLeft size={20} />

          </IconButton>


          <Box>

            <Stack
  direction="row"
  spacing={1}
  sx={{
    alignItems: "center",
  }}
>

              <Package size={25} />

              <Typography
                variant="h5"
                fontWeight={700}
              >
                Inventory Report
              </Typography>

            </Stack>


            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Inventory stock and student sales report
            </Typography>

          </Box>

        </Stack>


        <Stack
          direction="row"
          spacing={1}
        >

          <Button
            variant="outlined"
            startIcon={
              <Eye size={17} />
            }
            onClick={handleViewPdf}
            disabled={
              pdfLoading || !report
            }
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            View PDF
          </Button>


          <Button
            variant="contained"
            startIcon={
              <Download size={17} />
            }
            onClick={handleDownloadPdf}
            disabled={
              pdfLoading || !report
            }
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Download PDF
          </Button>

        </Stack>

      </Box>


      {/* ================= FILTERS ================= */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid #e5e7eb",
          borderRadius: 2,
          mb: 3,
        }}
      >

        <CardContent>

          <Typography
            fontWeight={700}
            sx={{ mb: 2 }}
          >
            Report Filters
          </Typography>

<Grid
  container
  spacing={2}
  sx={{
    alignItems: "center",
  }}
>

            {/* PERIOD */}

            <Grid
  size={{
    xs: 12,
    sm: 6,
    md: 3,
  }}
>

              <FormControl
                fullWidth
                size="small"
              >

                <InputLabel>
                  Reporting Period
                </InputLabel>

                <Select
                  value={period}
                  label="Reporting Period"
                  onChange={(e) =>
                    setPeriod(
                      e.target.value
                    )
                  }
                >

                  <MenuItem value="DAILY">
                    Today
                  </MenuItem>

                  <MenuItem value="MONTHLY">
                    This Month
                  </MenuItem>

                  <MenuItem value="YEARLY">
                    This Year
                  </MenuItem>

                  <MenuItem value="CUSTOM">
                    Custom Date Range
                  </MenuItem>

                </Select>

              </FormControl>

            </Grid>


            {/* SPORT */}

          <Grid
  size={{
    xs: 12,
    sm: 6,
    md: 3,
  }}
>
              <FormControl
                fullWidth
                size="small"
              >

                <InputLabel>
                  Sport
                </InputLabel>

                <Select
                  value={sportId}
                  label="Sport"
                  onChange={(e) =>
                    setSportId(
                      e.target.value
                    )
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
                        sport.sportName}

                    </MenuItem>

                  ))}

                </Select>

              </FormControl>

            </Grid>


            {/* CUSTOM DATES */}

            {period === "CUSTOM" && (
              <>

              <Grid
  size={{
    xs: 12,
    sm: 6,
    md: 3,
  }}
>

                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) =>
                      setStartDate(
                        e.target.value
                      )
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />

                </Grid>

<Grid
  size={{
    xs: 12,
    sm: 6,
    md: 3,
  }}
>

                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="End Date"
                    value={endDate}
                    onChange={(e) =>
                      setEndDate(
                        e.target.value
                      )
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />

                </Grid>

              </>
            )}


            {/* ACTIONS */}

            <Grid
  size={{
    xs: 12,
    md: period === "CUSTOM" ? 2 : 6,
  }}
>
<Stack
  direction="row"
  spacing={1}
  sx={{
    justifyContent: "flex-end",
  }}
>

                <Button
                  variant="outlined"
                  startIcon={
                    <RefreshCw size={16} />
                  }
                  onClick={handleReset}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  Reset
                </Button>


                <Button
                  variant="contained"
                  startIcon={
                    loading ? (
                      <CircularProgress
                        size={16}
                        color="inherit"
                      />
                    ) : (
                      <BarChart3 size={16} />
                    )
                  }
                  onClick={fetchReport}
                  disabled={loading}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  Generate
                </Button>

              </Stack>

            </Grid>

          </Grid>


          {/* ERROR */}

          {error && (

            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "#fff1f2",
                border: "1px solid #fecdd3",
              }}
            >

              <Typography
                variant="body2"
                color="error"
              >
                {error}
              </Typography>

            </Box>

          )}

        </CardContent>

      </Card>


      {/* ================= LOADING ================= */}

      {loading && (

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 8,
          }}
        >

          <CircularProgress />

        </Box>

      )}


      {/* ================= REPORT ================= */}

      {!loading && report && (

        <>

          {/* REPORT TITLE */}

          <Box sx={{ mb: 2 }}>

            <Typography
              variant="h6"
              fontWeight={700}
            >
              Inventory Report
            </Typography>


            <Typography
              variant="body2"
              color="text.secondary"
            >

              {getReportPeriod()}

              {" • "}

              {report.sportName ||
                "All Sports"}

            </Typography>

          </Box>


          {/* ================= SUMMARY ================= */}

          <Grid
            container
            spacing={2}
            sx={{ mb: 3 }}
          >

            {/* INVENTORY IN */}

         <Grid
  size={{
    xs: 12,
    sm: 6,
    md: 2.4,
  }}
>

              <SummaryCard
                title="Inventory In"
                value={formatMoney(
                  report.inventoryIn
                )}
                icon={
                  <Package size={21} />
                }
              />

            </Grid>


            {/* STUDENT SALES */}

            <Grid
  size={{
    xs: 12,
    sm: 6,
    md: 2.4,
  }}
>

              <SummaryCard
                title="Student Sales"
                value={formatMoney(
                  report.studentSales
                )}
                icon={
                  <ShoppingCart size={21} />
                }
              />

            </Grid>


            {/* PROFIT */}

           <Grid
  size={{
    xs: 12,
    sm: 6,
    md: 2.4,
  }}
>

              <SummaryCard
                title="Profit"
                value={formatMoney(
                  report.profit
                )}
                valueColor="#15803d"
                icon={
                  <TrendingUp size={21} />
                }
              />

            </Grid>


            {/* ITEMS SOLD */}
<Grid
  size={{
    xs: 12,
    sm: 6,
    md: 2.4,
  }}
>

              <SummaryCard
                title="Items Sold"
                value={`${Number(
                  report.itemsSold || 0
                )} units`}
                icon={
                  <ShoppingCart size={21} />
                }
              />

            </Grid>


            {/* CURRENT STOCK */}

           <Grid
  size={{
    xs: 12,
    sm: 6,
    md: 2.4,
  }}
>

              <SummaryCard
                title="Current Stock"
                value={`${Number(
                  report.currentStock || 0
                )} units`}
                icon={
                  <BarChart3 size={21} />
                }
              />

            </Grid>

          </Grid>


          {/* ================= SPORT-WISE SUMMARY ================= */}

          <Card
            elevation={0}
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >

            <Box
              sx={{
                px: 2,
                py: 1.8,
                backgroundColor: "#fafbfc",
              }}
            >

              <Typography
                fontWeight={700}
              >
                Sport-wise Summary
              </Typography>

            </Box>


            <TableContainer>

              <Table
                size="small"
                sx={{
                  minWidth: 800,
                }}
              >

                <TableHead>

                  <TableRow>

                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      Sport
                    </TableCell>


                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      Inventory In (₹)
                    </TableCell>


                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      Student Sales (₹)
                    </TableCell>


                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      Profit (₹)
                    </TableCell>


                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      Items Sold
                    </TableCell>


                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      Current Stock
                    </TableCell>

                  </TableRow>

                </TableHead>


                <TableBody>

                  {sportSummary.length === 0 ? (

                    <TableRow>

                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{
                          py: 5,
                          color: "text.secondary",
                        }}
                      >

                        No sport-wise inventory
                        data found for this period.

                      </TableCell>

                    </TableRow>

                  ) : (

                    sportSummary.map(
                      (sport, index) => (

                        <TableRow
                          key={
                            `${sport.sportName}-${index}`
                          }
                          hover
                        >

                          <TableCell>
                            {sport.sportName || "-"}
                          </TableCell>


                          <TableCell align="right">
                            {formatMoney(
                              sport.inventoryIn
                            )}
                          </TableCell>


                          <TableCell align="right">
                            {formatMoney(
                              sport.studentSales
                            )}
                          </TableCell>


                          <TableCell
                            align="right"
                            sx={{
                              color: "#15803d",
                              fontWeight: 600,
                            }}
                          >
                            {formatMoney(
                              sport.profit
                            )}
                          </TableCell>


                          <TableCell align="right">
                            {Number(
                              sport.itemsSold || 0
                            )}
                          </TableCell>


                          <TableCell align="right">
                            {Number(
                              sport.currentStock || 0
                            )}
                          </TableCell>

                        </TableRow>

                      )
                    )

                  )}


                  {/* TOTAL ROW */}

                  {sportSummary.length > 0 && (

                    <TableRow
                      sx={{
                        backgroundColor: "#eff6ff",
                      }}
                    >

                      <TableCell
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        Total
                      </TableCell>


                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {formatMoney(
                          report.inventoryIn
                        )}
                      </TableCell>


                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {formatMoney(
                          report.studentSales
                        )}
                      </TableCell>


                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: "#15803d",
                        }}
                      >
                        {formatMoney(
                          report.profit
                        )}
                      </TableCell>


                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {Number(
                          report.itemsSold || 0
                        )}
                      </TableCell>


                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {Number(
                          report.currentStock || 0
                        )}
                      </TableCell>

                    </TableRow>

                  )}

                </TableBody>

              </Table>

            </TableContainer>

          </Card>


          {/* ================= FOOTER ================= */}

          <Box
            sx={{
              textAlign: "center",
              py: 3,
              color: "text.secondary",
            }}
          >

            <Typography variant="caption">
              Yashree Sports Academy • Inventory Report
            </Typography>

          </Box>

        </>

      )}

    </Box>

  );
};


export default InventoryReports;