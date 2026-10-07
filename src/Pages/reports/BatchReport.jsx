import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from "@mui/material";

import {
  Eye,
  Download,
} from "lucide-react";

import {
  getAllBatchesForReport,
  viewBatchReportPdf,
  downloadBatchReportPdf,
} from "./report";

const BatchReports = () => {

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewLoading, setViewLoading] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);


  // ======================================================
  // FETCH ALL BATCHES
  // ======================================================

  useEffect(() => {
    fetchBatches();
  }, []);


  const fetchBatches = async () => {
    try {

      setLoading(true);
      setError("");

      const data = await getAllBatchesForReport();

      setBatches(Array.isArray(data) ? data : []);

    } catch (err) {

      console.error("Error fetching batches for report:", err);

      setError(
        err?.response?.data?.message ||
        "Failed to load batch reports."
      );

    } finally {

      setLoading(false);

    }
  };


  // ======================================================
  // VIEW PDF
  // ======================================================

  const handleViewReport = async (batchId) => {

    try {

      setViewLoading(batchId);

      await viewBatchReportPdf(batchId);

    } catch (err) {

      console.error("Error viewing batch report:", err);

      setError("Failed to open batch report.");

    } finally {

      setViewLoading(null);

    }
  };


  // ======================================================
  // DOWNLOAD PDF
  // ======================================================

  const handleDownloadReport = async (batchId) => {

    try {

      setDownloadLoading(batchId);

      await downloadBatchReportPdf(batchId);

    } catch (err) {

      console.error("Error downloading batch report:", err);

      setError("Failed to download batch report.");

    } finally {

      setDownloadLoading(null);

    }
  };


  // ======================================================
  // FORMAT TIME
  // ======================================================

  const formatTime = (time) => {

    if (!time) {
      return "-";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  // ======================================================
  // UI
  // ======================================================

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "#f8fafc",
        minHeight: "100%",
      }}
    >

      {/* PAGE HEADER */}

      <Box sx={{ mb: 3 }}>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            mb: 0.5,
          }}
        >
          Batch Reports
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "#64748b",
          }}
        >
          View or download reports for all academy batches.
        </Typography>

      </Box>


      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}


      {/* TABLE */}

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
        }}
      >

        <Table>

          <TableHead>

            <TableRow
              sx={{
                backgroundColor: "#f1f5f9",
              }}
            >

              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                Sr. No.
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                Batch Name
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                Batch Time
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                Assigned Coach
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                Total Players
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                Actions
              </TableCell>

            </TableRow>

          </TableHead>


          <TableBody>

            {/* LOADING */}

            {loading ? (

              <TableRow>

                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 6 }}
                >

                  <CircularProgress size={32} />

                  <Typography
                    sx={{
                      mt: 1,
                      color: "#64748b",
                    }}
                  >
                    Loading batches...
                  </Typography>

                </TableCell>

              </TableRow>

            ) : batches.length === 0 ? (

              /* NO DATA */

              <TableRow>

                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 6 }}
                >

                  <Typography
                    sx={{
                      color: "#64748b",
                    }}
                  >
                    No batches found.
                  </Typography>

                </TableCell>

              </TableRow>

            ) : (

              /* BATCH DATA */

              batches.map((batch, index) => (

                <TableRow
                  key={batch.id}
                  hover
                >

                  <TableCell>
                    {index + 1}
                  </TableCell>


                  <TableCell>

                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#1e293b",
                      }}
                    >
                      {batch.batchName || "-"}
                    </Typography>

                  </TableCell>


                  <TableCell>

                    {formatTime(batch.startTime)}
                    {" - "}
                    {formatTime(batch.endTime)}

                  </TableCell>


                  <TableCell>

                    {batch.coachName || "-"}

                  </TableCell>


                  <TableCell>

                    {batch.currentPlayers ?? 0}

                  </TableCell>


                  {/* ACTIONS */}

                  <TableCell align="center">

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >

                      {/* VIEW */}

                      <Tooltip title="View Report">

                        <span>

                          <IconButton
                            size="small"
                            onClick={() =>
                              handleViewReport(batch.id)
                            }
                            disabled={
                              viewLoading === batch.id
                            }
                            sx={{
                              color: "#2563eb",
                              backgroundColor: "#eff6ff",
                              "&:hover": {
                                backgroundColor: "#dbeafe",
                              },
                            }}
                          >

                            {viewLoading === batch.id ? (

                              <CircularProgress
                                size={18}
                              />

                            ) : (

                              <Eye size={18} />

                            )}

                          </IconButton>

                        </span>

                      </Tooltip>


                      {/* DOWNLOAD */}

                      <Tooltip title="Download Report">

                        <span>

                          <IconButton
                            size="small"
                            onClick={() =>
                              handleDownloadReport(batch.id)
                            }
                            disabled={
                              downloadLoading === batch.id
                            }
                            sx={{
                              color: "#16a34a",
                              backgroundColor: "#f0fdf4",
                              "&:hover": {
                                backgroundColor: "#dcfce7",
                              },
                            }}
                          >

                            {downloadLoading === batch.id ? (

                              <CircularProgress
                                size={18}
                              />

                            ) : (

                              <Download size={18} />

                            )}

                          </IconButton>

                        </span>

                      </Tooltip>

                    </Box>

                  </TableCell>

                </TableRow>

              ))

            )}

          </TableBody>

        </Table>

      </TableContainer>

    </Box>
  );
};

export default BatchReports;