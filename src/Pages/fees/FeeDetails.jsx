import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Search,
  RefreshCw,
  Eye,
  CreditCard,
  Users,
  CheckCircle2,
  Clock3,
  ChevronDown,
  X,
  IndianRupee,
  CalendarDays,
  Layers3,
  Trophy,
  BarChart3
} from "lucide-react";

import enrollmentService from "./enrollmentService";
import PaymentService from "../payment/PaymentService";


// =========================================================
// HELPERS
// =========================================================

const getData = (response) => {

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};


const normalizeStatus = (value) =>
  String(value || "").toUpperCase();


const isSuccessfulPayment = (payment) =>
  [
    "RECEIVED",
    "COMPLETED",
    "SUCCESS",
    "PAID"
  ].includes(
    normalizeStatus(payment?.status)
  );


const formatCurrency = (value) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2
    }
  ).format(
    Number(value || 0)
  );


const getCurrentYear = () =>
  new Date().getFullYear();


const getYearOptions = () => {

  const currentYear =
    getCurrentYear();

  return Array.from(
    { length: 5 },
    (_, index) =>
      currentYear - index
  );
};


// =========================================================
// MAIN COMPONENT
// =========================================================

const FeeDetails = () => {

  const navigate = useNavigate();


  // =======================================================
  // EXISTING PLAYER FEE HISTORY STATE
  // =======================================================

  const [enrollments, setEnrollments] =
    useState([]);

  const [payments, setPayments] =
    useState({});

  const [installments, setInstallments] =
    useState({});

  const [selectedSport, setSelectedSport] =
    useState("ALL");

  const [selectedStatus, setSelectedStatus] =
    useState("ALL");

  const [search, setSearch] =
    useState("");

  const [selectedEnrollment, setSelectedEnrollment] =
    useState(null);


  // =======================================================
  // NEW VIEW STATE
  // =======================================================

  const [viewType, setViewType] =
    useState("PLAYER_HISTORY");


  // =======================================================
  // NEW REPORT STATE
  // =======================================================

  const [reportSport, setReportSport] =
    useState("ALL");

  const [selectedYear, setSelectedYear] =
    useState(
      String(getCurrentYear())
    );

  const [reportViewMode, setReportViewMode] =
    useState("MONTHLY");

  const [report, setReport] =
    useState(null);

  const [reportLoading, setReportLoading] =
    useState(false);

  const [reportError, setReportError] =
    useState("");


  // =======================================================
  // COMMON LOADING STATE
  // =======================================================

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


  // =======================================================
  // LOAD EXISTING PLAYER FEES
  // =======================================================

  const loadFees = useCallback(
    async () => {

      try {

        setLoading(true);

        const enrollmentData =
          getData(
            await enrollmentService.getAll()
          );

        setEnrollments(
          enrollmentData
        );


        const paymentMap = {};
        const installmentMap = {};


        await Promise.all(
          enrollmentData.map(
            async (enrollment) => {

              const id =
                enrollment.id;


              try {

                paymentMap[id] =
                  getData(
                    await PaymentService
                      .getByEnrollment(id)
                  );

              } catch {

                paymentMap[id] = [];

              }


              try {

                installmentMap[id] =
                  getData(
                    await PaymentService
                      .getInstallments(id)
                  );

              } catch {

                installmentMap[id] = [];

              }

            }
          )
        );


        setPayments(
          paymentMap
        );

        setInstallments(
          installmentMap
        );


      } catch (error) {

        console.error(
          "Failed to load fee details:",
          error
        );

        setEnrollments([]);

        setPayments({});

        setInstallments({});


      } finally {

        setLoading(false);

        setRefreshing(false);

      }

    },
    []
  );


  // =======================================================
  // LOAD PLAYER FEES ON INITIAL LOAD
  // =======================================================

  useEffect(() => {

    loadFees();

  }, [loadFees]);


  // =======================================================
  // EXISTING SPORTS
  // =======================================================

  const sports = useMemo(
    () => {

      const map =
        new Map();


      enrollments.forEach(
        (e) => {

          if (
            e.sportId &&
            e.sportName
          ) {

            map.set(
              e.sportId,
              e.sportName
            );

          }

        }
      );


      return [
        ...map
      ].map(
        ([id, name]) => ({
          id,
          name
        })
      );

    },
    [enrollments]
  );


  // =======================================================
  // EXISTING PLAYER FEE CALCULATION
  // =======================================================

  const getFeeInfo = useCallback(
    (enrollment) => {

      const paid =
        (
          payments[
            enrollment.id
          ] || []
        )
          .filter(
            isSuccessfulPayment
          )
          .reduce(
            (sum, p) =>
              sum +
              Number(
                p.amount || 0
              ),
            0
          );


      const total =
        Number(
          enrollment.finalAmount || 0
        );


      const remaining =
        Math.max(
          total - paid,
          0
        );


      const list =
        installments[
          enrollment.id
        ] || [];


      const pending =
        list.filter(
          (i) =>
            normalizeStatus(
              i.status
            ) === "PENDING"
        );


      return {

        total,

        paid,

        remaining,

        list,

        pending,

        status:
          remaining <= 0
            ? "COMPLETED"
            : "PENDING"

      };

    },
    [
      payments,
      installments
    ]
  );


  // =======================================================
  // EXISTING PLAYER FILTER
  // =======================================================

  const filtered =
    useMemo(
      () =>
        enrollments.filter(
          (e) => {

            const info =
              getFeeInfo(e);


            const q =
              search
                .trim()
                .toLowerCase();


            const text =
              `${e.playerName || ""} ${
                e.sportName || ""
              } ${
                e.batchName || ""
              }`.toLowerCase();


            return (
              (!q ||
                text.includes(q)) &&

              (
                selectedSport ===
                "ALL" ||
                String(
                  e.sportId
                ) ===
                String(
                  selectedSport
                )
              ) &&

              (
                selectedStatus ===
                "ALL" ||
                info.status ===
                selectedStatus
              )
            );

          }
        ),
      [
        enrollments,
        search,
        selectedSport,
        selectedStatus,
        getFeeInfo
      ]
    );


  // =======================================================
  // OPEN PAYMENT
  // =======================================================

  const openPayment =
    (enrollment) => {

      const info =
        getFeeInfo(
          enrollment
        );


      const next =
        info.pending[0];


      navigate(
        "/receptionist/payment-form",
        {
          state: {

            playerId:
              enrollment.playerId,

            playerName:
              enrollment.playerName,

            playerEnrollmentId:
              enrollment.id,

            enrollmentId:
              enrollment.id,

            sportId:
              enrollment.sportId,

            sportName:
              enrollment.sportName,

            batchId:
              enrollment.batchId,

            batchName:
              enrollment.batchName,

            finalAmount:
              info.total,

            paidAmount:
              info.paid,

            remainingAmount:
              next
                ? Number(
                    next.amount || 0
                  )
                : info.remaining,

            installmentId:
              next?.id ||
              null,

            installmentNumber:
              next?.installmentNumber ||
              null

          }
        }
      );

    };


  // =======================================================
  // LOAD NEW SPORT FEE REPORT
  // =======================================================

  const loadFeeReport =
    useCallback(
      async () => {

        try {

          setReportLoading(
            true
          );

          setReportError(
            ""
          );


          let response;


          // =================================================
          // ALL SPORTS
          // =================================================

          if (
            reportSport ===
            "ALL"
          ) {

            response =
              await enrollmentService
                .getAllSportsFeeReport(
                  Number(
                    selectedYear
                  )
                );

          }


          // =================================================
          // SPECIFIC SPORT
          // =================================================

          else {

            response =
              await enrollmentService
                .getSportFeeReport(
                  reportSport,
                  Number(
                    selectedYear
                  )
                );

          }


          const data =
            response?.data ??
            response;


          setReport(
            data
          );


        } catch (error) {

          console.error(
            "Failed to load fee report:",
            error
          );


          setReport(
            null
          );


          setReportError(
            error?.message ||
            "Failed to load fee report."
          );


        } finally {

          setReportLoading(
            false
          );

          setRefreshing(
            false
          );

        }

      },
      [
        reportSport,
        selectedYear
      ]
    );


  // =======================================================
  // LOAD REPORT WHEN REPORT FILTER CHANGES
  // =======================================================

  useEffect(
    () => {

      if (
        viewType ===
        "FEE_REPORT"
      ) {

        loadFeeReport();

      }

    },
    [
      viewType,
      loadFeeReport
    ]
  );


  // =======================================================
  // MONTHLY REPORT DATA
  // =======================================================

  const monthlyReports =
    useMemo(
      () => {

        if (
          Array.isArray(
            report?.monthlyReports
          )
        ) {

          return report.monthlyReports;

        }

        return [];

      },
      [report]
    );


  // =======================================================
  // YEARLY TOTALS
  // =======================================================

  const yearlyCollection =
    Number(
      report?.yearlyCollection ||
      0
    );


  const yearlyPending =
    Number(
      report?.yearlyPending ||
      0
    );


  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh =
    async () => {

      setRefreshing(
        true
      );


      if (
        viewType ===
        "PLAYER_HISTORY"
      ) {

        await loadFees();

      } else {

        await loadFeeReport();

      }

    };


  // =======================================================
  // LOADING
  // =======================================================

  if (
    loading &&
    viewType ===
    "PLAYER_HISTORY"
  ) {

    return (

      <div className="min-h-[500px] flex items-center justify-center text-gray-600">

        <RefreshCw
          className="animate-spin mr-3"
          size={22}
        />

        Loading fee details...

      </div>

    );

  }


  // =======================================================
  // MAIN RENDER
  // =======================================================

  return (

    <div className="min-h-screen bg-[#f7f9fc] px-4 md:px-6 py-6 md:py-8">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-7">

        <div>

          <h1 className="text-3xl font-bold text-[#10213f]">
            Fees Collection
          </h1>

          <p className="mt-2 text-gray-500">
            View player fee history and sport-wise fee reports.
          </p>

        </div>


        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-[#10213f] hover:bg-gray-50"
        >

          <RefreshCw
            size={18}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh

        </button>

      </div>


      {/* ===================================================
          MAIN VIEW DROPDOWN
      =================================================== */}

      <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 mb-6 shadow-sm">

        <Filter label="View">

          <Select
            value={viewType}
            onChange={setViewType}
          >

            <option value="PLAYER_HISTORY">
              Player Fee History
            </option>

            <option value="FEE_REPORT">
              Fee Collection Report
            </option>

          </Select>

        </Filter>

      </div>


      {/* ===================================================
          PLAYER FEE HISTORY
          EXISTING UI
      =================================================== */}

      {viewType ===
        "PLAYER_HISTORY" && (

        <>

          {/* =================================================
              EXISTING FILTERS
          ================================================= */}

          <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 mb-6 shadow-sm">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


              <Filter label="Sport">

                <Select
                  value={
                    selectedSport
                  }
                  onChange={
                    setSelectedSport
                  }
                >

                  <option value="ALL">
                    All Sports
                  </option>

                  {sports.map(
                    (s) => (

                      <option
                        key={s.id}
                        value={s.id}
                      >
                        {s.name}
                      </option>

                    )
                  )}

                </Select>

              </Filter>


              <Filter label="Search Player">

                <div className="relative">

                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={search}
                    onChange={
                      (e) =>
                        setSearch(
                          e.target.value
                        )
                    }
                    placeholder="Search player, sport or batch..."
                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />

                </div>

              </Filter>


              <Filter label="Payment Status">

                <Select
                  value={
                    selectedStatus
                  }
                  onChange={
                    setSelectedStatus
                  }
                >

                  <option value="ALL">
                    All Status
                  </option>

                  <option value="PENDING">
                    Pending
                  </option>

                  <option value="COMPLETED">
                    Completed
                  </option>

                </Select>

              </Filter>


            </div>

          </div>


          {/* =================================================
              EXISTING SUMMARY
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

            <Summary
              title="Players"
              value={
                filtered.length
              }
              icon={
                <Users size={23} />
              }
              cls="text-blue-600 bg-blue-50"
            />


            <Summary
              title="Pending Fees"
              value={
                filtered.filter(
                  (e) =>
                    getFeeInfo(e)
                      .status ===
                    "PENDING"
                ).length
              }
              icon={
                <Clock3 size={23} />
              }
              cls="text-orange-500 bg-orange-50"
            />


            <Summary
              title="Completed Fees"
              value={
                filtered.filter(
                  (e) =>
                    getFeeInfo(e)
                      .status ===
                    "COMPLETED"
                ).length
              }
              icon={
                <CheckCircle2
                  size={23}
                />
              }
              cls="text-green-600 bg-green-50"
            />

          </div>


          {/* =================================================
              EXISTING PLAYER TABLE
          ================================================= */}

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100">

              <h2 className="text-lg font-bold text-[#10213f]">
                Player Fee Details
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Use View for complete information or Pay Remaining to collect the next due amount.
              </p>

            </div>


            {
              filtered.length ===
              0 ? (

                <Empty />

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1100px]">

                    <thead className="bg-[#f8fafc]">

                      <tr>

                        {[
                          "Player",
                          "Sport",
                          "Batch",
                          "Payment Status",
                          "Remaining Fee",
                          "Remaining Installments",
                          "Actions"
                        ].map(
                          (h, i) => (

                            <th
                              key={h}
                              className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${
                                i === 6
                                  ? "text-right"
                                  : ""
                              }`}
                            >
                              {h}
                            </th>

                          )
                        )}

                      </tr>

                    </thead>


                    <tbody className="divide-y divide-gray-100">

                      {filtered.map(
                        (e) => {

                          const info =
                            getFeeInfo(
                              e
                            );


                          return (

                            <tr
                              key={e.id}
                              className="hover:bg-gray-50"
                            >

                              <td className="px-6 py-5">

                                <div className="flex items-center gap-3">

                                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">

                                    {(
                                      e.playerName ||
                                      "P"
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}

                                  </div>


                                  <div>

                                    <p className="font-semibold text-[#10213f]">

                                      {
                                        e.playerName ||
                                        "Unknown Player"
                                      }

                                    </p>

                                    <p className="text-xs text-gray-400 mt-1">

                                      Enrollment #
                                      {e.id}

                                    </p>

                                  </div>

                                </div>

                              </td>


                              <td className="px-6 py-5">

                                <span className="flex items-center gap-2">

                                  <Trophy
                                    size={17}
                                    className="text-blue-500"
                                  />

                                  {
                                    e.sportName ||
                                    "-"
                                  }

                                </span>

                              </td>


                              <td className="px-6 py-5">

                                <span className="flex items-center gap-2">

                                  <Layers3
                                    size={17}
                                    className="text-gray-400"
                                  />

                                  {
                                    e.batchName ||
                                    "-"
                                  }

                                </span>

                              </td>


                              <td className="px-6 py-5">

                                {
                                  info.status ===
                                  "COMPLETED"

                                    ? (

                                      <Badge
                                        green
                                        icon={
                                          <CheckCircle2
                                            size={15}
                                          />
                                        }
                                      >
                                        Completed
                                      </Badge>

                                    )

                                    : (

                                      <Badge
                                        icon={
                                          <Clock3
                                            size={15}
                                          />
                                        }
                                      >
                                        Pending
                                      </Badge>

                                    )
                                }

                              </td>


                              <td className="px-6 py-5">

                                <p
                                  className={`font-bold ${
                                    info.remaining >
                                    0
                                      ? "text-orange-600"
                                      : "text-green-600"
                                  }`}
                                >

                                  {
                                    formatCurrency(
                                      info.remaining
                                    )
                                  }

                                </p>

                                <p className="text-xs text-gray-400 mt-1">

                                  Total{" "}
                                  {
                                    formatCurrency(
                                      info.total
                                    )
                                  }

                                </p>

                              </td>


                              <td className="px-6 py-5">

                                {
                                  normalizeStatus(
                                    e.paymentPlan
                                  ) ===
                                  "ONE_TIME"

                                    ? (

                                      <span className="text-gray-400">
                                        One Time
                                      </span>

                                    )

                                    : info.pending.length ===
                                      0

                                    ? (

                                      <span className="text-green-600 font-medium">
                                        All Paid
                                      </span>

                                    )

                                    : (

                                      <span className="font-semibold text-[#10213f]">
                                        {
                                          info.pending.length
                                        }{" "}
                                        remaining
                                      </span>

                                    )
                                }

                              </td>


                              <td className="px-6 py-5">

                                <div className="flex justify-end items-center gap-2">

                                  <button
                                    type="button"
                                    title="View complete details"
                                    onClick={() =>
                                      setSelectedEnrollment(
                                        e
                                      )
                                    }
                                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:text-blue-600 hover:bg-blue-50"
                                  >

                                    <Eye
                                      size={18}
                                    />

                                  </button>


                                  {info.remaining >
                                    0 && (

                                    <button
                                      type="button"
                                      onClick={() =>
                                        openPayment(
                                          e
                                        )
                                      }
                                      className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                                    >

                                      {
                                        info.list
                                          .length
                                          ? "Pay Installment"
                                          : "Pay Remaining"
                                      }

                                    </button>

                                  )}

                                </div>

                              </td>


                            </tr>

                          );

                        }
                      )}

                    </tbody>

                  </table>

                </div>

              )
            }

          </div>


          {/* =================================================
              EXISTING MODAL
          ================================================= */}

          {
            selectedEnrollment && (

              <FeeModal
                enrollment={
                  selectedEnrollment
                }
                info={
                  getFeeInfo(
                    selectedEnrollment
                  )
                }
                onClose={() =>
                  setSelectedEnrollment(
                    null
                  )
                }
                onPay={() =>
                  openPayment(
                    selectedEnrollment
                  )
                }
              />

            )
          }

        </>

      )}


      {/* ===================================================
          NEW FEE COLLECTION REPORT
      =================================================== */}

      {viewType ===
        "FEE_REPORT" && (

        <>

          {/* =================================================
              REPORT FILTERS
          ================================================= */}

          <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 mb-6 shadow-sm">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


              {/* SPORT */}

              <Filter label="Sport">

                <Select
                  value={
                    reportSport
                  }
                  onChange={
                    setReportSport
                  }
                >

                  <option value="ALL">
                    All Sports
                  </option>

                  {sports.map(
                    (sport) => (

                      <option
                        key={sport.id}
                        value={sport.id}
                      >
                        {sport.name}
                      </option>

                    )
                  )}

                </Select>

              </Filter>


              {/* YEAR */}

              <Filter label="Year">

                <Select
                  value={
                    selectedYear
                  }
                  onChange={
                    setSelectedYear
                  }
                >

                  {getYearOptions().map(
                    (year) => (

                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>

                    )
                  )}

                </Select>

              </Filter>


              {/* VIEW */}

              <Filter label="View">

                <div className="grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setReportViewMode(
                        "MONTHLY"
                      )
                    }
                    className={`px-4 py-3.5 rounded-xl font-semibold border ${
                      reportViewMode ===
                      "MONTHLY"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Monthly
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setReportViewMode(
                        "YEARLY"
                      )
                    }
                    className={`px-4 py-3.5 rounded-xl font-semibold border ${
                      reportViewMode ===
                      "YEARLY"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Yearly
                  </button>

                </div>

              </Filter>

            </div>

          </div>


          {/* =================================================
              REPORT HEADER
          ================================================= */}

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6">

            <div className="p-6 flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">

                  <Trophy
                    size={25}
                  />

                </div>


                <div>

                  <h2 className="text-xl font-bold text-[#10213f]">

                    {
                      report?.sportName ||
                      (
                        reportSport ===
                        "ALL"
                          ? "All Sports"
                          : "Sport"
                      )
                    }

                  </h2>

                  <p className="text-sm text-gray-500 mt-1">

                    Fee report for{" "}
                    {selectedYear}

                  </p>

                </div>

              </div>


              <CalendarDays
                size={22}
                className="text-gray-500"
              />

            </div>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {
            reportError && (

              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-6">

                {reportError}

              </div>

            )
          }


          {/* =================================================
              REPORT LOADING
          ================================================= */}

          {
            reportLoading ? (

              <div className="min-h-[300px] flex items-center justify-center text-gray-600">

                <RefreshCw
                  size={22}
                  className="animate-spin mr-3"
                />

                Loading fee report...

              </div>

            ) : (

              <>


                {/* =============================================
                    MONTHLY VIEW
                ============================================= */}

                {
                  reportViewMode ===
                  "MONTHLY" && (

                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                      <div className="px-6 py-5 border-b border-gray-100">

                        <div className="flex items-center gap-3">

                          <BarChart3
                            size={21}
                            className="text-blue-600"
                          />

                          <div>

                            <h2 className="text-lg font-bold text-[#10213f]">
                              Monthly Fee Collection
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">

                              Monthly collection and pending amount for{" "}
                              {
                                report?.sportName ||
                                (
                                  reportSport ===
                                  "ALL"
                                    ? "All Sports"
                                    : "Selected Sport"
                                )
                              }{" "}
                              in {selectedYear}.

                            </p>

                          </div>

                        </div>

                      </div>


                      {
                        monthlyReports.length ===
                        0 ? (

                          <div className="py-20 text-center">

                            <BarChart3
                              size={42}
                              className="mx-auto text-gray-300"
                            />

                            <h3 className="mt-4 text-lg font-semibold text-gray-700">
                              No monthly report available
                            </h3>

                            <p className="text-gray-400 mt-1">
                              No fee report data found for the selected filters.
                            </p>

                          </div>

                        ) : (

                          <div className="overflow-x-auto">

                            <table className="w-full">

                              <thead className="bg-[#f8fafc]">

                                <tr>

                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Month
                                  </th>

                                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                                    Collection
                                  </th>

                                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                                    Pending
                                  </th>

                                </tr>

                              </thead>


                              <tbody className="divide-y divide-gray-100">

                                {monthlyReports.map(
                                  (month) => (

                                    <tr
                                      key={
                                        month.monthNumber
                                      }
                                      className="hover:bg-gray-50"
                                    >

                                      <td className="px-6 py-5">

                                        <div className="flex items-center gap-3">

                                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                                            <CalendarDays
                                              size={18}
                                            />

                                          </div>

                                          <span className="font-semibold text-[#10213f]">

                                            {
                                              month.monthName ||
                                              "-"
                                            }

                                          </span>

                                        </div>

                                      </td>


                                      <td className="px-6 py-5 text-right">

                                        <span className="font-bold text-green-600">

                                          {
                                            formatCurrency(
                                              month.collection
                                            )
                                          }

                                        </span>

                                      </td>


                                      <td className="px-6 py-5 text-right">

                                        <span className="font-bold text-orange-600">

                                          {
                                            formatCurrency(
                                              month.pending
                                            )
                                          }

                                        </span>

                                      </td>

                                    </tr>

                                  )
                                )}

                              </tbody>

                            </table>

                          </div>

                        )
                      }

                    </div>

                  )
                }


                {/* =============================================
                    YEARLY VIEW
                ============================================= */}

                {
                  reportViewMode ===
                  "YEARLY" && (

                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                      <div className="px-6 py-5 border-b border-gray-100">

                        <div className="flex items-center gap-3">

                          <BarChart3
                            size={21}
                            className="text-blue-600"
                          />

                          <div>

                            <h2 className="text-lg font-bold text-[#10213f]">
                              Yearly Fee Summary
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                              Total fee collection and pending amount
                            </p>

                          </div>

                        </div>

                      </div>


                      <div className="p-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                          {/* COLLECTION */}

                          <div className="border border-green-100 bg-green-50 rounded-2xl p-6">

                            <div className="flex items-center justify-between">

                              <div>

                                <p className="text-sm text-green-700 font-medium">
                                  Total Collection
                                </p>

                                <p className="text-3xl font-bold text-green-700 mt-2">

                                  {
                                    formatCurrency(
                                      yearlyCollection
                                    )
                                  }

                                </p>

                                <p className="text-sm text-green-600 mt-2">

                                  {
                                    report?.sportName ||
                                    (
                                      reportSport ===
                                      "ALL"
                                        ? "All Sports"
                                        : "Selected Sport"
                                    )
                                  }

                                  {" — "}

                                  {selectedYear}

                                </p>

                              </div>


                              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-green-600">

                                <IndianRupee
                                  size={24}
                                />

                              </div>

                            </div>

                          </div>


                          {/* PENDING */}

                          <div className="border border-orange-100 bg-orange-50 rounded-2xl p-6">

                            <div className="flex items-center justify-between">

                              <div>

                                <p className="text-sm text-orange-700 font-medium">
                                  Total Pending
                                </p>

                                <p className="text-3xl font-bold text-orange-700 mt-2">

                                  {
                                    formatCurrency(
                                      yearlyPending
                                    )
                                  }

                                </p>

                                <p className="text-sm text-orange-600 mt-2">

                                  {
                                    report?.sportName ||
                                    (
                                      reportSport ===
                                      "ALL"
                                        ? "All Sports"
                                        : "Selected Sport"
                                    )
                                  }

                                  {" — "}

                                  {selectedYear}

                                </p>

                              </div>


                              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-orange-500">

                                <Clock3
                                  size={24}
                                />

                              </div>

                            </div>

                          </div>


                        </div>

                      </div>

                    </div>

                  )
                }

              </>

            )
          }

        </>

      )}

    </div>

  );

};


// =========================================================
// FILTER
// =========================================================

const Filter =
  ({
    label,
    children
  }) => (

    <div>

      <label className="block text-sm font-semibold text-gray-700 mb-2">

        {label}

      </label>

      {children}

    </div>

  );


// =========================================================
// SELECT
// =========================================================

const Select =
  ({
    value,
    onChange,
    children
  }) => (

    <div className="relative">

      <select
        value={value}
        onChange={
          (e) =>
            onChange(
              e.target.value
            )
        }
        className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3.5 pr-10 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
      >

        {children}

      </select>

      <ChevronDown
        size={18}
        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
      />

    </div>

  );


// =========================================================
// SUMMARY
// =========================================================

const Summary =
  ({
    title,
    value,
    icon,
    cls
  }) => (

    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">

      <div>

        <p className="text-gray-500 text-sm">
          {title}
        </p>

        <p className="text-2xl font-bold text-[#10213f] mt-2">
          {value}
        </p>

      </div>

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${cls}`}
      >
        {icon}
      </div>

    </div>

  );


// =========================================================
// BADGE
// =========================================================

const Badge =
  ({
    children,
    icon,
    green = false
  }) => (

    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
        green
          ? "bg-green-50 text-green-700"
          : "bg-orange-50 text-orange-700"
      }`}
    >

      {icon}

      {children}

    </span>

  );


// =========================================================
// EMPTY
// =========================================================

const Empty = () => (

  <div className="py-20 text-center">

    <CreditCard
      size={42}
      className="mx-auto text-gray-300"
    />

    <h3 className="mt-4 text-lg font-semibold text-gray-700">
      No fee records found
    </h3>

    <p className="text-gray-400 mt-1">
      Try changing your search or filters.
    </p>

  </div>

);


// =========================================================
// FEE MODAL
// =========================================================

const FeeModal =
  ({
    enrollment,
    info,
    onClose,
    onPay
  }) => (

    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden">


        {/* HEADER */}

        <div className="flex items-center justify-between px-6 py-5 border-b">

          <div>

            <h2 className="text-xl font-bold text-[#10213f]">
              Player Fee Details
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Enrollment and payment information
            </p>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center"
          >

            <X
              size={20}
            />

          </button>

        </div>


        {/* BODY */}

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-90px)]">


          {/* PLAYER */}

          <div className="bg-blue-50 rounded-2xl p-5 mb-6 flex items-center gap-4">

            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">

              {(
                enrollment.playerName ||
                "P"
              )
                .charAt(0)
                .toUpperCase()}

            </div>


            <div>

              <h3 className="text-xl font-bold text-[#10213f]">

                {
                  enrollment.playerName
                }

              </h3>

              <p className="text-gray-600 mt-1">

                {
                  enrollment.sportName ||
                  "-"
                }

                {" • "}

                {
                  enrollment.batchName ||
                  "-"
                }

              </p>

            </div>

          </div>


          {/* SUMMARY */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

            <Box
              label="Total Fee"
              value={
                formatCurrency(
                  info.total
                )
              }
            />

            <Box
              label="Paid"
              value={
                formatCurrency(
                  info.paid
                )
              }
              cls="text-green-600"
            />

            <Box
              label="Remaining"
              value={
                formatCurrency(
                  info.remaining
                )
              }
              cls="text-orange-600"
            />


            <Box
              label="Plan"
              value={
                normalizeStatus(
                  enrollment.paymentPlan
                ) ===
                "ONE_TIME"
                  ? "One Time"
                  : `${info.pending.length} Remaining`
              }
            />

          </div>


          {/* ENROLLMENT INFORMATION */}

          <div className="border rounded-2xl p-5 mb-6">

            <h3 className="font-bold text-[#10213f] mb-4">
              Enrollment Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <Info
                label="Sport"
                value={
                  enrollment.sportName
                }
              />

              <Info
                label="Batch"
                value={
                  enrollment.batchName
                }
              />

              <Info
                label="Enrollment Date"
                value={
                  enrollment.enrollmentDate
                }
              />

              <Info
                label="Payment Plan"
                value={
                  enrollment.paymentPlan
                }
              />

              <Info
                label="Fee Structure"
                value={
                  `#${enrollment.feeStructureId || "-"}`
                }
              />

              <Info
                label="Duration"
                value={
                  enrollment.duration
                    ? `${enrollment.duration} ${
                        enrollment.durationUnit ||
                        ""
                      }`
                    : "-"
                }
              />

            </div>

          </div>


          {/* INSTALLMENTS */}

          {
            info.list.length >
            0 && (

              <div className="border rounded-2xl overflow-hidden">

                <div className="px-5 py-4 bg-gray-50 border-b font-bold text-[#10213f]">
                  Installment Details
                </div>


                <div className="divide-y">

                  {
                    info.list.map(
                      (i) => (

                        <div
                          key={i.id}
                          className="px-5 py-4 flex items-center justify-between"
                        >

                          <div>

                            <p className="font-semibold">
                              Installment{" "}
                              {
                                i.installmentNumber
                              }
                            </p>

                            <p className="text-sm text-gray-500 mt-1">

                              Due:{" "}
                              {
                                i.dueDate ||
                                "-"
                              }

                              {i.paidDate
                                ? ` • Paid: ${i.paidDate}`
                                : ""}

                            </p>

                          </div>


                          <div className="text-right">

                            <p className="font-bold">

                              {
                                formatCurrency(
                                  i.amount
                                )
                              }

                            </p>

                            <p
                              className={`text-sm font-medium ${
                                normalizeStatus(
                                  i.status
                                ) ===
                                "PAID"
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            >

                              {
                                normalizeStatus(
                                  i.status
                                ) ===
                                "PAID"
                                  ? "Paid"
                                  : "Pending"
                              }

                            </p>

                          </div>

                        </div>

                      )
                    )
                  }

                </div>

              </div>

            )
          }


          {/* PAY */}

          {
            info.remaining >
              0 && (

              <div className="mt-6 flex justify-end">

                <button
                  type="button"
                  onClick={
                    onPay
                  }
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >

                  <CreditCard
                    size={18}
                    className="inline mr-2"
                  />

                  {
                    normalizeStatus(
                      enrollment.paymentPlan
                    ) ===
                    "THREE_INSTALLMENTS"
                      ? "Pay Installment"
                      : "Pay Remaining"
                  }

                </button>

              </div>

            )
          }


        </div>

      </div>

    </div>

  );


// =========================================================
// BOX
// =========================================================

const Box =
  ({
    label,
    value,
    cls =
      "text-[#10213f]"
  }) => (

    <div className="border rounded-xl p-4">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p
        className={`text-lg font-bold mt-2 ${cls}`}
      >
        {value}
      </p>

    </div>

  );


// =========================================================
// INFO
// =========================================================

const Info =
  ({
    label,
    value
  }) => (

    <div>

      <p className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="font-semibold text-gray-800 mt-2">
        {value || "-"}
      </p>

    </div>

  );


export default FeeDetails;