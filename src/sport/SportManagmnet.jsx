import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trophy,
  Users,
  Power,
} from "lucide-react";
import { getAllSports, updateSportStatus } from "./sportService"; // adjust path

export default function SportManagmnet() {

 // { label, url }

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [sportList, setSportList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState(null);
  const [newStatus, setNewStatus] = useState(""); // "ACTIVE" | "INACTIVE"
  const [statusLoading, setStatusLoading] = useState(false);

  // ---------- Fetch sports (latest first) ----------
  const loadSports = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllSports();
      let list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      // Last record first
      list = [...list].sort((a, b) => (b.id || 0) - (a.id || 0));
      setSportList(list);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load sports");
      setSportList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSports();
  }, []);

  // ---------- Helpers ----------
  const getStatus = (sport) => {
    const s = sport.status || sport.Status;
    if (!s) return "Inactive";
    const upper = String(s).toUpperCase();
    if (upper === "ACTIVE") return "Active";
    if (upper === "INACTIVE") return "Inactive";
    return String(s);
  };

  const isActiveStatus = (status) =>
    String(status).toUpperCase() === "ACTIVE";

  // ---------- Counts ----------
  const totalSports = sportList.length;
  const activeSports = sportList.filter((s) =>
    isActiveStatus(getStatus(s))
  ).length;
  const inactiveSports = sportList.filter(
    (s) => !isActiveStatus(getStatus(s))
  ).length;

  // ---------- Filter + Search (by name only) ----------
  const filtered = sportList.filter((sport) => {
    const name = (sport.sportsName || "").toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch = name.includes(searchLower);

    const status = getStatus(sport);
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && isActiveStatus(status)) ||
      (statusFilter === "Inactive" && !isActiveStatus(status));

    return matchesSearch && matchesStatus;
  });

  // ---------- Pagination ----------
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // ---------- Status change (open confirm) ----------
  const openStatusConfirm = (sport, targetStatus) => {
    setSelectedSport(sport);
    setNewStatus(targetStatus);
    setConfirmOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!selectedSport || !newStatus) return;

    setStatusLoading(true);
    try {
      await updateSportStatus(selectedSport.id, newStatus);
      setConfirmOpen(false);
      setSelectedSport(null);
      setNewStatus("");
      await loadSports();
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
    setSelectedSport(null);
    setNewStatus("");
  };

  return (

    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Sport Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage all sports of Yashree Sports Academy
          </p>
        </div>


        <button
          onClick={() => navigate("/sport-form")}
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add New Sport
        </button>


        
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Sports</p>
            <p className="text-2xl font-bold text-slate-800">{totalSports}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Active Sports</p>
            <p className="text-2xl font-bold text-slate-800">{activeSports}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Inactive Sports</p>
            <p className="text-2xl font-bold text-slate-800">{inactiveSports}</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by sport name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Filter className="w-4 h-4" />
              <span>Filter by Status</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <option value="All">All Sports</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sport
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Age Range
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    Loading sports...
                  </td>
                </tr>
              ) : paginated.length > 0 ? (
                paginated.map((sport) => {
                  const status = getStatus(sport);
                  const isActive = isActiveStatus(status);

                  return (
                    <tr
                      key={sport.id}
                      className="hover:bg-slate-50/70 transition"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">
                          {sport.sportsName || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {sport.minAge ?? "-"} – {sport.maxAge ?? "-"} yrs
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          ></span>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">






<div className="flex items-center justify-center gap-2">

  {/* Edit */}
  <button
    onClick={() =>
      navigate(`/sport-form/${sport.id}`)
    }
    className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
    title="Edit"
  >
    <Edit2 className="w-4 h-4" />
  </button>

  {/* Active / Inactive */}
  <button
    type="button"
    onClick={() =>
      openStatusConfirm(
        sport,
        isActive ? "INACTIVE" : "ACTIVE"
      )
    }
    className={`p-2 rounded-lg transition ${
      isActive
        ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
        : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
    }`}
    title={isActive ? "Set Inactive" : "Set Active"}
  >
    <Power className="w-4 h-4" />
  </button>

</div>












                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-slate-500">
                      No sports found
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

        {/* Pagination */}
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
            sports
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition ${
                    currentPage === page
                      ? "bg-sky-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmOpen && selectedSport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Confirm Status Change
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to set{" "}
              <span className="font-medium text-slate-800">
                "{selectedSport.sportsName}"
              </span>{" "}
              to{" "}
              <span
                className={`font-medium ${
                  newStatus === "ACTIVE"
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {newStatus === "ACTIVE" ? "Active" : "Inactive"}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelConfirm}
                disabled={statusLoading}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
              >
                No
              </button>
              <button
                onClick={handleConfirmStatus}
                disabled={statusLoading}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition disabled:opacity-60"
              >
                {statusLoading ? "Updating..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}