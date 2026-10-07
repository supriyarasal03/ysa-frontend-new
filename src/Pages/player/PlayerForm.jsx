  import React, { useEffect, useMemo, useRef, useState } from "react";
  import { useNavigate, useParams } from "react-router-dom";
  import {
    ArrowLeft,
    Camera,
    Upload,
    X,
    User,
    FileText,
    Shield,
    CheckCircle2,
    AlertCircle,
    CheckCircle,
    CreditCard,
    QrCode,
    Loader2,
  } from "lucide-react";

  import PlayerService from "./PlayerService";
  import PaymentService from "../payment/PaymentService";
  import axiosClient from "../../api/axiosClient";
  import AdmissionReceiptModal from "./AdmissionReceiptModal";
  import { getAllInventory } from "../inventory/inventoryApi";

  const bloodGroups = [
    { label: "A+", value: "A_POSITIVE" },
    { label: "A-", value: "A_NEGATIVE" },
    { label: "B+", value: "B_POSITIVE" },
    { label: "B-", value: "B_NEGATIVE" },
    { label: "AB+", value: "AB_POSITIVE" },
    { label: "AB-", value: "AB_NEGATIVE" },
    { label: "O+", value: "O_POSITIVE" },
    { label: "O-", value: "O_NEGATIVE" },
  ];

  const genders = [
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
    { label: "Other", value: "OTHER" },
  ];

  const initialForm = {
    username: "",

    password: "",
    confirmPassword: "",
    sportId: "",
    batchId: "",
    includeInventory: false,
    inventoryFee: "0",
    firstName: "",
    wantsPhysiotherapist: false,
    physiotherapistId: "",

    lastName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    playerMobileNo: "",
    playerEmail: "",
    parentName: "",
    parentMobileNo: "",
    parentEmail: "",
    admissionDate: new Date().toISOString().slice(0, 10),
    hasInjury: false,
    injuryDetails: "",
    photoCaptureType: "UPLOADED",
  };

  const initialFiles = {
    photo: null,
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    certificate: null,
  };

  const initialPreviews = {
    photo: null,
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    certificate: null,
  };


  const formatTime12Hour = (time) => {
    if (!time) return "";

    const [hours, minutes] = String(time).split(":");
    let hour = Number(hours);

    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minutes} ${period}`;
  };



  const money = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getAge = (dob) => {
    if (!dob) return null;

    const today = new Date();
    const birth = new Date(dob);

    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();

    if (
      month < 0 ||
      (month === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const unwrapList = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    if (Array.isArray(response?.data?.content)) return response.data.content;
    if (Array.isArray(response?.content)) return response.content;
    return [];
  };

  const getFeeDurationText = (fee) => {
    const unit = String(fee?.durationUnit || "")
      .replaceAll("_", " ")
      .toUpperCase();

    return `${fee?.duration ?? ""} ${unit}`;
  };

  const getSportId = (sport) =>
    sport?.id ??
    sport?.sportId ??
    sport?.sportsId ??
    sport?.data?.id;

  const getSportName = (sport) =>
    sport?.name ||
    sport?.sportName ||
    sport?.sportsName ||
    sport?.title ||
    (typeof sport?.sport === "string" ? sport.sport : sport?.sport?.name) ||
    sport?.data?.name ||
    sport?.data?.sportName ||
    `Sport #${getSportId(sport) ?? ""}`;

  const getBatchName = (batch) =>
    batch?.batchName ||
    batch?.name ||
    `Batch #${batch?.id}`;

  const PlayerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [form, setForm] = useState(initialForm);
    const [files, setFiles] = useState(initialFiles);
    const [previews, setPreviews] = useState(initialPreviews);


    const [existingDocuments, setExistingDocuments] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    certificate: null,
  });

    const [sports, setSports] = useState([]);
    const [batches, setBatches] = useState([]);


    const [physiotherapists, setPhysiotherapists] = useState([]);

    const [loadingData, setLoadingData] = useState(true);
    const [loading, setLoading] = useState(false);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [stream, setStream] = useState(null);

    const [errors, setErrors] = useState({});
    const [backendErrors, setBackendErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    // Registration flow:
    // PLAYER -> PAYMENT
    const [step, setStep] = useState("PLAYER");

    const [createdPlayer, setCreatedPlayer] = useState(null);
    const [createdEnrollment, setCreatedEnrollment] = useState(null);
    const [installments, setInstallments] = useState([]);
    const [showAdmissionReceipt, setShowAdmissionReceipt] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState(null);

    const [paymentPlan, setPaymentPlan] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [paymentAmount, setPaymentAmount] = useState("");

    const [qrData, setQrData] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [upiScreenshot, setUpiScreenshot] = useState(null);

    // Lock enrollment, inventory and payment selections after payment.
    const [paymentLocked, setPaymentLocked] = useState(false);

    // Inventory selected during the same registration form.
    const [inventory, setInventory] = useState([]);
    const [inventorySubItem, setInventorySubItem] = useState("");
    const [inventoryBrand, setInventoryBrand] = useState("");
    const [inventoryId, setInventoryId] = useState("");
    const [inventoryQuantity, setInventoryQuantity] = useState("1");
    const [selectedInventoryItems, setSelectedInventoryItems] = useState([]);
    const [inventoryLoading, setInventoryLoading] = useState(false);


    const age = getAge(form.dateOfBirth);
    const isAdult = age !== null && age >= 18;

    // =========================================================
    // LOAD SPORTS + BATCHES
    // =========================================================

    useEffect(() => {
      const loadInitialData = async () => {
        try {
          setLoadingData(true);


          
const [
  sportsResponse,
  batchesResponse,
  inventoryResponse,
] = await Promise.all([
  axiosClient.get("/sport"),
  axiosClient.get("/batches"),
  getAllInventory(),
]);








          const sportList = unwrapList(sportsResponse.data);
          const batchList = unwrapList(batchesResponse.data);
          const inventoryList = Array.isArray(inventoryResponse?.data)
            ? inventoryResponse.data
            : [];





          setSports(sportList);
          setBatches(batchList);
          setInventory(inventoryList);


          if (isEdit) {
            const playerResponse =
              await PlayerService.getById(id);




            const player =
              playerResponse?.data || playerResponse;


              setExistingDocuments({
    aadhaarFront: player.aadhaarFrontUrl || null,
    aadhaarBack: player.aadhaarBackUrl || null,
    panCard: player.panCardUrl || null,
    certificate: player.certificateUrl || null,
  });


  if (player) {
    setForm((prev) => ({
      ...prev,
      username: player.username || "",

    sportId: player.sportId || "",
  batchId: player.batchId || "",
  firstName: player.firstName || "",

      lastName: player.lastName || "",
      dateOfBirth: player.dateOfBirth
        ? String(player.dateOfBirth).slice(0, 10)
        : "",
      gender: player.gender || "",
      bloodGroup: player.bloodGroup || "",
      address: player.address || "",
      playerMobileNo: player.playerMobileNo || "",
      playerEmail: player.playerEmail || "",
      parentName: player.parentName || "",
      parentMobileNo: player.parentMobileNo || "",
      parentEmail: player.parentEmail || "",
      admissionDate: player.admissionDate
        ? String(player.admissionDate).slice(0, 10)
        : prev.admissionDate,
      hasInjury: Boolean(player.hasInjury),
      injuryDetails: player.injuryDetails || "",
      photoCaptureType:
        player.photoCaptureType || "UPLOADED",
    }));

    // -----------------------------------------
    // LOAD EXISTING PLAYER PHOTO
    // -----------------------------------------
    // -----------------------------------------
  // LOAD EXISTING PLAYER PHOTO
  // -----------------------------------------
  // -----------------------------------------
  // LOAD EXISTING PLAYER PHOTO
  // -----------------------------------------
  if (player.photoUrl) {
    try {
      const photoPath = player.photoUrl.startsWith("/api/")
        ? player.photoUrl.substring(4)
        : player.photoUrl;

      const photoResponse = await axiosClient.get(
        photoPath,
        {
          responseType: "blob",
        }
      );

      const photoBlobUrl = URL.createObjectURL(
        photoResponse.data
      );

      setPreviews((prev) => ({
        ...prev,
        photo: photoBlobUrl,
      }));
    } catch (photoError) {
      console.error(
        "Failed to load player photo:",
        photoError
      );
    }
  }



  }


          }
        } catch (error) {
          console.error("Player form load error:", error);
          setBackendErrors({
            general:
              error.response?.data?.message ||
              "Unable to load sports/batches.",
          });
        } finally {
          setLoadingData(false);
        }
      };

      loadInitialData();
    }, [id, isEdit]);

    // =========================================================
    // LOAD ACTIVE PHYSIOTHERAPISTS SEPARATELY
    // This must not block the main Player Form.
    // =========================================================
    useEffect(() => {
      let cancelled = false;

      const loadPhysiotherapists = async () => {
        try {
          const response =
            await PlayerService.getActivePhysiotherapists();

          if (!cancelled) {
            setPhysiotherapists(unwrapList(response));
          }
        } catch (error) {
          console.error(
            "Unable to load active physiotherapists:",
            error
          );

          if (!cancelled) {
            setPhysiotherapists([]);
          }
        }
      };

      loadPhysiotherapists();

      return () => {
        cancelled = true;
      };
    }, []);

    // =========================================================
  const availableSports = useMemo(() => {
    return sports.filter((sport) => {
      const status = String(
        sport?.Status ??
        sport?.status ??
        sport?.sportStatus ??
        sport?.data?.Status ??
        sport?.data?.status ??
        ""
      ).toUpperCase();

      return status === "ACTIVE";
    });
  }, [sports]);


    // =========================================================
    // DERIVED DATA
    // =========================================================
  const availableBatches = useMemo(() => {
    return batches.filter((batch) => {
      const sameSport =
        String(batch.sportId) === String(form.sportId);

      const active =
        !batch.status ||
        String(batch.status).toUpperCase() === "ACTIVE";

      // IMPORTANT:
      // Backend returns:
      // availableSeats = capacity - currentPlayers
      //
      // A full batch has availableSeats = 0, so it must
      // NOT appear while registering a new player.
      const availableSeats = Number(batch.availableSeats ?? 0);

      return sameSport && active && availableSeats > 0;
    });
  }, [batches, form.sportId]);







    // In EDIT mode the current batch must still be displayed even if
    // that batch has become full. It is read-only and cannot be changed.
    // For NEW registration, only batches with available seats are allowed.
    const selectedBatch = isEdit
      ? batches.find(
          (batch) =>
            String(batch.id) === String(form.batchId)
        )
      : availableBatches.find(
          (batch) =>
            String(batch.id) === String(form.batchId)
        );




  const selectedFee = selectedBatch
    ? {
        amount: Number(selectedBatch.fee || 0),

        // Database discount is stored as PERCENTAGE
        discountPercent: Number(selectedBatch.discount || 0),

        // Convert percentage discount into actual rupee amount
        discountAmount: Number(
          (
            Number(selectedBatch.fee || 0) *
            Number(selectedBatch.discount || 0) /
            100
          ).toFixed(2)
        ),

        finalFee: Number(
          (
            Number(selectedBatch.fee || 0) -
            (
              Number(selectedBatch.fee || 0) *
              Number(selectedBatch.discount || 0) /
              100
            )
          ).toFixed(2)
        ),

        duration: selectedBatch.courseDuration || 0,
        durationUnit: selectedBatch.courseDurationUnit || "",
      }
    : null;



    // =========================================================
    // REGISTRATION AMOUNTS
    // IMPORTANT: THREE_INSTALLMENTS = ZERO DISCOUNT
    // =========================================================

    const originalCourseFee = Number(
    selectedBatch?.fee || 0
  );


  const discountPercent = Math.max(
    0,
    Math.min(
      100,
      Number(selectedBatch?.discount || 0)
    )
  );

  const configuredDiscount = Number(
    (
      originalCourseFee *
      discountPercent /
      100
    ).toFixed(2)
  );


    const registrationDiscount =
      paymentPlan === "ONE_TIME"
        ? configuredDiscount
        : 0;

    const finalCourseFee = Number(
      (originalCourseFee - registrationDiscount).toFixed(2)
    );

    const inventoryTotal = form.includeInventory
      ? selectedInventoryItems.reduce(
          (sum, item) =>
            sum +
            Number(item.unitPrice || item.sellingPrice || 0) *
              Number(item.quantity || 0),
          0
        )
      : 0;

      


      const physiotherapyFee = form.wantsPhysiotherapist
    ? 1000
    : 0;




    const totalRegistrationFee = Number(
      (finalCourseFee + inventoryTotal+physiotherapyFee).toFixed(2)
    );







  const installmentAmounts = useMemo(() => {
    // 3 installments always use the full batch/course fee.
    // Batch discount is NOT applied.
    // Complete inventory fee is added only to the 1st installment.

    const firstCourseAmount = Number(
      (originalCourseFee / 3).toFixed(2)
    );

    const second = firstCourseAmount;

    const third = Number(
      (originalCourseFee - firstCourseAmount - second).toFixed(2)
    );


  const first = Number(
    (
      firstCourseAmount +
      inventoryTotal +
      physiotherapyFee
    ).toFixed(2)
  );




    return [first, second, third];
  }, [
    originalCourseFee,
    inventoryTotal,
    physiotherapyFee,
  ]);




    useEffect(() => {
      if (!isEdit && paymentPlan) {
        setPaymentAmount(
          paymentPlan === "THREE_INSTALLMENTS"
            ? installmentAmounts[0] || 0
            : totalRegistrationFee
        );
      }
    }, [
      isEdit,
      paymentPlan,
      totalRegistrationFee,
      installmentAmounts,
    ]);

    // =========================================================
    // FIELD CHANGE
    // =========================================================

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;

      if (paymentLocked && ["sportId", "batchId", "includeInventory", "inventoryFee"].includes(name)) return;

      let finalValue = value;

      // Names: letters and spaces only.
      if (["firstName", "lastName", "parentName"].includes(name)) {
        finalValue = value.replace(/[^A-Za-z ]/g, "").replace(/\s{2,}/g, " ");
      }

      // Mobile numbers: digits only, maximum 10 digits.
      if (["playerMobileNo", "parentMobileNo"].includes(name)) {
        finalValue = value.replace(/\D/g, "").slice(0, 10);
      }

      // Username follows the backend pattern: letters, numbers, dot, underscore.
      if (name === "username") {
        finalValue = value.replace(/[^A-Za-z0-9._]/g, "").slice(0, 20);
      }

      // Emails: no spaces and keep a reasonable length.
      if (["playerEmail", "parentEmail"].includes(name)) {
        finalValue = value.replace(/\s/g, "").slice(0, 100);
      }

      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : finalValue,
      }));

      setErrors((prev) => ({ ...prev, [name]: "" }));
      setBackendErrors((prev) => ({ ...prev, [name]: "" }));
      setSuccessMessage("");
    };

    const handleSportChange = (e) => {
      if (paymentLocked) return;

      const sportId = e.target.value;

    setForm((prev) => ({
    ...prev,
    sportId,
    batchId: "",
    includeInventory: false,
    inventoryFee: "0",
  }));

      setInventorySubItem("");
      setInventoryBrand("");
      setInventoryId("");
      setInventoryQuantity("1");
      setSelectedInventoryItems([]);

      setPaymentPlan("");
      setPaymentMethod("");
      setPaymentAmount("");
      setInstallments([]);
      setForm((prev) => ({
        ...prev,
        includeInventory: false,
        inventoryFee: "0",
      }));
      setSelectedInstallment(null);
      setQrData(null);
      setUpiScreenshot(null);
      setPaymentLocked(false);

      setErrors((prev) => ({
        ...prev,
        sportId: "",
        batchId: "",
      }));
    };

    const handleBatchChange = (e) => {
      if (paymentLocked) return;

      setForm((prev) => ({
        ...prev,
        batchId: e.target.value,
      }));

      setErrors((prev) => ({
        ...prev,
        batchId: "",
      }));
    };




    // =========================================================
    // FILE HANDLING
    // =========================================================

    const handleFileChange = (e, key) => {
      const file = e.target.files?.[0];

      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [key]: "File size cannot exceed 10 MB.",
        }));
        return;
      }

      setFiles((prev) => ({
        ...prev,
        [key]: file,
      }));

      setPreviews((prev) => ({
        ...prev,
        [key]: URL.createObjectURL(file),
      }));

      if (key === "photo") {
        setForm((prev) => ({
          ...prev,
          photoCaptureType: "UPLOADED",
        }));
      }

      setErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    };

    const removeFile = (key) => {
      if (previews[key]?.startsWith("blob:")) {
        URL.revokeObjectURL(previews[key]);
      }

      setFiles((prev) => ({
        ...prev,
        [key]: null,
      }));

      setPreviews((prev) => ({
        ...prev,
        [key]: null,
      }));
    };

    // =========================================================
    // CAMERA
    // =========================================================

    const openCamera = async () => {
      try {
        const mediaStream =
          await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          });

        setStream(mediaStream);
        setCameraOpen(true);

        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject =
              mediaStream;
          }
        }, 100);
      } catch (error) {
        console.error(error);
        alert(
          "Camera permission denied or not available."
        );
      }
    };

    const closeCamera = () => {
      if (stream) {
        stream.getTracks().forEach((track) =>
          track.stop()
        );
      }

      setStream(null);
      setCameraOpen(false);
    };

    const capturePhoto = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          const file = new File(
            [blob],
            "live-photo.jpg",
            { type: "image/jpeg" }
          );

          setFiles((prev) => ({
            ...prev,
            photo: file,
          }));

          setPreviews((prev) => ({
            ...prev,
            photo: URL.createObjectURL(blob),
          }));

          setForm((prev) => ({
            ...prev,
            photoCaptureType: "LIVE_CAMERA",
          }));

          setErrors((prev) => ({
            ...prev,
            photo: "",
          }));

          closeCamera();
        },
        "image/jpeg",
        0.9
      );
    };

    // =========================================================
    // VALIDATION
    // =========================================================

    const validatePlayer = () => {
      const next = {};
      const today = new Date().toISOString().slice(0, 10);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const nameRegex = /^[A-Za-z ]+$/;
      const usernameRegex = /^[A-Za-z0-9._]+$/;
      const mobileRegex = /^[6-9]\d{9}$/;

      if (!form.username.trim()) {
        next.username = "Username is required.";
      } else if (form.username.length < 4 || form.username.length > 20) {
        next.username = "Username must be between 4 and 20 characters.";
      } else if (!usernameRegex.test(form.username)) {
        next.username = "Username can contain only letters, numbers, dot and underscore.";
      }

      if (!isEdit) {
        if (!form.password) {
          next.password = "Password is required.";
        } else if (form.password.length < 8 || form.password.length > 100) {
          next.password = "Password must be between 8 and 100 characters.";
        }

        if (!form.confirmPassword) {
          next.confirmPassword = "Please confirm password.";
        } else if (form.password !== form.confirmPassword) {
          next.confirmPassword = "Passwords do not match.";
        }
      }

      if (!form.firstName.trim()) {
        next.firstName = "First name is required.";
      } else if (form.firstName.trim().length < 3 || form.firstName.trim().length > 30) {
        next.firstName = "First name must be between 3 and 30 characters.";
      } else if (!nameRegex.test(form.firstName.trim())) {
        next.firstName = "First name can contain only letters and spaces.";
      }

      if (!form.lastName.trim()) {
        next.lastName = "Last name is required.";
      } else if (form.lastName.trim().length < 2 || form.lastName.trim().length > 30) {
        next.lastName = "Last name must be between 2 and 30 characters.";
      } else if (!nameRegex.test(form.lastName.trim())) {
        next.lastName = "Last name can contain only letters and spaces.";
      }

      if (!form.dateOfBirth) {
        next.dateOfBirth = "Date of birth is required.";
      } else if (form.dateOfBirth >= today) {
        next.dateOfBirth = "Date of birth must be in the past.";
      }

      if (!form.gender) next.gender = "Gender is required.";
      if (!form.bloodGroup) next.bloodGroup = "Blood group is required.";

      if (!form.address.trim()) {
        next.address = "Address is required.";
      } else if (form.address.trim().length < 5 || form.address.trim().length > 255) {
        next.address = "Address must be between 5 and 255 characters.";
      }




      // Parent / Guardian Name is required for every player.
  if (!form.parentName.trim()) {
    next.parentName = "Parent / Guardian name is required.";
  } else if (
    form.parentName.trim().length < 3 ||
    form.parentName.trim().length > 30
  ) {
    next.parentName =
      "Parent / Guardian name must be between 3 and 30 characters.";
  } else if (!nameRegex.test(form.parentName.trim())) {
    next.parentName =
      "Parent / Guardian name can contain only letters and spaces.";
  }



  if (!form.parentMobileNo.trim()) {
    next.parentMobileNo = "Parent mobile number is required.";
  } else if (!mobileRegex.test(form.parentMobileNo.trim())) {
    next.parentMobileNo =
      "Enter a valid 10-digit parent mobile number.";
  }

  if (!form.parentEmail.trim()) {
    next.parentEmail = "Parent email is required.";
  } else if (!emailRegex.test(form.parentEmail.trim())) {
    next.parentEmail =
      "Enter a valid parent email address.";
  }


  if (!isEdit) {
    if (!form.sportId) next.sportId = "Sport is required.";
    if (!form.batchId) next.batchId = "Batch is required.";
    if (!selectedBatch) next.batchId = "Please select a valid batch.";
    if (!paymentPlan) next.paymentPlan = "Payment plan is required.";
    if (form.wantsPhysiotherapist && !form.physiotherapistId) {
      next.physiotherapistId = "Please select a physiotherapist.";
    }




        if (form.includeInventory && selectedInventoryItems.length === 0) {
          next.inventoryId = "Select at least one inventory item or choose No inventory.";
        }

        if (form.hasInjury && !form.injuryDetails.trim()) {
          next.injuryDetails = "Injury details are required.";
        }

        if (paymentMethod === "UPI" && !upiScreenshot) {
          next.paymentMethod = "UPI payment screenshot is required.";
        }

        if (!files.photo) {
          next.photo = "Player photo is required.";
        }

        if (!files.aadhaarFront) {
          next.aadhaarFront = "Aadhaar front is required.";
        }

        if (!files.aadhaarBack) {
          next.aadhaarBack = "Aadhaar back is required.";
        }

        if (isAdult && !files.panCard) {
          next.panCard = "PAN card is required for adults.";
        }
      }


      setErrors(next);

      if (Object.keys(next).length) {
        setTimeout(() => focusErrorField(Object.keys(next)[0]), 80);
      }

      return Object.keys(next).length === 0;
    };

    const getError = (field) =>
      errors[field] || backendErrors[field];

    const focusErrorField = (field) => {
      if (!field) return;

      setTimeout(() => {
        const element = document.querySelector(`[name="${field}"]`);
        const errorElement = document.querySelector(`[data-error-field="${field}"]`);
        const target = element || errorElement;

        if (!target) return;

        target.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        if (typeof target.focus === "function") {
          target.focus({ preventScroll: true });
        } else {
          const focusable = target.querySelector?.(
            'input:not([type="hidden"]), select, textarea, button'
          );
          focusable?.focus({ preventScroll: true });
        }
      }, 80);
    };

    const parseBackendValidationErrors = (response, adult = isAdult) => {
      const result = {};
      if (!response) return result;

      const addFieldErrors = (source) => {
        if (!source || typeof source !== "object" || Array.isArray(source)) return;
        Object.entries(source).forEach(([key, value]) => {
          if (value !== null && value !== undefined && String(value).trim()) {
            result[key] = String(value);
          }
        });
      };

      addFieldErrors(response.data);
      addFieldErrors(response.errors);
      addFieldErrors(response.fieldErrors);

      const message = typeof response.message === "string" ? response.message : "";

      // Handles Hibernate/Jakarta validation text such as:
      // propertyPath=firstName ... interpolatedMessage='First name is required'
      const propertyMatches = [...message.matchAll(/propertyPath=([^,\s}]+)/g)];
      const templateMatches = [...message.matchAll(/messageTemplate='([^']+)'/g)];
      const interpolatedMatches = [...message.matchAll(/interpolatedMessage='([^']+)'/g)];

      propertyMatches.forEach((match, index) => {
        const backendField = match[1];
        const backendMessage =
          interpolatedMatches[index]?.[1] ||
          templateMatches[index]?.[1] ||
          "Invalid value.";

        if (backendField === "playerHasOwnContact") {
          result[adult ? "playerMobileNo" : "parentMobileNo"] = backendMessage;
        } else {
          result[backendField] = backendMessage;
        }
      });

      // Map common backend business/duplicate errors to the actual field.
      if (message) {
        const lower = message.toLowerCase();
        const mappings = [
          ["username", "username"],
          ["email", adult ? "playerEmail" : "parentEmail"],
          ["player email", "playerEmail"],
          ["parent email", "parentEmail"],
          ["player mobile", "playerMobileNo"],
          ["parent mobile", "parentMobileNo"],
          ["sport", "sportId"],
          ["batch", "batchId"],
          ["first name", "firstName"],
          ["last name", "lastName"],
          ["date of birth", "dateOfBirth"],
          ["blood group", "bloodGroup"],
          ["gender", "gender"],
          ["address", "address"],
          ["admission date", "admissionDate"],
          ["parent name", "parentName"],
          ["photo", "photo"],
          ["aadhaar front", "aadhaarFront"],
          ["aadhaar back", "aadhaarBack"],
          ["pan card", "panCard"],
        ];

        mappings.forEach(([keyword, field]) => {
          if (!result[field] && lower.includes(keyword)) {
            result[field] = message;
          }
        });
      }

      if (!Object.keys(result).length && message) {
        result.general = message;
      }

      return result;
    };

    const focusFirstError = (fieldErrors) => {
      const priority = [
        "username",
        "email",
        "firstName",
        "lastName",
        "dateOfBirth",
        "gender",
        "bloodGroup",
        "playerMobileNo",
        "playerEmail",
        "parentMobileNo",
        "parentEmail",
        "parentName",
        "address",
        "admissionDate",
        "injuryDetails",
        "sportId",
        "batchId",
        "inventoryFee",
        "paymentPlan",
        "photo",
        "aadhaarFront",
        "aadhaarBack",
        "panCard",
        "certificate",
      ];

      const field = priority.find(
        (name) => fieldErrors?.[name]
      );

      if (field) {
        focusErrorField(field);
      }
    };

    // =========================================================
    // SINGLE FORM REGISTRATION
    // Player + Enrollment + Installments + Payment
    // =========================================================

    const handleRegistrationSubmit = async (e) => {
      e?.preventDefault();

      setSuccessMessage("");
      setBackendErrors({});

      if (!validatePlayer()) {
        return;
      }

      if (isEdit) {
        return handleEditSubmit(e);
      }

      if (!selectedBatch) {
        setBackendErrors({
          batchId: "Please select a valid batch. Fee and discount are taken from the selected batch.",
        });
        focusErrorField("batchId");
        return;
      }

      if (!paymentPlan) {
        setBackendErrors({
          paymentPlan: "Please select a payment plan.",
        });
        focusErrorField("paymentPlan");
        return;
      }

      if (!paymentMethod) {
        setBackendErrors({
          paymentMethod: "Please select a payment method.",
        });
        focusErrorField("paymentMethod");
        return;
      }

      if (paymentMethod === "UPI" && !upiScreenshot) {
        setBackendErrors({
          paymentMethod: "Upload the UPI payment screenshot.",
        });
        focusErrorField("paymentMethod");
        return;
      }

      if (form.includeInventory && selectedInventoryItems.length === 0) {
        setBackendErrors({
          inventoryId: "Select at least one inventory item or choose No inventory.",
        });
        focusErrorField("inventoryId");
        return;
      }

      const inventoryTotal = form.includeInventory
        ? selectedInventoryItems.reduce(
            (sum, item) =>
              sum +
              Number(item.unitPrice || item.sellingPrice || 0) *
                Number(item.quantity || 0),
            0
          )
        : 0;

      // The registration backend currently accepts inventoryFee.
      // Keep the selected inventory total synchronized with that field.
      const inventoryFee = Number(inventoryTotal.toFixed(2));

      const originalCourseFee = Number(
        selectedBatch?.fee ??
          selectedFee?.amount ??
          0
      );


    const discountPercent = Math.max(
    0,
    Math.min(
      100,
      Number(selectedBatch?.discount || 0)
    )
  );

  const configuredDiscount = Number(
    (
      originalCourseFee *
      discountPercent /
      100
    ).toFixed(2)
  );

      // BUSINESS RULE:
      // ONE_TIME -> discount applies
      // THREE_INSTALLMENTS -> discount is always ZERO
      const discount =
        paymentPlan === "ONE_TIME"
          ? configuredDiscount
          : 0;

      const finalCourseFee = Number(
        (originalCourseFee - discount).toFixed(2)
      );


      const totalRegistrationFee = Number(
    (
      finalCourseFee +
      inventoryFee +
      physiotherapyFee
    ).toFixed(2)
  );



      // UI amount. The backend creates the actual payment/installment
      // records from the same payment plan.
      const paymentAmount =
        paymentPlan === "THREE_INSTALLMENTS"
          ? Number((totalRegistrationFee / 3).toFixed(2))
          : totalRegistrationFee;

      try {
        setLoading(true);

        const data = new FormData();

        const accountEmail = isAdult
          ? form.playerEmail
          : form.parentEmail;

        const fields = {
          username: form.username,
          email: accountEmail,
          password: form.password,
          confirmPassword: form.confirmPassword,
          sportId: form.sportId,
          batchId: form.batchId,
          firstName: form.firstName,
          lastName: form.lastName,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          bloodGroup: form.bloodGroup,
          address: form.address,
          playerHasOwnContact: String(isAdult),
          playerMobileNo: form.playerMobileNo || "",
          playerEmail: form.playerEmail || "",
          parentName: form.parentName,
          parentMobileNo: form.parentMobileNo || "",
          parentEmail: form.parentEmail || "",
          admissionDate: form.admissionDate,
          hasInjury: String(Boolean(form.hasInjury)),
          injuryDetails: form.injuryDetails || "",
          photoCaptureType: form.photoCaptureType || "UPLOADED",
          inventoryFee: String(inventoryFee),

  wantsPhysiotherapist: String(
    Boolean(form.wantsPhysiotherapist)
  ),

  physiotherapistId: form.wantsPhysiotherapist
    ? form.physiotherapistId
    : "",

          paymentPlan,
          paymentMethod,
          // Keep selected item IDs available to any compatible backend
          // without inventing a new endpoint.
          inventoryItems: JSON.stringify(
            selectedInventoryItems.map((item) => ({
              inventoryId: Number(item.id),
              quantity: Number(item.quantity),
            }))
          ),
        };

        Object.entries(fields).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            data.append(key, value);
          }
        });

        data.append("photo", files.photo);
        data.append("aadhaarFront", files.aadhaarFront);
        data.append("aadhaarBack", files.aadhaarBack);

        if (files.panCard) {
          data.append("panCard", files.panCard);
        }

        if (files.certificate) {
          data.append("certificate", files.certificate);
        }

        if (paymentMethod === "UPI" && upiScreenshot) {
          data.append("upiScreenshot", upiScreenshot);
        }

        const response = await PlayerService.register(data);

        if (!response?.success) {
          throw new Error(
            response?.message || "Player registration failed."
          );
        }

        const registration = response.data;

        setCreatedPlayer(registration?.player || null);
        setCreatedEnrollment(registration?.enrollment || null);
        setInstallments(registration?.installments || []);

        setPaymentAmount(paymentAmount);

        setSuccessMessage(
          paymentMethod === "UPI"
            ? "Player registration completed. UPI payment is pending verification."
            : "Player registration and payment completed successfully."
        );

        if (registration?.player?.id) {
          setShowAdmissionReceipt(true);
        }
      } catch (error) {
        console.error("Player registration error:", error);

        const response = error.response?.data;
        const parsedErrors = parseBackendValidationErrors(response, isAdult);

        if (Object.keys(parsedErrors).length) {
          setBackendErrors(parsedErrors);
          setTimeout(() => focusFirstError(parsedErrors), 80);
        } else {
          setBackendErrors({
            general:
              response?.message ||
              error.message ||
              "Unable to complete player registration.",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    // =========================================================
    // PAYMENT AMOUNT
    // =========================================================





  // =========================================================
  // PAYMENT AMOUNT
  // =========================================================

  const getRegistrationPaymentAmount = () => {


    const batchFee = Number(
    selectedBatch?.fee || 0
  );

  const batchDiscountPercent = Math.max(
    0,
    Math.min(
      100,
      Number(selectedBatch?.discount || 0)
    )
  );

  const batchDiscountAmount = Number(
    (
      batchFee *
      batchDiscountPercent /
      100
    ).toFixed(2)
  );

  const discountedFee = Number(
    (batchFee - batchDiscountAmount).toFixed(2)
  );



    const inventoryFee = form.includeInventory
      ? Number(form.inventoryFee || 0)
      : 0;


      const physiotherapyFee = form.wantsPhysiotherapist
    ? 1000
    : 0;

    // =======================================================
    // THREE INSTALLMENTS
    // NO DISCOUNT
    // =======================================================

    if (
      paymentPlan === "THREE_INSTALLMENTS"
    ) {

      const totalWithoutDiscount =
        batchFee + inventoryFee+physiotherapyFee;

      return Number(
        (totalWithoutDiscount / 3).toFixed(2)
      );
    }

    // =======================================================
    // ONE TIME
    // DISCOUNT APPLIED
    // =======================================================
  return Number(
    (
      discountedFee +
      inventoryFee +
      physiotherapyFee
    ).toFixed(2)
  );
};

    // =========================================================
    // PAYMENT METHOD
    // =========================================================

    const handlePaymentMethodChange = (
      method
    ) => {
      if (paymentLocked) return;

      setPaymentMethod(method);
      setQrData(null);
      setUpiScreenshot(null);
      // Cash is confirmed at the reception counter. UPI locks after proof upload.
      setPaymentLocked(method === "CASH");

      setBackendErrors((prev) => ({
        ...prev,
        paymentMethod: "",
      }));
    };

    // =========================================================
    // GENERATE QR
    // =========================================================

    const handleGenerateQr = async () => {
      if (
        !paymentAmount ||
        Number(paymentAmount) <= 0
      ) {
        setBackendErrors({
          general:
            "Valid payment amount is required.",
        });
        return;
      }

      try {
        setQrLoading(true);
        setBackendErrors({});

        const response =
          await PaymentService.generateQr(
            paymentAmount
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to generate QR."
          );
        }

        setQrData(response.data);
      } catch (error) {
        console.error(
          "QR generation error:",
          error
        );

        setBackendErrors({
          general:
            error.response?.data?.message ||
            error.message ||
            "Unable to generate UPI QR.",
        });
      } finally {
        setQrLoading(false);
      }
    };

    // =========================================================
    // STEP 2 - CREATE PAYMENT
    // =========================================================

    const handleCompletePayment = async () => {
      setBackendErrors({});

      if (!paymentMethod) {
        setBackendErrors({
          paymentMethod: "Please select a payment method.",
        });
        return;
      }

      if (!paymentPlan) {
        setBackendErrors({
          paymentPlan: "Please select a payment plan.",
        });
        return;
      }

      if (!selectedBatch) {
        setBackendErrors({
          batchId: "Please select a valid batch.",
        });
        return;
      }

      if (paymentMethod === "UPI" && !upiScreenshot) {
        setBackendErrors({
          general: "UPI payment screenshot is required.",
        });
        return;
      }

      if (!files.photo) {
        setBackendErrors({
          photo: "Player photo is required.",
        });
        return;
      }

      try {
        setLoading(true);

        const data = new FormData();

        // User.email is taken from the active contact.
        const accountEmail = isAdult
          ? form.playerEmail
          : form.parentEmail;

        const fields = {
          username: form.username,
          email: accountEmail,
          password: form.password,
          confirmPassword: form.confirmPassword,

          sportId: form.sportId,
          batchId: form.batchId,

          firstName: form.firstName,
          lastName: form.lastName,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          bloodGroup: form.bloodGroup,
          address: form.address,

          playerHasOwnContact: String(isAdult),
          playerMobileNo: form.playerMobileNo || "",
          playerEmail: form.playerEmail || "",


          wantsPhysiotherapist: String(
    Boolean(form.wantsPhysiotherapist)
  ),

  physiotherapistId: form.wantsPhysiotherapist
    ? form.physiotherapistId
    : "", 

          parentName: form.parentName,
          parentMobileNo: form.parentMobileNo || "",
          parentEmail: form.parentEmail || "",

          admissionDate: form.admissionDate,

          hasInjury: String(Boolean(form.hasInjury)),
          injuryDetails: form.injuryDetails || "",

          photoCaptureType:
            form.photoCaptureType || "UPLOADED",

          // Required by PlayerRegistrationRequest.
          inventoryFee: String(
            form.includeInventory
              ? Number(form.inventoryFee || 0)
              : 0
          ),

          paymentPlan,
          paymentMethod,
        };

        Object.entries(fields).forEach(([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== ""
          ) {
            data.append(key, value);
          }
        });

        // Multipart files.
        data.append("photo", files.photo);

        if (files.aadhaarFront) {
          data.append("aadhaarFront", files.aadhaarFront);
        }

        if (files.aadhaarBack) {
          data.append("aadhaarBack", files.aadhaarBack);
        }

        if (files.panCard) {
          data.append("panCard", files.panCard);
        }

        if (files.certificate) {
          data.append("certificate", files.certificate);
        }

        if (paymentMethod === "UPI" && upiScreenshot) {
          data.append("upiScreenshot", upiScreenshot);
        }

        const response = await PlayerService.register(data);

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Player registration failed."
          );
        }

        const registration = response.data;

        setCreatedPlayer(registration?.player || null);
        setCreatedEnrollment(registration?.enrollment || null);
        setInstallments(registration?.installments || []);

        const payment = registration?.payment;

        setSuccessMessage(
          paymentMethod === "UPI"
            ? "Registration completed. UPI payment is pending verification."
            : "Player registration and cash payment completed successfully."
        );

        if (registration?.player?.id) {
          setShowAdmissionReceipt(true);
        }
      } catch (error) {
        console.error(
          "Player registration error:",
          error
        );

        const response = error.response?.data;

        const parsedErrors =
          parseBackendValidationErrors(
            response,
            isAdult
          );

        if (Object.keys(parsedErrors).length) {
          setBackendErrors(parsedErrors);

          setTimeout(() => {
            focusFirstError(parsedErrors);
          }, 80);
        } else {
          setBackendErrors({
            general:
              response?.message ||
              error.message ||
              "Unable to complete player registration.",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    // =========================================================
    // EDIT MODE
    // =========================================================

    const handleEditSubmit = async (e) => {
      e.preventDefault();

      if (!validatePlayer()) return;

      try {
        setLoading(true);



  const data = new FormData();

  const accountEmail = isAdult
    ? form.playerEmail
    : form.parentEmail;

  Object.entries(form).forEach(
    ([key, value]) => {
      if (
        key === "email" ||
        value === null ||
        value === undefined ||
        value === "" ||
        [
    "confirmPassword",
    "batchId",
  ].includes(key)
      ) {
        return;
      }

      data.append(key, value);
    }
  );

  // User.email
  data.append("email", accountEmail);

  // Contact ownership
  data.append(
    "playerHasOwnContact",
    String(isAdult)
  );







        if (files.photo) {
          data.append(
            "photo",
            files.photo
          );
        }

        if (files.aadhaarFront) {
          data.append(
            "aadhaarFront",
            files.aadhaarFront
          );
        }

        if (files.aadhaarBack) {
          data.append(
            "aadhaarBack",
            files.aadhaarBack
          );
        }

        if (files.panCard) {
          data.append(
            "panCard",
            files.panCard
          );
        }

        if (files.certificate) {
          data.append(
            "certificate",
            files.certificate
          );
        }

        await PlayerService.update(
          id,
          data
        );

        setSuccessMessage(
          "Player updated successfully."
        );

        setTimeout(() => {
          navigate(
            "/receptionist/players"
          );
        }, 1200);
      } catch (error) {
        console.error(
          "Player update error:",
          error
        );

        setBackendErrors({
          general:
            error.response?.data?.message ||
            "Unable to update player.",
        });
      } finally {
        setLoading(false);
      }
    };

    // =========================================================
    // CLEANUP CAMERA + PREVIEWS
    // =========================================================

    useEffect(() => {
      return () => {
        if (stream) {
          stream.getTracks().forEach((track) =>
            track.stop()
          );
        }

        Object.values(previews).forEach(
          (preview) => {
            if (preview?.startsWith("blob:")) {
              URL.revokeObjectURL(preview);
            }
          }
        );
      };
    }, [stream]);

    // =========================================================
    // =========================================================
    // RENDER
    // =========================================================

    const inputClass = (field) =>
      `w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 ${
        getError(field)
          ? "border-red-400 focus:border-red-500"
          : "border-slate-200 focus:border-blue-500"
      }`;

    const sectionClass =
      "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden";

    const fieldLabel =
      "block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 mb-1.5";

    const errorText = (field) =>
      getError(field) ? (
        <p
          className="mt-1.5 text-xs text-red-500 error-text"
          data-error-field={field}
        >
          {getError(field)}
        </p>
      ) : null;

    const sectionTitle = (number, icon, title, subtitle) => (
      <div className="px-5 sm:px-6 py-5 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Step {number}</span>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mt-0.5">{title}</h3>
            {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
    );

    if (loadingData) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-8 py-6 flex items-center gap-3 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm">Loading player registration...</span>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900">
        <div className="bg-[#0f172a] text-white shadow-md">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="h-[76px] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => navigate("/receptionist/players")}
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition shrink-0"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
                    {isEdit ? "Edit Player" : "Register New Player"}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5 truncate">
                    {isEdit
                      ? "Update player information"
                      : "Complete player, enrollment, inventory and payment in one form"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/receptionist/players")}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-10">
          {backendErrors.general && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{backendErrors.general}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

            <form
              onSubmit={handleRegistrationSubmit}
            >
              <div className="space-y-5">

                <div className="min-w-0 space-y-5">
                  {/* 01 PERSONAL DETAILS */}
                  <section className={sectionClass}>
                    <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-blue-600 tracking-[0.12em] uppercase">
                            Step 01
                          </p>
                          <h2 className="text-base sm:text-lg font-bold text-slate-900">
                            Personal Details
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Enter the player's basic information
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-6">
                      <div className="grid grid-cols-1 xl:grid-cols-[170px_minmax(0,1fr)] gap-6">




  {/* PHOTO */}
  <div>
    <label className={fieldLabel}>Player Photo *</label>

    <div className="w-full max-w-[160px] aspect-square rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center relative">

      {previews.photo ? (
        <>
          <img
            src={previews.photo}
            alt="Player"
            className="w-full h-full object-cover"
          />

          {/* REMOVE / REPLACE PHOTO */}
          <button
            type="button"
            onClick={() => removeFile("photo")}
            title="Remove photo"
          className="absolute top-2 right-2 text-white hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <div className="text-center">
          <User className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-[11px] text-slate-400 mt-2">
            Photo required
          </p>
        </div>
      )}
    </div>

    {/* CAMERA + UPLOAD */}
    <div className="grid grid-cols-2 gap-2 mt-3 max-w-[160px]">

      <button
        type="button"
        onClick={openCamera}
        className="h-9 inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-semibold hover:bg-blue-700"
      >
        <Camera className="w-3.5 h-3.5" />
        Camera
      </button>

      <label className="h-9 inline-flex items-center justify-center gap-1.5 border border-slate-200 bg-white rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-50">

        {previews.photo ? (
          <>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Uploaded
          </>
        ) : (
          <>
            <Upload className="w-3.5 h-3.5" />
            Upload
          </>
        )}

        {/* IMPORTANT:
            Keep input available even when photo already exists.
            This allows receptionist to replace the photo.
        */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) =>
            handleFileChange(e, "photo")
          }
        />
      </label>
    </div>

    {errorText("photo")}
  </div>










                        {/* BASIC FIELDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={fieldLabel}>First Name *</label>
                            <input
                              name="firstName"
                              type="text"
                              value={form.firstName}
                              onChange={handleChange}
                              placeholder="Enter first name"
                              className={inputClass("firstName")}
                            />
                            {errorText("firstName")}
                          </div>

                          <div>
                            <label className={fieldLabel}>Last Name *</label>
                            <input
                              name="lastName"
                              type="text"
                              value={form.lastName}
                              onChange={handleChange}
                              placeholder="Enter last name"
                              className={inputClass("lastName")}
                            />
                            {errorText("lastName")}
                          </div>

                          <div>
                            <label className={fieldLabel}>Date of Birth *</label>
                            <input
                              name="dateOfBirth"
                              type="date"
                              value={form.dateOfBirth}
                              onChange={handleChange}
                              className={inputClass("dateOfBirth")}
                            />
                            {errorText("dateOfBirth")}
                            {age !== null && (
                              <div className={`mt-2 inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                                isAdult
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-violet-50 text-violet-700 border border-violet-100"
                              }}`}>
                                Age {age} · {isAdult ? "18 or above" : "Under 18"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className={fieldLabel}>Gender *</label>
                            <select
                              name="gender"
                              value={form.gender}
                              onChange={handleChange}
                              className={inputClass("gender")}
                            >
                              <option value="">Select gender</option>
                              {genders.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                            {errorText("gender")}
                          </div>

                          <div>
                            <label className={fieldLabel}>Blood Group *</label>
                            <select
                              name="bloodGroup"
                              value={form.bloodGroup}
                              onChange={handleChange}
                              className={inputClass("bloodGroup")}
                            >
                              <option value="">Select blood group</option>
                              {bloodGroups.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                            {errorText("bloodGroup")}
                          </div>

                        
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-5">
                        <label className={fieldLabel}>Residential Address *</label>
                        <textarea
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Enter complete residential address"
                          className={`w-full px-3.5 py-3 rounded-xl border bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                            getError("address")
                              ? "border-red-400"
                              : "border-slate-200"
                          }`}
                        />
                        {errorText("address")}
                      </div>
                    </div>
                  </section>

                  {/* 02 CONTACT DETAILS */}
                  <section className={sectionClass}>
                    <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isAdult
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-violet-50 text-violet-600"
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-blue-600 tracking-[0.12em] uppercase">
                              Step 02
                            </p>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900">
                              Contact Details
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {isAdult
                                ? "Adult player's contact information"
                                : "Parent or guardian contact information"}
                            </p>
                          </div>
                        </div>

                        {age !== null && (
                          <span className={`hidden sm:inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                            isAdult
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-violet-50 text-violet-700"
                          }`}>
                            Age {age}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      {isAdult ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4 sm:p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-sm font-semibold text-emerald-800">
                              Player contact
                            </p>
                          
                          </div>










  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {/* PLAYER MOBILE */}
    <div>
      <label className={fieldLabel}>
        Player Mobile *
      </label>

      <input
        name="playerMobileNo"
        value={form.playerMobileNo}
        onChange={handleChange}
        maxLength={10}
        inputMode="numeric"
        placeholder="10-digit mobile number"
        className={inputClass("playerMobileNo")}
      />

      {errorText("playerMobileNo")}
    </div>


    {/* PLAYER EMAIL */}
    <div>
      <label className={fieldLabel}>
        Player Email *
      </label>

      <input
        name="playerEmail"
        type="email"
        value={form.playerEmail}
        onChange={handleChange}
        placeholder="player@example.com"
        className={inputClass("playerEmail")}
      />

      {errorText("playerEmail")}
    </div>


    {/* PARENT NAME */}
    <div>
      <label className={fieldLabel}>
        Parent / Guardian Name *
      </label>

      <input
        name="parentName"
        value={form.parentName}
        onChange={handleChange}
        placeholder="Enter parent / guardian name"
        className={inputClass("parentName")}
      />

      {errorText("parentName")}
    </div>


    {/* PARENT MOBILE */}
    <div>
      <label className={fieldLabel}>
        Parent Mobile *
      </label>

      <input
        name="parentMobileNo"
        value={form.parentMobileNo}
        onChange={handleChange}
        maxLength={10}
        inputMode="numeric"
        placeholder="10-digit mobile number"
        className={inputClass("parentMobileNo")}
      />

      {errorText("parentMobileNo")}
    </div>


    {/* PARENT EMAIL */}
    <div className="md:col-span-2">
      <label className={fieldLabel}>
        Parent Email *
      </label>

      <input
        name="parentEmail"
        type="email"
        value={form.parentEmail}
        onChange={handleChange}
        placeholder="parent@example.com"
        className={inputClass("parentEmail")}
      />

      {errorText("parentEmail")}
    </div>

  </div>












                        </div>
                      ) : (
                        <div className="rounded-2xl border border-violet-200 bg-violet-50/20 p-4 sm:p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="w-2 h-2 rounded-full bg-violet-500" />
                            <p className="text-sm font-semibold text-violet-800">
                              Parent / Guardian contact
                            </p>
                          
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={fieldLabel}>Parent / Guardian Name *</label>
                              <input
                                name="parentName"
                                value={form.parentName}
                                onChange={handleChange}
                                placeholder="Enter parent / guardian name"
                                className={inputClass("parentName")}
                              />
                              {errorText("parentName")}
                            </div>

                            <div>
                              <label className={fieldLabel}>Parent Mobile *</label>
                              <input
                                name="parentMobileNo"
                                value={form.parentMobileNo}
                                onChange={handleChange}
                                maxLength={10}
                                inputMode="numeric"
                                placeholder="10-digit mobile number"
                                className={inputClass("parentMobileNo")}
                              />
                              {errorText("parentMobileNo")}
                            </div>

                            <div className="md:col-span-2">
                              <label className={fieldLabel}>Parent Email *</label>
                              <input
                                name="parentEmail"
                                type="email"
                                value={form.parentEmail}
                                onChange={handleChange}
                                placeholder="parent@example.com"
                                className={inputClass("parentEmail")}
                              />
                              {errorText("parentEmail")}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* 03 ADMISSION & MEDICAL */}
                  <section className={sectionClass}>
                    <div className="px-5 sm:px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-600 tracking-[0.12em] uppercase">
                          Step 03
                        </p>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                          Admission & Medical
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Admission date and injury information
                        </p>
                      </div>
                    </div>





                    

                    <div className="p-5 sm:p-6 space-y-5">
                      <div className="max-w-sm">
                        <label className={fieldLabel}>Admission Date *</label>
                        <input
                          name="admissionDate"
                          type="date"
                          value={form.admissionDate}
                          onChange={handleChange}
                          className={inputClass("admissionDate")}
                        />
                        {errorText("admissionDate")}
                      </div>

                      <div className={`rounded-2xl border p-4 sm:p-5 ${
                        form.hasInjury
                          ? "border-amber-200 bg-amber-50/40"
                          : "border-slate-200 bg-slate-50/50"
                      }`}>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="hasInjury"
                            checked={form.hasInjury}
                            onChange={handleChange}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              Player has an existing injury
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Select this if any injury or medical concern should be recorded.
                            </p>
                          </div>
                        </label>

                        {form.hasInjury && (
                          <div className="mt-4">
                            <label className={fieldLabel}>Injury Details *</label>
                            <textarea
                              name="injuryDetails"
                              value={form.injuryDetails}
                              onChange={handleChange}
                              rows={3}
                              placeholder="Describe the injury or medical concern"
                              className={`w-full px-3.5 py-3 rounded-xl border bg-white text-sm outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                                getError("injuryDetails")
                                  ? "border-red-400"
                                  : "border-slate-200"
                              }`}
                            />
                            {errorText("injuryDetails")}
                          </div>
                        )}
                      </div>
                    </div>
                  </section>





                  {/* 04 DOCUMENTS */}
                  <section className={sectionClass}>
                    <div className="px-5 sm:px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-600 tracking-[0.12em] uppercase">
                          Step 04
                        </p>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                          Documents
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Upload identity and supporting documents
                        </p>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: "aadhaarFront", label: "Aadhaar Front", required: true },
                          { key: "aadhaarBack", label: "Aadhaar Back", required: true },
                          ...(isAdult
                            ? [{ key: "panCard", label: "PAN Card", required: true }]
                            : []),
                          { key: "certificate", label: "Certificate", required: false },






  ].map((doc) => {
    const selectedFile = files[doc.key];
    const existingDocument = existingDocuments[doc.key];

    const hasDocument =
      Boolean(selectedFile) ||
      Boolean(existingDocument);

  const documentName =
    selectedFile?.name ||
    (existingDocument
      ? `${doc.label}.pdf`
      : "");

    return (
      <div
        key={doc.key}
        className={`rounded-2xl border p-4 transition relative ${
          getError(doc.key)
            ? "border-red-300 bg-red-50/40"
            : hasDocument
            ? "border-emerald-200 bg-emerald-50/30"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center justify-between gap-4">

          {/* DOCUMENT NAME */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-800">
                {doc.label}
              </p>

              {doc.required && (
                <span className="text-red-500 text-xs">
                  *
                </span>
              )}
            </div>

            {hasDocument ? (
              <div className="mt-1 flex items-center gap-2 min-w-0">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />

                <p
                  className="text-xs text-emerald-700 font-medium truncate"
                  title={documentName}
                >
                  {documentName}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-1">
                {doc.required
                  ? "Required"
                  : "Optional"}{" "}
                · PDF or image
              </p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 shrink-0">

            {/* REMOVE / REPLACE BUTTON */}
            {hasDocument && (
    <button
      type="button"
      onClick={() => {
        removeFile(doc.key);

        setExistingDocuments((prev) => ({
          ...prev,
          [doc.key]: null,
        }));
      }}
      title="Remove and replace document"
      className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
    >
      <X className="w-5 h-5" />
    </button>
  )}






            {/* UPLOAD / UPLOADED */}
            <label
              className={`h-9 px-3.5 rounded-lg inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                hasDocument
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {hasDocument ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Uploaded
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </>
              )}

              {/* ALWAYS keep file input available.
                  This allows replacing an existing document. */}
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) =>
                  handleFileChange(e, doc.key)
                }
              />
            </label>
          </div>
        </div>

        {/* VALIDATION ERROR */}
        {getError(doc.key) && (
          <p
            className="text-xs text-red-500 mt-2 error-text"
            data-error-field={doc.key}
          >
            {getError(doc.key)}
          </p>
        )}
      </div>
    );
  })
                        
                        
                        
                        }







                          
                      </div>
                    </div>
                  </section>








                  {/* 05 ENROLLMENT */}
                  <section className={sectionClass}>
                    <div className="px-5 sm:px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-600 tracking-[0.12em] uppercase">
                          Step 05
                        </p>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                          Enrollment Details
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Select sport and batch; fee and discount come from the batch
                        </p>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={fieldLabel}>Sport *</label>
  <select 
    name="sportId"
    value={form.sportId}
    onChange={handleSportChange}
    disabled={isEdit || paymentLocked}
    className={`${inputClass(
      "sportId"
    )} disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed`}
  >

                            <option value="">Select sport</option>

  {availableSports.map((sport) => (
    <option
      key={getSportId(sport)}
      value={getSportId(sport)}
    >
      {getSportName(sport)}
    </option>
  ))}



                          </select>
                          {errorText("sportId")}
                        </div>




                        <div>
                          <label className={fieldLabel}>Batch </label>
                          <select
                            name="batchId"
                            value={form.batchId}
                            onChange={handleBatchChange}
                          disabled={!form.sportId || isEdit || paymentLocked}
                            className={`${inputClass("batchId")} disabled:bg-slate-50 disabled:text-slate-400`}
                          >


                            <option value="">
    {form.sportId ? "Select batch" : "Select sport first"}
  </option>

  {availableBatches.map((batch) => (
    <option key={batch.id} value={batch.id}>
      {getBatchName(batch)} —{" "}
      {formatTime12Hour(batch.startTime)} -{" "}
      {formatTime12Hour(batch.endTime)} —{" "}
      {String(batch.trainingDays || "")
        .split(",")
        .map((day) => day.trim().slice(0, 3))
        .join(", ")}
    </option>
  ))}

  {/* Keep the player's existing batch visible in EDIT mode,
      even when that batch is now full. */}
  {isEdit &&
    form.batchId &&
    !availableBatches.some(
      (batch) => String(batch.id) === String(form.batchId)
    ) &&
    selectedBatch && (
      <option value={selectedBatch.id}>
        {getBatchName(selectedBatch)} —{" "}
        {formatTime12Hour(selectedBatch.startTime)} -{" "}
        {formatTime12Hour(selectedBatch.endTime)} —{" "}
        {String(selectedBatch.trainingDays || "")
          .split(",")
          .map((day) => day.trim().slice(0, 3))
          .join(", ")}{" "}
        (Full)
      </option>
    )}




                          </select>

                        {selectedBatch && (
    <div className="mt-2 space-y-1.5 text-xs text-slate-500">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span>
          <strong className="text-slate-700">Time:</strong>{" "}

  {formatTime12Hour(selectedBatch.startTime)} -{" "}
  {formatTime12Hour(selectedBatch.endTime)}


        </span>

        <span>
          <strong className="text-slate-700">Capacity:</strong>{" "}
          {selectedBatch.capacity}
        </span>
      </div>

      <div>
        <strong className="text-slate-700">Training Days:</strong>{" "}
        {String(selectedBatch.trainingDays || "")
          .split(",")
          .map((day) => day.trim())
          .join(", ")}
      </div>
    </div>
  )}




                          {errorText("batchId")}

                          {isEdit && (
                            <p className="mt-2 text-xs text-amber-600">
                              Batch is locked after registration and cannot be changed.
                            </p>
                          )}
                        </div>
                      </div>



  <div>








    <label className={fieldLabel}>
      Fee Details
    </label>

    {!form.batchId ? (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        Select a batch to view the batch fee and discount.
      </div>
    ) : selectedBatch ? (
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] font-bold text-blue-600">
              Batch Fee
            </p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {getBatchName(selectedBatch)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {getFeeDurationText(selectedFee)}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-2xl font-bold text-blue-700">
              ₹{money(originalCourseFee)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Fee from selected batch
            </p>
          </div>
        </div>




      {/* PHYSIOTHERAPY */}
  {!isEdit && (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Physiotherapy
        </p>

        <h3 className="text-base font-semibold text-slate-900 mt-1">
          Does this player want physiotherapy?
        </h3>

        <p className="text-xs text-slate-500 mt-1">
          Physiotherapy service fee is ₹1,000.
        </p>
      </div>

      <div className="p-5 space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* YES */}
          <button
            type="button"
            disabled={paymentLocked}
            onClick={() => {
              if (paymentLocked) return;

              setForm((prev) => ({
                ...prev,
                wantsPhysiotherapist: true,
              }));

              setErrors((prev) => ({
                ...prev,
                physiotherapistId: "",
              }));
            }}
            className={`rounded-2xl border-2 p-5 text-left transition ${
              form.wantsPhysiotherapist
                ? "border-blue-600 bg-blue-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            } ${
              paymentLocked
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">
                  Yes
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Player wants physiotherapy
                </p>
              </div>

              <span
                className={`w-5 h-5 rounded-full border-2 shrink-0 ${
                  form.wantsPhysiotherapist
                    ? "border-blue-600 bg-blue-600"
                    : "border-slate-300 bg-white"
                }`}
              />
            </div>
          </button>

          {/* NO */}
          <button
            type="button"
            disabled={paymentLocked}
            onClick={() => {
              if (paymentLocked) return;

              setForm((prev) => ({
                ...prev,
                wantsPhysiotherapist: false,
                physiotherapistId: "",
              }));

              setErrors((prev) => ({
                ...prev,
                physiotherapistId: "",
              }));
            }}
            className={`rounded-2xl border-2 p-5 text-left transition ${
              !form.wantsPhysiotherapist
                ? "border-blue-600 bg-blue-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            } ${
              paymentLocked
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">
                  No
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  No physiotherapy required
                </p>
              </div>

              <span
                className={`w-5 h-5 rounded-full border-2 shrink-0 ${
                  !form.wantsPhysiotherapist
                    ? "border-blue-600 bg-blue-600"
                    : "border-slate-300 bg-white"
                }`}
              />
            </div>
          </button>

        </div>

        {/* PHYSIOTHERAPIST DROPDOWN */}
        {form.wantsPhysiotherapist && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5">

            <label className={fieldLabel}>
              Select Physiotherapist *
            </label>

            <select
              name="physiotherapistId"
              value={form.physiotherapistId}
              onChange={handleChange}
              disabled={paymentLocked}
              className={`${inputClass(
                "physiotherapistId"
              )} disabled:bg-slate-100`}
            >
              <option value="">
                Select physiotherapist
              </option>

              {physiotherapists.map((physio) => (
                <option
                  key={physio.id}
                  value={physio.id}
                >
                  {`${physio.firstName || ""} ${
                    physio.lastName || ""
                  }`.trim()}
                </option>
              ))}
            </select>

            {errorText("physiotherapistId")}

            <p className="text-xs text-slate-500 mt-2">
              Physiotherapy fee: ₹1,000
            </p>

          </div>
        )}

      </div>
    </div>
  )}






  {/* ONE-TIME PAYMENT INFO */}
  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600">
          One-time Payment
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Batch discount is applied.
        </p>
      </div>

      <p className="text-xl font-bold text-blue-700">


      ₹{money(
    Math.max(
      0,
      originalCourseFee - configuredDiscount
    ) +
    inventoryTotal +
    physiotherapyFee
  )}




      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">

      {/* BATCH DISCOUNT */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
          Batch Discount
        </p>

        <p className="text-base font-bold text-emerald-600 mt-1">
          {discountPercent}%
        </p>

        <p className="text-xs text-slate-500 mt-1">
          ₹{money(configuredDiscount)} discount
        </p>
      </div>

      {/* ONE-TIME COURSE FEE */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
          One-time Course Fee
        </p>

        <p className="text-base font-bold text-slate-900 mt-1">
          ₹{money(
            Math.max(
              0,
              originalCourseFee - configuredDiscount
            )
          )}
        </p>
      </div>

      {/* INVENTORY */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
          Inventory
        </p>

        <p className="text-base font-bold text-slate-900 mt-1">
          ₹{money(inventoryTotal)}
        </p>
      </div>

    </div>
  </div>


  {/* THREE INSTALLMENTS INFO */}
  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600">
          3 Installments
        </p>
        <p className="text-xs text-slate-500 mt-1">
          No batch discount is applied.
        </p>
      </div>

      <p className="text-xl font-bold text-blue-700">

      ₹{money(
    originalCourseFee +
    inventoryTotal +
    physiotherapyFee
  )}


      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">

      {/* INSTALLMENT 1 */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
          Installment 1
        </p>

        <p className="text-base font-bold text-blue-700 mt-1">
          ₹{money(installmentAmounts[0] || 0)}
        </p>

        <p className="text-xs text-slate-500 mt-1">
          Course fee + full inventory + physiotherapy
        </p>
      </div>

      {/* INSTALLMENT 2 */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
          Installment 2
        </p>

        <p className="text-base font-bold text-blue-700 mt-1">
          ₹{money(installmentAmounts[1] || 0)}
        </p>

        <p className="text-xs text-slate-500 mt-1">
          Course fee
        </p>
      </div>

      {/* INSTALLMENT 3 */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
          Installment 3
        </p>

        <p className="text-base font-bold text-blue-700 mt-1">
          ₹{money(installmentAmounts[2] || 0)}
        </p>

        <p className="text-xs text-slate-500 mt-1">
          Course fee
        </p>
      </div>

    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">

      {/* DISCOUNT */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
          Discount
        </p>

        <p className="text-base font-bold text-slate-700 mt-1">
          Not Applied
        </p>

        <p className="text-xs text-slate-500 mt-1">
          ₹0.00 discount
        </p>
      </div>

      {/* DURATION */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
          Duration
        </p>

        <p className="text-base font-bold text-slate-900 mt-1">
          {getFeeDurationText(selectedFee)}
        </p>
      </div>

    </div>
  </div>


      </div>
    ) : (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        The selected batch could not be loaded.
      </div>
    )}












                      {/* INVENTORY */}
                      {!isEdit && (
                      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
                            Inventory
                          </p>
                          <h3 className="text-base font-semibold text-slate-900 mt-1">
                            Do you want inventory for this player?
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            Select academy equipment only when the player is taking stock.
                          </p>
                        </div>

                        <div className="p-5 space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              type="button"
                              disabled={paymentLocked}
                              onClick={() => {
                                if (paymentLocked) return;
                                setForm((prev) => ({
                                  ...prev,
                                  includeInventory: true,
                                }));
                                setErrors((prev) => ({
                                  ...prev,
                                  inventoryFee: "",
                                }));
                              }}
                              className={`rounded-2xl border-2 p-5 text-left transition ${
                                form.includeInventory
                                  ? "border-blue-600 bg-blue-50 shadow-sm"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              } ${paymentLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-semibold text-slate-900">Yes</p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Player wants academy inventory
                                  </p>
                                </div>
                                <span className={`w-5 h-5 rounded-full border-2 shrink-0 ${
                                  form.includeInventory
                                    ? "border-blue-600 bg-blue-600"
                                    : "border-slate-300 bg-white"
                                } ${paymentLocked ? "opacity-60 cursor-not-allowed" : ""}`} />
                              </div>
                            </button>

                            <button
                              type="button"
                              disabled={paymentLocked}
                              onClick={() => {
                                if (paymentLocked) return;
                                setForm((prev) => ({
                                  ...prev,
                                  includeInventory: false,
                                  inventoryFee: "0",
                                }));
                                setInventorySubItem("");
                                setInventoryBrand("");
                                setInventoryId("");
                                setInventoryQuantity("1");
                                setSelectedInventoryItems([]);
                              }}
                              className={`rounded-2xl border-2 p-5 text-left transition ${
                                !form.includeInventory
                                  ? "border-blue-600 bg-blue-50 shadow-sm"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              } ${paymentLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-semibold text-slate-900">No</p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    No inventory required
                                  </p>
                                </div>
                                <span className={`w-5 h-5 rounded-full border-2 shrink-0 ${
                                  !form.includeInventory
                                    ? "border-blue-600 bg-blue-600"
                                    : "border-slate-300 bg-white"
                                } ${paymentLocked ? "opacity-60 cursor-not-allowed" : ""}`} />
                              </div>
                            </button>
                          </div>

                          {!form.includeInventory ? (
                            <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-xs text-slate-500">
                              No inventory will be added to this registration.
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className={fieldLabel}>Inventory Item *</label>
                                  <select
                                    value={inventorySubItem}
                                    onChange={(e) => {
                                      setInventorySubItem(e.target.value);
                                      setInventoryBrand("");
                                      setInventoryId("");
                                    }}
                                    disabled={!form.sportId || inventoryLoading || paymentLocked}
                                    className={`${inputClass("inventorySubItem")} disabled:bg-slate-100`}
                                  >
                                    <option value="">
                                      {form.sportId ? "Select item" : "Select sport first"}
                                    </option>
                                    {[...new Set(
                                      inventory
                                        .filter(
                                          (item) =>
                                            String(item?.sportId) === String(form.sportId) &&
                                            String(item?.status || "ACTIVE").toUpperCase() === "ACTIVE" &&
                                            Number(item?.currentStock || 0) > 0
                                        )
                                        .map((item) => item?.subItem)
                                        .filter(Boolean)
                                    )]
                                      .sort()
                                      .map((item) => (
                                        <option key={item} value={item}>
                                          {item}
                                        </option>
                                      ))}
                                  </select>
                                </div>

                                <div>
                                  <label className={fieldLabel}>Brand *</label>
                                  <select
                                    value={inventoryBrand}
                                    onChange={(e) => {
                                      setInventoryBrand(e.target.value);
                                      setInventoryId("");
                                    }}
                                    disabled={!inventorySubItem || paymentLocked}
                                    className={`${inputClass("inventoryBrand")} disabled:bg-slate-100`}
                                  >
                                    <option value="">
                                      {inventorySubItem ? "Select brand" : "Select item first"}
                                    </option>
                                    {inventory
                                      .filter(
                                        (item) =>
                                          String(item?.sportId) === String(form.sportId) &&
                                          String(item?.subItem || "").toLowerCase() ===
                                            String(inventorySubItem).toLowerCase() &&
                                          String(item?.status || "ACTIVE").toUpperCase() === "ACTIVE" &&
                                          Number(item?.currentStock || 0) > 0
                                      )
                                      .map((item) => item?.brand)
                                      .filter(Boolean)
                                      .filter((value, index, arr) => arr.indexOf(value) === index)
                                      .sort()
                                      .map((brand) => (
                                        <option key={brand} value={brand}>
                                          {brand}
                                        </option>
                                      ))}
                                  </select>
                                </div>

                                



                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-4 items-end">
                                <div>
                                  <label className={fieldLabel}>Selected Inventory</label>
                                  <select
                                    value={inventoryId}
                                    onChange={(e) => setInventoryId(e.target.value)}
                                    disabled={!inventoryBrand || paymentLocked}
                                    className={`${inputClass("inventoryId")} disabled:bg-slate-100`}
                                  >
                                    <option value="">
                                      {inventoryBrand ? "Select product" : "Select brand first"}
                                    </option>
                                    {inventory
                                      .filter(
                                        (item) =>
                                          String(item?.sportId) === String(form.sportId) &&
                                          String(item?.subItem || "").toLowerCase() ===
                                            String(inventorySubItem).toLowerCase() &&
                                          String(item?.brand || "").toLowerCase() ===
                                            String(inventoryBrand).toLowerCase() &&
                                          String(item?.status || "ACTIVE").toUpperCase() === "ACTIVE" &&
                                          Number(item?.currentStock || 0) > 0
                                      )
                                      .map((item) => (
                                        <option key={item.id} value={item.id}>
                                          {item.subItem} — {item.brand} — ₹{money(item.sellingPrice)}
                                        </option>
                                      ))}
                                  </select>
                                </div>

                                <div>
                                  <label className={fieldLabel}>Quantity *</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max={
                                      inventory.find(
                                        (item) => String(item?.id) === String(inventoryId)
                                      )?.currentStock || 1
                                    }
                                    value={inventoryQuantity}
                                    onChange={(e) => {
                                      if (paymentLocked) return;
                                      setInventoryQuantity(
                                        e.target.value.replace(/\D/g, "").slice(0, 3)
                                      );
                                    }}
                                    disabled={paymentLocked}
                                    className={`${inputClass("inventoryQuantity")} disabled:bg-slate-100 disabled:cursor-not-allowed`}
                                  />
                                </div>

                                <button
                                  type="button"
                                  disabled={paymentLocked}
                                  onClick={() => {
                                    if (paymentLocked) return;
                                    const item = inventory.find(
                                      (entry) => String(entry?.id) === String(inventoryId)
                                    );
                                    const quantity = Number(inventoryQuantity);

                                    if (!item || quantity <= 0) {
                                      setBackendErrors((prev) => ({
                                        ...prev,
                                        inventoryId: "Select an inventory item and valid quantity.",
                                      }));
                                      return;
                                    }

                                    const available = Number(item.currentStock || 0);
                                    const alreadySelected = selectedInventoryItems.find(
                                      (entry) => String(entry.id) === String(item.id)
                                    );
                                    const totalRequested =
                                      quantity + Number(alreadySelected?.quantity || 0);

                                    if (totalRequested > available) {
                                      setBackendErrors((prev) => ({
                                        ...prev,
                                        inventoryId: `Only ${available} unit(s) available for ${item.subItem} - ${item.brand}.`,
                                      }));
                                      return;
                                    }

                                    setSelectedInventoryItems((prev) => {
                                      if (alreadySelected) {
                                        return prev.map((entry) =>
                                          String(entry.id) === String(item.id)
                                            ? { ...entry, quantity: totalRequested }
                                            : entry
                                        );
                                      }

                                      return [
                                        ...prev,
                                        {
                                          ...item,
                                          quantity,
                                          unitPrice: Number(item.sellingPrice || 0),
                                          totalPrice:
                                            Number(item.sellingPrice || 0) * quantity,
                                        },
                                      ];
                                    });

                                    setInventoryId("");
                                    setInventoryQuantity("1");
                                    setBackendErrors((prev) => ({
                                      ...prev,
                                      inventoryId: "",
                                    }));
                                  }}
                                  className="h-11 px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                                >
                                  Add Item
                                </button>
                              </div>

                              {backendErrors.inventoryId && (
                                <p className="text-xs text-red-500">
                                  {backendErrors.inventoryId}
                                </p>
                              )}

                              {selectedInventoryItems.length > 0 && (
                                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                                  <div className="px-4 py-3 border-b border-slate-100">
                                    <p className="text-sm font-semibold text-slate-800">
                                      Selected Inventory
                                    </p>
                                  </div>

                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead className="bg-slate-50">
                                        <tr>
                                          <th className="p-3 text-left">Item</th>
                                          <th className="p-3 text-left">Brand</th>
                                          <th className="p-3 text-center">Qty</th>
                                          <th className="p-3 text-right">Price</th>
                                          <th className="p-3 text-right">Total</th>
                                          <th className="p-3 text-center">Action</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {selectedInventoryItems.map((item) => (
                                          <tr key={item.id} className="border-t border-slate-100">
                                            <td className="p-3 font-medium">{item.subItem}</td>
                                            <td className="p-3">{item.brand}</td>
                                            <td className="p-3 text-center">{item.quantity}</td>
                                            <td className="p-3 text-right">₹{money(item.unitPrice)}</td>
                                            <td className="p-3 text-right font-semibold">
                                              ₹{money(item.unitPrice * item.quantity)}
                                            </td>
                                            <td className="p-3 text-center">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (paymentLocked) return;
                                                  setSelectedInventoryItems((prev) =>
                                                    prev.filter(
                                                      (entry) => String(entry.id) !== String(item.id)
                                                    )
                                                  );
                                                }}
                                                disabled={paymentLocked}
                                                className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                                                title="Remove item"
                                              >
                                                <X className="w-4 h-4" />
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>

                                  <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4">
                                    <span className="text-sm font-semibold text-slate-600">
                                      Inventory Total
                                    </span>
                                    <span className="text-xl font-bold text-blue-700">
                                      ₹{money(
                                        selectedInventoryItems.reduce(
                                          (sum, item) =>
                                            sum +
                                            Number(item.unitPrice || item.sellingPrice || 0) *
                                              Number(item.quantity || 0),
                                          0
                                        )
                                      )}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>









                      

                    </div>
                      )}
                  </div>
                    </div>
                </section>

                  {/* 06 PAYMENT */}
                  {!isEdit && selectedFee && (
                    <section className={sectionClass}>
                      <div className="px-5 sm:px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-blue-600 tracking-[0.12em] uppercase">
                            Step 06
                          </p>
                          <h2 className="text-base sm:text-lg font-bold text-slate-900">
                            Payment
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Select the payment plan and payment method in this same form
                          </p>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 space-y-5">
                        {/* PAYMENT PLAN */}
                        <div>
                          <label className={fieldLabel}>Payment Plan *</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              type="button"
                              disabled={paymentLocked}
                              onClick={() => {
                                if (paymentLocked) return;
                                setPaymentPlan("ONE_TIME");
                                setPaymentMethod("");
                                setQrData(null);
                                setUpiScreenshot(null);
                              }}
                              className={`rounded-2xl border-2 p-5 text-left transition ${
                                paymentPlan === "ONE_TIME"
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-sm text-slate-900">
                                    One-time payment
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Complete course fee in one payment. Applicable batch discount is applied.
                                  </p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 shrink-0 ${
                                  paymentPlan === "ONE_TIME"
                                    ? "border-blue-600 bg-blue-600"
                                    : "border-slate-300"
                                } ${paymentLocked ? "opacity-60 cursor-not-allowed" : ""}`} />
                              </div>
                            </button>

                            <button
                              type="button"
                              disabled={paymentLocked}
                              onClick={() => {
                                if (paymentLocked) return;
                                setPaymentPlan("THREE_INSTALLMENTS");
                                setPaymentMethod("");
                                setQrData(null);
                                setUpiScreenshot(null);
                              }}
                              className={`rounded-2xl border-2 p-5 text-left transition ${
                                paymentPlan === "THREE_INSTALLMENTS"
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-sm text-slate-900">
                                    3 installments
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    No discount is applicable. The total is divided into three payments.
                                  </p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 shrink-0 ${
                                  paymentPlan === "THREE_INSTALLMENTS"
                                    ? "border-blue-600 bg-blue-600"
                                    : "border-slate-300"
                                } ${paymentLocked ? "opacity-60 cursor-not-allowed" : ""}`} />
                              </div>
                            </button>
                          </div>
                          {errorText("paymentPlan")}
                        </div>

                        {/* FEE SUMMARY */}
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600">
                                Registration Fee
                              </p>
                              <p className="text-sm font-semibold text-slate-900 mt-1">
                                {getFeeDurationText(selectedFee)}
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">
                              ₹{money(totalRegistrationFee)}
                            </p>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Course Fee</span>
                              <span className="font-medium">₹{money(originalCourseFee)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Discount</span>
                              <span className={`font-medium ${
                                paymentPlan === "THREE_INSTALLMENTS"
                                  ? "text-slate-700"
                                  : "text-emerald-600"
                              }`}>
                                ₹{money(registrationDiscount)}
                              </span>
                            </div>
                            {paymentPlan === "THREE_INSTALLMENTS" && (
                              <p className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs font-semibold text-amber-800">
                                No discount is applicable for 3 installments.
                              </p>
                            )}
                            <div className="flex justify-between">
                              <span className="text-slate-500">Final Course Fee</span>
                              <span className="font-semibold">₹{money(finalCourseFee)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Inventory</span>
                              <span className="font-semibold">
                                ₹{money(inventoryTotal)}
                              </span>
                            </div>

  <span className="font-bold text-blue-700">
    ₹{money(totalRegistrationFee)}
  </span>

  <div className="flex justify-between">
    <span className="text-slate-500">
      Physiotherapy
    </span>

    <span className="font-semibold">
      ₹{money(physiotherapyFee)}
    </span>
  </div>





                            <div className="border-t border-slate-200 pt-3 flex justify-between">
                              <span className="font-semibold text-slate-800">Total</span>
                              <span className="font-bold text-blue-700">
                                ₹{money(totalRegistrationFee)}
                              </span>
                            </div>
                          </div>

                          {paymentPlan === "THREE_INSTALLMENTS" &&
                            installmentAmounts.length === 3 && (
                              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {installmentAmounts.map((amount, index) => (
                                  <div
                                    key={index}
                                    className="rounded-xl bg-white border border-slate-200 p-4"
                                  >
                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                                      Installment {index + 1}
                                    </p>
                                    <p className="text-lg font-bold text-slate-900 mt-1">
                                      ₹{money(amount)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>

                        {/* PAYMENT METHOD */}
                        {paymentPlan && (
                          <div>
                            <label className={fieldLabel}>Payment Method *</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <button
                                type="button"
                                onClick={() => handlePaymentMethodChange("CASH")}
                                disabled={paymentLocked}
                                className={`rounded-2xl border-2 p-5 text-left transition ${
                                  paymentMethod === "CASH"
                                    ? "border-emerald-600 bg-emerald-50"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                } ${paymentLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-base font-semibold">Cash</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                      Payment received at the reception counter.
                                    </p>
                                  </div>
                                  <CreditCard className="w-5 h-5 text-emerald-600" />
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => handlePaymentMethodChange("UPI")}
                                disabled={paymentLocked}
                                className={`rounded-2xl border-2 p-5 text-left transition ${
                                  paymentMethod === "UPI"
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-base font-semibold">UPI</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                      Generate QR and upload payment proof.
                                    </p>
                                  </div>
                                  <QrCode className="w-5 h-5 text-blue-600" />
                                </div>
                              </button>
                            </div>
                            {errorText("paymentMethod")}
                          </div>
                        )}

                        {/* UPI */}
                        {paymentMethod === "UPI" && (
                          <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  UPI Payment
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  Amount: ₹{money(paymentAmount)}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={handleGenerateQr}
                                disabled={qrLoading || !paymentAmount || paymentLocked}
                                className="h-11 px-5 inline-flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                              >
                                {qrLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <QrCode className="w-4 h-4" />
                                    Generate QR
                                  </>
                                )}
                              </button>
                            </div>

                            {paymentLocked && (
                              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                                Payment confirmed. Sport, batch, inventory and payment selections are now locked.
                              </div>
                            )}

                            {qrData?.qrCodeBase64 && (
                              <div className="mt-5 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
                                <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col items-center">
                                  <img
                                    src={`data:image/png;base64,${qrData.qrCodeBase64}`}
                                    alt="UPI QR Code"
                                    className="w-56 h-56 bg-white p-2 rounded-xl"
                                  />
                                  <p className="text-xl font-bold mt-3">
                                    ₹{qrData.amount}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {qrData.payeeName}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1">
                                    {qrData.upiId}
                                  </p>
                                </div>

                                <label className="min-h-40 border-2 border-dashed border-slate-200 rounded-2xl bg-white flex flex-col items-center justify-center gap-2 px-5 py-6 cursor-pointer hover:bg-slate-50">
                                  <Upload className="w-6 h-6 text-blue-600" />
                                  <span className="text-sm font-medium text-slate-700 text-center">
                                    {upiScreenshot
                                      ? upiScreenshot.name
                                      : "Upload UPI payment screenshot"}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    PNG, JPG or JPEG
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={paymentLocked}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0] || null;
                                      if (!file) return;
                                      setUpiScreenshot(file);
                                      setPaymentLocked(true);
                                    }}
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* 07 ACCOUNT */}
                  <section className={sectionClass}>
                    <div className="px-5 sm:px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-600 tracking-[0.12em] uppercase">
                          Step 06
                        </p>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                          Account Credentials
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isAdult ? "Player login credentials" : "Parent / guardian login credentials"}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      {/* No duplicate login-email field or email banner.
                          The account email is taken from the contact section
                          by the existing submit logic. */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={fieldLabel}>Username *</label>
                          <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Create username"
                            className={inputClass("username")}
                          />
                          {errorText("username")}
                        </div>

                        {!isEdit && (
                          <>
                            <div>
                              <label className={fieldLabel}>Password *</label>
                              <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Minimum 8 characters"
                                className={inputClass("password")}
                              />
                              {errorText("password")}
                            </div>

                            <div>
                              <label className={fieldLabel}>Confirm Password *</label>
                              <input
                                name="confirmPassword"
                                type="password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter password"
                                className={inputClass("confirmPassword")}
                              />
                              {errorText("confirmPassword")}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* FINAL ACTION */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {isEdit ? "Ready to update player" : "Ready to register player"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {isEdit
                            ? "Review the details before saving changes."
                            : "All player, enrollment, inventory and payment details will be submitted together."}
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || (!isEdit && (!paymentPlan || !paymentMethod))}
                        className="min-w-[220px] h-11 inline-flex items-center justify-center gap-2 px-6 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {isEdit ? "Updating..." : "Registering..."}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            {isEdit ? "Update Player" : "Add Player"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
        </div>

        {/* CAMERA MODAL */}
        {cameraOpen && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Live Camera</h3>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-xl bg-black"
              />

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium"
                >
                  Capture Photo
                </button>

                <button
                  type="button"
                  onClick={closeCamera}
                  className="px-5 py-2.5 border border-gray-200 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADMISSION RECEIPT MODAL */}
        {showAdmissionReceipt && createdPlayer?.id && (
          <AdmissionReceiptModal
            playerId={createdPlayer.id}
            onClose={() => {
              setShowAdmissionReceipt(false);
            }}
            onContinue={() => {
              setShowAdmissionReceipt(false);
              navigate("/receptionist/players");
            }}
          />
        )}
      </div>
    );
  };

  export default PlayerForm;