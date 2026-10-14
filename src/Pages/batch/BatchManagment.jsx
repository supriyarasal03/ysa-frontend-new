import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Power,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
} from "lucide-react";

import {
  getAllBatches,
  deactivateBatch,
  activateBatch,
  deleteBatch,
} from "./BatchService";

export default function BatchManagement() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  const [batchList, setBatchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [viewBatch, setViewBatch] = useState(null);

  // ==========================================================
  // LOAD BATCHES
  // ==========================================================

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllBatches();

      const list = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setBatchList(list);
    } catch (err) {
      console.error("Failed to load batches:", err);

      setError(err.message || "Failed to load batches.");

      setBatchList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  // ==========================================================
  // HELPERS
  // ==========================================================

  const getStatus = (batch) => {
    const status = batch?.status ?? batch?.Status ?? "";

    const value = String(status).toUpperCase();

    if (value === "ACTIVE") {
      return "Active";
    }

    if (value === "INACTIVE") {
      return "Inactive";
    }

    return value || "Inactive";
  };

  const isActive = (batch) => getStatus(batch) === "Active";

  const getSportName = (batch) =>
    batch?.sportName ||
    batch?.sport?.sportsName ||
    batch?.sport?.sportName ||
    "-";

  const getCoachName = (batch) => {
    if (batch?.coachName) {
      return batch.coachName;
    }

    const firstName = batch?.coach?.firstName || "";
    const lastName = batch?.coach?.lastName || "";

    return `${firstName} ${lastName}`.trim() || "-";
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const value = new Date(`${date}T00:00:00`);

    if (Number.isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    const [hourValue, minuteValue] = String(time).split(":").map(Number);

    const period = hourValue >= 12 ? "PM" : "AM";

    let hour = hourValue % 12;

    if (hour === 0) {
      hour = 12;
    }

    return `${hour}:${String(minuteValue || 0).padStart(2, "0")} ${period}`;
  };

  const formatTiming = (batch) => {
    if (!batch?.startTime || !batch?.endTime) {
      return "-";
    }

    return `${formatTime(batch.startTime)} - ${formatTime(batch.endTime)}`;
  };

  const formatDays = (days) => {
    if (!days) {
      return "-";
    }

    const labels = {
      MONDAY: "Mon",
      TUESDAY: "Tue",
      WEDNESDAY: "Wed",
      THURSDAY: "Thu",
      FRIDAY: "Fri",
      SATURDAY: "Sat",
      SUNDAY: "Sun",
    };

    return String(days)
      .split(",")
      .map((day) => {
        const key = day.trim().toUpperCase();

        return labels[key] || day;
      })
      .join(", ");
  };

  const formatMoney = (amount) => {
    if (amount === null || amount === undefined || amount === "") {
      return "-";
    }

    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const getCourseDuration = (batch) => {
    if (batch?.courseDuration == null) {
      return "-";
    }

    const unit = batch?.courseDurationUnit || "";

    return `${batch.courseDuration} ${unit.toLowerCase()}`;
  };

  // ==========================================================
  // COUNTS
  // ==========================================================

  const totalBatches = batchList.length;

  const activeBatches = batchList.filter(isActive).length;

  const inactiveBatches = batchList.filter((batch) => !isActive(batch)).length;

  // ==========================================================
  // SEARCH + FILTER
  // ==========================================================

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();

    return batchList.filter((batch) => {
      const name = String(batch?.batchName || "").toLowerCase();

      const sport = String(getSportName(batch)).toLowerCase();

      const coach = String(getCoachName(batch)).toLowerCase();

      const matchesSearch =
        !value ||
        name.includes(value) ||
        sport.includes(value) ||
        coach.includes(value);

      const status = getStatus(batch);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && status === "Active") ||
        (statusFilter === "Inactive" && status === "Inactive");

      return matchesSearch && matchesStatus;
    });
  }, [batchList, search, statusFilter]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // ==========================================================
  // PERMANENTLY DELETE BATCH
  // ==========================================================

  const handleDeleteBatch = async (batch) => {
    if (!batch?.id) {
      return;
    }

    const confirmed = window.confirm(
      `WARNING: Permanently delete "${batch.batchName}"?\n\n` +
        "This action cannot be undone. Continue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(batch.id);
      setError("");

      await deleteBatch(batch.id);

      // Refresh the list after successful deletion
      await loadBatches();

      // Close the details modal if it shows the deleted batch
      setViewBatch((current) => (current?.id === batch.id ? null : current));
    } catch (err) {
      console.error("Failed to permanently delete batch:", err);

      setError(err.message || "Failed to permanently delete batch.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ==========================================================
  // STATUS CHANGE
  // ==========================================================

  const handleStatusChange = async (batch) => {
    if (!batch?.id) {
      return;
    }

    const active = isActive(batch);

    const confirmed = window.confirm(
      active
        ? `Deactivate "${batch.batchName}"?`
        : `Activate "${batch.batchName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(batch.id);

      setError("");

      if (active) {
        await deactivateBatch(batch.id);
      } else {
        await activateBatch(batch.id);
      }

      await loadBatches();
    } catch (err) {
      console.error("Failed to change batch status:", err);

      setError(err.message || "Failed to change batch status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Batch Management
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Manage all training batches of Yashree Sports Academy
          </p>
        </div>

        <button
          onClick={() => navigate("/batch-form")}
          className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add New Batch
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Total Batches</p>

          <p className="text-2xl font-bold text-slate-800 mt-1">
            {totalBatches}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Active Batches</p>

          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {activeBatches}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Inactive Batches</p>

          <p className="text-2xl font-bold text-rose-600 mt-1">
            {inactiveBatches}
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* TOOLBAR */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search by batch, sport or coach..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);

                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Filter className="w-4 h-4" />
              Filter by Status
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);

                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5"
            >
              <option value="All">All Batches</option>

              <option value="Active">Active Only</option>

              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Batch
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Sport / Coach
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Dates
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Timing
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Course / Fee
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Capacity
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    Loading batches...
                  </td>
                </tr>
              ) : paginated.length > 0 ? (
                paginated.map((batch) => (
                  <tr
                    key={batch.id}
                    className="hover:bg-slate-50/70 transition"
                  >
                    {/* BATCH */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        {batch.batchName || "-"}
                      </p>
                    </td>

                    {/* SPORT / COACH */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {getSportName(batch)}
                      </p>

                      <p className="text-xs text-slate-400 mt-0.5">
                        {getCoachName(batch)}
                      </p>
                    </td>

                    {/* DATES */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {formatDate(batch.startDate)}
                      </p>

                      <p className="text-xs text-slate-400 mt-0.5">
                        to {formatDate(batch.endDate)}
                      </p>
                    </td>

                    {/* TIMING */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {formatTiming(batch)}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {formatDays(batch.trainingDays)}
                      </p>
                    </td>

                    {/* COURSE / FEE */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {getCourseDuration(batch)}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Fee: {formatMoney(batch.fee)}
                      </p>

                      <p className="text-xs text-emerald-600 mt-0.5">
                        Discount: {formatMoney(batch.discount ?? 0)}
                      </p>
                    </td>

                    {/* CAPACITY */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {batch.capacity ?? "-"} players
                      </p>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          isActive(batch)
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive(batch) ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />

                        {getStatus(batch)}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {/* VIEW */}
                        <button
                          type="button"
                          onClick={() => setViewBatch(batch)}
                          className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                          title="View Batch"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* EDIT */}
                        <button
                          type="button"
                          onClick={() => navigate(`/batch-form/${batch.id}`)}
                          className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                          title="Edit Batch"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* STATUS */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(batch)}
                          disabled={actionLoadingId === batch.id}
                          className={`p-2 rounded-lg transition disabled:opacity-40 ${
                            isActive(batch)
                              ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={
                            isActive(batch)
                              ? "Deactivate Batch"
                              : "Activate Batch"
                          }
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        {/* PERMANENT DELETE */}
                        <button
                          type="button"
                          onClick={() => handleDeleteBatch(batch)}
                          disabled={actionLoadingId === batch.id}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition disabled:opacity-40"
                          title="Permanently Delete Batch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <Layers className="w-12 h-12 mx-auto mb-3 text-slate-300" />

                    <p className="font-medium text-slate-500">
                      No batches found
                    </p>

                    <p className="text-sm text-slate-400 mt-1">
                      Try adjusting your search or filter
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filtered.length === 0 ? 0 : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-800">
              {Math.min(startIndex + itemsPerPage, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">
              {filtered.length}
            </span>{" "}
            batches
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[36px] h-9 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? "bg-sky-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          VIEW BATCH MODAL (portal, compact for laptop screens)
      ====================================================== */}

      {viewBatch &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-3"
            onClick={() => setViewBatch(null)}
          >
            <div
              className="w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(event) => event.stopPropagation()}
            >
              {/* HEADER */}
              <div className="bg-[#0d172c] px-5 py-3 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-white leading-tight">
                    Batch Details
                  </h2>

                  <p className="text-xs text-slate-300">
                    Complete information about this training batch
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewBatch(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SCROLLABLE CONTENT */}
              <div className="overflow-y-auto flex-1">
                <div className="p-4 space-y-4">
                  {/* BATCH HEADER */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                        <Layers className="w-7 h-7 text-sky-600" />
                      </div>

                      <div className="min-w-0">
                        <h1 className="text-xl font-bold text-slate-800 truncate">
                          {viewBatch.batchName || "-"}
                        </h1>

                        <p className="text-sm text-slate-500">
                          {getSportName(viewBatch)}
                        </p>

                        <span
                          className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isActive(viewBatch)
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive(viewBatch)
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          />

                          {getStatus(viewBatch)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center shrink-0">
                      <p className="text-xs text-slate-400">Capacity</p>

                      <p className="text-xl font-bold text-slate-800 leading-tight">
                        {viewBatch.capacity ?? "-"}
                      </p>

                      <p className="text-xs text-slate-500">Players</p>
                    </div>
                  </div>

                  {/* BATCH INFORMATION */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Batch Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200">
                      <div className="bg-white px-4 py-3">
                        <p className="text-xs text-slate-400">Sport</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {getSportName(viewBatch)}
                        </p>
                      </div>

                      <div className="bg-white px-4 py-3">
                        <p className="text-xs text-slate-400">Coach</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {getCoachName(viewBatch)}
                        </p>
                      </div>

                      <div className="bg-white px-4 py-3">
                        <p className="text-xs text-slate-400">
                          Training Timing
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {formatTiming(viewBatch)}
                        </p>
                      </div>

                      <div className="bg-white px-4 py-3">
                        <p className="text-xs text-slate-400">Start Date</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {formatDate(viewBatch.startDate)}
                        </p>
                      </div>

                      <div className="bg-white px-4 py-3">
                        <p className="text-xs text-slate-400">End Date</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {formatDate(viewBatch.endDate)}
                        </p>
                      </div>

                      <div className="bg-white px-4 py-3">
                        <p className="text-xs text-slate-400">Training Days</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {formatDays(viewBatch.trainingDays)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* COURSE & FEE INFORMATION */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Course & Fee Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200">
                      <div className="bg-white px-4 py-3">
                        <p className="text-xs text-slate-400">
                          Course Duration
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {getCourseDuration(viewBatch)}
                        </p>
                      </div>

                      <div className="bg-white px-4 py-3">
                        <p className="text-xs text-slate-400">Fee</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {formatMoney(viewBatch.fee)}
                        </p>
                      </div>

                      <div className="bg-white px-4 py-3">
                        <p className="text-xs text-slate-400">Discount</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {formatMoney(viewBatch.discount ?? 0)}
                        </p>
                      </div>

                      <div className="bg-white px-4 py-3">
                        <p className="text-xs text-slate-400">Final Fee</p>
                        <p className="text-base font-bold text-emerald-600">
                          {formatMoney(
                            Math.max(
                              0,
                              Number(viewBatch.fee || 0) -
                                Number(viewBatch.discount || 0)
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="px-5 py-2.5 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setViewBatch(null)}
                  className="px-5 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}