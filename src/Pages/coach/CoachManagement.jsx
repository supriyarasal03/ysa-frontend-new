import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
    Trash2,
  Edit2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Filter,
  X,
  FileText,
  Download,
  ExternalLink,
  User,
  BriefcaseBusiness,
  ShieldCheck,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
} from "lucide-react";

import {
  getAllCoaches,
  updateCoachStatus,
  getCoachById,
  viewCoachFile,
  downloadCoachFile,
  deleteCoach,
} from "./CoachService";

const API_BASE = "";

export default function CoachManagement() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;


  const [deletingCoachId, setDeletingCoachId] = useState(null);

  const [coachList, setCoachList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Status confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewCoach, setViewCoach] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewPhotoUrl, setViewPhotoUrl] = useState(null);
  const [coachPhotoUrls, setCoachPhotoUrls] = useState({});






const handleDeleteCoach = async (coach) => {
  if (!coach?.id) {
    alert("Invalid coach selected.");
    return;
  }

  const coachName =
    `${coach.firstName || ""} ${coach.lastName || ""}`.trim() ||
    coach.name ||
    `Coach #${coach.id}`;

  const confirmed = window.confirm(
    `Are you sure you want to permanently delete ${coachName}?\n\n` +
    "The coach's login and related records will be deleted. " +
    "Batches will remain without an assigned coach, and player data will be preserved."
  );

  if (!confirmed) {
    return;
  }

  setDeletingCoachId(coach.id);

  try {
    await deleteCoach(coach.id);

    // Remove the deleted coach's photo URL from memory.
    setCoachPhotoUrls((previous) => {
      const updated = { ...previous };
      const photoUrl = updated[coach.id];

      if (photoUrl) {
        window.URL.revokeObjectURL(photoUrl);
      }

      delete updated[coach.id];
      return updated;
    });

    // Close the details modal if it shows the deleted coach.
    if (viewCoach?.id === coach.id) {
      closeView();
    }

    alert("Coach deleted successfully.");

    // Refresh the list from the backend.
    await loadCoaches();
  } catch (err) {
    console.error("Failed to delete coach:", err);

    alert(
      err.response?.data?.message ||
      err.message ||
      "Failed to delete coach. Please try again."
    );
  } finally {
    setDeletingCoachId(null);
  }
};








  const getSportName = (coach) => {

  return (
    coach?.sportName ||
    coach?.sport?.sportsName ||
    coach?.sport?.sportName ||
    "-"
  );

};  

  // =========================================================
  // LOAD COACHES
  // =========================================================

  const loadCoaches = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getAllCoaches();

      let list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      list = [...list].sort(
        (a, b) => (b.id || 0) - (a.id || 0)
      );

      setCoachList(list);

// Load coach profile photos
const photoMap = {};

await Promise.all(
  list.map(async (coach) => {
    const photoPath =
      coach?.livePhotoPath ||
      coach?.profilePhotoPath;

    if (!photoPath) {
      return;
    }

    try {
      const blob = await viewCoachFile(photoPath);

      const url = window.URL.createObjectURL(blob);

      photoMap[coach.id] = url;
    } catch (photoError) {
      console.error(
        `Unable to load photo for coach ${coach.id}:`,
        photoError
      );
    }
  })
);

setCoachPhotoUrls(photoMap);
    } catch (err) {
      console.error("Failed to load coaches:", err);

      setError(
        err.message || "Failed to load coaches"
      );

      setCoachList([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadCoaches();
  }, []);


  // =========================================================
  // HELPERS
  // =========================================================

  const getFullName = (coach) => {
    if (coach?.name || coach?.fullName) {
      return coach.name || coach.fullName;
    }

    return (
      `${coach?.firstName || ""} ${
        coach?.lastName || ""
      }`.trim() || "-"
    );
  };


  const getEmail = (coach) => {
    return (
      coach?.email ||
      coach?.user?.email ||
      "-"
    );
  };


  const getStatus = (coach) => {
    const status =
      coach?.status ||
      coach?.userStatus ||
      coach?.user?.status;

    if (!status) {
      return "Inactive";
    }

    const upper = String(status).toUpperCase();

    if (upper === "ACTIVE") {
      return "Active";
    }

    if (upper === "INACTIVE") {
      return "Inactive";
    }

    return String(status);
  };


  const isActive = (status) => {
    return (
      String(status).toUpperCase() === "ACTIVE"
    );
  };


  const getPhotoUrl = (coach) => {
    const path =
      coach?.livePhotoPath ||
      coach?.profilePhotoPath ||
      coach?.photoUrl;

    if (!path) {
      return null;
    }

    if (
      path.startsWith("http") ||
      path.startsWith("blob:") ||
      path.startsWith("data:")
    ) {
      return path;
    }

    return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  };


  const getInitials = (name) => {
    if (!name || name === "-") {
      return "?";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };


  const formatDate = (dateStr) => {
    if (!dateStr) {
      return "-";
    }

    try {
      return new Date(dateStr).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return dateStr;
    }
  };




  const formatFileSize = (bytes) => {
  if (!bytes) {
    return "-";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};


const handleViewDocument = async (
  document
) => {
  if (!document?.filePath) {
    alert("Document file is not available.");
    return;
  }

  try {
    const blob =
      await viewCoachDocument(
        document.filePath
      );

    const url =
      window.URL.createObjectURL(
        blob
      );

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    setTimeout(() => {
      window.URL.revokeObjectURL(
        url
      );
    }, 60000);

  } catch (error) {
    console.error(error);

    alert(
      error.message ||
        "Unable to view document."
    );
  }
};


const handleDownloadDocument = async (
  document
) => {
  if (!document?.filePath) {
    alert("Document file is not available.");
    return;
  }

  try {
    const result =
      await downloadCoachDocument(
        document.filePath
      );

    const url =
      window.URL.createObjectURL(
        result.blob
      );

    const link =
      window.document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      result.fileName ||
      document.originalFileName ||
      `${document.documentType || "document"}`;

    window.document.body.appendChild(
      link
    );

    link.click();

    window.document.body.removeChild(
      link
    );

    window.URL.revokeObjectURL(
      url
    );

  } catch (error) {
    console.error(error);

    alert(
      error.message ||
        "Unable to download document."
    );
  }
};










  // =========================================================
  // STATISTICS
  // =========================================================

  const totalCoaches = coachList.length;

  const activeCoaches = coachList.filter(
    (coach) =>
      isActive(getStatus(coach))
  ).length;

  const inactiveCoaches =
    totalCoaches - activeCoaches;


  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const filtered = coachList.filter((coach) => {
    const name =
      getFullName(coach).toLowerCase();

    const email =
      getEmail(coach).toLowerCase();

    const mobile = String(
      coach?.mobileNumber || ""
    ).toLowerCase();

      const sport =
  getSportName(coach).toLowerCase();

    const searchLower =
      search.toLowerCase().trim();


   const matchesSearch =
  name.includes(searchLower) ||
  email.includes(searchLower) ||
  mobile.includes(searchLower) ||
  sport.includes(searchLower);

    const status = getStatus(coach);

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" &&
        isActive(status)) ||
      (statusFilter === "Inactive" &&
        !isActive(status));

    return (
      matchesSearch &&
      matchesStatus
    );
  });


  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages =
    Math.ceil(
      filtered.length / itemsPerPage
    ) || 1;

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const paginated =
    filtered.slice(
      startIndex,
      startIndex + itemsPerPage
    );


  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);


  // =========================================================
  // STATUS CHANGE
  // =========================================================

  const openStatusConfirm = (
    coach,
    targetStatus
  ) => {
    setSelectedCoach(coach);
    setNewStatus(targetStatus);
    setConfirmOpen(true);
  };


  const closeStatusConfirm = () => {
    if (statusLoading) {
      return;
    }

    setConfirmOpen(false);
    setSelectedCoach(null);
    setNewStatus("");
  };


  const handleConfirmStatus = async () => {
    if (
      !selectedCoach ||
      !newStatus
    ) {
      return;
    }

    setStatusLoading(true);

    try {
      await updateCoachStatus(
        selectedCoach.id,
        newStatus
      );

      closeStatusConfirm();

      await loadCoaches();
    } catch (err) {
      console.error(
        "Status update failed:",
        err
      );

      alert(
        err.message ||
          "Failed to update coach status"
      );
    } finally {
      setStatusLoading(false);
    }
  };


  // =========================================================
  // VIEW COACH
  // =========================================================
const openView = async (coach) => {
  setViewOpen(true);
  setViewLoading(true);
  setViewCoach(null);
  setViewPhotoUrl(null);

  try {
    const res =
      await getCoachById(coach.id);

    const data =
      res?.data || res;

    setViewCoach(data);

    const photoPath =
      data?.livePhotoPath ||
      data?.profilePhotoPath;

    if (photoPath) {
      try {
        const blob =
          await viewCoachFile(
            photoPath
          );

        const url =
          window.URL.createObjectURL(
            blob
          );

        setViewPhotoUrl(url);

      } catch (photoError) {
        console.error(
          "Unable to load coach photo:",
          photoError
        );
      }
    }

  } catch (error) {

    console.error(error);

    setViewCoach(coach);

  } finally {

    setViewLoading(false);
  }
};






const closeView = () => {
  setViewOpen(false);
  setViewCoach(null);

  if (viewPhotoUrl) {
    window.URL.revokeObjectURL(viewPhotoUrl);
  }

  setViewPhotoUrl(null);
};

  // =========================================================
  // RENDER
  // =========================================================




  return (
    <div className="p-6 lg:p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Coach Management
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Manage all coaches of Yashree Sports Academy
          </p>
        </div>


        <button
          onClick={() =>
            navigate("/coach-form")
          }
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add New Coach
        </button>

      </div>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

        {/* Total */}

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">

          <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-sky-600" />
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Total Coaches
            </p>

            <p className="text-2xl font-bold text-slate-800">
              {totalCoaches}
            </p>
          </div>

        </div>


        {/* Active */}

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">

          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-emerald-600" />
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Active Coaches
            </p>

            <p className="text-2xl font-bold text-slate-800">
              {activeCoaches}
            </p>
          </div>

        </div>


        {/* Inactive */}

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">

          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
            <UserX className="w-6 h-6 text-rose-600" />
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Inactive Coaches
            </p>

            <p className="text-2xl font-bold text-slate-800">
              {inactiveCoaches}
            </p>
          </div>

        </div>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}


      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Search + Filter */}

        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

          <div className="relative w-full lg:w-80">

            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search by name, email or mobile..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition"
            />

          </div>


          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Filter className="w-4 h-4" />
              <span>Status</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <option value="All">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

          </div>

        </div>


        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-slate-50 text-left">

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Coach
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Contact
                </th>
<th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
  Sport
</th>

<th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
  Experience
</th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Salary
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Qualification
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Joining Date
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
                    colSpan="9"
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    Loading coaches...
                  </td>

                </tr>

              ) : paginated.length > 0 ? (

                paginated.map((coach) => {

                  const name =
                    getFullName(coach);

                  const status =
                    getStatus(coach);
const photoUrl =
  coachPhotoUrls[coach.id];

                  const initials =
                    getInitials(name);


                  return (

                    <tr
                      key={coach.id}
                      className="hover:bg-slate-50/70 transition"
                    >

                      {/* Coach */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">

                            {photoUrl ? (

                              <img
                                src={photoUrl}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display =
                                    "none";
                                }}
                              />

                            ) : (

                              initials || "?"

                            )}

                          </div>


                          <div>

                            <p className="font-medium text-slate-800">
                              {name}
                            </p>

                           

                          </div>

                        </div>

                      </td>


                      {/* Contact */}

                      <td className="px-6 py-4">

                        <p className="text-sm text-slate-700">
                          {getEmail(coach)}
                        </p>

                        <p className="text-xs text-slate-400 mt-0.5">
                          {coach.mobileNumber ||
                            "-"}
                        </p>

                      </td>


                      {/* Experience */}
{/* Sport */}

<td className="px-6 py-4 text-sm text-slate-600">

  {getSportName(coach)}

</td>


{/* Experience */}

<td className="px-6 py-4 text-sm text-slate-600">

  {coach.experience !=
  null
    ? `${coach.experience} yrs`
    : "-"}

</td>

{/* Salary */}

<td className="px-6 py-4 text-sm text-slate-600">

  {coach.salary != null
    ? `₹${Number(coach.salary).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "-"}

</td>




                      {/* Qualification */}

                      <td className="px-6 py-4 text-sm text-slate-600">

                        {coach.qualification ||
                          "-"}

                      </td>


                      {/* Joining Date */}

                      <td className="px-6 py-4 text-sm text-slate-600">

                        {formatDate(
                          coach.joiningDate
                        )}

                      </td>


                      {/* Status */}

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            isActive(status)
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >

                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive(
                                status
                              )
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          />

                          {status}

                        </span>

                      </td>


                      {/* =================================================
                          ACTIONS
                          ONLY: VIEW / EDIT / ACTIVE-INACTIVE
                      ================================================= */}

                      <td className="px-6 py-4">

                        <div className="flex items-center justify-center gap-1">

                          {/* VIEW */}

                          <button
                            onClick={() =>
                              openView(
                                coach
                              )
                            }
                            className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>


                          {/* EDIT */}

                          <button
                            onClick={() =>
                              navigate(
                                `/coach-form/${coach.id}`
                              )
                            }
                            className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                            title="Edit coach"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>


                          {/* ACTIVE / INACTIVE */}

                          <button
                            onClick={() =>
                              openStatusConfirm(
                                coach,
                                isActive(
                                  status
                                )
                                  ? "INACTIVE"
                                  : "ACTIVE"
                              )
                            }
                            className={`p-2 rounded-lg transition ${
                              isActive(status)
                                ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={
                              isActive(status)
                                ? "Set Inactive"
                                : "Set Active"
                            }
                          >

                            {isActive(
                              status
                            ) ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}

                          </button>




<button
  type="button"
  onClick={() => handleDeleteCoach(coach)}
  disabled={deletingCoachId === coach.id}
  title="Delete coach"
  aria-label={`Delete ${coach.firstName || ""} ${coach.lastName || ""}`}
  className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
>
  <Trash2 className="h-4 w-4" />
</button>






                        </div>

                      </td>

                    </tr>

                  );

                })

              ) : (

                <tr>

                  <td
                    colSpan="8"
                    className="px-6 py-16 text-center"
                  >

                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />

                    <p className="font-medium text-slate-500">
                      No coaches found
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


        {/* =================================================
            PAGINATION
        ================================================= */}

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">

          <p className="text-sm text-slate-500">

            Showing{" "}

            <span className="font-semibold text-slate-800">
              {filtered.length === 0
                ? 0
                : startIndex + 1}
            </span>{" "}

            to{" "}

            <span className="font-semibold text-slate-800">
              {Math.min(
                startIndex +
                  itemsPerPage,
                filtered.length
              )}
            </span>{" "}

            of{" "}

            <span className="font-semibold text-slate-800">
              {filtered.length}
            </span>{" "}

            coaches

          </p>


          <div className="flex items-center gap-1.5">

            <button
              onClick={() =>
                setCurrentPage(
                  (p) =>
                    Math.max(
                      p - 1,
                      1
                    )
                )
              }
              disabled={
                currentPage === 1
              }
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>


            {Array.from(
              {
                length: totalPages,
              },
              (_, i) => i + 1
            ).map((page) => (

              <button
                key={page}
                onClick={() =>
                  setCurrentPage(page)
                }
                className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition ${
                  currentPage === page
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>

            ))}


            <button
              onClick={() =>
                setCurrentPage(
                  (p) =>
                    Math.min(
                      p + 1,
                      totalPages
                    )
                )
              }
              disabled={
                currentPage ===
                  totalPages ||
                totalPages === 0
              }
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>


      {/* =====================================================
          VIEW COACH MODAL
      ===================================================== */}

      {/* ===================== VIEW MODAL ===================== */}

{viewOpen && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

    <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

      {/* HEADER */}

      <div className="bg-slate-900 text-white px-7 py-5 flex items-center justify-between shrink-0">

        <h2 className="text-xl font-semibold">
          Coach Details
        </h2>

        <button
          onClick={closeView}
          className="p-2 rounded-lg hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

      </div>


      {/* BODY */}

      {viewLoading ? (

        <div className="flex-1 flex items-center justify-center p-16 text-slate-500">
          Loading coach details...
        </div>

      ) : viewCoach ? (

        <div className="overflow-y-auto p-7 space-y-6">

          {/* PROFILE */}

          <div className="flex flex-col sm:flex-row items-start gap-5">

 <div className="
  relative
  w-32
  h-32
  rounded-2xl
  bg-gradient-to-br from-sky-400 to-blue-600
  flex
  items-center
  justify-center
  shrink-0
">

  {viewPhotoUrl ? (

    <>
      {/* Normal Image */}
      <img
  src={viewPhotoUrl}
  alt={getFullName(viewCoach)}
  className="
    w-full
    h-full
    object-cover
    rounded-2xl
    cursor-zoom-in
    transition-transform
    duration-300
    hover:scale-150
    hover:z-50
  "
/>

      {/* Large Image on Hover */}
      <div className="
        absolute
        left-1/2
        top-1/2
        -translate-x-1/2
        -translate-y-1/2
        hidden
        group-hover:block
        z-50
        pointer-events-none
      ">
        <img
          src={viewPhotoUrl}
          alt="Coach Preview"
          className="
            w-72
            h-72
            object-cover
            rounded-2xl
            shadow-2xl
            border-4
            border-white
          "
        />
      </div>
    </>

  ) : (

    <span className="text-white text-3xl font-bold">
      {getFullName(viewCoach)
        .split(" ")
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()}
    </span>

  )}

</div>










            <div className="pt-2">

              <h3 className="text-2xl font-bold text-slate-800">
                {getFullName(viewCoach)}
              </h3>

              <div className="flex items-center gap-2 mt-3">

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    isActive(getStatus(viewCoach))
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive(getStatus(viewCoach))
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }`}
                  />

                  {getStatus(viewCoach)}
                </span>

                <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-medium">
                  Photo: LIVE_CAMERA
                </span>

              </div>

            </div>

          </div>


          {/* PERSONAL INFORMATION */}

          <div className="border border-slate-200 rounded-2xl p-7">

            <div className="flex items-center gap-3 mb-7">

              <User className="w-5 h-5 text-sky-600" />

              <h3 className="text-base font-semibold text-slate-800">
                PERSONAL INFORMATION
              </h3>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">

              <DetailItem
                icon={Mail}
                label="Email"
                value={
                  viewCoach.email ||
                  viewCoach.user?.email ||
                  "-"
                }
              />

              <DetailItem
                icon={Phone}
                label="Mobile"
                value={viewCoach.mobileNumber || "-"}
              />

              <DetailItem
                icon={CalendarDays}
                label="Date of Birth"
                value={formatDate(viewCoach.dateOfBirth)}
              />

              <DetailItem
                label="Gender"
                value={viewCoach.gender || "-"}
              />

              <DetailItem
                icon={CalendarDays}
                label="Joining Date"
                value={formatDate(viewCoach.joiningDate)}
              />

              <DetailItem
                icon={MapPin}
                label="Address"
                value={viewCoach.address || "-"}
                full
              />

            </div>

          </div>


          {/* PROFESSIONAL DETAILS */}

          <div className="border border-slate-200 rounded-2xl p-7">

            <div className="flex items-center gap-3 mb-7">

              <BriefcaseBusiness className="w-5 h-5 text-sky-600" />

              <h3 className="text-base font-semibold text-slate-800">
                PROFESSIONAL DETAILS
              </h3>

            </div>




<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">

  <DetailItem
    label="Sport"
    value={getSportName(viewCoach)}
  />

  <DetailItem
    label="Highest Qualification"
    value={viewCoach.qualification || "-"}
  />

  <DetailItem
    label="Monthly Salary"
    value={
      viewCoach.salary != null
        ? `₹${Number(viewCoach.salary).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : "-"
    }
  />




              <DetailItem
                label="Experience"
                value={
                  viewCoach.experience != null
                    ? `${viewCoach.experience} years`
                    : "-"
                }
              />

            </div>

          </div>


          {/* BANK DETAILS */}

          {viewCoach.bankDetails && (

            <div className="border border-slate-200 rounded-2xl p-7">

              <div className="flex items-center gap-3 mb-7">

                <ShieldCheck className="w-5 h-5 text-sky-600" />

                <h3 className="text-base font-semibold text-slate-800">
                  BANK DETAILS
                </h3>

              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">

                <DetailItem
                  label="Bank Name"
                  value={
                    viewCoach.bankDetails.bankName || "-"
                  }
                />

                <DetailItem
                  label="Branch Name"
                  value={
                    viewCoach.bankDetails.branchName || "-"
                  }
                />

                <DetailItem
                  label="Account Holder Name"
                  value={
                    viewCoach.bankDetails.accountHolderName || "-"
                  }
                />

                <DetailItem
                  label="Account Number"
                  value={
                    viewCoach.bankDetails.accountNumber || "-"
                  }
                />

                <DetailItem
                  label="IFSC Code"
                  value={
                    viewCoach.bankDetails.ifscCode || "-"
                  }
                />

              </div>

            </div>

          )}


          {/* DOCUMENTS */}

          <div className="border border-slate-200 rounded-2xl overflow-hidden">

            <div className="px-7 py-5 border-b border-slate-200 bg-slate-50 flex items-center gap-3">

              <FileText className="w-5 h-5 text-sky-600" />

              <div>

                <h3 className="text-base font-semibold text-slate-800">
                  DOCUMENTS
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Coach verification and qualification documents
                </p>

              </div>

            </div>


            {Array.isArray(viewCoach.documents) &&
            viewCoach.documents.length > 0 ? (

              <div className="divide-y divide-slate-100">

                {viewCoach.documents.map((document) => (

                  <div
                    key={document.id}
                    className="px-7 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >

                    <div className="flex items-center gap-4 min-w-0">

                      <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">

                        <FileText className="w-5 h-5 text-sky-600" />

                      </div>


                      <div className="min-w-0">

                        <p className="font-semibold text-slate-800 capitalize">
                          {String(
                            document.documentType || "Document"
                          ).replace(/-/g, " ")}
                        </p>

                        <p className="text-sm text-slate-500 truncate">
                          {document.originalFileName || "-"}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {formatFileSize(document.fileSize)}
                        </p>

                      </div>

                    </div>


                    <div className="flex gap-2">

                      <button
                        onClick={async () => {

                          try {

                            const blob =
                              await viewCoachFile(
                                document.filePath
                              );

                            const url =
                              window.URL.createObjectURL(
                                blob
                              );

                            window.open(
                              url,
                              "_blank"
                            );

                            setTimeout(() => {
                              window.URL.revokeObjectURL(url);
                            }, 60000);

                          } catch (error) {

                            alert(
                              error.message ||
                                "Unable to view document."
                            );

                          }

                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-sky-50 hover:text-sky-600 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </button>


                      <button
                        onClick={async () => {

                          try {

                            const response =
                              await downloadCoachFile(
                                document.filePath
                              );

                            const url =
                              window.URL.createObjectURL(
                                response.data
                              );

                            const link =
                              window.document.createElement(
                                "a"
                              );

                            link.href = url;

                            link.download =
                              document.originalFileName ||
                              "document";

                            window.document.body.appendChild(
                              link
                            );

                            link.click();

                            link.remove();

                            window.URL.revokeObjectURL(
                              url
                            );

                          } catch (error) {

                            alert(
                              error.message ||
                                "Unable to download document."
                            );

                          }

                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            ) : (

              <div className="p-8 text-center text-slate-400 text-sm">
                No documents uploaded.
              </div>

            )}

          </div>


          {/* FOOTER */}

          <div className="flex justify-end gap-3 pt-2">

            <button
              onClick={closeView}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
            >
              Close
            </button>

            <button
              onClick={() => {

                closeView();

                navigate(
                  `/coach-form/${viewCoach.id}`
                );

              }}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium"
            >
              Edit Coach
            </button>

          </div>

        </div>

      ) : (

        <div className="p-16 text-center text-slate-500">
          Unable to load coach details.
        </div>

      )}

    </div>

  </div>
)}










      {/* =====================================================
          STATUS CONFIRM MODAL
      ===================================================== */}

      {confirmOpen &&
        selectedCoach && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">

              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Confirm Status Change
              </h3>


              <p className="text-sm text-slate-600 mb-6">

                Are you sure you want to set{" "}

                <span className="font-medium text-slate-800">
                  "{getFullName(
                    selectedCoach
                  )}"
                </span>{" "}

                to{" "}

                <span
                  className={`font-medium ${
                    newStatus ===
                    "ACTIVE"
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {newStatus ===
                  "ACTIVE"
                    ? "Active"
                    : "Inactive"}
                </span>
                ?

              </p>


              <div className="flex justify-end gap-3">

                <button
                  onClick={
                    closeStatusConfirm
                  }
                  disabled={
                    statusLoading
                  }
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
                >
                  No
                </button>


                <button
                  onClick={
                    handleConfirmStatus
                  }
                  disabled={
                    statusLoading
                  }
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition disabled:opacity-60"
                >
                  {statusLoading
                    ? "Updating..."
                    : "Yes"}
                </button>

              </div>

            </div>

          </div>

        )}



        

    </div>
  );
}




function DetailItem({
  icon: Icon,
  label,
  value,
  full = false,
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>

      <div className="flex items-center gap-2 mb-2">

        {Icon && (
          <Icon className="w-4 h-4 text-slate-400" />
        )}

        <p className="text-sm text-slate-400">
          {label}
        </p>

      </div>

      <p className="text-base font-medium text-slate-800">
        {value}
      </p>

    </div>
  );
}


function formatFileSize(bytes) {

  if (!bytes) {
    return "-";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}