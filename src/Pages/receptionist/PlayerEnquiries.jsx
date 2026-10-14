import { useEffect, useState } from "react";

import PlayerEnquiryService from "../../services/PlayerEnquiryService";

const PlayerEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD ENQUIRIES
  // =========================================================

  useEffect(() => {
    const loadEnquiries = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await PlayerEnquiryService.getAll();

        if (response?.success) {
          setEnquiries(response.data || []);
        } else {
          setEnquiries([]);
        }
      } catch (err) {
        console.error("Error loading player enquiries:", err);
        setError("Unable to load player enquiries.");
      } finally {
        setLoading(false);
      }
    };

    loadEnquiries();
  }, []);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateTime) => {
    if (!dateTime) {
      return "-";
    }

    return new Date(dateTime).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-center gap-3 text-gray-500">
          <i className="fas fa-spinner fa-spin" />
          Loading enquiries...
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8">
        <div className="flex items-center gap-3 text-red-600">
          <i className="fas fa-exclamation-circle" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Player Enquiries
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          View enquiries submitted by prospective players.
        </p>
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Total Enquiries</p>

            <p className="text-2xl font-bold text-slate-900 mt-1">
              {enquiries.length}
            </p>
          </div>

          <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center">
            <i className="fas fa-user-plus text-blue-700" />
          </div>
        </div>
      </div>

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {enquiries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <i className="fas fa-inbox text-2xl text-gray-400" />
          </div>

          <h3 className="text-lg font-semibold text-gray-700">
            No enquiries found
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            New player enquiries will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* ===================================================
              MOBILE CARDS (below md)
          =================================================== */}

          <div className="md:hidden space-y-3">
            {enquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {enquiry.playerName || "-"}
                    </p>

                    {enquiry.email && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {enquiry.email}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                    {enquiry.sportName || "-"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 text-sm">
                  <div>
                    <p className="text-[11px] uppercase text-gray-400">
                      Age
                    </p>
                    <p className="text-slate-700">{enquiry.age ?? "-"}</p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase text-gray-400">
                      Player Mobile
                    </p>
                    <p className="text-slate-700">
                      {enquiry.mobile || enquiry.playerMobileNumber || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase text-gray-400">
                      Parent
                    </p>
                    <p className="text-slate-700">
                      {enquiry.parentName || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase text-gray-400">
                      Parent Mobile
                    </p>
                    <p className="text-slate-700">
                      {enquiry.parentMobile || "-"}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-[11px] uppercase text-gray-400">
                      Preferred Batch
                    </p>

                    <p className="text-slate-700 font-medium">
                      {enquiry.batchName || "-"}
                    </p>

                    {enquiry.startTime && enquiry.endTime && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatTime(enquiry.startTime)} -{" "}
                        {formatTime(enquiry.endTime)}
                      </p>
                    )}

                    {enquiry.trainingDays && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {enquiry.trainingDays}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-slate-100">
                  Submitted: {formatDate(enquiry.createdAt)}
                </p>
              </div>
            ))}
          </div>

          {/* ===================================================
              DESKTOP TABLE (md and above)
          =================================================== */}

          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Player
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Age
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Player Mobile
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Sport
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Preferred Batch
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Parent
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Parent Mobile
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Submitted
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {enquiries.map((enquiry) => (
                    <tr
                      key={enquiry.id}
                      className="hover:bg-slate-50 transition"
                    >
                      {/* PLAYER */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">
                          {enquiry.playerName || "-"}
                        </div>

                        {enquiry.email && (
                          <div className="text-xs text-gray-500 mt-1">
                            {enquiry.email}
                          </div>
                        )}
                      </td>

                      {/* AGE */}
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {enquiry.age ?? "-"}
                      </td>

                      {/* PLAYER MOBILE */}
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {enquiry.mobile ||
                          enquiry.playerMobileNumber ||
                          "-"}
                      </td>

                      {/* SPORT */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                          {enquiry.sportName || "-"}
                        </span>
                      </td>

                      {/* BATCH */}
                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-slate-700">
                          {enquiry.batchName || "-"}
                        </div>

                        {enquiry.startTime && enquiry.endTime && (
                          <div className="text-xs text-gray-500 mt-1">
                            {formatTime(enquiry.startTime)}
                            {" - "}
                            {formatTime(enquiry.endTime)}
                          </div>
                        )}

                        {enquiry.trainingDays && (
                          <div className="text-xs text-gray-400 mt-1">
                            {enquiry.trainingDays}
                          </div>
                        )}
                      </td>

                      {/* PARENT */}
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {enquiry.parentName || "-"}
                      </td>

                      {/* PARENT MOBILE */}
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {enquiry.parentMobile || "-"}
                      </td>

                      {/* DATE */}
                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(enquiry.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PlayerEnquiries;
