import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Trophy,
  ArrowLeft,
  Save,
  X,
  Users,
  
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  addSport,
  updateSport,
  getSportById,
} from "./sportService";

export default function SportForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(Boolean(id));
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    sportsName: "",
    minAge: "",
    maxAge: "",
  });

  // ---------------------------------------------------------------------------
  // Load sport data in edit mode
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isEdit) {
      setFetching(false);
      return;
    }

    const loadSport = async () => {
      try {
        setFetching(true);

        const res = await getSportById(id);
        const sport = res?.data || res;

        if (!sport) {
          setErrors({ general: "Sport not found." });
          return;
        }

        setFormData({
          sportsName: sport.sportsName || "",
          minAge:
            sport.minAge !== null && sport.minAge !== undefined
              ? String(sport.minAge)
              : "",
          maxAge:
            sport.maxAge !== null && sport.maxAge !== undefined
              ? String(sport.maxAge)
              : "",
        });
      } catch (error) {
        setErrors({
          general:
            error?.response?.data?.message ||
            error?.message ||
            "Failed to load sport details.",
        });
      } finally {
        setFetching(false);
      }
    };

    loadSport();
  }, [id, isEdit]);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  // ---------------------------------------------------------------------------
  // Validation helpers
  // ---------------------------------------------------------------------------

  const validateField = (name, value = formData[name]) => {
    const v = String(value ?? "").trim();

    switch (name) {
      case "sportsName":
        if (!v) return "Sports name is required.";
        if (v.length < 2) return "Sports name must be at least 2 characters.";
        if (v.length > 15) return "Sports name cannot exceed 15 characters.";
        if (!/^[A-Za-z][A-Za-z0-9 &'/-]*$/.test(v)) {
          return "Sports name contains invalid characters.";
        }
        return "";

      case "minAge": {
        if (!v) return "Minimum age is required.";

        if (!/^\d+$/.test(v)) {
          return "Minimum age must contain numbers only.";
        }

        const min = Number(v);

        if (min < 1) return "Minimum age must be at least 1.";
        if (min > 100) return "Minimum age cannot exceed 100.";

        return "";
      }

      case "maxAge": {
        if (!v) return "Maximum age is required.";

        if (!/^\d+$/.test(v)) {
          return "Maximum age must contain numbers only.";
        }

        const max = Number(v);

        if (max < 1) return "Maximum age must be at least 1.";
        if (max > 100) return "Maximum age cannot exceed 100.";

        if (
          formData.minAge !== "" &&
          Number(formData.minAge) > max
        ) {
          return "Maximum age must be greater than or equal to minimum age.";
        }

        return "";
      }

      default:
        return "";
    }
  };

  const validate = () => {
    const newErrors = {};

    ["sportsName", "minAge", "maxAge"].forEach((field) => {
      const message = validateField(field);
      if (message) newErrors[field] = message;
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "minAge" || name === "maxAge") {
      value = value.replace(/\D/g, "").slice(0, 3);
    }

    if (name === "sportsName") {
      value = value.slice(0, 15);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccessMessage("");

    if (errors[name]) {
      const message = validateField(name, value);

      setErrors((prev) => ({
        ...prev,
        [name]: message,
      }));
    }

    // Revalidate max age when minimum age changes.
    if (name === "minAge" && errors.maxAge) {
      const maxMessage = validateField("maxAge", formData.maxAge);

      setErrors((prev) => ({
        ...prev,
        maxAge: maxMessage,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const message = validateField(name);

    setErrors((prev) => ({
      ...prev,
      [name]: message,
    }));
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrors({});

    if (!validate()) return;

    setLoading(true);

    const payload = {
      sportsName: formData.sportsName.trim(),
      minAge: Number(formData.minAge),
      maxAge: Number(formData.maxAge),
    };

    try {





      
      if (isEdit) {
        const response = await updateSport(id, payload);

        if (response?.success === false) {
          throw {
            response: {
              data: response,
            },
          };
        }

       setSuccessMessage(
  response?.message || "Sport updated successfully."
);

setTimeout(() => {
  navigate("/admin/sport-management");
}, 1000);



      } else {
        const response = await addSport(payload);

        if (response?.success === false) {
          throw {
            response: {
              data: response,
            },
          };
        }

        setSuccessMessage(
  response?.message || "Sport added successfully."
);

setTimeout(() => {
  navigate("/admin/sport-management");
}, 2000);



      }
    } catch (error) {
      console.error("Sport save error:", error);

      const responseData = error?.response?.data || error;
      const backendData = responseData?.data;

      const fieldErrors = {};

      if (
        backendData &&
        typeof backendData === "object" &&
        !Array.isArray(backendData)
      ) {
        Object.entries(backendData).forEach(([key, value]) => {
          if (typeof value === "string") {
            fieldErrors[key] = value;
          } else if (Array.isArray(value) && value.length > 0) {
            fieldErrors[key] = value[0];
          }
        });
      }

      const message =
        responseData?.message ||
        error?.message ||
        "Something went wrong while saving the sport.";

      if (
        /sport.*name.*(already exists|exists|duplicate)/i.test(message) ||
        /sports.*name.*(already exists|exists|duplicate)/i.test(message)
      ) {
        fieldErrors.sportsName = "This sport already exists.";
      }

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setErrors({
          general: message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const ErrorText = ({ name }) =>
    errors[name] ? (
      <div className="mt-1.5 flex items-start gap-1.5 text-xs text-rose-600">
        <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>{errors[name]}</span>
      </div>
    ) : null;

const inputClass = (name) =>
  `w-full h-12 px-4 rounded-xl border bg-white text-sm text-slate-800 placeholder:text-slate-400
   focus:outline-none focus:ring-2 transition
   ${
     errors[name]
       ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100"
       : "border-slate-200 focus:border-sky-500 focus:ring-sky-100"
   }`;




  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl px-8 py-6 shadow-sm text-sm text-slate-500">
          Loading sport details...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Page Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/sport-management")}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200
                         flex items-center justify-center text-slate-600
                         hover:bg-slate-100 transition"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {isEdit ? "Edit Sport" : "Add New Sport"}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {isEdit
                  ? "Update the sport information below."
                  : "Create a sport and define its eligible age group."}
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* Navy Header */}
          <div className="bg-[#0f172a] px-6 md:px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-sky-300" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-white">
                  Sport Information
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Enter the basic details for this sport.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">

            {/* General Error */}
            {errors.general && (
              <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700">
                  {errors.general}
                </p>
              </div>
            )}

            {/* Sport Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sports Name <span className="text-rose-500">*</span>
              </label>
<div>
  <input
  type="text"
  name="sportsName"
  value={formData.sportsName}
  onChange={handleChange}
  onBlur={handleBlur}
  maxLength={15}
  autoComplete="off"
  placeholder="e.g. Cricket"
  className={inputClass("sportsName")}
 
/>  


              </div>

              <div className="flex justify-between items-start">
                <ErrorText name="sportsName" />

                <span className="ml-auto mt-1.5 text-[11px] text-slate-400">
                  {formData.sportsName.length}/15
                </span>
              </div>
            </div>








{/* Age Range */}
<div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 md:p-6">
  <div className="flex items-center gap-2 mb-5">
    <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center">
      <Users className="w-4 h-4 text-sky-600" />
    </div>

    <div>
      <h3 className="text-sm font-semibold text-slate-700">
        Eligible Age Group
      </h3>

      <p className="text-xs text-slate-400 mt-0.5">
        Define the minimum and maximum player age.
      </p>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

    {/* Minimum Age */}
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Minimum Age <span className="text-rose-500">*</span>
      </label>

      <input
        type="text"
        name="minAge"
        value={formData.minAge}
        onChange={handleChange}
        onBlur={handleBlur}
        inputMode="numeric"
        maxLength={3}
        placeholder="e.g. 8"
        className={inputClass("minAge")}
      />

      <ErrorText name="minAge" />
    </div>

    {/* Maximum Age */}
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Maximum Age <span className="text-rose-500">*</span>
      </label>

      <input
        type="text"
        name="maxAge"
        value={formData.maxAge}
        onChange={handleChange}
        onBlur={handleBlur}
        inputMode="numeric"
        maxLength={3}
        placeholder="e.g. 18"
        className={inputClass("maxAge")}
      />

      <ErrorText name="maxAge" />
    </div>

  </div>

  {/* Valid range indicator */}
  {formData.minAge !== "" &&
    formData.maxAge !== "" &&
    Number(formData.minAge) <= Number(formData.maxAge) &&
    !errors.minAge &&
    !errors.maxAge && (
      <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600">
        <CheckCircle2 className="w-4 h-4" />

        <span>
          Eligible players: {formData.minAge} to{" "}
          {formData.maxAge} years
        </span>
      </div>
    )}
</div>







            {/* Success */}
            {successMessage && (
              <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-sm font-medium text-emerald-700">
                  {successMessage}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-7 mt-7 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate("/admin/sport-management")}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-xl
                           border border-slate-200 bg-white text-slate-600 text-sm font-medium
                           hover:bg-slate-50 transition disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl
                           bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold
                           shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEdit ? "Update Sport" : "Add Sport"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-4">
          All fields marked with <span className="text-rose-500">*</span> are required.
        </p>
      </div>
    </div>
  );
}
