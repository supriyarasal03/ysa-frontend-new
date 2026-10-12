
import React, { useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Package,
  Stethoscope,
  CreditCard,
  Search,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

import ProfitLossService from "./ProfitLossServic.js";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

const toDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

const currentMonth = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}`;

const years = Array.from(
  { length: 11 },
  (_, index) => today.getFullYear() - 5 + index
);

const ProfitLoss = () => {
  const [filterType, setFilterType] = useState("custom");

  const [startDate, setStartDate] = useState(toDateInput(firstDay));
  const [endDate, setEndDate] = useState(toDateInput(today));
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateReport = async () => {
    let reportStartDate = startDate;
    let reportEndDate = endDate;

    if (filterType === "custom") {
      if (!startDate || !endDate) {
        setError("Please select both start date and end date.");
        return;
      }

      if (startDate > endDate) {
        setError("Start date cannot be after end date.");
        return;
      }
    } else {
      if (!selectedMonth) {
        setError("Please select a month and year.");
        return;
      }

      const [year, month] = selectedMonth.split("-").map(Number);

      reportStartDate = `${year}-${String(month).padStart(2, "0")}-01`;

      const lastDay = new Date(year, month, 0).getDate();

      reportEndDate = `${year}-${String(month).padStart(
        2,
        "0"
      )}-${String(lastDay).padStart(2, "0")}`;
    }

    try {
      setLoading(true);
      setError("");
      setReport(null);

      const data =
        await ProfitLossService.generateProfitLossReport(
          reportStartDate,
          reportEndDate
        );

      setReport(data);
    } catch (err) {
      console.error("Profit & Loss report error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to generate the report. Please check the backend API and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const cards = report
    ? [
        {
          title: "Student Fees Received",
          value: report.studentFeesReceived,
          icon: CreditCard,
        },
        {
          title: "Inventory Profit",
          value: report.inventoryProfit,
          icon: Package,
        },
        {
          title: "Physiotherapy Fees Received",
          value: report.physiotherapyFeesReceived,
          icon: Stethoscope,
        },
        {
          title: "Employee Salary Expense",
          value: report.employeeSalaryExpense,
          icon: Wallet,
        },
        {
          title: "Total Income",
          value: report.totalIncome,
          icon: TrendingUp,
        },
        {
          title: "Total Expense",
          value: report.totalExpense,
          icon: TrendingDown,
        },
      ]
    : [];

  const isProfit = Number(report?.netProfitOrLoss ?? 0) >= 0;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
            Profit &amp; Loss Report
          </h1>

          <p className="mt-2 text-sm text-slate-500 md:text-base">
            View academy income, inventory profit, physiotherapy
            fees, salary expenses, and net profit or loss.
          </p>
        </div>

        {/* Date filter */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <CalendarDays size={21} />
            Select Report Period
          </h2>

          {/* Filter type */}
          <div className="mb-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setFilterType("custom");
                setError("");
                setReport(null);
              }}
              className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                filterType === "custom"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Custom Date Range
            </button>

            <button
              type="button"
              onClick={() => {
                setFilterType("monthly");
                setError("");
                setReport(null);
              }}
              className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                filterType === "monthly"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Month-wise Report
            </button>
          </div>

          {filterType === "custom" ? (
            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
              <div>
                <label
                  htmlFor="startDate"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Start Date
                </label>

                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  End Date
                </label>

                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="text-sm text-slate-500">
                Choose any start and end dates using the calendar.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label
                  htmlFor="reportMonth"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Select Month
                </label>

                <select
                  id="reportMonth"
                  value={selectedMonth.split("-")[1]}
                  onChange={(e) => {
                    const year = selectedMonth.split("-")[0];
                    setSelectedMonth(`${year}-${e.target.value}`);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {Array.from({ length: 12 }, (_, index) => {
                    const monthNumber = String(index + 1).padStart(2, "0");
                    const monthName = new Date(2000, index, 1).toLocaleString(
                      "en-IN",
                      { month: "long" }
                    );

                    return (
                      <option key={monthNumber} value={monthNumber}>
                        {monthName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label
                  htmlFor="reportYear"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Select Year
                </label>

                <select
                  id="reportYear"
                  value={selectedMonth.split("-")[0]}
                  onChange={(e) => {
                    const month = selectedMonth.split("-")[1];
                    setSelectedMonth(`${e.target.value}-${month}`);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-sm text-slate-500 sm:col-span-2 md:col-span-1">
                The complete selected month will be included automatically.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerateReport}
            disabled={loading}
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Search size={20} />
                Generate Report
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Report data */}
        {report && (
          <>
            <p className="mb-4 text-sm text-slate-500">
              Report period:{" "}
              <span className="font-medium text-slate-700">
                {report.startDate || startDate}
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-700">
                {report.endDate || endDate}
              </span>
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                        <Icon size={22} />
                      </div>

                      <p className="text-sm font-medium text-gray-600">
                        {item.title}
                      </p>
                    </div>

                    <p className="break-words text-2xl font-bold text-gray-900">
                      {formatCurrency(item.value)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Net profit / loss */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5 md:px-7">
                <h2 className="text-xl font-bold text-slate-800">
                  Net Profit / Loss
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Financial summary for the selected period
                </p>
              </div>

              <div className="p-5 md:p-7">
                <p
                  className={`break-words text-3xl font-extrabold md:text-5xl ${
                    isProfit ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(report.netProfitOrLoss)}
                </p>

                <div
                  className={`mt-5 rounded-xl border p-4 text-sm font-medium ${
                    isProfit
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-800"
                  }`}
                >
                  {isProfit
                    ? "The academy has a net profit for this period."
                    : "The academy has a net loss for this period."}
                </div>

                <p className="mt-4 text-sm text-slate-500">
                  Net Profit / Loss = Total Income − Total Expense
                </p>
              </div>
            </div>
          </>
        )}

        {/* Initial state */}
        {!report && !loading && !error && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            Select a report period and click Generate Report to view
            the results.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfitLoss;
