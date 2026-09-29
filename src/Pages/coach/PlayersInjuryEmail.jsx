
import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

const PlayersInjuryEmail = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInjuryReports();
  }, []);

  const fetchInjuryReports = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axiosClient.get(
        "/injury-reports/coach"
      );

      const responseData = response.data;

      // Supports common Spring Boot response structures:
      // { data: [...] } or directly [...]
      const reportList = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.data)
        ? responseData.data
        : [];

      setReports(reportList);
    } catch (error) {
      console.error("Failed to fetch injury reports:", error);

      setErrorMessage(
        error.response?.data?.message ||
        "Unable to load injury reports. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const playerName =
      report.playerName ||
      `${report.firstName || ""} ${report.lastName || ""}`.trim();

    const searchValue = searchTerm.toLowerCase();

    return (
      playerName.toLowerCase().includes(searchValue) ||
      (report.injuryType || "").toLowerCase().includes(searchValue) ||
      (report.description || "").toLowerCase().includes(searchValue)
    );
  });

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return dateValue;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Player Injury Reports
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              View injury reports submitted by parents and players assigned to you.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchInjuryReports}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh Reports"}
          </button>
        </div>

        {/* SUMMARY */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Injury Reports
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {reports.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Matching Reports
            </p>

            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {filteredReports.length}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by player name, injury type, or description..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-gray-500">
              Loading injury reports...
            </p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-3 text-4xl">🩹</div>

            <h3 className="text-lg font-semibold text-gray-700">
              No Injury Reports Found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {searchTerm
                ? "No reports match your search."
                : "You have not received any injury reports from your assigned players."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filteredReports.map((report, index) => {
              const playerName =
                report.playerName ||
                `${report.firstName || ""} ${report.lastName || ""}`.trim() ||
                "Unknown Player";

              return (
                <div
                  key={report.id || index}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {playerName}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Injury Report
                      </p>
                    </div>

                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                      Injury
                    </span>
                  </div>

                  {/* CARD BODY */}
                  <div className="space-y-4 p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Injury Type
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {report.injuryType || "Not specified"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Injury Date
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {formatDate(report.injuryDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Reported On
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {formatDate(
                            report.createdAt ||
                            report.reportedAt ||
                            report.createdDate
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Description
                      </p>

                      <div className="mt-2 min-h-20 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                        {report.description?.trim() ||
                          "No additional description provided."}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersInjuryEmail;