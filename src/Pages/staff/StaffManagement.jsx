import {
  Search,
  Plus,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Filter,
  Eye,
  Power,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  User,
  Briefcase,
  FileText,
  Shield,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import {
  getAllStaff,
  downloadStaffDocument,
  updateStaffStatus,
  getStaffDocument,
  deactivateStaff,
  getStaffById,
} from "./StaffService";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

//import { viewOrDownloadFile } from "../../utils/fileHelper";

const API_BASE = ""; // change if needed

export default function StaffManagement() {
  const navigate = useNavigate();
  const [previewDoc, setPreviewDoc] = useState(null);
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;


const [photoUrls, setPhotoUrls] = useState({});


  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("desc");

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewStaff, setViewStaff] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);



  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllStaff("ALL");
      let list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];


      // Latest staff record first
list.sort((a, b) => (b.id || 0) - (a.id || 0));

setStaffList(list);
setCurrentPage(1);




    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to load staff");
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  // ---------- Helpers ----------
  const getFullName = (s) => {
    if (!s) return "-";
    if (s.name) return s.name;
    return `${s.firstName || ""} ${s.lastName || ""}`.trim() || "-";
  };

  const getStatus = (s) => {
    const st = s?.status || s?.userStatus;
    if (!st) return "Inactive";
    const upper = String(st).toUpperCase();
    if (upper === "ACTIVE") return "Active";
    if (upper === "INACTIVE") return "Inactive";
    return String(st);
  };

  const isActive = (status) => String(status).toUpperCase() === "ACTIVE";

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatRole = (role) => {
    if (!role) return "-";
    return String(role)
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };




useEffect(() => {
  let createdUrls = [];

  const loadStaffPhotos = async () => {
    if (!staffList || staffList.length === 0) {
      return;
    }

    const urls = {};

    for (const staff of staffList) {
      if (!staff?.id || !staff?.photoUrl) {
        continue;
      }

      try {
        const blob = await getStaffDocument(staff.id, "photo");

        const url = URL.createObjectURL(blob);

        urls[staff.id] = url;
        createdUrls.push(url);
      } catch (error) {
        console.error(
          `Unable to load photo for staff ${staff.id}:`,
          error
        );
      }
    }

    setPhotoUrls(urls);
  };

  loadStaffPhotos();

  return () => {
    createdUrls.forEach((url) => {
      URL.revokeObjectURL(url);
    });
  };
}, [staffList]);






  // ---------- Counts ----------
  const totalStaff = staffList.length;
  const activeStaff = staffList.filter((s) => isActive(getStatus(s))).length;
  const inactiveStaff = staffList.filter((s) => !isActive(getStatus(s))).length;

  // ---------- Filter ----------
  const filteredStaff = staffList.filter((staff) => {
    const name = getFullName(staff).toLowerCase();
    const email = (staff.email || "").toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch =
      name.includes(searchLower) ||
      email.includes(searchLower) ||
      (staff.mobileNumber || "").includes(searchLower);

    const status = getStatus(staff);
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && isActive(status)) ||
      (statusFilter === "Inactive" && !isActive(status));

    const role = (staff.role || "").toString().toUpperCase();
    const matchesRole =
      roleFilter === "All" || role === roleFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesRole;
  });

  // ---------- Sort ----------
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    let valA, valB;

    if (sortField === "name") {
      valA = getFullName(a).toLowerCase();
      valB = getFullName(b).toLowerCase();
    } else if (sortField === "joiningDate") {
      valA = a.joiningDate || a.joined || "";
      valB = b.joiningDate || b.joined || "";
    } else if (sortField === "role") {
      valA = (a.role || "").toString().toLowerCase();
      valB = (b.role || "").toString().toLowerCase();
    } else {
      valA = a.id || 0;
      valB = b.id || 0;
    }

    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // ---------- Pagination ----------
  const totalPages = Math.ceil(sortedStaff.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStaff = sortedStaff.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, roleFilter, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "id" ? "desc" : "asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-sky-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-sky-600" />
    );
  };

  // ---------- Status ----------
  const openStatusConfirm = (staff, targetStatus) => {
    setSelectedStaff(staff);
    setNewStatus(targetStatus);
    setConfirmOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!selectedStaff || !newStatus) return;
    setStatusLoading(true);
    try {
      await updateStaffStatus(selectedStaff.id, newStatus);
      setConfirmOpen(false);
      setSelectedStaff(null);
      setNewStatus("");
      await loadStaff();
    } catch (err) {
      alert(err?.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  // ---------- Delete ----------




const handleDocumentDownload = async (label, documentType) => {
  if (!viewStaff?.id || !documentType) {
    alert("Document information is not available.");
    return;
  }

  try {
    const blob = await downloadStaffDocument(
      viewStaff.id,
      documentType
    );

    if (!blob || !blob.size) {
      alert("File is empty.");
      return;
    }

    const blobUrl = URL.createObjectURL(blob);

    const extension =
      blob.type === "application/pdf"
        ? "pdf"
        : blob.type.startsWith("image/")
        ? "jpg"
        : "file";

    const fileName =
      `${getFullName(viewStaff)}-${label
        .replace(/\s+/g, "-")
        .toLowerCase()}.${extension}`;

    const link = document.createElement("a");

    link.href = blobUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(blobUrl);

  } catch (error) {
    console.error("Download failed:", error);

    if (error?.response?.status === 401) {
      alert("Session expired. Please login again.");
    } else {
      alert("Unable to download document.");
    }
  }
};





const openDocumentPreview = async (label, documentType) => {
  if (!viewStaff?.id || !documentType) {
    alert("Document information is not available.");
    return;
  }

  try {
    console.log(
      `Loading ${documentType} for staff ${viewStaff.id}`
    );

    const blob = await getStaffDocument(
      viewStaff.id,
      documentType
    );

    console.log(
      "Document type:",
      blob.type,
      "size:",
      blob.size
    );

    if (!blob || !blob.size) {
      alert("File is empty.");
      return;
    }

    const blobUrl = URL.createObjectURL(blob);

    const type = (blob.type || "").toLowerCase();

    const isImage = type.startsWith("image/");
    const isPdf =
      type === "application/pdf" ||
      type.includes("pdf");

    setPreviewDoc({
      label,
      documentType,
      url: blobUrl,
      blob,
      isBlob: true,
      isImage,
      isPdf,
    });

  } catch (error) {
    console.error(
      "Unable to preview document:",
      error
    );

    const status = error?.response?.status;

    if (status === 401) {
      alert("Session expired. Please login again.");
    } else if (status === 404) {
      alert("Document not found.");
    } else {
      alert("Unable to open document.");
    }
  }
};


  // ---------- View Detail ----------
  const openView = async (staff) => {
    setViewOpen(true);
    setViewLoading(true);
    setViewStaff(null);
    try {
      const res = await getStaffById(staff.id);
      const data = res?.data || res;
      setViewStaff(data || staff);
    } catch {
      setViewStaff(staff);
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage all staff members of Yashree Sports Academy
          </p>
        </div>

        <button
          onClick={() => navigate("/staff-form")}
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add New Staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Staff</p>
            <p className="text-2xl font-bold text-slate-800">{totalStaff}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Active Staff</p>
            <p className="text-2xl font-bold text-slate-800">{activeStaff}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
            <UserX className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Inactive Staff</p>
            <p className="text-2xl font-bold text-slate-800">{inactiveStaff}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/40 cursor-pointer min-w-[130px]"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Role</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/40 cursor-pointer min-w-[160px]"
              >
                <option value="All">All Roles</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="INVENTORY_MANAGER">Inventory Manager</option>
                <option value="CLEANING_STAFF">Cleaning Staff</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Avatar
                </th>
                <th
                  className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center gap-1.5">
                    Staff Member <SortIcon field="name" />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Contact
                </th>
                <th
                  className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700"
                  onClick={() => toggleSort("role")}
                >
                  <div className="flex items-center gap-1.5">
                    Role <SortIcon field="role" />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700"
                  onClick={() => toggleSort("joiningDate")}
                >
                  <div className="flex items-center gap-1.5">
                    Joined Date <SortIcon field="joiningDate" />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-slate-500">
                    Loading staff...
                  </td>
                </tr>
              ) : paginatedStaff.length > 0 ? (
                paginatedStaff.map((staff) => {
                  const name = getFullName(staff);
                  const status = getStatus(staff);
                  const initials = name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();


             const photoUrl = photoUrls[staff.id];

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/70 transition">
                      {/* Avatar */}
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                const fallback =
                                  e.target.parentElement.querySelector("span");
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <span
                            className={`w-full h-full items-center justify-center ${
                              photoUrl ? "hidden" : "flex"
                            }`}
                          >
                            {initials || "?"}
                          </span>
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{name}</p>
                        
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">
                          {staff.email || "-"}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {staff.mobileNumber || staff.phone || "-"}
                        </p>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                          {formatRole(staff.role)}
                        </span>
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
                              isActive(status)
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          />
                          {status}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(staff.joiningDate || staff.joined)}
                      </td>




                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openView(staff)}
                            className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>




                          <button
                            onClick={() => navigate(`/staff-form/${staff.id}`)}
                            className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              openStatusConfirm(
                                staff,
                                isActive(status) ? "INACTIVE" : "ACTIVE"
                              )
                            }
                            className={`p-2 rounded-lg transition ${
                              isActive(status)
                                ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={
                              isActive(status) ? "Set Inactive" : "Set Active"
                            }
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
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-slate-500">No staff found</p>
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
              {sortedStaff.length === 0 ? 0 : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-800">
              {Math.min(startIndex + itemsPerPage, sortedStaff.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">
              {sortedStaff.length}
            </span>{" "}
            staff
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

      {/* ========== VIEW DETAIL MODAL ========== */}
      {viewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-semibold">Staff Details</h2>
              <button
                onClick={() => setViewOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewLoading ? (
              <div className="p-16 text-center text-slate-500">
                Loading details...
              </div>
            ) : viewStaff ? (
              <div className="p-6 space-y-6">
                {/* Photo + basic */}
               
               
                <div className="flex flex-col sm:flex-row gap-5 items-start">



                  <div
  className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 cursor-pointer group"
  onClick={() => {


   if (photoUrls[viewStaff.id]) {



      setPhotoPreviewOpen(true);
    }
  }}


title={photoUrls[viewStaff.id] ? "Click to view photo" : ""}


>
 {photoUrls[viewStaff.id] ? (
    <img
    src={photoUrls[viewStaff.id]}

      alt={getFullName(viewStaff)}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
    />
  ) : (
    getFullName(viewStaff)
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  )}
</div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800">
                      {getFullName(viewStaff)}
                    </h3>

                   
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          isActive(getStatus(viewStaff))
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {getStatus(viewStaff)}
                      </span>
                      {viewStaff.photoCaptureType && (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                          Photo: {viewStaff.photoCaptureType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal */}
                <div className="border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-sky-600" />
                    <h4 className="text-sm font-semibold text-slate-700 uppercase">
                      Personal Information
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-slate-400 text-xs">Email</p>
                        <p className="text-slate-800">
                          {viewStaff.email || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-slate-400 text-xs">Mobile</p>
                        <p className="text-slate-800">
                          {viewStaff.mobileNumber || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-slate-400 text-xs">Date of Birth</p>
                        <p className="text-slate-800">
                          {formatDate(viewStaff.dateOfBirth)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Gender</p>
                      <p className="text-slate-800">
                        {viewStaff.gender || "-"}
                      </p>
                    </div>
                    <div className="sm:col-span-2 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-slate-400 text-xs">Address</p>
                        <p className="text-slate-800">
                          {viewStaff.address || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional */}
                <div className="border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-4 h-4 text-sky-600" />
                    <h4 className="text-sm font-semibold text-slate-700 uppercase">
                      Professional Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400 text-xs">
                        Highest Qualification
                      </p>
                      <p className="text-slate-800">
                        {viewStaff.highestQualification || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Experience</p>
                      <p className="text-slate-800">
                        {viewStaff.experienceYears != null
                          ? `${viewStaff.experienceYears} years`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Joining Date</p>
                      <p className="text-slate-800">
                        {formatDate(viewStaff.joiningDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Role</p>
                      <p className="text-slate-800">
                        {formatRole(viewStaff.role)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Monthly Salary</p>
                      <p className="text-slate-800">
                        {viewStaff.salary != null
                          ? `₹${Number(viewStaff.salary).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bank */}
                <div className="border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-sky-600" />
                    <h4 className="text-sm font-semibold text-slate-700 uppercase">
                      Bank Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400 text-xs">Account Number</p>
                      <p className="text-slate-800 font-mono">
                        {viewStaff.accountNumber || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">IFSC Code</p>
                      <p className="text-slate-800 font-mono">
                        {viewStaff.ifscCode || "-"}
                      </p>
                    </div>
                  </div>
                </div>




                {/* Documents */}
 {/* ==================== DOCUMENTS ==================== */}

<div className="mt-6">

  <div className="flex items-center gap-2 mb-4">
    <FileText className="w-4 h-4 text-sky-600" />

    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
      Documents
    </h3>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

    {[
      {
        label: "Aadhaar Front",
        documentType: "aadhaar-front",
        url: viewStaff?.aadhaarFrontUrl
      },
      {
        label: "Aadhaar Back",
        documentType: "aadhaar-back",
        url: viewStaff?.aadhaarBackUrl
      },
      {
        label: "PAN Card",
        documentType: "pan",
        url: viewStaff?.panCardUrl
      },
      {
        label: "Degree Certificate",
        documentType: "degree",
        url: viewStaff?.degreeCertificateUrl
      },
      {
        label: "Resume",
        documentType: "resume",
        url: viewStaff?.resumeUrl
      }
    ].map((doc) => (

      <div
        key={doc.label}
        className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl bg-slate-50/70"
      >

        <span className="text-sm font-medium text-slate-700">
          {doc.label}
        </span>

        <div className="flex items-center gap-3">

          {doc.url ? (
            <>

              {/* VIEW */}
              <button
                type="button"
                onClick={() =>
                  openDocumentPreview(
                    doc.label,
                    doc.documentType
                  )
                }
                className="text-sm font-medium text-sky-600 hover:text-sky-700 hover:underline"
              >
                View
              </button>


              {/* DOWNLOAD */}
              <button
                type="button"
                onClick={() =>
                  handleDocumentDownload(
                    doc.label,
                    doc.documentType
                  )
                }
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Download
              </button>

            </>
          ) : (

            <span className="text-xs text-slate-400">
              Not Uploaded
            </span>

          )}

        </div>

      </div>

    ))}

  </div>

</div>





                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setViewOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setViewOpen(false);
                      navigate(`/staff-form/${viewStaff.id}`);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium"
                  >
                    Edit Staff
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-500">
                Staff not found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Confirm Modal */}
      {confirmOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Confirm Status Change
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Set{" "}
              <span className="font-medium text-slate-800">
                "{getFullName(selectedStaff)}"
              </span>{" "}
              to{" "}
              <span
                className={`font-medium ${
                  newStatus === "ACTIVE" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {newStatus === "ACTIVE" ? "Active" : "Inactive"}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={statusLoading}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
              >
                No
              </button>
              <button
                onClick={handleConfirmStatus}
                disabled={statusLoading}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium disabled:opacity-60"
              >
                {statusLoading ? "Updating..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}








      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">
                {previewDoc.label}
              </h3>
              <div className="flex items-center gap-2">

        
                <button
                  type="button"
                  onClick={() => {
                    if (previewDoc.isBlob) {
                      URL.revokeObjectURL(previewDoc.url);
                    }
                    setPreviewDoc(null);
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-100 p-4 min-h-[400px] flex items-center justify-center">
              {previewDoc.isImage ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.label}
                  className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow"
                />
              ) : previewDoc.isPdf ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.label}
                  className="w-full h-[70vh] rounded-lg bg-white border-0"
                />
              ) : (
                <div className="text-center">
                  <p className="text-slate-600 mb-4">
                    Preview not available for this file type.
                  </p>
                  <a
                    href={previewDoc.url}
                    download
                    className="inline-block px-4 py-2 bg-sky-600 text-white rounded-lg text-sm"
                  >
                    Download to view
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}






{/* ==================== PHOTO PREVIEW MODAL ==================== */}

{photoPreviewOpen &&
  viewStaff &&
  photoUrls[viewStaff.id] && (
  <div
    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4"
    onClick={() => setPhotoPreviewOpen(false)}
  >
    <div
      className="relative max-w-4xl max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >

      {/* Close Button */}
      <button
        type="button"
        onClick={() => setPhotoPreviewOpen(false)}
        className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white text-slate-700 shadow-lg flex items-center justify-center hover:bg-slate-100 transition"
        title="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Staff Photo */}
      <img
       src={photoUrls[viewStaff.id]}
        alt={getFullName(viewStaff)}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
      />

      {/* Name */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="px-4 py-2 rounded-xl bg-black/60 text-white text-sm font-medium backdrop-blur-sm">
          {getFullName(viewStaff)}
        </div>
      </div>

    </div>
  </div>
)}



    </div>
  );
}
