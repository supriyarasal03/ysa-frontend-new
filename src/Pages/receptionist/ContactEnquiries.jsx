        import { useEffect, useState } from "react";
        import ReceptionistContactService from "./ReceptionistContactService";

        const ContactEnquiries = () => {

        const [contacts, setContacts] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");

        const [selectedContact, setSelectedContact] = useState(null);
        const [loadingDetails, setLoadingDetails] = useState(false);

        // =========================================================
        // LOAD CONTACT ENQUIRIES
        // =========================================================

        const loadContacts = async () => {
            try {
            setLoading(true);
            setError("");

            const response =
                await ReceptionistContactService.getAllContacts();

            if (response?.success) {
                setContacts(response.data || []);
            } else {
                setContacts([]);
                setError(
                response?.message ||
                "Unable to load contact enquiries."
                );
            }
            } catch (err) {
            console.error(
                "Error loading contact enquiries:",
                err
            );

            setContacts([]);

            setError(
                err?.response?.data?.message ||
                "Unable to load contact enquiries."
            );
            } finally {
            setLoading(false);
            }
        };

        // =========================================================
        // INITIAL LOAD
        // =========================================================

        useEffect(() => {
            loadContacts();
        }, []);

        // =========================================================
        // VIEW DETAILS
        // =========================================================

        const handleViewDetails = async (contact) => {

            try {
            setLoadingDetails(true);
            setError("");

            const response =
                await ReceptionistContactService
                .getContactById(contact.id);

            if (response?.success) {
                setSelectedContact(response.data);
            } else {
                setSelectedContact(contact);
            }

            } catch (err) {

            console.error(
                "Error loading contact details:",
                err
            );

            // The list record is already available,
            // so use it as a fallback.
            setSelectedContact(contact);

            } finally {
            setLoadingDetails(false);
            }
        };

        // =========================================================
        // DATE FORMAT
        // =========================================================

        const formatDateTime = (dateValue) => {

            if (!dateValue) {
            return "-";
            }

            const date = new Date(dateValue);

            if (Number.isNaN(date.getTime())) {
            return dateValue;
            }

            return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            });
        };

        // =========================================================
        // RENDER
        // =========================================================

        return (
            <div className="p-6">
            <div className="max-w-7xl mx-auto">

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                    Contact Enquiries
                    </h1>

                    <p className="text-gray-500 mt-1">
                    View enquiries submitted from the public
                    landing page.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadContacts}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
                >
                    <i
                    className={`fas ${
                        loading
                        ? "fa-spinner fa-spin"
                        : "fa-rotate"
                    }`}
                    />

                    Refresh
                </button>

                </div>

                {/* =====================================================
                    ERROR
                ===================================================== */}

                {error && (
                <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
                )}

                {/* =====================================================
                    LOADING
                ===================================================== */}

                {loading && (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <i className="fas fa-spinner fa-spin text-blue-700 text-xl" />

                    <p className="text-gray-500 mt-3">
                    Loading contact enquiries...
                    </p>
                </div>
                )}

                {/* =====================================================
                    EMPTY
                ===================================================== */}

                {!loading && contacts.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">

                    <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center">
                    <i className="fas fa-envelope-open-text text-blue-700 text-2xl" />
                    </div>

                    <h3 className="text-lg font-semibold text-slate-800 mt-4">
                    No Contact Enquiries
                    </h3>

                    <p className="text-gray-500 mt-1">
                    There are no contact enquiries available.
                    </p>

                </div>
                )}

                {/* =====================================================
                    CONTACT ENQUIRIES TABLE
                ===================================================== */}

                {!loading && contacts.length > 0 && (
                <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

                    <div className="overflow-x-auto">

                    <table className="min-w-full">

                        <thead className="bg-gray-50 border-b border-gray-200">

                        <tr>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                            Name
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                            Contact
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                            Email
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                            Query Type
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                            Submitted
                            </th>

                            <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                            Action
                            </th>
                        </tr>

                        </thead>

                        <tbody className="divide-y divide-gray-100">

                        {contacts.map((contact) => (

                            <tr
                            key={contact.id}
                            className="hover:bg-gray-50 transition"
                            >

                            <td className="px-5 py-4">
                                <p className="font-semibold text-slate-800">
                                {contact.firstName}{" "}
                                {contact.lastName}
                                </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                                +91 {contact.contactNumber}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                                {contact.email}
                            </td>

                            <td className="px-5 py-4">
                                <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                                {contact.queryType}
                                </span>
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-500">
                                {formatDateTime(
                                contact.createdAt
                                )}
                            </td>

                            <td className="px-5 py-4 text-right">

                                <button
                                type="button"
                                onClick={() =>
                                    handleViewDetails(contact)
                                }
                                className="inline-flex items-center gap-2 px-3 py-2 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
                                >
                                <i className="fas fa-eye" />
                                View
                                </button>

                            </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                    </div>

                </div>
                )}

                {/* =====================================================
                    MOBILE CONTACT CARDS
                ===================================================== */}

                {!loading && contacts.length > 0 && (
                <div className="md:hidden space-y-4">

                    {contacts.map((contact) => (

                    <div
                        key={contact.id}
                        className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                    >

                        <div className="flex items-start justify-between gap-3">

                        <div>
                            <h3 className="font-semibold text-slate-900">
                            {contact.firstName}{" "}
                            {contact.lastName}
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                            {contact.email}
                            </p>
                        </div>

                        <span className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                            {contact.queryType}
                        </span>

                        </div>

                        <div className="mt-4 space-y-2 text-sm">

                        <p className="text-gray-600">
                            <span className="font-medium text-gray-700">
                            Phone:
                            </span>{" "}
                            +91 {contact.contactNumber}
                        </p>

                        <p className="text-gray-500">
                            {formatDateTime(contact.createdAt)}
                        </p>

                        </div>

                        <button
                        type="button"
                        onClick={() =>
                            handleViewDetails(contact)
                        }
                        className="w-full mt-4 px-4 py-2.5 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
                        >
                        <i className="fas fa-eye mr-2" />
                        View Enquiry
                        </button>

                    </div>

                    ))}

                </div>
                )}

            </div>

            {/* =======================================================
                DETAILS MODAL
            ======================================================= */}

            {selectedContact && (
                <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
                onClick={() => setSelectedContact(null)}
                >

                <div
                    className="w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
                    onClick={(event) => event.stopPropagation()}
                >

                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">

                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                        Contact Enquiry
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                        Enquiry #{selectedContact.id}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setSelectedContact(null)}
                        className="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-500"
                    >
                        <i className="fas fa-times" />
                    </button>

                    </div>

                    <div className="p-6">

                    {loadingDetails && (
                        <div className="mb-4 text-sm text-blue-700">
                        <i className="fas fa-spinner fa-spin mr-2" />
                        Loading latest enquiry details...
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                        <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">
                            First Name
                        </p>
                        <p className="text-sm font-medium text-slate-800 mt-1">
                            {selectedContact.firstName || "-"}
                        </p>
                        </div>

                        <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">
                            Last Name
                        </p>
                        <p className="text-sm font-medium text-slate-800 mt-1">
                            {selectedContact.lastName || "-"}
                        </p>
                        </div>

                        <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">
                            Contact Number
                        </p>
                        <p className="text-sm font-medium text-slate-800 mt-1">
                            +91 {selectedContact.contactNumber || "-"}
                        </p>
                        </div>

                        <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">
                            Email ID
                        </p>
                        <p className="text-sm font-medium text-slate-800 mt-1 break-all">
                            {selectedContact.email || "-"}
                        </p>
                        </div>

                        <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">
                            Query / Issue Type
                        </p>
                        <span className="inline-flex mt-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                            {selectedContact.queryType || "-"}
                        </span>
                        </div>

                        <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">
                            Submitted On
                        </p>
                        <p className="text-sm font-medium text-slate-800 mt-1">
                            {formatDateTime(
                            selectedContact.createdAt
                            )}
                        </p>
                        </div>

                    </div>

                    <div className="mt-6">

                        <p className="text-xs font-semibold text-gray-400 uppercase">
                        Message
                        </p>

                        <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-xl min-h-28">

                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {selectedContact.message || "No message provided."}
                        </p>

                        </div>

                    </div>

                    </div>

                    <div className="flex justify-end px-6 py-4 border-t border-gray-200">

                    <button
                        type="button"
                        onClick={() => setSelectedContact(null)}
                        className="px-5 py-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
                    >
                        Close
                    </button>

                    </div>

                </div>

                </div>
            )}

            </div>
        );
        };

        export default ContactEnquiries;
