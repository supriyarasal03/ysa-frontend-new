import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  Camera,
  Upload,
  FileText,
  Shield,
  Building2,
  X,
  Check,
  Eye,
  EyeOff,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  addCoach,
  updateCoach,
  getCoachById,
  viewCoachFile,
  getAllSports,
} from "./CoachService";

// ============================================================
// CONSTANTS
// ============================================================

const API_BASE = "";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];

const DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];


// ============================================================
// COMPONENT
// ============================================================

export default function CoachForm() {

  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);



const getTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


  const fileInputRefs = {
    livePhoto: useRef(null),

    aadhaarFront: useRef(null),
    aadhaarBack: useRef(null),
    panCard: useRef(null),
    degreeCertificate: useRef(null),
    experienceCertificate: useRef(null),
    resume: useRef(null),
  };
  const [successMessage, setSuccessMessage] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Focus/scroll directly to the field that has a validation error.
  const fieldRefs = {
    username: useRef(null),
    email: useRef(null),
    password: useRef(null),
    firstName: useRef(null),
    lastName: useRef(null),
    mobileNumber: useRef(null),
    gender: useRef(null),


    dateOfBirth: useRef(null),

joiningDate: useRef(null),

address: useRef(null),



    sportId: useRef(null),
    experience: useRef(null),
    qualification: useRef(null),
    salary: useRef(null),
    bankName: useRef(null),
    branchName: useRef(null),
    accountHolderName: useRef(null),
    accountNumber: useRef(null),
    ifscCode: useRef(null),

     livePhoto: useRef(null),
  aadhaarFront: useRef(null),
  aadhaarBack: useRef(null),
  panCard: useRef(null),
  degreeCertificate: useRef(null),
  experienceCertificate: useRef(null),
  resume: useRef(null),
  };

  const [loading, setLoading] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState("");
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [backendErrors, setBackendErrors] = useState({});

  // ==========================================================
// SPORTS
// ==========================================================

const [sports, setSports] = useState([]);
const [sportsLoading, setSportsLoading] = useState(false);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  const [showPassword, setShowPassword] = useState(false);

  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);



  const [errors, setErrors] = useState({});

  // ==========================================================
  // FORM DATA
  // ==========================================================

  const [formData, setFormData] = useState({

    // Account
    username: "",
    email: "",
    password: "",

    // Personal
    firstName: "",
    lastName: "",
    mobileNumber: "",
    gender: "",
    dateOfBirth: "",
   joiningDate: getTodayDate(),
    address: "",  

    // Professional
    sportId: "",
    experience: "",
    qualification: "",
    salary: "",

    // Bank
    bankName: "",
    branchName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
  });




  // ==========================================================
// LOAD SPORTS
// ==========================================================



useEffect(() => {

  const loadSports = async () => {

    try {

      setSportsLoading(true);

      const response = await getAllSports();

      // =====================================================
      // GET SPORT LIST FROM API RESPONSE
      // Supports:
      // { success: true, data: [...] }
      // OR
      // [...]
      // OR
      // { data: { data: [...] } }
      // =====================================================

      const responseData =
        response?.data ?? response;

      const sportList =
        Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
          ? responseData.data
          : [];

      // =====================================================
      // ONLY ACTIVE SPORTS
      // Supports both "status" and "Status"
      // =====================================================

      const activeSports = sportList.filter((sport) => {

        const status =
          sport?.status ??
          sport?.Status ??
          "";

        return (
          String(status)
            .trim()
            .toUpperCase() === "ACTIVE"
        );

      });

      console.log("All sports:", sportList);
      console.log("Active sports:", activeSports);

      setSports(activeSports);

    } catch (error) {

      console.error(
        "Unable to load sports:",
        error
      );

      setSports([]);

    } finally {

      setSportsLoading(false);

    }

  };

  loadSports();

}, []);






  const handleRemoveLivePhoto = () => {
  setFiles((prev) => ({
    ...prev,
    livePhoto: null,
  }));

  setExistingPhotoUrl(null);

  setExistingFiles((prev) => ({
    ...prev,
    livePhotoPath: null,
  }));
};


  // ==========================================================
  // FILE DATA
  // ==========================================================

  const [files, setFiles] = useState({

    livePhoto: null,
   

    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    degreeCertificate: null,
    experienceCertificate: null,
    resume: null,
  });


  // ==========================================================
  // EXISTING FILE INFORMATION
  // ==========================================================

  const [existingFiles, setExistingFiles] = useState({

    livePhotoPath: null,
   
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    degreeCertificate: null,
    experienceCertificate: null,
    resume: null,
  });

  // Existing files are valid during edit mode.
  // livePhoto is stored separately as livePhotoPath.
  const hasExistingFile = (key) => {
    if (key === "livePhoto") {
      return Boolean(existingFiles.livePhotoPath);
    }

    return Boolean(existingFiles[key]);
  };


  // ==========================================================
  // DOCUMENT LABELS
  // ==========================================================

  const documentConfig = [
    {
      key: "aadhaarFront",
      title: "Aadhaar Card - Front",
      description: "Government identity proof",
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    {
      key: "aadhaarBack",
      title: "Aadhaar Card - Back",
      description: "Government identity proof",
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    {
      key: "panCard",
      title: "PAN Card",
      description: "Income tax identity document",
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    {
      key: "degreeCertificate",
      title: "Degree Certificate",
      description: "Educational qualification certificate",
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    {
      key: "experienceCertificate",
      title: "Experience Certificate",
      description: "Previous employment verification",
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    {
      key: "resume",
      title: "Resume",
      description: "Curriculum Vitae / Professional CV",
      accept: ".pdf",
    },
  ];




  useEffect(() => {
  return () => {
    if (existingPhotoUrl) {
      window.URL.revokeObjectURL(existingPhotoUrl);
    }
  };
}, [existingPhotoUrl]);


  // ==========================================================
  // LOAD COACH FOR EDIT
  // ==========================================================

  useEffect(() => {

    if (!isEditMode) {
      setPageLoading(false);
      return;
    }

    const loadCoach = async () => {

      try {

        setPageLoading(true);

        const response = await getCoachById(id);

        const coach = response?.data || response;

        if (!coach) {
          throw new Error("Coach not found");
        }


// Load existing coach photo through backend file API
if (coach.livePhotoPath) {
  try {
    const blob = await viewCoachFile(
      coach.livePhotoPath
    );

    const url = window.URL.createObjectURL(blob);

    setExistingPhotoUrl(url);
  } catch (photoError) {
    console.error(
      "Unable to load existing coach photo:",
      photoError
    );

    setExistingPhotoUrl(null);
  }
}


        setFormData({

          username: coach.username || "",
          email: coach.email || "",
          password: "",

          firstName: coach.firstName || "",
          lastName: coach.lastName || "",
          mobileNumber: coach.mobileNumber || "",
          gender: coach.gender || "",
          dateOfBirth: coach.dateOfBirth || "",
          joiningDate: coach.joiningDate || "",


          address: coach.address || "",

sportId:
  coach.sportId !== null &&
  coach.sportId !== undefined
    ? String(coach.sportId)
    : coach.sport?.id !== null &&
      coach.sport?.id !== undefined
    ? String(coach.sport.id)
    : "",

experience:
  coach.experience !== null &&
  coach.experience !== undefined
    ? String(coach.experience)
    : "",





          qualification: coach.qualification || "",
          salary: coach.salary ?? "",

          bankName: coach.bankDetails?.bankName || "",
          branchName: coach.bankDetails?.branchName || "",
          accountHolderName:
            coach.bankDetails?.accountHolderName || "",
          accountNumber:
            coach.bankDetails?.accountNumber || "",
          ifscCode:
            coach.bankDetails?.ifscCode || "",
        });


        setExistingFiles({

          livePhotoPath:
            coach.livePhotoPath || null,


          aadhaarFront:
            findDocument(coach.documents, "aadhaar-front"),

          aadhaarBack:
            findDocument(coach.documents, "aadhaar-back"),

          panCard:
            findDocument(coach.documents, "pan"),

          degreeCertificate:
            findDocument(coach.documents, "degree"),

          experienceCertificate:
            findDocument(coach.documents, "experience"),

          resume:
            findDocument(coach.documents, "resume"),
        });

      } catch (error) {

        console.error(error);

        alert(
          error?.message ||
          "Unable to load coach details."
        );

        navigate("/coach-management");

      } finally {

        setPageLoading(false);
      }
    };

    loadCoach();

  }, [id, isEditMode, navigate]);


  // ==========================================================
  // FIND DOCUMENT
  // ==========================================================

  const findDocument = (documents, type) => {
    if (!Array.isArray(documents)) {
      return null;
    }

    const wanted = String(type || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const aliases = {
      aadhaarfront: ["aadhaarfront", "aadharfront", "aadhaarcardfront", "aadharcardfront"],
      aadhaarback: ["aadhaarback", "aadharback", "aadhaarcardback", "aadharcardback"],
      pan: ["pan", "pancard"],
      degree: ["degree", "degreecertificate"],
      experience: ["experience", "experiencecertificate"],
      resume: ["resume", "cv"],
    };

    const accepted = aliases[wanted] || [wanted];

    return (
      documents.find((doc) => {
        const actual = String(
          doc?.documentType ??
          doc?.type ??
          doc?.documentName ??
          ""
        )
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");

        if (!actual) {
          return false;
        }

        return accepted.some(
          (alias) =>
            actual === alias ||
            actual.includes(alias) ||
            alias.includes(actual)
        );
      }) || null
    );
  };


  // ==========================================================
  // FOCUS FIRST ERROR FIELD
  // ==========================================================

  const focusErrorField = (errorsObject) => {
    if (!errorsObject || typeof errorsObject !== "object") return;

    const errorFields = Object.keys(errorsObject).filter(
      (field) => errorsObject[field]
    );

    if (!errorFields.length) return;

    const firstErrorField = errorFields[0];
    const fieldRef = fieldRefs[firstErrorField];

    if (!fieldRef?.current) return;

    // Wait until React has rendered the error state.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const element = fieldRef.current;

        if (!element) return;

        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Normal form fields.
        if (
          ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(
            element.tagName
          )
        ) {
          element.focus({ preventScroll: true });
          return;
        }

        // Document cards are DIVs. Focus the upload button inside it.
        const focusable = element.querySelector(
          'input:not([type="hidden"]), select, textarea, button'
        );

        if (focusable) {
          focusable.focus({ preventScroll: true });
        }
      });
    });
  };


  // ==========================================================
  // HANDLE TEXT INPUT
  // ==========================================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    let finalValue = value;

    // Name fields: do not allow numbers/special characters while typing.
    if (
      name === "firstName" ||
      name === "lastName" ||
      name === "accountHolderName"
    ) {
      finalValue = value.replace(/[^A-Za-z ]/g, "");
    }

    // Mobile only digits
    if (name === "mobileNumber") {
      finalValue = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    // Account number only digits
    if (name === "accountNumber") {
      finalValue = value
        .replace(/\D/g, "")
        .slice(0, 18);
    }

    // Experience only digits
    if (name === "experience") {
      finalValue = value
        .replace(/\D/g, "")
        .slice(0, 2);
    }

    // Salary: allow digits and decimal point (up to 2 decimals)
    if (name === "salary") {
      finalValue = value.replace(/[^0-9.]/g, "");

      const parts = finalValue.split(".");

      if (parts.length > 2) {
        finalValue = `${parts[0]}.${parts.slice(1).join("")}`;
      }

      if (finalValue.includes(".")) {
        const [whole, decimal] = finalValue.split(".");
        finalValue = `${whole}.${decimal.slice(0, 2)}`;
      }
    }

    // IFSC uppercase
    if (name === "ifscCode") {
      finalValue = value
        .toUpperCase()
        .replace(/\s/g, "")
        .slice(0, 11);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    if (successMessage) {
      setSuccessMessage("");
    }

    // Clear backend error when user changes field
    setBackendErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Clear frontend error while typing
    if (errors[name]) {

      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };


  // ==========================================================
  // VALIDATE FIELD
  // ==========================================================

  const validateField = (name, value) => {

    const val = String(value ?? "");


    switch (name) {

      // -------------------------------------------------------
      // USERNAME
      // -------------------------------------------------------

      case "username":

        if (!val.trim()) {
          return "Username is required";
        }

        if (val.length < 4 || val.length > 20) {
          return "Username must be between 4 and 20 characters";
        }

        if (!/^[a-zA-Z0-9._]+$/.test(val)) {
          return "Username can contain only letters, numbers, dot(.) and underscore(_)";
        }

        return "";


      // -------------------------------------------------------
      // EMAIL
      // -------------------------------------------------------

      case "email":

        if (!val.trim()) {
          return "Email is required";
        }

        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
        ) {
          return "Enter a valid email address";
        }

        return "";


      // -------------------------------------------------------
      // PASSWORD
      // -------------------------------------------------------

      case "password":

        // In edit mode, blank means keep the existing password.
        if (isEditMode && !val.trim()) {
          return "";
        }

        if (!val.trim()) {
          return "Password is required";
        }

        if (val.length < 8 || val.length > 100) {
          return "Password must be between 8 and 100 characters";
        }

        return "";


      // -------------------------------------------------------
      // FIRST NAME
      // -------------------------------------------------------

      case "firstName":

        if (!val.trim()) {
          return "First name is required";
        }

        if (val.trim().length < 2) {
          return "First name must be at least 2 characters";
        }

        if (val.length > 30) {
          return "First name cannot exceed 30 characters";
        }

        if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(val)) {
          return "First name can contain only letters and spaces";
        }

        return "";


      // -------------------------------------------------------
      // LAST NAME
      // -------------------------------------------------------

      case "lastName":

        if (!val.trim()) {
          return "Last name is required";
        }

        if (val.trim().length < 2) {
          return "Last name must be at least 2 characters";
        }

        if (val.length > 30) {
          return "Last name cannot exceed 30 characters";
        }

        if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(val)) {
          return "Last name can contain only letters and spaces";
        }

        return "";


      // -------------------------------------------------------
      // MOBILE
      // -------------------------------------------------------

      case "mobileNumber":

        if (!val.trim()) {
          return "Mobile number is required";
        }

        if (!/^[6-9][0-9]{9}$/.test(val)) {
          return "Enter a valid 10-digit mobile number";
        }

        return "";


      // -------------------------------------------------------
      // GENDER
      // -------------------------------------------------------

      case "gender":

        if (!val) {
          return "Gender is required";
        }

        return "";


      // -------------------------------------------------------
      // DATE OF BIRTH
      // -------------------------------------------------------

      case "dateOfBirth":

        if (!val) {
          return "Date of birth is required";
        }

        if (
          new Date(val) >=
          new Date()
        ) {
          return "Date of birth must be a past date";
        }

        return "";


      // -------------------------------------------------------
      // JOINING DATE
      // -------------------------------------------------------

     case "joiningDate":

  if (!val) {
    return "Joining date is required";
  }

  const today = getTodayDate();

  if (val < today) {
    return "Joining date cannot be a past date";
  }

  return "";





      // -------------------------------------------------------
      // ADDRESS
      // -------------------------------------------------------

      case "address":

        if (!val.trim()) {
          return "Address is required";
        }

        if (val.trim().length < 5) {
          return "Address must be at least 5 characters";
        }

        if (val.length > 500) {
          return "Address cannot exceed 500 characters";
        }

        return "";


        case "sportId":

  if (!val) {
    return "Sport is required";
  }

  return "";


      // -------------------------------------------------------
      // EXPERIENCE
      // -------------------------------------------------------

      case "experience":

        if (val === "") {
          return "Experience is required";
        }

        if (Number(val) < 0) {
          return "Experience cannot be negative";
        }

        if (Number(val) > 50) {
          return "Experience cannot exceed 50 years";
        }

        return "";


      // -------------------------------------------------------
      // QUALIFICATION
      // -------------------------------------------------------

      case "qualification":

        if (!val.trim()) {
          return "Qualification is required";
        }

        if (val.trim().length < 2) {
          return "Qualification must be at least 2 characters";
        }

        if (val.length > 100) {
          return "Qualification cannot exceed 100 characters";
        }

        return "";


      // -------------------------------------------------------
      // SALARY
      // -------------------------------------------------------

      case "salary":

        if (val === "") {
          return "Salary is required";
        }
if (!/^\d+(\.\d{1,2})?$/.test(val)) {
  return "Salary must be a valid amount with up to 2 decimal places";
}

        if (Number(val) <= 0) {
          return "Salary must be greater than 0";
        }

        return "";


      // -------------------------------------------------------
      // BANK NAME
      // -------------------------------------------------------

      case "bankName":

        if (!val.trim()) {
          return "Bank name is required";
        }

        if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(val)) {
          return "Bank name can contain only letters and spaces";
        }

        return "";


      // -------------------------------------------------------
      // BRANCH NAME
      // -------------------------------------------------------

      case "branchName":

        if (!val.trim()) {
          return "Branch name is required";
        }

        if (!/^[A-Za-z0-9 .,&()/-]+$/.test(val)) {
          return "Branch name contains invalid characters";
        }

        return "";


      // -------------------------------------------------------
      // ACCOUNT HOLDER
      // -------------------------------------------------------

      case "accountHolderName":

        if (!val.trim()) {
          return "Account holder name is required";
        }

        if (
          !/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(val)
        ) {
          return "Account holder name can contain only letters and spaces";
        }

        return "";


      // -------------------------------------------------------
      // ACCOUNT NUMBER
      // -------------------------------------------------------

      case "accountNumber":

        if (!val.trim()) {
          return "Account number is required";
        }

        if (!/^[0-9]{9,18}$/.test(val)) {
          return "Account number must contain 9 to 18 digits";
        }

        return "";


      // -------------------------------------------------------
      // IFSC
      // -------------------------------------------------------

      case "ifscCode":

        if (!val.trim()) {
          return "IFSC code is required";
        }

        if (
          !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(
            val.toUpperCase()
          )
        ) {
          return "Enter a valid IFSC code";
        }

        return "";


      default:
        return "";
    }
  };


  // ==========================================================
  // BLUR VALIDATION
  // ==========================================================

  const handleBlur = (e) => {

    const { name, value } = e.target;

    const error = validateField(
      name,
      value
    );

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };


  // ==========================================================
  // FILE VALIDATION
  // ==========================================================

  const validateFile = (
    file,
    fieldName,
    allowedTypes
  ) => {

    if (!file) {
      return `${fieldName} is required`;
    }

    if (!allowedTypes.includes(file.type)) {

      if (fieldName === "Resume") {
        return "Resume must be a PDF file";
      }

      return `${fieldName} must be a image file`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `${fieldName} cannot exceed 2 MB`;
    }

    return "";
  };


  // ==========================================================
  // HANDLE FILE
  // ==========================================================

  const handleFileChange = (
    fieldName,
    file
  ) => {

    if (!file) {
      return;
    }

    const labelMap = {

      livePhoto: "Live photo",

      profilePhoto: "Profile photo",

      aadhaarFront: "Aadhaar front",

      aadhaarBack: "Aadhaar back",

      panCard: "PAN card",

      degreeCertificate:
        "Degree certificate",

      experienceCertificate:
        "Experience certificate",

      resume: "Resume",
    };

    const allowed =
      fieldName === "livePhoto" ||
      fieldName === "profilePhoto"
        ? IMAGE_TYPES
        : fieldName === "resume"
        ? ["application/pdf"]
        : DOCUMENT_TYPES;


    const error = validateFile(
      file,
      labelMap[fieldName],
      allowed
    );


    if (error) {

      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));

      return;
    }


    setFiles((prev) => ({
      ...prev,
      [fieldName]: file,
    }));


    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));


    setBackendErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    setSuccessMessage("");
  };


  // ==========================================================
  // CAMERA
  // ==========================================================

  const openCamera = async () => {

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        });

      setCameraStream(stream);
      setCameraOpen(true);

      setTimeout(() => {

        if (videoRef.current) {
          videoRef.current.srcObject =
            stream;
        }

      }, 100);

    } catch (error) {

      console.error(error);

      alert(
        "Unable to access camera. Please allow camera permission."
      );
    }
  };


  // ==========================================================
  // CLOSE CAMERA
  // ==========================================================

  const closeCamera = () => {

    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach((track) =>
          track.stop()
        );
    }

    setCameraStream(null);
    setCameraOpen(false);
  };


  // ==========================================================
  // CAPTURE CAMERA PHOTO
  // ==========================================================

  const capturePhoto = () => {

    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const context =
      canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );


    canvas.toBlob(
      (blob) => {

        if (!blob) {
          return;
        }

        const file =
          new File(
            [blob],
            "live-photo.jpg",
            {
              type: "image/jpeg",
            }
          );

        handleFileChange(
          "livePhoto",
          file
        );

        closeCamera();

      },
      "image/jpeg",
      0.9
    );
  };


  // ==========================================================
  // SUBMIT VALIDATION
  // ==========================================================

  const validateAllFields = () => {

    const newErrors = {};

    const fields = [
      "username",
      "email",
      "password",
      "firstName",
      "lastName",
      "mobileNumber",
      "gender",
      "dateOfBirth",
      "joiningDate",
     "address",
"sportId",
"experience",
"qualification",
      "bankName",
      "branchName",
      "accountHolderName",
      "accountNumber",
      "ifscCode",
    ];

    fields.forEach((field) => {
      const error = validateField(field, formData[field]);

      if (error) {
        newErrors[field] = error;
      }
    });

    const requiredFiles = [
      ["livePhoto", "Live photo"],
      ["aadhaarFront", "Aadhaar front"],
      ["aadhaarBack", "Aadhaar back"],
      ["panCard", "PAN card"],
      ["degreeCertificate", "Degree certificate"],
      ["experienceCertificate", "Experience certificate"],
      ["resume", "Resume"],
    ];

    requiredFiles.forEach(([key, label]) => {

      // Existing saved files are valid during edit.
      if (
        isEditMode &&
        !files[key] &&
        hasExistingFile(key)
      ) {
        return;
      }

      const error = validateFile(
        files[key],
        label,
        key === "livePhoto"
          ? IMAGE_TYPES
          : key === "resume"
          ? ["application/pdf"]
          : DOCUMENT_TYPES
      );

      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


// ==========================================================
// RESET FORM AFTER SUCCESSFUL COACH ADD
// ==========================================================
const resetCoachForm = () => {

  setFormData({
    username: "",
    email: "",
    password: "",

    firstName: "",
    lastName: "",
    mobileNumber: "",
    gender: "",
    dateOfBirth: "",
   joiningDate: getTodayDate(),
    address: "",

    experience: "",
    qualification: "",
    salary: "",

    bankName: "",
    branchName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
  });

  setFiles({
    livePhoto: null,
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    degreeCertificate: null,
    experienceCertificate: null,
    resume: null,
  });

  setExistingFiles({
    livePhotoPath: null,
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    degreeCertificate: null,
    experienceCertificate: null,
    resume: null,
  });

  setExistingPhotoUrl(null);

  setErrors({});
  setBackendErrors({});

  // Clear file inputs
  Object.values(fileInputRefs).forEach((ref) => {
    if (ref.current) {
      ref.current.value = "";
    }
  });
};




  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setBackendErrors({});


    // Validate frontend and focus the first invalid field.
    if (!validateAllFields()) {
      setTimeout(() => {
        const currentErrors = {};
        const fieldsToCheck = [
          "username",
          "email",
          "password",
          "firstName",
          "lastName",
          "mobileNumber",
          "gender",
          "dateOfBirth",
          "joiningDate",
          "address",
          "experience",
          "qualification",
          "salary",
          "bankName",
          "branchName",
          "accountHolderName",
          "accountNumber",
          "ifscCode",
        ];

        fieldsToCheck.forEach((field) => {
          const message = validateField(field, formData[field]);
          if (message) currentErrors[field] = message;
        });

        const requiredFiles = [
          ["livePhoto", "Live photo"],
          ["aadhaarFront", "Aadhaar front"],
          ["aadhaarBack", "Aadhaar back"],
          ["panCard", "PAN card"],
          ["degreeCertificate", "Degree certificate"],
          ["experienceCertificate", "Experience certificate"],
          ["resume", "Resume"],
        ];

        requiredFiles.forEach(([key, label]) => {
          if (
            isEditMode &&
            !files[key] &&
            hasExistingFile(key)
          ) {
            return;
          }

          const fileError = validateFile(
            files[key],
            label,
            key === "livePhoto"
              ? IMAGE_TYPES
              : key === "resume"
              ? ["application/pdf"]
              : DOCUMENT_TYPES
          );

          if (fileError) {
            currentErrors[key] = fileError;
          }
        });

        focusErrorField(currentErrors);
      }, 0);

      return;
    }


    try {

      setLoading(true);


      const payload =
        new FormData();


      // ======================================================
      // ACCOUNT
      // ======================================================

      payload.append(
        "username",
        formData.username.trim()
      );

      payload.append(
        "email",
        formData.email.trim()
      );


      if (
        !isEditMode ||
        formData.password.trim()
      ) {

        payload.append(
          "password",
          formData.password
        );
      }


      // ======================================================
      // PERSONAL
      // ======================================================

      payload.append(
        "firstName",
        formData.firstName.trim()
      );

      payload.append(
        "lastName",
        formData.lastName.trim()
      );

      payload.append(
        "mobileNumber",
        formData.mobileNumber
      );

      payload.append(
        "gender",
        formData.gender
      );

      payload.append(
        "dateOfBirth",
        formData.dateOfBirth
      );

      payload.append(
        "joiningDate",
        formData.joiningDate
      );

      payload.append(
        "address",
        formData.address.trim()
      );


      // ======================================================
      // PROFESSIONAL
      // ======================================================

      // ======================================================
// PROFESSIONAL
// ======================================================

payload.append(
  "sportId",
  formData.sportId
);

payload.append(
  "experience",
  formData.experience
);



      payload.append(
        "qualification",
        formData.qualification.trim()
      );

      payload.append(
        "salary",
        formData.salary
      );


      // ======================================================
      // PHOTOS
      // ======================================================







      // ======================================================
      // PHOTOS
      // ======================================================

      // Only send a new photo when selected/captured.
      // Omitting it during edit keeps the existing photo.
      if (files.livePhoto) {
        payload.append(
          "livePhoto",
          files.livePhoto
        );
      }


      // ======================================================
      // DOCUMENTS
      // ======================================================

      // Only replacement/new files are sent.
      // Existing documents are kept by the backend.
      const documentFields = [
        "aadhaarFront",
        "aadhaarBack",
        "panCard",
        "degreeCertificate",
        "experienceCertificate",
        "resume",
      ];

      documentFields.forEach((field) => {
        if (files[field]) {
          payload.append(field, files[field]);
        }
      });


      // ======================================================
      // BANK
      // ======================================================

      payload.append(
        "bankName",
        formData.bankName.trim()
      );

      payload.append(
        "branchName",
        formData.branchName.trim()
      );

      payload.append(
        "accountHolderName",
        formData.accountHolderName.trim()
      );

      payload.append(
        "accountNumber",
        formData.accountNumber
      );

      payload.append(
        "ifscCode",
        formData.ifscCode.toUpperCase()
      );


      // ======================================================
      // API
      // ======================================================

      let response;

      if (isEditMode) {

        response =
          await updateCoach(
            id,
            payload
          );

      } else {

        response =
          await addCoach(
            payload
          );
      }


      if (
        response?.success === false
      ) {

        throw {
          response: {
            data: response,
          },
        };
      }


      setBackendErrors({});
      setErrors({});




if (isEditMode) {
  setSuccessMessage("Coach updated successfully.");

  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });

  setTimeout(() => {
    navigate("/admin/coach-managmnet");
  }, 2000);

} else {

  resetCoachForm();

  setSuccessMessage("Coach added successfully.");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  setTimeout(() => {
    navigate("/admin/coach-managmnet");
  }, 1000);
}





   } catch (error) {

      console.error("Coach submit error:", error);

      const backend = error?.response?.data || error;
      const backendData = backend?.data;
      const fieldErrors = {};

      if (
        backendData &&
        typeof backendData === "object" &&
        !Array.isArray(backendData)
      ) {
        Object.entries(backendData).forEach(([field, value]) => {

          const message = Array.isArray(value)
            ? value[0]
            : String(value ?? "");

          if (!message) {
            return;
          }

          const lower = message.toLowerCase();

          // Blank password is valid during edit.
          if (
            isEditMode &&
            field === "password" &&
            !formData.password.trim()
          ) {
            return;
          }

          const documentField = [
            "livePhoto",
            "aadhaarFront",
            "aadhaarBack",
            "panCard",
            "degreeCertificate",
            "experienceCertificate",
            "resume",
          ].includes(field);

          // Existing document is already valid during edit.
          if (
            isEditMode &&
            documentField &&
            !files[field] &&
            hasExistingFile(field) &&
            lower.includes("required")
          ) {
            return;
          }

          fieldErrors[field] = message;
        });
      }

      const message =
        String(backend?.message || error?.message || "");

      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("email already exists")) {
        fieldErrors.email = "Email already exists.";
      }

      if (lowerMessage.includes("username already exists")) {
        fieldErrors.username = "Username already exists.";
      }

      if (lowerMessage.includes("mobile")) {
        fieldErrors.mobileNumber =
          message || "Mobile number already exists.";
      }

      if (Object.keys(fieldErrors).length > 0) {

        setBackendErrors(fieldErrors);

        setErrors((prev) => ({
          ...prev,
          ...fieldErrors,
        }));

        setTimeout(() => {
          focusErrorField(fieldErrors);
        }, 0);

      } else {

        setBackendErrors({
          general:
            message || "Failed to save coach.",
        });

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }

    finally {

      setLoading(false);
    }
  };


  // ==========================================================
  // ERROR HELPER
  // ==========================================================

  const getError = (field) => {

    return (
      errors[field] ||
      backendErrors[field] ||
      ""
    );
  };


  // ==========================================================
  // INPUT CLASS
  // ==========================================================

  const inputClass = (field) => {

    const hasError =
      Boolean(getError(field));

    return `
      w-full
      px-4
      py-3
      rounded-xl
      border
      ${
        hasError
          ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100"
          : "border-slate-200 bg-white focus:border-sky-500 focus:ring-sky-100"
      }
      text-sm
      text-slate-800
      outline-none
      focus:ring-2
      transition
    `;
  };


  // ==========================================================
  // ERROR COMPONENT
  // ==========================================================

  const FieldError = ({
    field,
  }) => {

    const error =
      getError(field);

    if (!error) {
      return null;
    }

    return (
      <p className="mt-1.5 text-xs text-red-600">
        {error}
      </p>
    );
  };


  // ==========================================================
  // FILE URL
  // ==========================================================

  const getFileUrl = (path) => {

    if (!path) {
      return "";
    }

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    return `${API_BASE}/${path}`;
  };


  // ==========================================================
  // FILE CARD
  // ==========================================================
const renderDocument = (config) => {

  const file = files[config.key];

  const existing = existingFiles[config.key];

  const hasDocument =
    Boolean(file || existing);


  // ============================================
  // VIEW DOCUMENT
  // ============================================

  const handleViewDocument = () => {

    // New file selected
    if (file) {

      const url =
        URL.createObjectURL(file);

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }


    // Existing document
    if (existing) {

      const path =
        existing.filePath ||
        existing.path ||
        existing.url;

      if (path) {

        window.open(
          getFileUrl(path),
          "_blank",
          "noopener,noreferrer"
        );
      }
    }
  };


  // ============================================
  // DELETE SELECTED FILE
 // ============================================
// REMOVE / REPLACE DOCUMENT
// ============================================
const handleRemoveDocument = (config) => {

  // Remove newly selected file if one exists
  setFiles((prev) => ({
    ...prev,
    [config.key]: null,
  }));

  // Hide existing document only from UI.
  // DO NOT delete it from backend.
  setExistingFiles((prev) => ({
    ...prev,
    [config.key]: null,
  }));

  setErrors((prev) => ({
    ...prev,
    [config.key]: "",
  }));

  setBackendErrors((prev) => ({
    ...prev,
    [config.key]: "",
  }));

  setSuccessMessage("");
};









  return (

    <div
      key={config.key}
      ref={fieldRefs[config.key]}
      tabIndex={-1}
      className={`
    rounded-2xl
    border
    ${
      getError(config.key)
        ? "border-red-300 bg-red-50/30"
        : "border-slate-200 bg-white"
    }
    p-5
  `}
>




      <div className="
        flex
        flex-col
        sm:flex-row
        sm:items-center
        justify-between
        gap-4
      ">


        {/* ======================================
            DOCUMENT INFORMATION
        ====================================== */}

        <div className="
          flex
          items-start
          gap-3
          min-w-0
        ">

          <div className="
            w-10
            h-10
            rounded-xl
            bg-sky-50
            flex
            items-center
            justify-center
            shrink-0
          ">

            <FileText
              className="w-5 h-5 text-sky-600"
            />

          </div>


          <div className="min-w-0">

            <p className="
              font-semibold
              text-slate-800
              text-sm
            ">

              {config.title}

              <span className="text-red-500 ml-1">
                *
              </span>

            </p>


            <p className="
              text-xs
              text-slate-400
              mt-1
            ">

              {config.description}

            </p>


            {/* ==================================
                NEW FILE
            ================================== */}

            {file ? (

              <div className="mt-2">

                <p className="
                  text-xs
                  text-emerald-600
                  font-medium
                  truncate
                  max-w-[300px]
                ">

                  ✓ {file.name}

                </p>


                <p className="
                  text-[11px]
                  text-slate-400
                  mt-1
                ">

                  {(file.size / 1024 / 1024).toFixed(2)} MB

                </p>

              </div>

            ) : existing ? (

              /* ==================================
                 EXISTING FILE
              ================================== */

              <p className="
                text-xs
                text-emerald-600
                font-medium
                mt-2
              ">

                ✓ Document uploaded

              </p>

            ) : (

              /* ==================================
                 NO FILE
              ================================== */

              <p className="
                text-xs
                text-slate-400
                mt-2
              ">

                Not Uploaded

              </p>

            )}

          </div>

        </div>


        {/* ======================================
            ACTION BUTTONS
        ====================================== */}

        <div className="
          flex
          items-center
          gap-2
          shrink-0
        ">


          {/* ====================================
              NO FILE
          ==================================== */}

          {!hasDocument && (

            <button
              type="button"
              onClick={() =>
                fileInputRefs[
                  config.key
                ].current?.click()
              }
              className="
                px-4
                py-2
                rounded-xl
                border
                border-sky-200
                bg-sky-50
                text-sky-700
                text-xs
                font-semibold
                hover:bg-sky-100
                transition
              "
            >

              <Upload
                className="
                  w-4
                  h-4
                  inline
                  mr-1
                "
              />

              Upload File

            </button>

          )}


          {/* ====================================
              FILE EXISTS
          ==================================== */}

          {hasDocument && (

            <>

              {/* VIEW */}

              <button
                type="button"
                onClick={
                  handleViewDocument
                }
                className="
                  px-3
                  py-2
                  rounded-xl
                  border
                  border-blue-200
                  bg-blue-50
                  text-blue-700
                  text-xs
                  font-semibold
                  hover:bg-blue-100
                  transition
                "
              >

                <Eye
                  className="
                    w-4
                    h-4
                    inline
                    mr-1
                  "
                />

                View

              </button>


              {/* DELETE */}

              <button
                type="button"
               onClick={() => handleRemoveDocument(config)}


                disabled={deletingDocument === config.key}
                className="
                  px-3
                  py-2
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  text-red-600
                  text-xs
                  font-semibold
                  hover:bg-red-100
                  transition
                "
              >

                <X
                  className="
                    w-4
                    h-4
                    inline
                    mr-1
                  "
                />

                {deletingDocument === config.key
                  ? "Deleting..."
                  : "Delete"}

              </button>

            </>

          )}

        </div>

      </div>


      {/* ========================================
          HIDDEN FILE INPUT
      ======================================== */}

      <input
        ref={
          fileInputRefs[
            config.key
          ]
        }
        type="file"
        accept={config.accept}
        className="hidden"
        onChange={(e) => {

          const selectedFile =
            e.target.files?.[0];

          handleFileChange(
            config.key,
            selectedFile
          );

          // Allow selecting same file again
          e.target.value = "";

        }}
      />


      {/* ========================================
          ERROR
      ======================================== */}

      {getError(config.key) && (

        <FieldError
          field={config.key}
        />

      )}

    </div>
  );
};










  // ==========================================================
  // PAGE LOADING
  // ==========================================================

  if (pageLoading) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">

        <div className="text-center">

          <Loader2
            className="w-8 h-8 animate-spin text-sky-600 mx-auto"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading coach details...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      <div className="max-w-7xl mx-auto">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="
          bg-slate-900
          text-white
          rounded-t-2xl
          px-6
          py-5
          flex
          items-center
          justify-between
        ">

          <div>

            <h1 className="text-xl md:text-2xl font-bold">
              {isEditMode
                ? "Edit Coach"
                : "Register New Coach"}
            </h1>

            <p className="text-slate-300 text-xs mt-1">
              Yashree Sports Academy
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              navigate("/admin/coach-managmnet")
            }
            className="
              p-2
              rounded-lg
              hover:bg-white/10
              transition
            "
          >

            <X className="w-5 h-5" />

          </button>

        </div>


        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-b-2xl shadow-sm"
        >

          {backendErrors.general && (
            <div className="
              mx-6 md:mx-8 mt-6
              rounded-xl
              border border-red-200
              bg-red-50
              px-4 py-3
              text-sm font-medium text-red-700
            ">
              {backendErrors.general}
            </div>
          )}

          {/* ==================================================
              1. PERSONAL INFORMATION
          ================================================== */}

          <section className="p-6 md:p-8">

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">

              <User className="w-5 h-5 text-sky-600" />

              <h2 className="font-bold text-slate-800">
                1. PERSONAL INFORMATION
              </h2>

            </div>


            {/* PHOTO AREA */}

            <div className="
              mt-6
              rounded-2xl
              border
              border-slate-200
              p-5
              bg-slate-50/50
            ">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Camera className="w-5 h-5 text-sky-600" />

                  <h3 className="font-semibold text-slate-700">
                    Live Profile Photo Capture
                  </h3>

                </div>

                <span className="
                  text-xs
                  px-3
                  py-1
                  rounded-full
                  bg-sky-50
                  text-sky-600
                  font-medium
                ">
                  READY
                </span>

              </div>


              <div className="
                mt-4
                flex
                flex-col
                md:flex-row
                items-center
                gap-6
              ">


<div className="
  relative
  w-40
  h-40
  rounded-2xl
  overflow-visible
  bg-slate-900
  flex
  items-center
  justify-center
  border
  border-slate-200
">

  {files.livePhoto ? (

    <>
      <img
        src={URL.createObjectURL(files.livePhoto)}
        alt="Live"
        className="
          w-full
          h-full
          object-cover
          rounded-2xl
        "
      />

      {/* REMOVE PHOTO */}
      <button
        type="button"
        onClick={handleRemoveLivePhoto}
        className="
          absolute
          -top-2
          -right-2
          w-8
          h-8
          rounded-full
          bg-white
          border
          border-slate-200
          shadow-md
          flex
          items-center
          justify-center
          text-red-500
          hover:bg-red-50
          hover:text-red-600
          transition
          z-10
        "
        title="Remove photo"
      >
        <X className="w-4 h-4" />
      </button>
    </>

  ) : existingPhotoUrl ? (

    <>
      <img
        src={existingPhotoUrl}
        alt="Existing coach"
        className="
          w-full
          h-full
          object-cover
          rounded-2xl
        "
      />

      {/* REMOVE EXISTING PHOTO */}
      <button
        type="button"
        onClick={handleRemoveLivePhoto}
        className="
          absolute
          -top-2
          -right-2
          w-8
          h-8
          rounded-full
          bg-white
          border
          border-slate-200
          shadow-md
          flex
          items-center
          justify-center
          text-red-500
          hover:bg-red-50
          hover:text-red-600
          transition
          z-10
        "
        title="Remove photo"
      >
        <X className="w-4 h-4" />
      </button>
    </>

  ) : (

    <div className="text-center text-slate-400">

      <User className="w-12 h-12 mx-auto" />

      <p className="text-xs mt-2">
        No Photo Captured
      </p>

    </div>

  )}

</div>





                <div>

                  <p className="text-sm font-medium text-slate-600">
                    Capture a clear frontal photo
                  </p>

                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    JPG or PNG • Maximum 2 MB
                  </p>


                  <div className="flex flex-wrap gap-3">

                    <button
                      type="button"
                      onClick={openCamera}
                      className="
                        px-4
                        py-2.5
                        rounded-xl
                        bg-sky-600
                        hover:bg-sky-700
                        text-white
                        text-sm
                        font-medium
                        transition
                      "
                    >

                      <Camera className="w-4 h-4 inline mr-2" />

                      Open Camera & Capture

                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        fileInputRefs.livePhoto.current?.click()
                      }
                      className="
                        px-4
                        py-2.5
                        rounded-xl
                        border
                        border-slate-300
                        text-slate-700
                        text-sm
                        font-medium
                        hover:bg-slate-50
                        transition
                      "
                    >

                      <Upload className="w-4 h-4 inline mr-2" />

                      Upload File Instead

                    </button>

                  </div>

                  <input
                    ref={fileInputRefs.livePhoto}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      handleFileChange(
                        "livePhoto",
                        e.target.files?.[0]
                      );
                      e.target.value = "";
                    }}
                  />

                  <FieldError field="livePhoto" />

                </div>

              </div>

            </div>


            {/* PROFILE PHOTO */}

            




            {/* PERSONAL FIELDS */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">

              {/* FIRST NAME */}

              <div>

                <label className="field-label">
                  FIRST NAME *
                </label>

                <input
                  ref={fieldRefs.firstName}
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("firstName")}
                  placeholder="e.g. Rahul"
                />

                <FieldError field="firstName" />

              </div>


              {/* LAST NAME */}

              <div>

                <label className="field-label">
                  LAST NAME *
                </label>

                <input
                  ref={fieldRefs.lastName}
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("lastName")}
                  placeholder="e.g. Sharma"
                />

                <FieldError field="lastName" />

              </div>


              {/* MOBILE */}

              <div>

                <label className="field-label">
                  PHONE NUMBER *
                </label>

                <input
                  ref={fieldRefs.mobileNumber}
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={10}
                  inputMode="numeric"
                  className={inputClass("mobileNumber")}
                  placeholder="e.g. 9876543210"
                />

                <FieldError field="mobileNumber" />

              </div>


              {/* GENDER */}

              <div>

                <label className="field-label">
                  GENDER *
                </label>

                <div className="relative">

                  <select
                    ref={fieldRefs.gender}
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${inputClass("gender")} appearance-none`}
                  >

                    <option value="">
                      Select Gender
                    </option>

                    <option value="MALE">
                      Male
                    </option>

                    <option value="FEMALE">
                      Female
                    </option>

                    <option value="OTHER">
                      Other
                    </option>

                  </select>

                  <ChevronDown className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    w-4
                    h-4
                    text-slate-400
                    pointer-events-none
                  " />

                </div>

                <FieldError field="gender" />

              </div>


              {/* DOB */}

              <div>

                <label className="field-label">
                  DATE OF BIRTH *
                </label>

                <input
                  ref={fieldRefs.dateOfBirth}
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("dateOfBirth")}
                />

                <FieldError field="dateOfBirth" />

              </div>


              {/* JOINING DATE */}


{/* JOINING DATE - ONLY FOR ADD */}

{!isEditMode && (
  <div>

    <label className="field-label">
      JOINING DATE *
    </label>



<input
  ref={fieldRefs.joiningDate}
  type="date"
  name="joiningDate"
  value={formData.joiningDate}
  min={getTodayDate()}
  onChange={handleChange}
  onBlur={handleBlur}
  className={inputClass("joiningDate")}
/>



    <FieldError field="joiningDate" />

  </div>
)}






            </div>


            {/* ADDRESS */}

            <div className="mt-5">

              <label className="field-label">
                ADDRESS *
              </label>

              <textarea
                ref={fieldRefs.address}
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                className={inputClass("address")}
                placeholder="Enter complete address"
              />

              <FieldError field="address" />

            </div>

          </section>


          {/* ==================================================
              2. PROFESSIONAL DETAILS
          ================================================== */}

          <section className="px-6 md:px-8 pb-8">

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">

              <Building2 className="w-5 h-5 text-sky-600" />

              <h2 className="font-bold text-slate-800">
                2. PROFESSIONAL DETAILS
              </h2>

            </div>


            





<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

  {/* SPORT */}





<div>

  <label className="field-label">
    SPORT *
  </label>

  <div className="relative">

    <select
      ref={fieldRefs.sportId}
      name="sportId"
      value={formData.sportId}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={sportsLoading}
      className={`${inputClass("sportId")} appearance-none`}
    >

      <option value="">
        {sportsLoading
          ? "Loading sports..."
          : sports.length === 0
          ? "No Active Sports Available"
          : "Select Sport"}
      </option>

      {sports.map((sport) => (
        <option
          key={sport.id}
          value={sport.id}
        >
          {sport.sportsName}
        </option>
      ))}

    </select>

    <ChevronDown
      className="
        absolute
        right-3
        top-1/2
        -translate-y-1/2
        w-4
        h-4
        text-slate-400
        pointer-events-none
      "
    />

  </div>

  <FieldError field="sportId" />

</div>



  {/* QUALIFICATION */}

  <div>

    <label className="field-label">
      QUALIFICATION *
    </label>



                <input
                  ref={fieldRefs.qualification}
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("qualification")}
                  placeholder="e.g. Bachelor of Physical Education"
                />

                <FieldError field="qualification" />

              </div>


              {/* SALARY */}

              <div>

                <label className="field-label">
                  MONTHLY SALARY *
                </label>

                <input
                  ref={fieldRefs.salary}
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  className={inputClass("salary")}
                  placeholder="e.g. 25000"
                />

                <FieldError field="salary" />

              </div>


              <div>

                <label className="field-label">
                  EXPERIENCE *
                </label>

                <div className="relative">

                  <input
                    ref={fieldRefs.experience}
                    type="number"
                    name="experience"
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass("experience")}
                    placeholder="e.g. 5"
                  />

                </div>

                <FieldError field="experience" />

              </div>

            </div>

          </section>


          {/* ==================================================
              3. DOCUMENTS
          ================================================== */}

          <section className="px-6 md:px-8 pb-8">

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">

              <FileText className="w-5 h-5 text-sky-600" />

              <h2 className="font-bold text-slate-800">
                3. COACH VERIFICATION & QUALIFICATION DOCUMENTS
              </h2>

            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">

              {documentConfig.map(
                (config) =>
                  renderDocument(config)
              )}

            </div>

          </section>


          {/* ==================================================
              4. BANK DETAILS
          ================================================== */}

          <section className="px-6 md:px-8 pb-8">

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">

              <Shield className="w-5 h-5 text-sky-600" />

              <h2 className="font-bold text-slate-800">
                4. BANK DETAILS
              </h2>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

              {/* BANK */}

              <div>

                <label className="field-label">
                  BANK NAME *
                </label>

                <input
                  ref={fieldRefs.bankName}
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("bankName")}
                  placeholder="e.g. HDFC Bank"
                />

                <FieldError field="bankName" />

              </div>


              {/* BRANCH */}

              <div>

                <label className="field-label">
                  BRANCH NAME *
                </label>

                <input
                  ref={fieldRefs.branchName}
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("branchName")}
                  placeholder="e.g. Pune Camp"
                />

                <FieldError field="branchName" />

              </div>


              {/* HOLDER */}

              <div>

                <label className="field-label">
                  ACCOUNT HOLDER NAME *
                </label>

                <input
                  ref={fieldRefs.accountHolderName}
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("accountHolderName")}
                  placeholder="e.g. Rahul Sharma"
                />

                <FieldError
                  field="accountHolderName"
                />

              </div>


              {/* ACCOUNT */}

              <div>

                <label className="field-label">
                  ACCOUNT NUMBER *
                </label>

                <input
                  ref={fieldRefs.accountNumber}
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={18}
                  inputMode="numeric"
                  className={inputClass("accountNumber")}
                  placeholder="9 to 18 digits"
                />

                <FieldError
                  field="accountNumber"
                />

              </div>


              {/* IFSC */}

              <div>

                <label className="field-label">
                  IFSC CODE *
                </label>

                <input
                  ref={fieldRefs.ifscCode}
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={11}
                  className={inputClass("ifscCode")}
                  placeholder="e.g. HDFC0001234"
                />

                <FieldError field="ifscCode" />

              </div>

            </div>

          </section>


          {/* ==================================================
              5. ACCOUNT
          ================================================== */}

          <section className="px-6 md:px-8 pb-8">

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">

              <Shield className="w-5 h-5 text-sky-600" />

              <h2 className="font-bold text-slate-800">
                5. ACCOUNT & CREDENTIALS
              </h2>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

              {/* USERNAME */}

              <div>

                <label className="field-label">
                  USERNAME *
                </label>

                <input
                  ref={fieldRefs.username}
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("username")}
                  placeholder="e.g. rahul_s"
                />

                <FieldError field="username" />

              </div>


              {/* EMAIL */}

              <div>

                <label className="field-label">
                  EMAIL *
                </label>

                <input
                  ref={fieldRefs.email}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("email")}
                  placeholder="e.g. rahul@gmail.com"
                />

                <FieldError field="email" />

              </div>


              {/* PASSWORD */}


{/* PASSWORD - ONLY FOR ADD */}

{!isEditMode && (
  <div className="md:col-span-2">

    <label className="field-label">
      PASSWORD *
    </label>

    <div className="relative">

      <input
        ref={fieldRefs.password}
        type={
          showPassword
            ? "text"
            : "password"
        }
        name="password"
        value={formData.password}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`${inputClass(
          "password"
        )} pr-12`}
        placeholder="Minimum 8 characters"
      />

      <button
        type="button"
        onClick={() =>
          setShowPassword(
            (prev) => !prev
          )
        }
        className="
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          text-slate-400
          hover:text-slate-600
        "
      >

        {showPassword ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}

      </button>

    </div>

    <FieldError field="password" />

  </div>
)}






            </div>

          </section>


          {/* ==================================================
              ACTIONS
          ================================================== */}

          {successMessage && (
            <div className="
              mx-6 md:mx-8
              mb-4
              rounded-xl
              border border-emerald-200
              bg-emerald-50
              px-4 py-3
              flex items-center gap-2
              text-sm font-semibold text-emerald-700
            ">
              <span className="
                flex h-5 w-5
                items-center justify-center
                rounded-full
                bg-emerald-500
                text-white text-xs
              ">
                ✓
              </span>
              {successMessage}
            </div>
          )}

          <div className="
            border-t
            border-slate-100
            px-6
            md:px-8
            py-5
            flex
            flex-col
            sm:flex-row
            justify-end
            gap-3
            bg-slate-50/60
            rounded-b-2xl
          ">

            <button
              type="button"
              onClick={() =>
                navigate("/admin/coach-managmnet")
              }
              disabled={loading}
              className="
                px-6
                py-3
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-600
                text-sm
                font-semibold
                hover:bg-slate-50
              "
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={loading}
              className="
                px-7
                py-3
                rounded-xl
                bg-sky-600
                hover:bg-sky-700
                text-white
                text-sm
                font-semibold
                shadow-sm
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >

              {loading ? (

                <>
                  <Loader2
                    className="
                      w-4
                      h-4
                      inline
                      mr-2
                      animate-spin
                    "
                  />

                  {isEditMode
                    ? "Updating Coach..."
                    : "Registering Coach..."}
                </>

              ) : (

                <>
                  <Check
                    className="
                      w-4
                      h-4
                      inline
                      mr-2
                    "
                  />

                  {isEditMode
                    ? "Update Coach"
                    : "Register New Coach"}
                </>

              )}

            </button>

          </div>

        </form>

      </div>


      {/* ======================================================
          CAMERA MODAL
      ====================================================== */}

      {cameraOpen && (

        <div className="
          fixed
          inset-0
          z-[100]
          bg-black/70
          flex
          items-center
          justify-center
          p-4
        ">

          <div className="
            bg-white
            rounded-2xl
            w-full
            max-w-lg
            overflow-hidden
            shadow-2xl
          ">

            <div className="
              px-5
              py-4
              bg-slate-900
              text-white
              flex
              items-center
              justify-between
            ">

              <h3 className="font-semibold">
                Capture Live Photo
              </h3>

              <button
                type="button"
                onClick={closeCamera}
                className="
                  p-1.5
                  rounded-lg
                  hover:bg-white/10
                "
              >

                <X className="w-5 h-5" />

              </button>

            </div>


            <div className="p-5">

              <div className="
                rounded-xl
                overflow-hidden
                bg-black
              ">

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="
                    w-full
                    aspect-video
                    object-cover
                  "
                />

              </div>


              <canvas
                ref={canvasRef}
                className="hidden"
              />


              <div className="
                flex
                justify-center
                gap-3
                mt-5
              ">

                <button
                  type="button"
                  onClick={closeCamera}
                  className="
                    px-5
                    py-2.5
                    rounded-xl
                    border
                    border-slate-200
                    text-slate-600
                    font-medium
                  "
                >
                  Cancel
                </button>


                <button
                  type="button"
                  onClick={capturePhoto}
                  className="
                    px-6
                    py-2.5
                    rounded-xl
                    bg-sky-600
                    hover:bg-sky-700
                    text-white
                    font-semibold
                  "
                >

                  <Camera className="w-4 h-4 inline mr-2" />

                  Capture Photo

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


// ============================================================
// SMALL CSS CLASSES
// ============================================================

if (
  typeof document !== "undefined" &&
  !document.getElementById("coach-form-styles")
) {
  const style = document.createElement("style");

  style.id = "coach-form-styles";

  style.innerHTML = `
    .field-label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 700;
      color: rgb(71 85 105);
      letter-spacing: 0.025em;
    }
  `;

  document.head.appendChild(style);
}