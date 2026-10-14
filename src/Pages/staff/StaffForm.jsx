import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Camera,
  Upload,
  X,
  User,
  Briefcase,
  FileText,
  Shield,
  Maximize2,
} from "lucide-react";
import { addstaff, updateStaff, getStaffById } from "./StaffService";

const API_BASE = "";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ROLE_OPTIONS = [
  { value: "RECEPTIONIST", label: "Receptionist" },
  { value: "INVENTORY_MANAGER", label: "Inventory Manager" },
  { value: "CLEANING_STAFF", label: "Cleaning Staff" },
];

const DOCUMENTS = [
  {
    key: "aadhaarFront",
    label: "Aadhaar Front",
    desc: "Front side of Aadhaar",
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "aadhaarBack",
    label: "Aadhaar Back",
    desc: "Back side of Aadhaar",
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "panCard",
    label: "PAN Card",
    desc: "PAN identity document",
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "degreeCertificate",
    label: "Degree Certificate",
    desc: "Highest qualification proof",
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "resume",
    label: "Resume / CV",
    desc: "PDF resume",
    accept: ".pdf",
  },
];

const StaffForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(Boolean(id));
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoCaptureType, setPhotoCaptureType] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const [docPreviews, setDocPreviews] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    degreeCertificate: null,
    resume: null,
  });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
     bankName: "",
  branchName: "",
  accountHolderName: "",
    role: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
joiningDate: "",
    highestQualification: "",
    experienceYears: "",
    salary: "",
    accountNumber: "",
    ifscCode: "",
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    degreeCertificate: null,
    resume: null,
  });




  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const setFieldError = (name, message) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  };

  const ErrorText = ({ name }) =>
    errors[name] ? (
      <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
    ) : null;

  const fieldClass = (name, extra = "") =>
  `w-full h-11 px-4 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
    errors[name] ? "border-red-500" : "border-slate-200"
  } ${extra}`;

const focusField = (name) => {
  if (!name) return;

  const element = document.querySelector(`[name="${name}"]`);

  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setTimeout(() => {
      element.focus();
    }, 300);
  }
};





  const validateFile = (file, field) => {
    if (!file) return "";

    if (file.size > MAX_FILE_SIZE) {
      return "File size cannot exceed 5 MB.";
    }

    const allowed = {
      aadhaarFront: ["application/pdf", "image/jpeg", "image/png"],
      aadhaarBack: ["application/pdf", "image/jpeg", "image/png"],
      panCard: ["application/pdf", "image/jpeg", "image/png"],
      degreeCertificate: ["application/pdf", "image/jpeg", "image/png"],
      resume: ["application/pdf"],
      photo: ["image/jpeg", "image/png", "image/webp"],
    };

    if (!allowed[field]?.includes(file.type)) {
      if (field === "resume") return "Resume must be a PDF file.";
      if (field === "photo") return "Photo must be JPG, PNG or WEBP.";
      return "Only PDF, JPG or PNG files are allowed.";
    }

    return "";
  };

  const isValidEmail = (value) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);

  const validateField = (name, value = formData[name]) => {
    const v = typeof value === "string" ? value.trim() : value;

    switch (name) {
      case "firstName":
        if (!v) return "First name is required.";
        if (!/^[A-Za-z ]+$/.test(v))
          return "First name can contain only letters and spaces.";
        if (v.length < 3 || v.length > 30)
          return "First name must be between 3 and 30 characters.";
        return "";

      case "lastName":
        if (!v) return "Last name is required.";
        if (!/^[A-Za-z ]+$/.test(v))
          return "Last name can contain only letters and spaces.";
        if (v.length < 2 || v.length > 30)
          return "Last name must be between 2 and 30 characters.";
        return "";

      case "username":
        if (!v) return "Username is required.";
        if (v.length < 4 || v.length > 30)
          return "Username must be between 4 and 30 characters.";
        if (!/^[A-Za-z0-9._-]+$/.test(v))
          return "Username can contain letters, numbers, dot, underscore and hyphen only.";
        return "";

      case "email":
        if (!v) return "Email is required.";
        if (v.length > 100) return "Email cannot exceed 100 characters.";
        if (!isValidEmail(v)) return "Enter a valid email address.";
        return "";

      case "password":
        if (!isEdit && !v) return "Password is required.";
        if (v && (v.length < 8 || v.length > 100))
          return "Password must be between 8 and 100 characters.";
        return "";

      case "confirmPassword":
        if (!isEdit && !v) return "Confirm password is required.";
        if (v && v !== formData.password) return "Passwords do not match.";
        return "";

      case "role":
        if (!v) return "Staff role is required.";
        if (!ROLE_OPTIONS.some((r) => r.value === v))
          return "Select a valid staff role.";
        return "";

      case "mobileNumber":
        if (!v) return "Mobile number is required.";
        if (!/^[6-9]\d{9}$/.test(v))
          return "Enter a valid 10-digit mobile number.";
        return "";

      case "dateOfBirth":
        if (!v) return "Date of birth is required.";
        if (v >= today) return "Date of birth must be in the past.";
        return "";

      case "gender":
        if (!v) return "Gender is required.";
        if (!["MALE", "FEMALE", "OTHER"].includes(v))
          return "Select a valid gender.";
        return "";

      case "address":
        if (!v) return "Address is required.";
        if (v.length < 5 || v.length > 255)
          return "Address must be between 5 and 255 characters.";
        return "";

      case "joiningDate":
        if (!v) return "Joining date is required.";
        if (v < today)
          return "Joining date cannot be before today.";
        return "";

      case "highestQualification":
        if (!v) return "Highest qualification is required.";
        if (v.length < 2 || v.length > 100)
          return "Qualification must be between 2 and 100 characters.";
        return "";

      case "experienceYears":
        if (v === "" || v === null || v === undefined)
          return "Experience is required.";
        if (!/^\d+$/.test(String(v)))
          return "Experience must be a whole number.";
        if (Number(v) < 0 || Number(v) > 50)
          return "Experience must be between 0 and 50 years.";
        return "";

      case "salary":
        if (v === "" || v === null || v === undefined)
          return "Salary is required.";
        if (!/^\d+(\.\d{1,2})?$/.test(String(v)))
          return "Salary must be a valid amount with up to 2 decimal places.";
        if (Number(v) <= 0)
          return "Salary must be greater than 0.";
        return "";

      case "bankName":
  if (!v) return "Bank name is required.";
  if (v.length < 2 || v.length > 100)
    return "Bank name must be between 2 and 100 characters.";
  return "";

case "branchName":
  if (!v) return "Branch name is required.";
  if (v.length < 2 || v.length > 100)
    return "Branch name must be between 2 and 100 characters.";
  return "";

case "accountHolderName":
  if (!v) return "Account holder name is required.";
  if (!/^[A-Za-z ]+$/.test(v))
    return "Account holder name can contain only letters and spaces.";
  if (v.length < 2 || v.length > 100)
    return "Account holder name must be between 2 and 100 characters.";
  return "";

case "accountNumber":
  if (!v) return "Account number is required.";
  if (!/^\d{9,18}$/.test(v))
    return "Account number must contain 9 to 18 digits.";
  return "";

      case "ifscCode":
        if (!v) return "IFSC code is required.";
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.toUpperCase()))
          return "Enter a valid IFSC code.";
        return "";

      default:
        return "";
    }
  };

  const validate = () => {
    const next = {};
const fields = [
  "username",
  "email",
  ...(!isEdit ? ["password", "confirmPassword"] : []),
  "role",
  "firstName",



  "lastName",
  "mobileNumber",
  "dateOfBirth",
  "gender",
  "address",
  ...(!isEdit ? ["joiningDate"] : []),
  "highestQualification",
"experienceYears",
"salary",
"bankName",
"branchName",
"accountHolderName",
"accountNumber",
"ifscCode",
];
    fields.forEach((field) => {
      const message = validateField(field);
      if (message) next[field] = message;
    });

    if (!isEdit) {
      if (!photoFile) next.photo = "Staff photo is required.";
      if (!formData.aadhaarFront)
        next.aadhaarFront = "Aadhaar front document is required.";
      if (!formData.aadhaarBack)
        next.aadhaarBack = "Aadhaar back document is required.";
      if (!formData.panCard)
        next.panCard = "PAN card document is required.";
if (formData.role === "CLEANING_STAFF") {
  // Degree Certificate and Resume are optional
} else {
  // Degree Certificate and Resume are mandatory
  if (!formData.degreeCertificate)
    next.degreeCertificate = "Degree certificate is required.";

  if (!formData.resume)
    next.resume = "Resume is required.";
}





    }

    


setErrors(next);
return next;
  };
  // ---------------------------------------------------------------------------
  // Load existing staff
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isEdit) {
      setFetching(false);
      return;
    }

    const loadStaff = async () => {
      try {
        setFetching(true);

        const res = await getStaffById(id);
        const staff = res?.data || res;

        if (!staff) {
          setErrors({ general: "Staff not found." });
          return;
        }

        setFormData({
          username: staff.username || "",
          email: staff.email || "",
          password: "",
          confirmPassword: "",
          role: staff.role || "",
          firstName: staff.firstName || "",
          lastName: staff.lastName || "",
          mobileNumber: staff.mobileNumber || "",
          dateOfBirth: staff.dateOfBirth
            ? String(staff.dateOfBirth).slice(0, 10)
            : "",
          gender: staff.gender || "",
          address: staff.address || "",
          joiningDate: staff.joiningDate
            ? String(staff.joiningDate).slice(0, 10)
            : "",
          highestQualification: staff.highestQualification || "",
          experienceYears: staff.experienceYears ?? "",
          salary: staff.salary ?? "",

         bankName: staff.bankName || "",
branchName: staff.branchName || "",
accountHolderName: staff.accountHolderName || "",
accountNumber: staff.accountNumber || "",
ifscCode: staff.ifscCode || "",
          aadhaarFront: null,
          aadhaarBack: null,
          panCard: null,
          degreeCertificate: null,
          resume: null,
        });

        if (staff.photoUrl) {
          const url = staff.photoUrl.startsWith("http")
            ? staff.photoUrl
            : `${API_BASE}${staff.photoUrl}`;

          setPhotoPreview(url);
          setPhotoCaptureType(staff.photoCaptureType || "UPLOADED");
        }

        setDocPreviews({
          aadhaarFront: staff.aadhaarFrontUrl ? "Document uploaded" : null,
          aadhaarBack: staff.aadhaarBackUrl ? "Document uploaded" : null,
          panCard: staff.panCardUrl ? "Document uploaded" : null,
          degreeCertificate: staff.degreeCertificateUrl
            ? "Document uploaded"
            : null,
          resume: staff.resumeUrl ? "Document uploaded" : null,
        });
      } catch (error) {
        console.error("Failed to load staff:", error);
        setErrors({
          general:
            error?.message ||
            error?.response?.data?.message ||
            "Unable to load staff details.",
        });
      } finally {
        setFetching(false);
      }
    };

    loadStaff();
  }, [id, isEdit]);

  // ---------------------------------------------------------------------------
  // Camera
  // ---------------------------------------------------------------------------

  const openCamera = async () => {
    try {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.photo;
        return next;
      });

      if (!navigator.mediaDevices?.getUserMedia) {
        setErrors((prev) => ({
          ...prev,
          photo: "Camera is not supported by this browser.",
        }));
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      setStream(mediaStream);
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (error) {
      console.error("Camera error:", error);
      setErrors((prev) => ({
        ...prev,
        photo: "Unable to access camera. Please allow camera permission.",
      }));
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStream(null);
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth) {
      setErrors((prev) => ({
        ...prev,
        photo: "Camera is not ready yet.",
      }));
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], `staff-photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(blob));
        setPhotoCaptureType("LIVE_CAMERA");
        setFieldError("photo", "");
        closeCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileError = validateFile(file, "photo");

    if (fileError) {
      setFieldError("photo", fileError);
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoCaptureType("UPLOADED");
    setFieldError("photo", "");
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoCaptureType("");

    if (!isEdit) {
      setFieldError("photo", "Staff photo is required.");
    }
  };

  // ---------------------------------------------------------------------------
  // Documents
  // ---------------------------------------------------------------------------

  const handleDocChange = (field, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileError = validateFile(file, field);

    if (fileError) {
      setFieldError(field, fileError);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));

    setDocPreviews((prev) => ({
      ...prev,
      [field]: file.name,
    }));

    setFieldError(field, "");
  };

  // ---------------------------------------------------------------------------
  // Form handlers
  // ---------------------------------------------------------------------------

  const handleChange = (event) => {
    const { name } = event.target;
    let { value } = event.target;







if (name === "role" && value === "CLEANING_STAFF") {
  setFormData((prev) => ({
    ...prev,
    degreeCertificate: null,
    resume: null,
  }));

  setDocPreviews((prev) => ({
    ...prev,
    degreeCertificate: null,
    resume: null,
  }));

  setErrors((prev) => {
    const next = { ...prev };
    delete next.degreeCertificate;
    delete next.resume;
    return next;
  });
}










if (
  name === "firstName" ||
  name === "lastName" ||
  name === "accountHolderName"
) {
  value = value.replace(/[^A-Za-z ]/g, "");
}


    if (name === "mobileNumber") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "accountNumber") {
      value = value.replace(/\D/g, "").slice(0, 18);
    }

    if (name === "experienceYears") {
      value = value.replace(/\D/g, "").slice(0, 2);
    }

    if (name === "salary") {
      value = value.replace(/[^0-9.]/g, "");
      const parts = value.split(".");
      if (parts.length > 2) {
        value = `${parts[0]}.${parts.slice(1).join("")}`;
      }
      if (value.includes(".")) {
        const [whole, decimal] = value.split(".");
        value = `${whole}.${decimal.slice(0, 2)}`;
      }
    }

    if (name === "username") {
      value = value.replace(/\s/g, "").slice(0, 30);
    }

    if (name === "ifscCode") {
      value = value.replace(/\s/g, "").toUpperCase().slice(0, 11);
    }

    if (name === "email") {
      value = value.slice(0, 100);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccessMessage("");

    // Validate while typing once a field has an error.
    if (errors[name]) {
      const message = validateField(name, value);
      setFieldError(name, message);
    }
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    const message = validateField(name);

    setFieldError(name, message);
  };

  // ---------------------------------------------------------------------------
  // Backend error handling
  // ---------------------------------------------------------------------------

  const applyBackendErrors = (error) => {
    const response = error?.response?.data || error;
    const backendData = response?.data;

    const fieldErrors = {};

    if (backendData && typeof backendData === "object" && !Array.isArray(backendData)) {
      Object.entries(backendData).forEach(([key, value]) => {
        if (typeof value === "string") fieldErrors[key] = value;
      });
    }

    const message = String(
      response?.message ||
        error?.message ||
        ""
    );

    // Duplicate/constraint messages are mapped to the correct field.
    if (/username.*(already exists|exists|duplicate)/i.test(message)) {
      fieldErrors.username = "Username already exists.";
    }

    if (/email.*(already exists|exists|duplicate)/i.test(message)) {
      fieldErrors.email = "Email already exists.";
    }

    if (/mobile.*(already exists|exists|duplicate)/i.test(message)) {
      fieldErrors.mobileNumber = "Mobile number already exists.";
    }

    if (/confirm.*password|password.*match/i.test(message)) {
      fieldErrors.confirmPassword = message;
    }


      if (Object.keys(fieldErrors).length > 0) {
  setErrors((prev) => ({
    ...prev,
    ...fieldErrors,
    general: "",
  }));

  const firstError = Object.keys(fieldErrors)[0];

  setTimeout(() => {
    focusField(firstError);
  }, 100);
} else {



      setErrors((prev) => ({
        ...prev,
        general:
          message ||
          "Could not save staff. Please check the entered details.",
      }));
    }
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrors({});


const validationErrors = validate();

if (Object.keys(validationErrors).length > 0) {
  const firstError = Object.keys(validationErrors)[0];

  focusField(firstError);

  return;
}



    setLoading(true);

    try {
      const fd = new FormData();

      fd.append("username", formData.username.trim());
      fd.append("email", formData.email.trim());

if (!isEdit && formData.password) {
  fd.append("password", formData.password);
}

if (!isEdit && formData.confirmPassword) {
  fd.append("confirmPassword", formData.confirmPassword);
}




      fd.append("role", formData.role);
      fd.append("firstName", formData.firstName.trim());
      fd.append("lastName", formData.lastName.trim());
      fd.append("mobileNumber", formData.mobileNumber);
      fd.append("dateOfBirth", formData.dateOfBirth);
      fd.append("gender", formData.gender);

fd.append("address", formData.address.trim());

if (!isEdit) {
  fd.append("joiningDate", formData.joiningDate);
}

fd.append(
  "highestQualification",
  formData.highestQualification.trim()
);




      fd.append("experienceYears", formData.experienceYears);
      fd.append("salary", formData.salary);


   fd.append("bankName", formData.bankName.trim());
fd.append("branchName", formData.branchName.trim());
fd.append("accountHolderName", formData.accountHolderName.trim());
fd.append("accountNumber", formData.accountNumber);
fd.append("ifscCode", formData.ifscCode.toUpperCase());

      if (photoFile) {
        fd.append("photo", photoFile);
        fd.append("photoCaptureType", photoCaptureType);
      }

      if (formData.aadhaarFront) {
        fd.append("aadhaarFront", formData.aadhaarFront);
      }
      if (formData.aadhaarBack) {
        fd.append("aadhaarBack", formData.aadhaarBack);
      }
      if (formData.panCard) {
        fd.append("panCard", formData.panCard);
      }
      if (formData.degreeCertificate) {
        fd.append("degreeCertificate", formData.degreeCertificate);
      }
      if (formData.resume) {
        fd.append("resume", formData.resume);
      }



const response = isEdit
  ? await updateStaff(id, fd)
  : await addstaff(fd);

if (response?.success === false) {
  applyBackendErrors({ response: { data: response } });
  return;
}

setSuccessMessage(
  response?.message ||
    (isEdit
      ? "Staff updated successfully."
      : "Staff registered successfully.")
);

// Redirect to Staff Management after 3 seconds
setTimeout(() => {
  navigate("/admin/staff-management");
}, 1000);

} catch (error) {
  console.error("Staff save error:", error);
  applyBackendErrors(error);
} finally {
  setLoading(false);
}




    
  };


  





  

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [stream]);

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-8 py-6 text-slate-500">
          Loading staff details...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900/95 p-0 md:p-4 lg:p-6 flex items-center justify-center">
      <div className="w-full max-w-[1550px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl border border-slate-300 shadow-2xl overflow-hidden flex flex-col">

        {/* ================================================================
            FORM HEADER
        ================================================================= */}
        <div className="shrink-0 bg-[#0f172a] text-white px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold tracking-tight">
            {isEdit ? "Edit Staff Member" : "Register New Staff Member"}
          </h1>

          <div className="flex items-center gap-4">
            <span
              className="text-slate-400"
              title="Staff registration form"
            >
              <Maximize2 className="w-5 h-5" />
            </span>

            <button
              type="button"
              onClick={() => navigate("/admin/staff-management")}
              disabled={loading}
              className="text-slate-300 hover:text-white transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================
            SCROLLABLE FORM
        ================================================================= */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="overflow-y-auto flex-1 bg-white"
        >
          <div className="p-4 md:p-6 space-y-6">

            {/* ============================================================
                1. PERSONAL INFORMATION
            ============================================================= */}
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                <User className="w-5 h-5 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  1. Personal Information
                </h2>
              </div>

              <div className="p-5 md:p-6 space-y-6">

                {/* Profile Photo */}
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-sky-600" />
                      <h3 className="text-sm font-bold text-slate-700">
                        Live Profile Photo Capture
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold ${
                        photoPreview
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {photoPreview ? "CAPTURED" : "READY"}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col lg:flex-row items-start gap-6">
                    {/* Photo */}
                    <div className="relative shrink-0">
                      <div
                        className="w-56 h-56 rounded-2xl border-2 border-slate-200 bg-[#0f172a] overflow-hidden flex items-center justify-center cursor-pointer group"
                        onClick={() => {
                          if (photoPreview) setShowPhotoModal(true);
                        }}
                      >
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Staff preview"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="text-center">
                            <User className="w-14 h-14 text-slate-500 mx-auto mb-2" />
                            <p className="text-xs text-slate-400">
                              No Photo Captured
                            </p>
                          </div>
                        )}
                      </div>

                      {photoPreview && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePhoto();
                            }}
                            className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-red-300 text-red-500 shadow-sm hover:bg-red-50 transition z-10"
                            title="Remove photo"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <p className="text-[11px] text-center text-slate-400 mt-2">
                            Click photo to enlarge
                          </p>
                        </>
                      )}
                    </div>

                    {/* Photo Actions */}
                    <div className="flex-1 pt-2 lg:pt-12">
                      <p className="text-sm font-medium text-slate-500 mb-4">
                        Capture a clear frontal photo for official academy staff identification.
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={openCamera}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                        >
                          <Camera className="w-4 h-4" />
                          Open Camera & Capture
                        </button>

                        <label>
                          <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold cursor-pointer transition">
                            <Upload className="w-4 h-4" />
                            Upload File Instead
                          </span>

                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            className="hidden"
                            onChange={handlePhotoUpload}
                          />
                        </label>
                      </div>

                      <p className="text-xs text-slate-400 mt-3">
                        JPG, PNG or WEBP. Maximum file size 5 MB.
                      </p>

                      <ErrorText name="photo" />
                    </div>
                  </div>
                </div>

                {/* Personal Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="off"
                      placeholder="e.g. Sunita"
                      className={fieldClass("firstName", "bg-white")}
                    />
                    <ErrorText name="firstName" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="off"
                      placeholder="e.g. Sharma"
                      className={fieldClass("lastName", "bg-white")}
                    />
                    <ErrorText name="lastName" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="e.g. 9823011223"
                      className={fieldClass("mobileNumber", "bg-white")}
                    />
                    <ErrorText name="mobileNumber" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={fieldClass("gender", "bg-white")}
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <ErrorText name="gender" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      max={yesterday}
                      className={fieldClass("dateOfBirth", "bg-white")}
                    />
                    <ErrorText name="dateOfBirth" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                      Staff Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={fieldClass("role", "bg-white")}
                    >
                      <option value="">Select Staff Role</option>
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <ErrorText name="role" />
                  </div>

                  <div className="md:col-span-2 xl:col-span-3">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows={2}
                      maxLength={255}
                      placeholder="Enter complete address"
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white ${
                        errors.address
                          ? "border-red-500"
                          : "border-slate-200"
                      }`}
                    />
                    <ErrorText name="address" />
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================================
                2. PROFESSIONAL DETAILS
            ============================================================= */}
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  2. Professional Details
                </h2>
              </div>

            
            
            
              <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

               




                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    Highest Qualification{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="highestQualification"
                    value={formData.highestQualification}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={100}
                    placeholder="e.g. B.Com, MBA"
                    className={fieldClass("highestQualification", "bg-white")}
                  />
                  <ErrorText name="highestQualification" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    Experience
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      inputMode="numeric"
                      maxLength={2}
                      placeholder="e.g. 8"
                      className={fieldClass("experienceYears", "bg-white pr-16")}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      Years
                    </span>
                  </div>
                  <ErrorText name="experienceYears" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    Monthly Salary <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      ₹
                    </span>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      inputMode="decimal"
                      placeholder="e.g. 25000"
                      className={fieldClass("salary", "bg-white pl-9")}
                    />
                  </div>
                  <ErrorText name="salary" />
                </div>


               {!isEdit && (
  <div className="xl:col-span-2">
    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
      Joining Date <span className="text-red-500">*</span>
    </label>
    <input
      type="date"
      name="joiningDate"
      value={formData.joiningDate}
      min={today}
      onChange={handleChange}
      onBlur={handleBlur}
      className={fieldClass("joiningDate", "bg-white")}
    />
    <ErrorText name="joiningDate" />
  </div>
)}



              </div>
            </section>

            {/* ============================================================
                3. STAFF VERIFICATION & QUALIFICATION DOCUMENTS
            ============================================================= */}
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  3. Staff Verification & Qualification Documents
                </h2>
              </div>

              <div className="p-5 md:p-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">


{DOCUMENTS
  .filter(
    (doc) =>
      formData.role !== "CLEANING_STAFF" ||
      !["degreeCertificate", "resume"].includes(doc.key)
  )
  .map((doc) => (






                    <div
                      key={doc.key}
                      className={`relative flex items-center justify-between gap-4 p-4 border rounded-xl bg-white ${
                        errors[doc.key]
                          ? "border-red-300"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">
                          {doc.label}{" "}
                          {!isEdit && <span className="text-red-500">*</span>}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {docPreviews[doc.key]
                            ? docPreviews[doc.key]
                            : doc.desc}
                        </p>

                        <ErrorText name={doc.key} />
                      </div>

                      <label className="shrink-0">
                        <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer transition">
                          <Upload className="w-4 h-4" />
                          {docPreviews[doc.key] ? "Change File" : "Upload File"}
                        </span>

                        <input
                          type="file"
                          accept={doc.accept}
                          className="hidden"
                          onChange={(e) => handleDocChange(doc.key, e)}
                        />
                      </label>

                      {docPreviews[doc.key] && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              [doc.key]: null,
                            }));

                            setDocPreviews((prev) => ({
                              ...prev,
                              [doc.key]: null,
                            }));

                            if (!isEdit) {
                              setFieldError(
                                doc.key,
                                `${doc.label} is required.`
                              );
                            }
                          }}
                          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-red-200 text-red-500 hover:bg-red-50 transition shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-xs text-slate-400">
                  PDF, JPG or PNG files are accepted. Maximum file size: 5 MB.
                  Resume must be PDF.
                </p>
              </div>
            </section>

            {/* ============================================================
                4. BANK DETAILS
            ============================================================= */}
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                <Shield className="w-5 h-5 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  4. Bank Details
                </h2>
              </div>


              <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

  {/* Bank Name */}
  <div>
    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
      Bank Name <span className="text-red-500">*</span>
    </label>

    <input
      type="text"
      name="bankName"
      value={formData.bankName}
      onChange={handleChange}
      onBlur={handleBlur}
      maxLength={100}
      placeholder="e.g. State Bank of India"
      className={fieldClass("bankName", "bg-white")}
    />

    <ErrorText name="bankName" />
  </div>

  {/* Branch Name */}
  <div>
    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
      Branch Name <span className="text-red-500">*</span>
    </label>

    <input
      type="text"
      name="branchName"
      value={formData.branchName}
      onChange={handleChange}
      onBlur={handleBlur}
      maxLength={100}
      placeholder="e.g. Pune Main Branch"
      className={fieldClass("branchName", "bg-white")}
    />

    <ErrorText name="branchName" />
  </div>

  {/* Account Holder Name */}
  <div>
    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
      Account Holder Name <span className="text-red-500">*</span>
    </label>

    <input
      type="text"
      name="accountHolderName"
      value={formData.accountHolderName}
      onChange={handleChange}
      onBlur={handleBlur}
      maxLength={100}
      placeholder="e.g. Sunita Sharma"
      className={fieldClass("accountHolderName", "bg-white")}
    />

    <ErrorText name="accountHolderName" />
  </div>

  {/* Account Number */}
  <div>
    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
      Account Number <span className="text-red-500">*</span>
    </label>

    <input
      name="accountNumber"
      value={formData.accountNumber}
      onChange={handleChange}
      onBlur={handleBlur}
      inputMode="numeric"
      maxLength={18}
      placeholder="9-18 digits"
      className={fieldClass("accountNumber", "bg-white font-mono")}
    />

    <ErrorText name="accountNumber" />
  </div>

  {/* IFSC Code */}
  <div>
    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
      IFSC Code <span className="text-red-500">*</span>
    </label>

    <input
      name="ifscCode"
      value={formData.ifscCode}
      onChange={handleChange}
      onBlur={handleBlur}
      maxLength={11}
      placeholder="e.g. SBIN0001234"
      className={fieldClass("ifscCode", "bg-white uppercase")}
    />

    <ErrorText name="ifscCode" />
  </div>

</div>




            </section>

            {/* ============================================================
                5. ACCOUNT & CREDENTIALS
            ============================================================= */}
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                <Shield className="w-5 h-5 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  5. Account & Credentials
                </h2>
              </div>

              <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="username"
                    maxLength={30}
                    placeholder="e.g. sunita_s"
                    className={fieldClass("username", "bg-white")}
                  />
                  <ErrorText name="username" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="email"
                    maxLength={100}
                    placeholder="e.g. sunita@gmail.com"
                    className={fieldClass("email", "bg-white")}
                  />
                  <ErrorText name="email" />
                </div>



{!isEdit && (
  <>
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
        Password <span className="text-red-500">*</span>
      </label>

      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        onBlur={handleBlur}
        autoComplete="new-password"
        maxLength={100}
        placeholder="Min 8 characters"
        className={fieldClass("password", "bg-white")}
      />

      <ErrorText name="password" />
    </div>

    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
        Confirm Password <span className="text-red-500">*</span>
      </label>

      <input
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        autoComplete="new-password"
        maxLength={100}
        placeholder="Re-enter password"
        className={fieldClass("confirmPassword", "bg-white")}
      />

      <ErrorText name="confirmPassword" />
    </div>
  </>
)}



              </div>
            </section>

            {/* ============================================================
                MESSAGES + ACTIONS
            ============================================================= */}
            <div className="border-t border-slate-200 pt-5 pb-2">
              {successMessage && (
                <p className="mb-4 text-center text-emerald-600 font-semibold text-sm">
                  {successMessage}
                </p>
              )}

              {errors.general && (
                <p className="mb-4 text-center text-red-600 text-sm">
                  {errors.general}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin/staff-management")}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 disabled:opacity-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-60"
                >
                  {loading
                    ? isEdit
                      ? "Updating..."
                      : "Registering..."
                    : isEdit
                    ? "Update Staff"
                    : "Register New Staff"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ================================================================
          CAMERA MODAL
      ================================================================= */}
      {cameraOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">
                Capture Staff Photo
              </h3>

              <button
                type="button"
                onClick={closeCamera}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-5">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-xl bg-black aspect-video object-cover"
              />

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeCamera}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={capturePhoto}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium"
                >
                  <Camera className="w-4 h-4" />
                  Capture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          LARGE PHOTO PREVIEW MODAL
      ================================================================= */}
      {showPhotoModal && photoPreview && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh]">
            <button
              type="button"
              onClick={() => setShowPhotoModal(false)}
              className="absolute -top-3 -right-3 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-700 shadow-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={photoPreview}
              alt="Staff full preview"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffForm;
