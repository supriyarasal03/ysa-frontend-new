
import React, { useCallback, useEffect, useMemo, useState } from "react";

import InnventoryManagerService from "./InnventoryManagerService";


const today = new Date().toISOString().split("T")[0];

const currentYear = new Date().getFullYear();

const currentMonth = new Date().getMonth() + 1;


const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
};


const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unable to load financial report."
  );
};


const unwrapResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  return [];
};


const styles = {
  page: {
    padding: "24px",
    background: "#f8fafc",
    minHeight: "100vh",
    color: "#0f172a",
    fontFamily: "Inter, Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "24px",
  },

  title: {
    fontSize: "26px",
    fontWeight: 700,
    margin: 0,
  },

  subtitle: {
    color: "#64748b",
    marginTop: "6px",
    fontSize: "14px",
  },

  panel: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "22px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    alignItems: "end",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#475569",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    height: "42px",
    padding: "0 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "14px",
  },

  button: {
    height: "42px",
    padding: "0 20px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
  },

  secondaryButton: {
    height: "42px",
    padding: "0 16px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 600,
    cursor: "pointer",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  cardLabel: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "12px",
  },

  cardValue: {
    fontSize: "25px",
    fontWeight: 700,
    margin: 0,
    overflowWrap: "anywhere",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "750px",
  },

  th: {
    padding: "14px 12px",
    background: "#f8fafc",
    color: "#475569",
    fontSize: "12px",
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "14px 12px",
    fontSize: "14px",
    borderBottom: "1px solid #f1f5f9",
    whiteSpace: "nowrap",
  },

  message: {
    padding: "16px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "18px",
  },
};


const InventoryManagerReport = () => {

  const [reportType, setReportType] = useState("DAILY");

  const [selectedDate, setSelectedDate] = useState(today);

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [startDate, setStartDate] = useState(today);

  const [endDate, setEndDate] = useState(today);

  const [sportId, setSportId] = useState("");

  const [sports, setSports] = useState([]);

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");


  // ==========================================================
  // LOAD SPORTS FOR FILTER
  // ==========================================================

  useEffect(() => {

    const loadSports = async () => {

      try {

        const response =
          await InnventoryManagerService.getSports();

        const list = unwrapResponse(response);

        setSports(list);

      } catch (err) {

        console.error("Failed to load sports:", err);

      }
    };

    loadSports();

  }, []);


  // ==========================================================
  // LOAD FINANCIAL REPORT
  // ==========================================================

  const loadReport = useCallback(async () => {

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {

      let response;

      const selectedSportId = sportId || undefined;

      switch (reportType) {

        case "DAILY":

          response =
            await InnventoryManagerService.getDailyFinancialReport(
              selectedDate,
              selectedSportId
            );

          break;


        case "MONTHLY":

          response =
            await InnventoryManagerService.getMonthlyFinancialReport(
              selectedYear,
              selectedMonth,
              selectedSportId
            );

          break;


        case "YEARLY":

          response =
            await InnventoryManagerService.getYearlyFinancialReport(
              selectedYear,
              selectedSportId
            );

          break;


        case "CUSTOM":

          response =
            await InnventoryManagerService.getCustomFinancialReport(
              startDate,
              endDate,
              selectedSportId
            );

          break;


        default:
          throw new Error("Invalid report type.");
      }

      setReport(response);

      setSuccessMessage("Financial report loaded successfully.");

    } catch (err) {

      console.error("Financial report error:", err);

      setReport(null);
      setError(getErrorMessage(err));

    } finally {

      setLoading(false);

    }

  }, [
    reportType,
    selectedDate,
    selectedYear,
    selectedMonth,
    startDate,
    endDate,
    sportId,
  ]);


  // ==========================================================
  // INITIAL REPORT
  // ==========================================================

  useEffect(() => {
    loadReport();
  }, [loadReport]);


  // ==========================================================
  // SUMMARY DATA
  // ==========================================================

  const summary = report?.summary || {};

  const sportReports = useMemo(
    () => report?.sportWiseReports || [],
    [report]
  );


  const totalSelling =
    Number(summary.totalSellingAmount || 0);

  const totalCost =
    Number(summary.totalCostAmount || 0);

  const totalProfit =
    Number(summary.totalProfit || 0);

  const totalItems =
    Number(summary.totalItemsSold || 0);


  // ==========================================================
  // FILTER HANDLERS
  // ==========================================================

  const handleReportTypeChange = (event) => {

    setReportType(event.target.value);
    setReport(null);
    setError("");

  };


  const handleReset = () => {

    setReportType("DAILY");

    setSelectedDate(today);

    setSelectedYear(currentYear);

    setSelectedMonth(currentMonth);

    setStartDate(today);

    setEndDate(today);

    setSportId("");

  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>
            Inventory Financial Report
          </h1>

          <p style={styles.subtitle}>
            Track inventory sales, cost, profit, and sport-wise performance.
          </p>

        </div>

        <button
          type="button"
          style={styles.secondaryButton}
          onClick={loadReport}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Report"}
        </button>

      </div>


      {/* FILTER PANEL */}

      <div style={styles.panel}>

        <h3 style={{ marginTop: 0, marginBottom: 20 }}>
          Report Filters
        </h3>

        <div style={styles.filterGrid}>

          <div>

            <label style={styles.label}>
              Report Type
            </label>

            <select
              style={styles.input}
              value={reportType}
              onChange={handleReportTypeChange}
            >

              <option value="DAILY">Daily</option>

              <option value="MONTHLY">Monthly</option>

              <option value="YEARLY">Yearly</option>

              <option value="CUSTOM">Custom Date Range</option>

            </select>

          </div>


          {reportType === "DAILY" && (

            <div>

              <label style={styles.label}>
                Select Date
              </label>

              <input
                type="date"
                style={styles.input}
                value={selectedDate}
                max={today}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

            </div>

          )}


          {reportType === "MONTHLY" && (

            <>
              <div>

                <label style={styles.label}>
                  Select Month
                </label>

                <select
                  style={styles.input}
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(Number(e.target.value))
                  }
                >

                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((month, index) => (

                    <option key={month} value={index + 1}>
                      {month}
                    </option>

                  ))}

                </select>

              </div>

              <div>

                <label style={styles.label}>
                  Select Year
                </label>

                <input
                  type="number"
                  style={styles.input}
                  min="2000"
                  max={currentYear}
                  value={selectedYear}
                  onChange={(e) =>
                    setSelectedYear(Number(e.target.value))
                  }
                />

              </div>
            </>

          )}


          {reportType === "YEARLY" && (

            <div>

              <label style={styles.label}>
                Select Year
              </label>

              <input
                type="number"
                style={styles.input}
                min="2000"
                max={currentYear}
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(Number(e.target.value))
                }
              />

            </div>

          )}


          {reportType === "CUSTOM" && (

            <>

              <div>

                <label style={styles.label}>
                  Start Date
                </label>

                <input
                  type="date"
                  style={styles.input}
                  value={startDate}
                  max={endDate || today}
                  onChange={(e) => setStartDate(e.target.value)}
                />

              </div>

              <div>

                <label style={styles.label}>
                  End Date
                </label>

                <input
                  type="date"
                  style={styles.input}
                  value={endDate}
                  min={startDate}
                  max={today}
                  onChange={(e) => setEndDate(e.target.value)}
                />

              </div>

            </>

          )}


          <div>

            <label style={styles.label}>
              Sport
            </label>

            <select
              style={styles.input}
              value={sportId}
              onChange={(e) => setSportId(e.target.value)}
            >

              <option value="">
                All Sports
              </option>

              {sports.map((sport) => (

                <option
                  key={sport.id}
                  value={sport.id}
                >
                  {sport.sportsName}
                </option>

              ))}

            </select>

          </div>


          <div style={{ display: "flex", gap: 8 }}>

            <button
              type="button"
              style={styles.button}
              onClick={loadReport}
              disabled={loading}
            >
              {loading ? "Loading..." : "Apply Filters"}
            </button>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={handleReset}
            >
              Reset
            </button>

          </div>

        </div>

      </div>


      {/* ERROR MESSAGE */}

      {error && (

        <div
          style={{
            ...styles.message,
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>

      )}


      {/* SUCCESS MESSAGE */}

      {successMessage && !loading && !error && (

        <div
          style={{
            ...styles.message,
            background: "#f0fdf4",
            color: "#166534",
            border: "1px solid #bbf7d0",
          }}
        >
          {successMessage}
        </div>

      )}


      {/* FINANCIAL SUMMARY */}

      <div style={styles.cards}>

        <div style={styles.card}>

          <div style={styles.cardLabel}>
            Total Sales
          </div>

          <h2 style={{ ...styles.cardValue, color: "#2563eb" }}>
            {formatCurrency(totalSelling)}
          </h2>

          <p style={styles.subtitle}>
            Total selling amount
          </p>

        </div>


        <div style={styles.card}>

          <div style={styles.cardLabel}>
            Total Cost
          </div>

          <h2 style={{ ...styles.cardValue, color: "#d97706" }}>
            {formatCurrency(totalCost)}
          </h2>

          <p style={styles.subtitle}>
            Cost of items sold with known cost
          </p>

        </div>


        <div style={styles.card}>

          <div style={styles.cardLabel}>
            Total Profit
          </div>

          <h2
            style={{
              ...styles.cardValue,
              color: totalProfit >= 0 ? "#16a34a" : "#dc2626",
            }}
          >
            {formatCurrency(totalProfit)}
          </h2>

          <p style={styles.subtitle}>
            Sales minus recorded cost
          </p>

        </div>


        <div style={styles.card}>

          <div style={styles.cardLabel}>
            Quantity Sold
          </div>

          <h2 style={{ ...styles.cardValue, color: "#7c3aed" }}>
            {totalItems}
          </h2>

          <p style={styles.subtitle}>
            Total units sold
          </p>

        </div>

      </div>


      {/* HISTORICAL COST WARNING */}

      {summary.financialDataComplete === false && (

        <div
          style={{
            ...styles.message,
            background: "#fffbeb",
            color: "#92400e",
            border: "1px solid #fde68a",
          }}
        >

          <strong>Incomplete cost data:</strong>{" "}

          {summary.costUnknownQuantity || 0} sold units do not have
          a saved historical cost price. The displayed cost and
          profit totals include only units with known cost data.

        </div>

      )}


      {/* SPORT-WISE TABLE */}

      <div style={styles.panel}>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 18,
          }}
        >

          <div>

            <h3 style={{ margin: 0 }}>
              Sport-wise Financial Breakdown
            </h3>

            <p style={styles.subtitle}>
              Sales, cost, profit, and quantity for each sport.
            </p>

          </div>

          <span
            style={{
              background: "#eff6ff",
              color: "#1d4ed8",
              padding: "7px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {sportReports.length} Sports
          </span>

        </div>


        {loading ? (

          <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
            Loading financial report...
          </div>

        ) : error ? (

          <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
            Report data is unavailable.
          </div>

        ) : sportReports.length === 0 ? (

          <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
            No inventory sales found for the selected filters.
          </div>

        ) : (

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>#</th>

                  <th style={styles.th}>Sport</th>

                  <th style={styles.th}>Selling Amount</th>

                  <th style={styles.th}>Cost Amount</th>

                  <th style={styles.th}>Profit</th>

                  <th style={styles.th}>Quantity Sold</th>

                  <th style={styles.th}>Cost Data</th>

                </tr>

              </thead>


              <tbody>

                {sportReports.map((sport, index) => (

                  <tr key={sport.sportId ?? index}>

                    <td style={styles.td}>
                      {index + 1}
                    </td>

                    <td style={{ ...styles.td, fontWeight: 600 }}>
                      {sport.sportName || "Unknown Sport"}
                    </td>

                    <td style={styles.td}>
                      {formatCurrency(sport.sellingAmount)}
                    </td>

                    <td style={styles.td}>
                      {formatCurrency(sport.costAmount)}
                    </td>

                    <td
                      style={{
                        ...styles.td,
                        fontWeight: 600,
                        color:
                          Number(sport.profit || 0) >= 0
                            ? "#16a34a"
                            : "#dc2626",
                      }}
                    >
                      {formatCurrency(sport.profit)}
                    </td>

                    <td style={styles.td}>
                      {sport.itemsSold || 0}
                    </td>

                    <td style={styles.td}>

                      {sport.financialDataComplete ? (

                        <span
                          style={{
                            color: "#15803d",
                            background: "#f0fdf4",
                            padding: "5px 9px",
                            borderRadius: 20,
                            fontSize: 12,
                          }}
                        >
                          Complete
                        </span>

                      ) : (

                        <span
                          style={{
                            color: "#b45309",
                            background: "#fffbeb",
                            padding: "5px 9px",
                            borderRadius: 20,
                            fontSize: 12,
                          }}
                        >
                          Incomplete
                        </span>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>


              <tfoot>

                <tr style={{ background: "#f8fafc", fontWeight: 700 }}>

                  <td style={styles.td} colSpan={2}>
                    Total
                  </td>

                  <td style={styles.td}>
                    {formatCurrency(totalSelling)}
                  </td>

                  <td style={styles.td}>
                    {formatCurrency(totalCost)}
                  </td>

                  <td style={styles.td}>
                    {formatCurrency(totalProfit)}
                  </td>

                  <td style={styles.td}>
                    {totalItems}
                  </td>

                  <td style={styles.td}>
                    —
                  </td>

                </tr>

              </tfoot>

            </table>

          </div>

        )}

      </div>

    </div>

  );

};


export default InventoryManagerReport;