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

import ReceptionistAttendanceService
  from "./ReceptionistAttendanceService.js";


const ReceptionistAttendanceManagement = () => {

  // ==========================================================
  // STAFF LIST STATES
  // ==========================================================

  const [staffRecords, setStaffRecords] =
    useState([]);

  const [searchKeyword, setSearchKeyword] =
    useState("");

  const [selectedRole, setSelectedRole] =
    useState("ALL");


  // ==========================================================
  // ATTENDANCE HISTORY STATES
  // ==========================================================

  const [attendanceRecords, setAttendanceRecords] =
    useState([]);

  const [selectedStaff, setSelectedStaff] =
    useState(null);


  // ==========================================================
  // LOADING / ERROR
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");


  // ==========================================================
  // LOAD STAFF LIST
  // ==========================================================

  const loadStaff = async (
    keyword = searchKeyword,
    role = selectedRole
  ) => {

    try {

      setLoading(true);
      setErrorMessage("");

      const response =
        await ReceptionistAttendanceService
          .getAdminStaffList(
            keyword,
            role
          );

      const records =
        Array.isArray(response)
          ? response
          : [];

      setStaffRecords(records);

    } catch (error) {

      console.error(
        "Staff attendance loading error:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
        "Unable to load staff records."
      );

      setStaffRecords([]);

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadStaff("", "ALL");

  }, []);


  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = (
    event
  ) => {

    const value =
      event.target.value;

    setSearchKeyword(value);

    loadStaff(
      value,
      selectedRole
    );
  };


  // ==========================================================
  // ROLE FILTER
  // ==========================================================

  const handleRoleChange = (
    event
  ) => {

    const role =
      event.target.value;

    setSelectedRole(role);

    loadStaff(
      searchKeyword,
      role
    );
  };


  // ==========================================================
  // VIEW STAFF ATTENDANCE
  // ==========================================================

  const handleViewAttendance = async (
    staff
  ) => {

    try {

      setHistoryLoading(true);
      setErrorMessage("");

      const response =
        await ReceptionistAttendanceService
          .getAdminStaffAttendanceHistory(
            staff.userId
          );

      const records =
        Array.isArray(response)
          ? response
          : [];


      // ------------------------------------------------------
      // LATEST RECORD FIRST
      // ------------------------------------------------------

      const sortedRecords =
        [...records].sort(
          (a, b) => {

            const dateA =
              new Date(
                `${a.attendanceDate}T${
                  a.punchInTime || "00:00:00"
                }`
              );

            const dateB =
              new Date(
                `${b.attendanceDate}T${
                  b.punchInTime || "00:00:00"
                }`
              );

            return dateB - dateA;
          }
        );


      setAttendanceRecords(
        sortedRecords
      );

      setSelectedStaff(
        staff
      );

    } catch (error) {

      console.error(
        "Staff attendance history error:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
        "Unable to load attendance history."
      );

    } finally {

      setHistoryLoading(false);

    }
  };


  // ==========================================================
  // BACK TO STAFF LIST
  // ==========================================================

  const handleBack = () => {

    setSelectedStaff(null);

    setAttendanceRecords([]);

    setErrorMessage("");

  };


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (
    date
  ) => {

    if (!date) {
      return "--";
    }

    const parts =
      date.split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;

  };


  // ==========================================================
  // FORMAT TIME
  // ==========================================================

  const formatTime = (
    time
  ) => {

    if (!time) {
      return "--";
    }

    const parts =
      time.split(":");

    if (parts.length < 2) {
      return time;
    }

    let hour =
      parseInt(
        parts[0],
        10
      );

    const minute =
      parts[1];

    const period =
      hour >= 12
        ? "PM"
        : "AM";

    hour =
      hour % 12 || 12;

    return `${hour}:${minute} ${period}`;

  };


  // ==========================================================
  // FORMAT HOURS
  // ==========================================================

  const formatHours = (
    hours
  ) => {

    if (
      hours === null ||
      hours === undefined
    ) {

      return "--";

    }

    return `${Number(hours).toFixed(2)} Hrs`;

  };


  // ==========================================================
  // FORMAT ROLE
  // ==========================================================

  const formatRole = (
    role
  ) => {

    if (!role) {
      return "--";
    }

    return role
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, char =>
        char.toUpperCase()
      );

  };


  // ==========================================================
  // STAFF HISTORY VIEW
  // ==========================================================

  if (selectedStaff) {

    return (

      <div className="min-h-screen bg-slate-100 px-6 py-6">

        {/* ====================================================
            ERROR
        ==================================================== */}

        {errorMessage && (

          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

            <AlertCircle className="w-5 h-5" />

            {errorMessage}

          </div>

        )}


        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="px-8 py-7 border-b border-slate-100">

            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 mb-5"
            >

              <ArrowLeft className="w-4 h-4" />

              Back to Staff

            </button>


            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">

                  Attendance History

                </p>

                <h2 className="text-2xl font-semibold text-slate-900">

                  {selectedStaff.name || "--"}

                </h2>

                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">

                  <span>
                    Username: {selectedStaff.username || "--"}
                  </span>

                  <span>
                    Role: {formatRole(selectedStaff.role)}
                  </span>

                </div>

              </div>


              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">

                <UserRound className="w-6 h-6 text-slate-500" />

              </div>

            </div>

          </div>


          {/* ==================================================
              TABLE HEADER
          ================================================== */}

<div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr] items-center gap-4 bg-slate-50 border-b border-slate-100 px-8 py-5">

            <div className="text-xs font-medium text-slate-500 uppercase">
              Date
            </div>

            <div className="text-xs font-medium text-slate-500 uppercase">
              Punch In
            </div>

            <div className="text-xs font-medium text-slate-500 uppercase">
              Punch Out
            </div>

            <div className="text-xs font-medium text-slate-500 uppercase">
              Total Hours
            </div>

            <div className="text-xs font-medium text-slate-500 uppercase">
  Status
</div>






          </div>


          {/* ==================================================
              HISTORY LOADING
          ================================================== */}

          {historyLoading && (

            <div className="px-8 py-12 text-center text-slate-400">

              Loading attendance history...

            </div>

          )}


          {/* ==================================================
              HISTORY EMPTY
          ================================================== */}













          {!historyLoading &&
            attendanceRecords.length === 0 && (

              <div className="px-8 py-16 text-center">

                <CalendarDays
                  className="w-12 h-12 mx-auto text-slate-300 mb-4"
                />

                <p className="text-lg font-medium text-slate-600">

                  No attendance records found

                </p>

                <p className="text-sm text-slate-400 mt-2">

                  This staff member has no attendance history.

                </p>

              </div>

            )}


          {/* ==================================================
              HISTORY RECORDS
          ================================================== */}

          {!historyLoading &&
  attendanceRecords.map((record) => (
    <div
      key={record.id}
      className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr] items-center gap-4 px-8 py-6 border-b border-slate-100 last:border-b-0"
    >

      {/* DATE */}
      <div className="flex items-center gap-4">

        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">

          <CalendarDays
            className="w-5 h-5 text-slate-500"
          />

        </div>

        <span className="font-medium text-slate-800">
          {formatDate(record.attendanceDate)}
        </span>

      </div>


      {/* PUNCH IN */}
      <div className="font-medium text-slate-700">
        {formatTime(record.punchInTime)}
      </div>


      {/* PUNCH OUT */}
      <div className="font-medium text-slate-700">
        {formatTime(record.punchOutTime)}
      </div>


      {/* TOTAL HOURS */}
      <div>

        <span className="inline-flex items-center rounded-xl bg-sky-50 px-4 py-2 font-medium text-sky-600 whitespace-nowrap">

          {formatHours(record.totalHours)}

        </span>

      </div>


      {/* STATUS */}
      <div>

        <span
          className={
            record.status === "LATE_MARKED"
              ? "inline-flex items-center rounded-xl bg-orange-50 px-4 py-2 font-medium text-orange-600 whitespace-nowrap"

              : record.status === "PRESENT"
              ? "inline-flex items-center rounded-xl bg-green-50 px-4 py-2 font-medium text-green-600 whitespace-nowrap"

              : record.status === "COMPLETED_LATE"
              ? "inline-flex items-center rounded-xl bg-orange-50 px-4 py-2 font-medium text-orange-600 whitespace-nowrap"

              : record.status === "COMPLETED"
              ? "inline-flex items-center rounded-xl bg-blue-50 px-4 py-2 font-medium text-blue-600 whitespace-nowrap"

              : "inline-flex items-center rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-500 whitespace-nowrap"
          }
        >

          {record.status === "LATE_MARKED"
            ? "Late Marked"

            : record.status === "PRESENT"
            ? "Present"

            : record.status === "COMPLETED_LATE"
            ? "Completed Late"

            : record.status === "COMPLETED"
            ? "Completed"

            : "Not Marked"}

        </span>

      </div>

    </div>
  ))}

















        </div>

      </div>

    );

  }


  // ==========================================================
  // STAFF LIST VIEW
  // ==========================================================

  return (

    <div className="min-h-screen bg-slate-100 px-6 py-6">

      {/* ====================================================
          ERROR
      ==================================================== */}

      {errorMessage && (

        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

          <AlertCircle className="w-5 h-5" />

          {errorMessage}

        </div>

      )}


      {/* ====================================================
          STAFF RECORDS
      ==================================================== */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="px-8 py-7">

          <p className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">

            Staff

          </p>

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-semibold text-slate-900">

              Staff Attendance

            </h2>

            <div className="flex items-center gap-2 text-sm text-slate-400">

              <Clock3 className="w-5 h-5" />

              Attendance Management

            </div>

          </div>

        </div>


        {/* ==================================================
            SEARCH + ROLE FILTER
        ================================================== */}

        <div className="px-8 pb-7">

          <div className="flex flex-col md:flex-row gap-4">


            {/* SEARCH */}

            <div className="relative flex-1">

              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              />

              <input
                type="text"
                value={searchKeyword}
                onChange={handleSearch}
                placeholder="Search staff by name or username..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

            </div>


            {/* ROLE */}

            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className="w-full md:w-64 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >

              <option value="ALL">
                All Staff
              </option>

              <option value="RECEPTIONIST">
                Receptionist
              </option>

              <option value="COACH">
                Coach
              </option>

              <option value="INVENTORY_MANAGER">
                Inventory Manager
              </option>

              <option value="CLEANING_STAFF">
                Cleaning Staff
              </option>

            </select>

          </div>

        </div>


        {/* ==================================================
            TABLE HEADER
        ================================================== */}

        <div className="grid grid-cols-4 bg-slate-50 border-y border-slate-100 px-8 py-5">

          <div className="text-xs font-medium text-slate-500 uppercase">
            Employee
          </div>

          <div className="text-xs font-medium text-slate-500 uppercase">
            Username
          </div>

          <div className="text-xs font-medium text-slate-500 uppercase">
            Role
          </div>

          <div className="text-xs font-medium text-slate-500 uppercase">
            Action
          </div>

        </div>


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (

          <div className="px-8 py-12 text-center text-slate-400">

            Loading staff records...

          </div>

        )}


        {/* ==================================================
            EMPTY
        ================================================== */}

        {!loading &&
          staffRecords.length === 0 && (

            <div className="px-8 py-16 text-center">

              <UserRound
                className="w-12 h-12 mx-auto text-slate-300 mb-4"
              />

              <p className="text-lg font-medium text-slate-600">

                No staff found

              </p>

              <p className="text-sm text-slate-400 mt-2">

                Try another name, username, or role.

              </p>

            </div>

          )}


        {/* ==================================================
            STAFF RECORDS
        ================================================== */}

        {!loading &&
          staffRecords.map(
            (staff) => (

              <div
                key={staff.userId}
                className="grid grid-cols-4 items-center px-8 py-5 border-b border-slate-100 last:border-b-0"
              >

                {/* EMPLOYEE */}

                <div className="flex items-center gap-4">

                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">

                    <UserRound
                      className="w-5 h-5 text-slate-500"
                    />

                  </div>

                  <span className="font-medium text-slate-800">

                    {staff.name || "--"}

                  </span>

                </div>


                {/* USERNAME */}

                <div className="font-medium text-slate-700">

                  {staff.username || "--"}

                </div>


                {/* ROLE */}

                <div>

                  <span className="inline-flex rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">

                    {formatRole(
                      staff.role
                    )}

                  </span>

                </div>


                {/* ACTION */}

                <div>

                  <button
                    type="button"
                    onClick={() =>
                      handleViewAttendance(
                        staff
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
                  >

                    <Eye className="w-4 h-4" />

                    View

                  </button>

                </div>

              </div>

            )
          )}

      </div>

    </div>

  );

};


export default ReceptionistAttendanceManagement;