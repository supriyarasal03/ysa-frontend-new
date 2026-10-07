import React, { useEffect, useMemo, useState } from "react";







import {



  Search,



  Plus,



  Edit2,



  Users,



  UserCheck,



  UserX,



  Filter,



  Eye,



  Power,



  ArrowUpDown,



  ArrowUp,



  ArrowDown,



  X,



  User,



  Briefcase,



  FileText,



  Calendar,



  Phone,



  Mail,



  MapPin,



  GraduationCap,



  HeartPulse,



} from "lucide-react";







import { useNavigate } from "react-router-dom";







import {



  getAllPhysiotherapists,



  getPhysiotherapistById,



  activatePhysiotherapist,



  deactivatePhysiotherapist,



  getPhysiotherapistDocument,



  getPhysiotherapistErrorMessage,



} from "./Physiotherapist";











// ============================================================



// HELPERS



// ============================================================







const getFullName = (person) => {



  if (!person) return "-";







  return (



    `${person.firstName || ""} ${person.lastName || ""}`.trim() ||



    "-"



  );



};











const getStatus = (person) => {



  const status =



    person?.status ||



    person?.userStatus ||



    person?.user?.status;







  if (!status) return "INACTIVE";







  return String(status).toUpperCase();



};











const isActive = (person) => {



  return getStatus(person) === "ACTIVE";



};











const formatDate = (value) => {



  if (!value) return "-";







  try {



    return new Date(value).toLocaleDateString("en-IN", {



      day: "2-digit",



      month: "short",



      year: "numeric",



    });



  } catch {



    return value;



  }



};











const formatGender = (gender) => {



  if (!gender) return "-";







  return (



    String(gender).charAt(0).toUpperCase() +



    String(gender).slice(1).toLowerCase()



  );



};











const getInitials = (person) => {



  const name = getFullName(person);







  return name



    .split(" ")



    .map((item) => item[0])



    .join("")



    .slice(0, 2)



    .toUpperCase();



};











// ============================================================



// COMPONENT



// ============================================================







export default function PhysiotherapistManagement() {







  const navigate = useNavigate();







  const [physiotherapists, setPhysiotherapists] =



    useState([]);







  const [loading, setLoading] = useState(true);







  const [error, setError] = useState("");







  const [search, setSearch] = useState("");







  const [statusFilter, setStatusFilter] =



    useState("All");







  const [sortField, setSortField] =



    useState("id");







  const [sortDirection, setSortDirection] =



    useState("desc");







  const [viewOpen, setViewOpen] =



    useState(false);







  const [viewLoading, setViewLoading] =



    useState(false);







  const [selectedPhysiotherapist, setSelectedPhysiotherapist] =



    useState(null);







  const [confirmOpen, setConfirmOpen] =



    useState(false);







  const [statusLoading, setStatusLoading] =



    useState(false);







  const [statusTarget, setStatusTarget] =



    useState(null);







  const [documentPreview, setDocumentPreview] =



    useState(null);











  // ==========================================================



  // LOAD DATA



  // ==========================================================







  const loadPhysiotherapists = async () => {







    try {







      setLoading(true);



      setError("");







      const response =



        await getAllPhysiotherapists();







      const data =



        Array.isArray(response?.data)



          ? response.data



          : Array.isArray(response)



          ? response



          : [];







      setPhysiotherapists(data);







    } catch (err) {







      console.error(



        "Failed to load physiotherapists:",



        err



      );







      setError(



        getPhysiotherapistErrorMessage(err)



      );







      setPhysiotherapists([]);







    } finally {







      setLoading(false);



    }



  };











  useEffect(() => {



    loadPhysiotherapists();



  }, []);











  // ==========================================================



  // COUNTS



  // ==========================================================







  const totalPhysiotherapists =



    physiotherapists.length;







  const activePhysiotherapists =



    physiotherapists.filter(



      (item) => isActive(item)



    ).length;







  const inactivePhysiotherapists =



    totalPhysiotherapists -



    activePhysiotherapists;











  // ==========================================================



  // FILTER



  // ==========================================================







  const filteredPhysiotherapists =



    useMemo(() => {







      const searchText =



        search.trim().toLowerCase();







      return physiotherapists.filter(



        (person) => {







          const name =



            getFullName(person).toLowerCase();







          const email =



            String(



              person?.email || ""



            ).toLowerCase();







          const mobile =



            String(



              person?.mobileNumber || ""



            ).toLowerCase();







          const employeeId =



            String(



              person?.employeeId || ""



            ).toLowerCase();







          const matchesSearch =



            !searchText ||



            name.includes(searchText) ||



            email.includes(searchText) ||



            mobile.includes(searchText) ||



            employeeId.includes(searchText);







          const status =



            getStatus(person);







          const matchesStatus =



            statusFilter === "All" ||



            (statusFilter === "Active" &&



              status === "ACTIVE") ||



            (statusFilter === "Inactive" &&



              status === "INACTIVE");







          return (



            matchesSearch &&



            matchesStatus



          );



        }



      );







    }, [



      physiotherapists,



      search,



      statusFilter,



    ]);











  // ==========================================================



  // SORT



  // ==========================================================







  const sortedPhysiotherapists =



    useMemo(() => {







      const list =



        [...filteredPhysiotherapists];







      list.sort((a, b) => {







        let valueA;



        let valueB;







        if (sortField === "name") {







          valueA =



            getFullName(a).toLowerCase();







          valueB =



            getFullName(b).toLowerCase();







        } else if (



          sortField === "joiningDate"



        ) {







          valueA =



            a?.joiningDate || "";







          valueB =



            b?.joiningDate || "";







        } else if (



          sortField === "employeeId"



        ) {







          valueA =



            String(



              a?.employeeId || ""



            ).toLowerCase();







          valueB =



            String(



              b?.employeeId || ""



            ).toLowerCase();







        } else {







          valueA = a?.id || 0;



          valueB = b?.id || 0;



        }







        if (valueA < valueB) {



          return sortDirection === "asc"



            ? -1



            : 1;



        }







        if (valueA > valueB) {



          return sortDirection === "asc"



            ? 1



            : -1;



        }







        return 0;



      });







      return list;







    }, [



      filteredPhysiotherapists,



      sortField,



      sortDirection,



    ]);











  // ==========================================================



  // SORT TOGGLE



  // ==========================================================







  const toggleSort = (field) => {







    if (sortField === field) {







      setSortDirection(



        (previous) =>



          previous === "asc"



            ? "desc"



            : "asc"



      );







    } else {







      setSortField(field);







      setSortDirection(



        field === "id"



          ? "desc"



          : "asc"



      );



    }



  };











  const SortIcon = ({ field }) => {







    if (sortField !== field) {







      return (



        <ArrowUpDown



          className="w-3.5 h-3.5 text-slate-400"



        />



      );



    }







    return sortDirection === "asc" ? (



      <ArrowUp



        className="w-3.5 h-3.5 text-sky-600"



      />



    ) : (



      <ArrowDown



        className="w-3.5 h-3.5 text-sky-600"



      />



    );



  };











  // ==========================================================



  // VIEW



  // ==========================================================







  const openView = async (person) => {







    setViewOpen(true);



    setViewLoading(true);



    setSelectedPhysiotherapist(null);







    try {







      const response =



        await getPhysiotherapistById(



          person.id



        );







      const data =



        response?.data || response;







      setSelectedPhysiotherapist(



        data || person



      );







    } catch (err) {







      console.error(err);







      setSelectedPhysiotherapist(



        person



      );







    } finally {







      setViewLoading(false);



    }



  };











  // ==========================================================



  // STATUS CONFIRM



  // ==========================================================







  const openStatusConfirm = (person) => {







    setStatusTarget(person);







    setConfirmOpen(true);



  };











  const handleStatusChange = async () => {







    if (!statusTarget) return;







    setStatusLoading(true);







    try {







      if (isActive(statusTarget)) {







        await deactivatePhysiotherapist(



          statusTarget.id



        );







      } else {







        await activatePhysiotherapist(



          statusTarget.id



        );



      }







      setConfirmOpen(false);



      setStatusTarget(null);







      await loadPhysiotherapists();







    } catch (err) {







      alert(



        getPhysiotherapistErrorMessage(err)



      );







    } finally {







      setStatusLoading(false);



    }



  };











  // ==========================================================



  // DOCUMENT PREVIEW



  // ==========================================================







  const openDocument = async (



    label,



    documentType



  ) => {







    if (!selectedPhysiotherapist) {



      return;



    }







    try {







      const blob =



        await getPhysiotherapistDocument(



          selectedPhysiotherapist.id,



          documentType



        );







      if (!blob || !blob.size) {







        alert(



          "Document is empty."



        );







        return;



      }







      const url =



        URL.createObjectURL(blob);







      const type =



        String(blob.type || "")



          .toLowerCase();







      setDocumentPreview({







        label,







        url,







        isImage:



          type.startsWith("image/"),







        isPdf:



          type.includes("pdf"),







        documentType,



      });







    } catch (err) {







      console.error(err);







      alert(



        getPhysiotherapistErrorMessage(err)



      );



    }



  };











  // ==========================================================



  // CLOSE DOCUMENT



  // ==========================================================







  const closeDocument = () => {







    if (documentPreview?.url) {







      URL.revokeObjectURL(



        documentPreview.url



      );



    }







    setDocumentPreview(null);



  };











  // ==========================================================



  // RENDER



  // ==========================================================







  return (



    <div className="min-h-screen bg-[#f1f5f9] p-6 lg:p-8">







      {/* ======================================================



          HEADER



      ====================================================== */}







      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">







        <div>







          <h1 className="text-2xl font-bold text-slate-800">



            Physiotherapist Management



          </h1>







          <p className="text-slate-500 text-sm mt-1">



            Manage all physiotherapists of Yashree Sports Academy



          </p>







        </div>







        <button



          onClick={() =>



            navigate("/admin/physiotherapist-form")



          }



          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-md"



        >



          <Plus className="w-4 h-4" />







          Add New Physiotherapist



        </button>







      </div>











      {/* ======================================================



          STATS



      ====================================================== */}







      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">







        {/***** TOTAL *****/}







        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">







          <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">







            <Users className="w-6 h-6 text-sky-600" />







          </div>







          <div>







            <p className="text-sm text-slate-500">



              Total Physiotherapists



            </p>







            <p className="text-2xl font-bold text-slate-800">



              {totalPhysiotherapists}



            </p>







          </div>







        </div>











        {/***** ACTIVE *****/}







        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">







          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">







            <UserCheck className="w-6 h-6 text-emerald-600" />







          </div>







          <div>







            <p className="text-sm text-slate-500">



              Active Physiotherapists



            </p>







            <p className="text-2xl font-bold text-slate-800">



              {activePhysiotherapists}



            </p>







          </div>







        </div>











        {/***** INACTIVE *****/}







        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">







          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">







            <UserX className="w-6 h-6 text-rose-600" />







          </div>







          <div>







            <p className="text-sm text-slate-500">



              Inactive Physiotherapists



            </p>







            <p className="text-2xl font-bold text-slate-800">



              {inactivePhysiotherapists}



            </p>







          </div>







        </div>







      </div>











      {/* ======================================================



          ERROR



      ====================================================== */}







      {error && (







        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">



          {error}



        </div>







      )}











      {/* ======================================================



          TABLE



      ====================================================== */}







      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">







        {/***** TOOLBAR *****/}







        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">







          <div className="relative w-full lg:w-80">







            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />







            <input



              type="text"



              placeholder="Search by name, email, mobile or employee ID..."



              value={search}



              onChange={(e) =>



                setSearch(e.target.value)



              }



              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"



            />







          </div>











          <div className="flex items-center gap-2">







            <Filter className="w-4 h-4 text-slate-400" />







            <span className="text-sm text-slate-500">



              Status



            </span>







            <select



              value={statusFilter}



              onChange={(e) =>



                setStatusFilter(e.target.value)



              }



              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 min-w-[130px]"



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











        {/***** TABLE *****/}







        <div className="overflow-x-auto">







          <table className="w-full">







            <thead>







              <tr className="bg-slate-50 text-left">







                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">



                  Avatar



                </th>







                <th



                  onClick={() =>



                    toggleSort("name")



                  }



                  className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase cursor-pointer"



                >







                  <div className="flex items-center gap-1.5">







                    Physiotherapist







                    <SortIcon field="name" />







                  </div>







                </th>







                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">



                  Contact



                </th>













                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">



                  Specialization



                </th>







                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">



                  Status



                </th>







                <th



                  onClick={() =>



                    toggleSort("joiningDate")



                  }



                  className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase cursor-pointer"



                >







                  <div className="flex items-center gap-1.5">







                    Joined Date







                    <SortIcon field="joiningDate" />







                  </div>







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



                    Loading physiotherapists...



                  </td>







                </tr>







              ) : sortedPhysiotherapists.length > 0 ? (







                sortedPhysiotherapists.map(



                  (person) => {







                    const active =



                      isActive(person);







                    const name =



                      getFullName(person);







                    return (







                      <tr



                        key={person.id}



                        className="hover:bg-slate-50/70 transition"



                      >







                        {/***** AVATAR *****/}







                        <td className="px-6 py-4">







                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">







                            {getInitials(person)}







                          </div>







                        </td>











                        {/***** NAME *****/}







                        <td className="px-6 py-4">







                          <p className="font-medium text-slate-800">



                            {name}



                          </p>







                          <p className="text-xs text-slate-400">



                            #{String(person.id).padStart(3, "0")}



                          </p>







                        </td>











                        {/***** CONTACT *****/}







                        <td className="px-6 py-4">







                          <p className="text-sm text-slate-700">



                            {person.email || "-"}



                          </p>







                          <p className="text-xs text-slate-400 mt-0.5">



                            {person.mobileNumber || "-"}



                          </p>







                        </td>











                        {/***** EMPLOYEE ID *****/}

















                        {/***** SPECIALIZATION *****/}







                        <td className="px-6 py-4">







                          <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">







                            {person.specialization || "-"}







                          </span>







                        </td>











                        {/***** STATUS *****/}







                        <td className="px-6 py-4">







                          <span



                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${



                              active



                                ? "bg-emerald-50 text-emerald-700"



                                : "bg-rose-50 text-rose-700"



                            }`}



                          >







                            <span



                              className={`w-1.5 h-1.5 rounded-full ${



                                active



                                  ? "bg-emerald-500"



                                  : "bg-rose-500"



                              }`}



                            />







                            {active



                              ? "Active"



                              : "Inactive"}







                          </span>







                        </td>











                        {/***** JOINING DATE *****/}







                        <td className="px-6 py-4 text-sm text-slate-500">







                          {formatDate(



                            person.joiningDate



                          )}







                        </td>











                        {/***** ACTIONS *****/}







                        <td className="px-6 py-4">







                          <div className="flex items-center justify-center gap-1">







                            <button



                              onClick={() =>



                                openView(person)



                              }



                              className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"



                              title="View"



                            >







                              <Eye className="w-4 h-4" />







                            </button>











                            <button



                              onClick={() =>


navigate(
  `/admin/physiotherapist-form/${person.id}`
)


                              }



                              className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"



                              title="Edit"



                            >







                              <Edit2 className="w-4 h-4" />







                            </button>











                            <button



                              onClick={() =>



                                openStatusConfirm(



                                  person



                                )



                              }



                              className={`p-2 rounded-lg transition ${



                                active



                                  ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"



                                  : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"



                              }`}



                              title={



                                active



                                  ? "Deactivate"



                                  : "Activate"



                              }



                            >







                              <Power className="w-4 h-4" />







                            </button>







                          </div>







                        </td>







                      </tr>







                    );



                  }



                )







              ) : (







                <tr>







                  <td



                    colSpan="7"



                    className="px-6 py-16 text-center"



                  >







                    <HeartPulse className="w-12 h-12 mx-auto mb-3 text-slate-300" />







                    <p className="font-medium text-slate-500">



                      No physiotherapists found



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







      </div>











      {/* ======================================================



          VIEW MODAL



      ====================================================== */}







      {viewOpen && (







        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">







          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">







            <div className="sticky top-0 bg-slate-900 text-white px-6 py-4 flex items-center justify-between z-10">







              <h2 className="text-lg font-semibold">



                Physiotherapist Details



              </h2>







              <button



                onClick={() => {



                  setViewOpen(false);



                  setSelectedPhysiotherapist(null);



                }}



                className="p-1.5 hover:bg-white/10 rounded-lg"



              >







                <X className="w-5 h-5" />







              </button>







            </div>











            {viewLoading ? (







              <div className="p-16 text-center text-slate-500">



                Loading details...



              </div>







            ) : selectedPhysiotherapist ? (







              <div className="p-6 space-y-6">







                {/***** BASIC *****/}







                <div className="flex flex-col sm:flex-row gap-5">







                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">







                    {getInitials(



                      selectedPhysiotherapist



                    )}







                  </div>







                  <div>







                    <h3 className="text-xl font-bold text-slate-800">







                      {getFullName(



                        selectedPhysiotherapist



                      )}







                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Employee ID:{" "}
       {selectedPhysiotherapist.employeeId || "-"}
                    </p>
                    <span



                      className={`inline-flex mt-3 px-3 py-1 rounded-full text-xs font-medium ${



                        isActive(



                          selectedPhysiotherapist



                        )



                          ? "bg-emerald-50 text-emerald-700"



                          : "bg-rose-50 text-rose-700"



                      }`}



                    >







                      {isActive(



                        selectedPhysiotherapist



                      )



                        ? "Active"



                        : "Inactive"}







                    </span>







                  </div>







                </div>











                {/***** PERSONAL *****/}







                <div className="border border-slate-200 rounded-xl p-5">







                  <div className="flex items-center gap-2 mb-4">







                    <User className="w-4 h-4 text-sky-600" />







                    <h4 className="text-sm font-semibold text-slate-700 uppercase">



                      Personal Information



                    </h4>







                  </div>











                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">







                    <InfoItem



                      icon={<Mail />}



                      label="Email"



                      value={



                        selectedPhysiotherapist.email



                      }



                    />







                    <InfoItem



                      icon={<Phone />}



                      label="Mobile"



                      value={



                        selectedPhysiotherapist.mobileNumber



                      }



                    />







                    <InfoItem



                      icon={<Calendar />}



                      label="Date of Birth"



                      value={formatDate(



                        selectedPhysiotherapist.dateOfBirth



                      )}



                    />







                    <InfoItem



                      label="Gender"



                      value={formatGender(



                        selectedPhysiotherapist.gender



                      )}



                    />







                    <InfoItem



                      label="Blood Group"



                      value={



                        selectedPhysiotherapist.bloodGroup



                      }



                    />







                    <InfoItem



                      icon={<MapPin />}



                      label="Address"



                      value={



                        selectedPhysiotherapist.address



                      }



                    />







                  </div>







                </div>











                {/***** PROFESSIONAL *****/}







                <div className="border border-slate-200 rounded-xl p-5">







                  <div className="flex items-center gap-2 mb-4">







                    <Briefcase className="w-4 h-4 text-sky-600" />







                    <h4 className="text-sm font-semibold text-slate-700 uppercase">



                      Professional Details



                    </h4>







                  </div>











                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">







                    <InfoItem



                      icon={<GraduationCap />}



                      label="Qualification"



                      value={



                        selectedPhysiotherapist.qualification



                      }



                    />







                    <InfoItem



                      label="Specialization"



                      value={



                        selectedPhysiotherapist.specialization



                      }



                    />







                    <InfoItem



                      label="Experience"



                      value={



                        selectedPhysiotherapist.experienceYears != null



                          ? `${selectedPhysiotherapist.experienceYears} years`



                          : "-"



                      }



                    />







                    <InfoItem



                      label="Joining Date"



                      value={formatDate(



                        selectedPhysiotherapist.joiningDate



                      )}



                    />



                    <InfoItem

                      label="Monthly Salary"

                      value={

                        selectedPhysiotherapist.monthlySalary != null

                          ? `₹ ${Number(

                              selectedPhysiotherapist.monthlySalary

                            ).toLocaleString("en-IN")}`

                          : "-"

                      }

                    />







                  </div>







                </div>











                {/* BANK DETAILS */}



                <div className="border border-slate-200 rounded-xl p-5">



                  <div className="flex items-center gap-2 mb-4">



                    <Briefcase className="w-4 h-4 text-sky-600" />



                    <h4 className="text-sm font-semibold text-slate-700 uppercase">

                      Bank Details

                    </h4>



                  </div>



                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">



                    <InfoItem

                      label="Bank Name"

                      value={selectedPhysiotherapist.bankName}

                    />



                    <InfoItem

                      label="Branch Name"

                      value={selectedPhysiotherapist.branchName}

                    />



                    <InfoItem

                      label="Account Holder Name"

                      value={selectedPhysiotherapist.accountHolderName}

                    />



                    <InfoItem

                      label="Account Number"

                      value={selectedPhysiotherapist.accountNumber}

                    />



                    <InfoItem

                      label="IFSC Code"

                      value={selectedPhysiotherapist.ifscCode}

                    />



                  </div>



                </div>







                {/***** DOCUMENTS *****/}







                <div className="border border-slate-200 rounded-xl p-5">







                  <div className="flex items-center gap-2 mb-4">







                    <FileText className="w-4 h-4 text-sky-600" />







                    <h4 className="text-sm font-semibold text-slate-700 uppercase">



                      Documents



                    </h4>







                  </div>











                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">







                    <DocumentRow



                      label="Profile Photo"



                      available={



                        selectedPhysiotherapist.profilePhotoAvailable



                      }



                      onView={() =>



                        openDocument(



                          "Profile Photo",



                          "profile-photo"



                        )



                      }



                    />







                    <DocumentRow



                      label="Live Photo"



                      available={



                        selectedPhysiotherapist.livePhotoAvailable



                      }



                      onView={() =>



                        openDocument(



                          "Live Photo",



                          "live-photo"



                        )



                      }



                    />







                    <DocumentRow



                      label="Aadhaar Front"



                      available={



                        selectedPhysiotherapist.aadhaarFrontAvailable



                      }



                      onView={() =>



                        openDocument(



                          "Aadhaar Front",



                          "aadhaar-front"



                        )



                      }



                    />







                    <DocumentRow



                      label="Aadhaar Back"



                      available={



                        selectedPhysiotherapist.aadhaarBackAvailable



                      }



                      onView={() =>



                        openDocument(



                          "Aadhaar Back",



                          "aadhaar-back"



                        )



                      }



                    />







                    <DocumentRow



                      label="PAN Card"



                      available={



                        selectedPhysiotherapist.panCardAvailable



                      }



                      onView={() =>



                        openDocument(



                          "PAN Card",



                          "pan"



                        )



                      }



                    />







                    <DocumentRow



                      label="Degree Certificate"



                      available={



                        selectedPhysiotherapist.degreeCertificateAvailable



                      }



                      onView={() =>



                        openDocument(



                          "Degree Certificate",



                          "degree"



                        )



                      }



                    />







                    <DocumentRow



                      label="Experience Certificate"



                      available={



                        selectedPhysiotherapist.experienceCertificateAvailable



                      }



                      onView={() =>



                        openDocument(



                          "Experience Certificate",



                          "experience"



                        )



                      }



                    />







                  </div>







                </div>











                {/***** ACTIONS *****/}







                <div className="flex justify-end gap-3">







                  <button



                    onClick={() =>



                      setViewOpen(false)



                    }



                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium"



                  >



                    Close



                  </button>







                  <button



                    onClick={() => {



                      setViewOpen(false);







                      navigate(



                        `/physiotherapist-form/${selectedPhysiotherapist.id}`



                      );



                    }}



                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium"



                  >



                    Edit Physiotherapist



                  </button>







                </div>







              </div>







            ) : (







              <div className="p-16 text-center text-slate-500">



                Physiotherapist not found



              </div>







            )}







          </div>







        </div>







      )}











      {/* ======================================================



          STATUS CONFIRM



      ====================================================== */}







      {confirmOpen && statusTarget && (







        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/40">







          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">







            <h3 className="text-lg font-semibold text-slate-800 mb-2">



              Confirm Status Change



            </h3>







            <p className="text-sm text-slate-600 mb-6">







              Set{" "}







              <span className="font-medium text-slate-800">







                "{getFullName(statusTarget)}"







              </span>{" "}







              to{" "}







              <span



                className={



                  isActive(statusTarget)



                    ? "text-rose-600 font-medium"



                    : "text-emerald-600 font-medium"



                }



              >







                {isActive(statusTarget)



                  ? "Inactive"



                  : "Active"}







              </span>










            </p>







            <div className="flex justify-end gap-3">







              <button



                onClick={() =>



                  setConfirmOpen(false)



                }



                disabled={statusLoading}



                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm"



              >



                Cancel



              </button>







              <button



                onClick={handleStatusChange}



                disabled={statusLoading}



                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm disabled:opacity-60"



              >



                {statusLoading



                  ? "Updating..."



                  : "Confirm"}



              </button>







            </div>







          </div>







        </div>







      )}











      {/* ======================================================



          DOCUMENT PREVIEW



      ====================================================== */}







      {documentPreview && (







        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">







          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">







            <div className="flex items-center justify-between px-5 py-3 border-b">







              <h3 className="font-semibold text-slate-800">



                {documentPreview.label}



              </h3>







              <button



                onClick={closeDocument}



                className="p-1.5 hover:bg-slate-100 rounded-lg"



              >



                <X className="w-5 h-5" />



              </button>







            </div>











            <div className="flex-1 overflow-auto bg-slate-100 p-4 min-h-[400px] flex items-center justify-center">







              {documentPreview.isImage ? (







                <img



                  src={documentPreview.url}



                  alt={documentPreview.label}



                  className="max-w-full max-h-[70vh] rounded-lg shadow"



                />







              ) : documentPreview.isPdf ? (







                <iframe



                  src={documentPreview.url}



                  title={documentPreview.label}



                  className="w-full h-[70vh] bg-white"



                />







              ) : (







                <a



                  href={documentPreview.url}



                  download



                  className="px-4 py-2 bg-sky-600 text-white rounded-lg"



                >



                  Download File



                </a>







              )}







            </div>







          </div>







        </div>







      )}







    </div>



  );



}











// ============================================================



// INFO ITEM



// ============================================================







function InfoItem({



  icon,



  label,



  value,



}) {







  return (







    <div className="flex items-start gap-2">







      {icon && (



        <div className="text-slate-400 mt-0.5">







          {React.cloneElement(



            icon,



            {



              className:



                "w-4 h-4",



            }



          )}







        </div>



      )}







      <div>







        <p className="text-slate-400 text-xs">



          {label}



        </p>







        <p className="text-slate-800">



          {value || "-"}



        </p>







      </div>







    </div>



  );



}











// ============================================================



// DOCUMENT ROW



// ============================================================







function DocumentRow({



  label,



  available,



  onView,



}) {







  return (







    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">







      <span className="text-slate-700 text-sm">



        {label}



      </span>







      {available ? (







        <button



          onClick={onView}



          className="text-sky-600 hover:underline text-xs font-medium"



        >



          View



        </button>







      ) : (







        <span className="text-slate-400 text-xs">



          Not uploaded



        </span>







      )}







    </div>



  );



}