import React, { useEffect, useState } from "react";

import {
  CalendarDays,
  Clock3,
  AlertCircle,
  Search,
  Eye,
  ArrowLeft,
  UserRound,
} from "lucide-react";

import ReceptionistAttendanceService from "./ReceptionistAttendanceService.js";

const ReceptionistAttendanceManagement = () => {
  // ==========================================================
  // STATES
  // ==========================================================

  const [staffRecords, setStaffRecords] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ==========================================================
  // LOAD STAFF LIST
  // ==========================================================

  const loadStaff = async (keyword = searchKeyword, role = selectedRole) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await ReceptionistAttendanceService.getAdminStaffList(
        keyword,
        role
      );

      setStaffRecords(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Staff attendance loading error:", error);
      setErrorMessage(
        error?.response?.data?.message || "Unable to load staff records."
      );
      setStaffRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff("", "ALL");
  }, []);

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchKeyword(value);
    loadStaff(value, selectedRole);
  };

  const handleRoleChange = (event) => {
    const role = event.target.value;
    setSelectedRole(role);
    loadStaff(searchKeyword, role);
  };

  const handleViewAttendance = async (staff) => {
    try {
      setHistoryLoading(true);
      setErrorMessage("");

      const response =
        await ReceptionistAttendanceService.getAdminStaffAttendanceHistory(
          staff.userId
        );

      const records = Array.isArray(response) ? response : [];

      // Latest record first
      const sortedRecords = [...records].sort((a, b) => {
        const dateA = new Date(
          `${a.attendanceDate}T${a.punchInTime || "00:00:00"}`
        );
        const dateB = new Date(
          `${b.attendanceDate}T${b.punchInTime || "00:00:00"}`
        );
        return dateB - dateA;
      });

      setAttendanceRecords(sortedRecords);
      setSelectedStaff(staff);
    } catch (error) {
      console.error("Staff attendance history error:", error);
      setErrorMessage(
        error?.response?.data?.message || "Unable to load attendance history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedStaff(null);
    setAttendanceRecords([]);
    setErrorMessage("");
  };

  // ==========================================================
  // FORMATTERS
  // ==========================================================

  const formatDate = (date) => {
    if (!date) return "--";
    const parts = date.split("-");
    if (parts.length !== 3) return date;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const formatTime = (time) => {
    if (!time) return "--";
    const parts = time.split(":");
    if (parts.length < 2) return time;

    let hour = parseInt(parts[0], 10);
    const minute = parts[1];
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${hour}:${minute} ${period}`;
  };

  const formatHours = (hours) => {
    if (hours === null || hours === undefined) return "--";
    return `${Number(hours).toFixed(2)} Hrs`;
  };

  const formatRole = (role) => {
    if (!role) return "--";
    return role
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "LATE_MARKED":
        return { label: "Late Marked", cls: "bg-orange-50 text-orange-600" };
      case "PRESENT":
        return { label: "Present", cls: "bg-green-50 text-green-600" };
      case "COMPLETED_LATE":
        return { label: "Completed Late", cls: "bg-orange-50 text-orange-600" };
      case "COMPLETED":
        return { label: "Completed", cls: "bg-blue-50 text-blue-600" };
      default:
        return { label: "Not Marked", cls: "bg-slate-100 text-slate-500" };
    }
  };

  // ==========================================================
  // SHARED: ERROR BOX
  // ==========================================================

  const errorBox = errorMessage && (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span>{errorMessage}</span>
    </div>
  );

  // ==========================================================
  // STAFF HISTORY VIEW
  // ==========================================================

  if (selectedStaff) {
    return (
      <div className="min-h-screen bg-slate-100 p-3 sm:p-6">
        {errorBox}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* HEADER */}
          <div className="px-4 py-5 sm:px-8 sm:py-7 border-b border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 mb-4 sm:mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Staff
            </button>

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                  Attendance History
                </p>

                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 break-words">
                  {selectedStaff.name || "--"}
                </h2>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-sm text-slate-500">
                  <span className="break-all">
                    Username: {selectedStaff.username || "--"}
                  </span>
                  <span>Role: {formatRole(selectedStaff.role)}</span>
                </div>
              </div>

              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <UserRound className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" />
              </div>
            </div>
          </div>

          {/* DESKTOP TABLE HEADER (hidden on mobile) */}
          <div className="hidden md:grid grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr] items-center gap-4 bg-slate-50 border-b border-slate-100 px-8 py-5">
            <div className="text-xs font-medium text-slate-500 uppercase">Date</div>
            <div className="text-xs font-medium text-slate-500 uppercase">Punch In</div>
            <div className="text-xs font-medium text-slate-500 uppercase">Punch Out</div>
            <div className="text-xs font-medium text-slate-500 uppercase">Total Hours</div>
            <div className="text-xs font-medium text-slate-500 uppercase">Status</div>
          </div>

          {/* LOADING */}
          {historyLoading && (
            <div className="px-4 py-12 text-center text-slate-400">
              Loading attendance history...
            </div>
          )}

          {/* EMPTY */}
          {!historyLoading && attendanceRecords.length === 0 && (
            <div className="px-4 sm:px-8 py-14 text-center">
              <CalendarDays className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-600">
                No attendance records found
              </p>
              <p className="text-sm text-slate-400 mt-2">
                This staff member has no attendance history.
              </p>
            </div>
          )}

          {/* RECORDS */}
          {!historyLoading &&
            attendanceRecords.map((record) => {
              const statusInfo = getStatusInfo(record.status);

              return (
                <div
                  key={record.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  {/* ---------- MOBILE CARD ---------- */}
                  <div className="md:hidden px-4 py-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <CalendarDays className="w-5 h-5 text-slate-500" />
                        </div>
                        <span className="font-semibold text-slate-800">
                          {formatDate(record.attendanceDate)}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap ${statusInfo.cls}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3">
                      <div>
                        <p className="text-[11px] text-slate-400 mb-0.5">Punch In</p>
                        <p className="text-sm font-medium text-slate-700">
                          {formatTime(record.punchInTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 mb-0.5">Punch Out</p>
                        <p className="text-sm font-medium text-slate-700">
                          {formatTime(record.punchOutTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 mb-0.5">Total</p>
                        <p className="text-sm font-semibold text-sky-600">
                          {formatHours(record.totalHours)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ---------- DESKTOP ROW ---------- */}
                  <div className="hidden md:grid grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr] items-center gap-4 px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <CalendarDays className="w-5 h-5 text-slate-500" />
                      </div>
                      <span className="font-medium text-slate-800">
                        {formatDate(record.attendanceDate)}
                      </span>
                    </div>

                    <div className="font-medium text-slate-700">
                      {formatTime(record.punchInTime)}
                    </div>

                    <div className="font-medium text-slate-700">
                      {formatTime(record.punchOutTime)}
                    </div>

                    <div>
                      <span className="inline-flex items-center rounded-xl bg-sky-50 px-4 py-2 font-medium text-sky-600 whitespace-nowrap">
                        {formatHours(record.totalHours)}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center rounded-xl px-4 py-2 font-medium whitespace-nowrap ${statusInfo.cls}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  // ==========================================================
  // STAFF LIST VIEW
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-6">
      {errorBox}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* HEADER */}
        <div className="px-4 pt-5 pb-4 sm:px-8 sm:py-7">
          <p className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wide mb-2 sm:mb-3">
            Staff
          </p>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Staff Attendance
            </h2>

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock3 className="w-4 h-4 sm:w-5 sm:h-5" />
              Attendance Management
            </div>
          </div>
        </div>

        {/* SEARCH + ROLE FILTER */}
        <div className="px-4 pb-5 sm:px-8 sm:pb-7">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

              <input
                type="text"
                value={searchKeyword}
                onChange={handleSearch}
                placeholder="Search by name or username"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 sm:py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className="w-full md:w-64 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:py-3.5 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="ALL">All Staff</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="COACH">Coach</option>
              <option value="INVENTORY_MANAGER">Inventory Manager</option>
              <option value="CLEANING_STAFF">Cleaning Staff</option>
            </select>
          </div>
        </div>

        {/* DESKTOP TABLE HEADER (hidden on mobile) */}
        <div className="hidden md:grid grid-cols-4 bg-slate-50 border-y border-slate-100 px-8 py-5">
          <div className="text-xs font-medium text-slate-500 uppercase">Employee</div>
          <div className="text-xs font-medium text-slate-500 uppercase">Username</div>
          <div className="text-xs font-medium text-slate-500 uppercase">Role</div>
          <div className="text-xs font-medium text-slate-500 uppercase">Action</div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="px-4 py-12 text-center text-slate-400 border-t border-slate-100 md:border-t-0">
            Loading staff records...
          </div>
        )}

        {/* EMPTY */}
        {!loading && staffRecords.length === 0 && (
          <div className="px-4 sm:px-8 py-14 text-center border-t border-slate-100 md:border-t-0">
            <UserRound className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-600">No staff found</p>
            <p className="text-sm text-slate-400 mt-2">
              Try another name, username, or role.
            </p>
          </div>
        )}

        {/* RECORDS */}
        {!loading &&
          staffRecords.map((staff, index) => (
            <div
              key={staff.userId}
              className={`border-b border-slate-100 last:border-b-0 ${
                index === 0 ? "border-t md:border-t-0" : ""
              }`}
            >
              {/* ---------- MOBILE CARD ---------- */}
              <div className="md:hidden px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <UserRound className="w-5 h-5 text-slate-500" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 truncate">
                      {staff.name || "--"}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {staff.username || "--"}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                    {formatRole(staff.role)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleViewAttendance(staff)}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 active:bg-slate-800"
                >
                  <Eye className="w-4 h-4" />
                  View Attendance
                </button>
              </div>

              {/* ---------- DESKTOP ROW ---------- */}
              <div className="hidden md:grid grid-cols-4 items-center px-8 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                    <UserRound className="w-5 h-5 text-slate-500" />
                  </div>
                  <span className="font-medium text-slate-800">
                    {staff.name || "--"}
                  </span>
                </div>

                <div className="font-medium text-slate-700">
                  {staff.username || "--"}
                </div>

                <div>
                  <span className="inline-flex rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
                    {formatRole(staff.role)}
                  </span>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleViewAttendance(staff)}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ReceptionistAttendanceManagement;
