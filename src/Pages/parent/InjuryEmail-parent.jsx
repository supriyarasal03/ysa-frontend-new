
import React, { useEffect, useState } from "react";
import ParentService from "./parentService";

const InjuryEmail = () => {

  // =========================================================
  // GET TODAY'S DATE
  // =========================================================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // STATES
  // =========================================================

  const [students, setStudents] = useState([]);
  const [playerId, setPlayerId] = useState("");

  const [formData, setFormData] = useState({
    injuryType: "",
    injuryDate: getTodayDate(),
    description: ""
  });

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // FETCH PARENT'S CHILDREN
  // =========================================================

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);

        const response = await ParentService.getMyStudents();

        // Supports a direct array or common API response wrappers.
        const studentList = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.students)
              ? response.students
              : [];

        setStudents(studentList);

        if (studentList.length > 0) {
          setPlayerId(String(studentList[0].playerId ?? studentList[0].id));
        }

      } catch (error) {
        console.error("Failed to fetch children:", error);

        setErrorMessage(
          error.response?.data?.message ||
          "Unable to load your children. Please refresh the page."
        );

      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  // =========================================================
  // SUBMIT INJURY REPORT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!playerId) {
      setErrorMessage(
        "Please select a child before submitting the injury report."
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        playerId: Number(playerId),
        injuryType: formData.injuryType.trim(),
        injuryDate: formData.injuryDate,
        description: formData.description.trim()
      };

      const response = await ParentService.sendInjuryReport(payload);

      setSuccessMessage(
        response?.message ||
        "Your child's injury report has been sent successfully to the assigned coach."
      );

      setFormData({
        injuryType: "",
        injuryDate: getTodayDate(),
        description: ""
      });

    } catch (error) {
      console.error("Injury report submission failed:", error);

      const backendData = error.response?.data;
      const validationErrors = backendData?.data;

      if (
        validationErrors &&
        typeof validationErrors === "object"
      ) {
        const firstError = Object.values(validationErrors)[0];

        setErrorMessage(
          firstError ||
          backendData?.message ||
          "Please check the submitted details."
        );
      } else {
        setErrorMessage(
          backendData?.message ||
          backendData?.error ||
          "Unable to submit your injury report. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* HEADER */}

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 sm:px-8">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white text-2xl">
              🩹
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Report an Injury
              </h2>

              <p className="text-blue-100 text-sm mt-1">
                Notify your child's assigned coach about an injury.
              </p>
            </div>

          </div>

        </div>

        {/* FORM BODY */}

        <div className="p-6 sm:p-8">

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Please provide the details of your child's injury.
            Your report will be sent to the assigned coach
            for review and support.
          </p>

          {/* SUCCESS MESSAGE */}

          {successMessage && (
            <div
              role="status"
              className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
            >
              <span className="text-lg">✓</span>

              <p className="text-sm font-medium">
                {successMessage}
              </p>
            </div>
          )}

          {/* ERROR MESSAGE */}

          {errorMessage && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
            >
              <span className="text-lg">⚠</span>

              <p className="text-sm font-medium">
                {errorMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* SELECT CHILD */}

            <div>
              <label
                htmlFor="playerId"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Select Child <span className="text-red-500">*</span>
              </label>

              <select
                id="playerId"
                value={playerId}
                onChange={(event) => {
                  setPlayerId(event.target.value);
                  setSuccessMessage("");
                  setErrorMessage("");
                }}
                required
                disabled={loadingStudents || students.length === 0}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="">
                  {loadingStudents
                    ? "Loading children..."
                    : "Select a child"}
                </option>

                {students.map((student) => {
                  const id = student.playerId ?? student.id;

                  const name =
                    student.playerName ||
                    student.name ||
                    `${student.firstName || ""} ${student.lastName || ""}`.trim();

                  return (
                    <option key={id} value={id}>
                      {name || `Player ${id}`}
                    </option>
                  );
                })}
              </select>

              {!loadingStudents && students.length === 0 && (
                <p className="mt-2 text-sm text-red-600">
                  No children are linked to your parent account.
                </p>
              )}
            </div>

            {/* INJURY TYPE */}

            <div>
              <label
                htmlFor="injuryType"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Injury Type <span className="text-red-500">*</span>
              </label>

              <input
                id="injuryType"
                type="text"
                name="injuryType"
                value={formData.injuryType}
                onChange={handleChange}
                placeholder="e.g. Knee pain, ankle sprain"
                maxLength={100}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-xs text-gray-500">
                Enter the type of injury your child is experiencing.
              </p>
            </div>

            {/* INJURY DATE */}

            <div>
              <label
                htmlFor="injuryDate"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Injury Date <span className="text-red-500">*</span>
              </label>

              <input
                id="injuryDate"
                type="date"
                name="injuryDate"
                value={formData.injuryDate}
                onChange={handleChange}
                max={getTodayDate()}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Description

                <span className="ml-2 text-xs font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your child's injury, symptoms, or how it happened..."
                rows={5}
                maxLength={1000}
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="mt-1 flex justify-end">
                <span className="text-xs text-gray-500">
                  {formData.description.length}/1000 characters
                </span>
              </div>
            </div>

            {/* SUBMIT BUTTON */}

            <div className="pt-2">

              <button
                type="submit"
                disabled={
                  loading ||
                  loadingStudents ||
                  !playerId ||
                  students.length === 0
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>

                    Sending Report...
                  </>
                ) : (
                  <>
                    <span>✉</span>
                    Send Injury Report
                  </>
                )}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
};

export default InjuryEmail;