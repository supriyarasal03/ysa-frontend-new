import React, {



  useEffect,



  useRef,



  useState,



} from "react";





import {

  Camera,

  Upload,

  X,

  User,

  Briefcase,

  FileText,

  ChevronLeft,

  Maximize2,

  HeartPulse,

  Lock,

  Eye,

  EyeOff,

  Trash2,

} from "lucide-react";





import {



  useNavigate,



  useParams,



} from "react-router-dom";





import {
  addPhysiotherapist,
  updatePhysiotherapist,
  getPhysiotherapistById,
  getPhysiotherapistDocument,
  getPhysiotherapistErrorMessage,
} from "./Physiotherapist";









// ============================================================



// CONSTANTS



// ============================================================







const MAX_FILE_SIZE =



  5 * 1024 * 1024;







const IMAGE_TYPES = [



  "image/jpeg",



  "image/jpg",



  "image/png",



  "image/webp",



];







const DOCUMENT_TYPES = [



  "application/pdf",



  "image/jpeg",



  "image/jpg",



  "image/png",



  "image/webp",



];







const INITIAL_FORM = {



  username: "",



  email: "",



  password: "",







  firstName: "",



  lastName: "",







  gender: "",







  dateOfBirth: "",







  bloodGroup: "",







  mobileNumber: "",







  address: "",







  qualification: "",







  specialization: "",







  experienceYears: "",



  monthlySalary: "",



  bankName: "",



  branchName: "",



  accountHolderName: "",



  accountNumber: "",



  ifscCode: "",



  joiningDate:



    new Date()



      .toISOString()



      .split("T")[0],

  livePhoto: null,







  aadhaarFront: null,







  aadhaarBack: null,







  panCard: null,







  degreeCertificate: null,

};











// ============================================================



// COMPONENT



// ============================================================







export default function PhysiotherapistForm() {







  const navigate = useNavigate();







  const { id } = useParams();







  const isEdit =



    Boolean(id);











  // ==========================================================



  // STATE



  // ==========================================================







  const [formData, setFormData] =



    useState(INITIAL_FORM);







  const [errors, setErrors] =



    useState({});







  const [loading, setLoading] =



    useState(false);







  const [fetching, setFetching] =



    useState(isEdit);







  const [successMessage, setSuccessMessage] =



    useState("");







  const [showPassword, setShowPassword] =



    useState(false);











  // ==========================================================



  // CAMERA



  // ==========================================================







  const videoRef =



    useRef(null);







  const canvasRef =



    useRef(null);







  const [cameraOpen, setCameraOpen] =



    useState(false);







  const [stream, setStream] =



    useState(null);







  const [livePhotoPreview, setLivePhotoPreview] =



    useState(null);

  // ==========================================================



  // DOCUMENT PREVIEWS



  // ==========================================================







  const [documentPreviews, setDocumentPreviews] =



    useState({

      livePhoto: null,



      aadhaarFront: null,



      aadhaarBack: null,



      panCard: null,



      degreeCertificate: null,

    });











  // ==========================================================



  // LOAD EDIT DATA



  // ==========================================================







  useEffect(() => {







    if (!isEdit) {







      setFetching(false);







      return;



    }











    const loadPhysiotherapist =



      async () => {







        try {







          setFetching(true);







          const response =



            await getPhysiotherapistById(id);







          const person =



            response?.data ||



            response;







          if (!person) {







            setErrors({



              general:



                "Physiotherapist not found.",



            });







            return;



          }











          setFormData((previous) => ({



            ...previous,







            username:



              person.username || "",







            email:



              person.email || "",







            firstName:



              person.firstName || "",







            lastName:



              person.lastName || "",







            gender:



              person.gender || "",







            dateOfBirth:



              person.dateOfBirth



                ? String(



                    person.dateOfBirth



                  ).slice(0, 10)



                : "",







            bloodGroup:



              person.bloodGroup || "",







            mobileNumber:



              person.mobileNumber || "",







            address:



              person.address || "",







            qualification:



              person.qualification || "",







            specialization:



              person.specialization || "",







            experienceYears:



              person.experienceYears ??



              "",







            monthlySalary:



              person.monthlySalary ??



              "",







            bankName:



              person.bankName || "",







            branchName:



              person.branchName || "",







            accountHolderName:



              person.accountHolderName || "",







            accountNumber:



              person.accountNumber || "",







            ifscCode:



              person.ifscCode || "",







            joiningDate:



              person.joiningDate



                ? String(



                    person.joiningDate



                  ).slice(0, 10)



                : "",



          }));











          // Existing document indicators







          setDocumentPreviews({

livePhoto:



              person.livePhotoAvailable



                ? "existing"



                : null,







            aadhaarFront:



              person.aadhaarFrontAvailable



                ? "existing"



                : null,







            aadhaarBack:



              person.aadhaarBackAvailable



                ? "existing"



                : null,







            panCard:



              person.panCardAvailable



                ? "existing"



                : null,







            degreeCertificate:



              person.degreeCertificateAvailable



                ? "existing"



                : null,

});










if (person.livePhotoAvailable && id) {
  try {
    const blob = await getPhysiotherapistDocument(
      id,
      "live-photo"
    );

    const url = URL.createObjectURL(blob);

    setLivePhotoPreview(url);

    setDocumentPreviews((previous) => ({
      ...previous,
      livePhoto: url,
    }));
  } catch (error) {
    console.error(
      "Unable to load existing live photo:",
      error
    );
  }
}

























        } catch (error) {







          console.error(



            "Failed to load physiotherapist:",



            error



          );







          setErrors({



            general:



              getPhysiotherapistErrorMessage(



                error



              ),



          });







        } finally {







          setFetching(false);



        }



      };











    loadPhysiotherapist();







  }, [id, isEdit]);











  // ==========================================================



  // CLEANUP CAMERA



  // ==========================================================







  useEffect(() => {







    return () => {







      if (stream) {







        stream



          .getTracks()



          .forEach(



            (track) =>



              track.stop()



          );



      }







      if (



        livePhotoPreview?.startsWith(



          "blob:"



        )



      ) {







        URL.revokeObjectURL(



          livePhotoPreview



        );



      }







    };







  }, [stream]);











  // ==========================================================



  // INPUT CHANGE



  // ==========================================================







  const handleChange = (event) => {







    const {



      name,



      value,



    } = event.target;







    setFormData(



      (previous) => ({



        ...previous,



        [name]: value,



      })



    );







    setErrors(



      (previous) => ({



        ...previous,



        [name]: "",



        general: "",



      })



    );



  };











  // ==========================================================



  // FILE VALIDATION



  // ==========================================================







  const validateFile = (



    file,



    label,



    allowedTypes



  ) => {







    if (!file) {







      return `${label} is required.`;



    }







    if (



      file.size >



      MAX_FILE_SIZE



    ) {







      return `${label} must be less than 5 MB.`;



    }







    if (



      !allowedTypes.includes(



        file.type



      )



    ) {







      return `${label} has an invalid file type.`;



    }







    return "";



  };











  // ==========================================================



  // HANDLE FILE



  // ==========================================================







  const handleFileChange = (



    event,



    field



  ) => {







    const file =



      event.target.files?.[0];







    if (!file) return;











    const imageFields = [



      "livePhoto",



    ];







    const isImageField =



      imageFields.includes(field);











    const error =



      validateFile(



        file,



        field,



        isImageField



          ? IMAGE_TYPES



          : DOCUMENT_TYPES



      );











    if (error) {







      setErrors(



        (previous) => ({



          ...previous,



          [field]: error,



        })



      );







      event.target.value = "";







      return;



    }











    setFormData(



      (previous) => ({



        ...previous,



        [field]: file,



      })



    );











    setErrors(



      (previous) => ({



        ...previous,



        [field]: "",



      })



    );











    const previewUrl =



      URL.createObjectURL(file);











    setDocumentPreviews(



      (previous) => ({



        ...previous,



        [field]: previewUrl,



      })



    );

if (



      field === "livePhoto"



    ) {







      setLivePhotoPreview(



        previewUrl



      );



    }



  };











  // ==========================================================



  // CAMERA



  // ==========================================================







  const openCamera = async () => {







    try {







      if (



        !navigator.mediaDevices ||



        !navigator.mediaDevices



          .getUserMedia



      ) {







        alert(



          "Camera is not supported by this browser."



        );







        return;



      }











      const cameraStream =



        await navigator.mediaDevices



          .getUserMedia({



            video: {



              facingMode:



                "user",



              width: {



                ideal: 1280,



              },



              height: {



                ideal: 720,



              },



            },



            audio: false,



          });











      setStream(



        cameraStream



      );







      setCameraOpen(true);











      setTimeout(() => {







        if (videoRef.current) {







          videoRef.current.srcObject =



            cameraStream;







          videoRef.current.play();



        }







      }, 100);







    } catch (error) {







      console.error(



        "Camera error:",



        error



      );







      alert(



        "Unable to access camera. Please allow camera permission."



      );



    }



  };











  // ==========================================================



  // CLOSE CAMERA



  // ==========================================================







  const closeCamera = () => {







    if (stream) {







      stream



        .getTracks()



        .forEach(



          (track) =>



            track.stop()



        );



    }







    setStream(null);







    setCameraOpen(false);



  };











  // ==========================================================



  // CAPTURE LIVE PHOTO



  // ==========================================================







  const captureLivePhoto = () => {







    if (



      !videoRef.current ||



      !canvasRef.current



    ) {



      return;



    }











    const video =



      videoRef.current;







    const canvas =



      canvasRef.current;











    canvas.width =



      video.videoWidth ||



      640;







    canvas.height =



      video.videoHeight ||



      480;











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







        if (!blob) return;











        const file =



          new File(



            [



              blob,



            ],



            `physiotherapist-live-${Date.now()}.jpg`,



            {



              type:



                "image/jpeg",



            }



          );











        const url =



          URL.createObjectURL(



            blob



          );











        setFormData(



          (previous) => ({



            ...previous,



            livePhoto: file,



          })



        );











        setLivePhotoPreview(



          url



        );











        setDocumentPreviews(



          (previous) => ({



            ...previous,



            livePhoto: url,



          })



        );











        setErrors(



          (previous) => ({



            ...previous,



            livePhoto: "",



          })



        );











        closeCamera();







      },



      "image/jpeg",



      0.9



    );



  };











  // ==========================================================



  // FORM VALIDATION



  // ==========================================================







  const validate = () => {







    const newErrors = {};











    const requiredFields = [



      "username",



      "email",



      "firstName",



      "lastName",



      "gender",



      "dateOfBirth",



      "bloodGroup",



      "mobileNumber",



      "address",



      "qualification",



      "specialization",



      "experienceYears",



      "joiningDate",



    ];











    requiredFields.forEach(



      (field) => {







        if (



          !String(



            formData[field] ?? ""



          ).trim()



        ) {







          newErrors[field] =



            `${field



              .replace(



                /([A-Z])/g,



                " $1"



              )



              .replace(



                /^./,



                (char) =>



                  char.toUpperCase()



              )} is required.`;



        }







      }



    );











    if (



      !isEdit &&



      !formData.password



    ) {







      newErrors.password =



        "Password is required.";



    }











    if (



      formData.email &&



      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(



        formData.email



      )



    ) {







      newErrors.email =



        "Enter a valid email address.";



    }











    if (



      formData.mobileNumber &&



      !/^[0-9]{10}$/.test(



        formData.mobileNumber



      )



    ) {







      newErrors.mobileNumber =



        "Mobile number must contain 10 digits.";



    }











    if (



      formData.experienceYears !==



        "" &&



      Number(formData.experienceYears) <



        0



    ) {







      newErrors.experienceYears =



        "Experience cannot be negative.";



    }











    if (



      formData.monthlySalary !== "" &&



      Number(formData.monthlySalary) < 0



    ) {



      newErrors.monthlySalary =



        "Monthly salary cannot be negative.";



    }











    if (



      formData.ifscCode &&



      !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(



        formData.ifscCode.trim()



      )



    ) {



      newErrors.ifscCode =



        "Enter a valid IFSC code.";



    }











    // Required files only on create







    if (!isEdit) {







      const requiredFiles = [



        [



          "livePhoto",



          "Live photo",



          IMAGE_TYPES,



        ],



        [



          "aadhaarFront",



          "Aadhaar front",



          DOCUMENT_TYPES,



        ],



        [



          "aadhaarBack",



          "Aadhaar back",



          DOCUMENT_TYPES,



        ],



        [



          "panCard",



          "PAN card",



          DOCUMENT_TYPES,



        ],



        [



          "degreeCertificate",



          "Degree certificate",



          DOCUMENT_TYPES,



        ],



      ];











      requiredFiles.forEach(



        ([



          field,



          label,



          types,



        ]) => {







          const error =



            validateFile(



              formData[field],



              label,



              types



            );







          if (error) {







            newErrors[field] =



              error;



          }







        }



      );







    }











    setErrors(



      newErrors



    );











    return (



      Object.keys(



        newErrors



      ).length === 0



    );



  };











  // ==========================================================



  // FOCUS ERROR



  // ==========================================================







  const focusFirstError = (



    validationErrors



  ) => {







    const firstField =



      Object.keys(



        validationErrors



      )[0];







    if (!firstField) return;











    setTimeout(() => {







      const element =



        document.querySelector(



          `[name="${firstField}"]`



        );







      if (element) {







        element.focus();







        element.scrollIntoView({



          behavior: "smooth",



          block: "center",



        });



      }







    }, 100);



  };











  // ==========================================================



  // SUBMIT



  // ==========================================================







  const handleSubmit = async (



    event



  ) => {







    event.preventDefault();







    setSuccessMessage("");







    const valid =



      validate();











    if (!valid) {







      focusFirstError(



        errors



      );







      return;



    }











    setLoading(true);











    try {







      const payload =



        new FormData();











      // USER







      payload.append(



        "username",



        formData.username.trim()



      );







      payload.append(



        "email",



        formData.email.trim()



      );











      if (



        !isEdit &&



        formData.password



      ) {







        payload.append(



          "password",



          formData.password



        );



      }
payload.append(



        "firstName",



        formData.firstName.trim()



      );







      payload.append(



        "lastName",



        formData.lastName.trim()



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



        "bloodGroup",



        formData.bloodGroup



      );







      payload.append(



        "mobileNumber",



        formData.mobileNumber



      );







      payload.append(



        "address",



        formData.address.trim()



      );











      // PROFESSIONAL







      payload.append(



        "qualification",



        formData.qualification.trim()



      );







      payload.append(



        "specialization",



        formData.specialization.trim()



      );







      payload.append(



        "experienceYears",



        formData.experienceYears



      );













      payload.append(

        "monthlySalary",

        formData.monthlySalary

      );



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

        formData.accountNumber.trim()

      );



      payload.append(

        "ifscCode",

        formData.ifscCode.trim().toUpperCase()

      );

// Joining date cannot change during edit







      if (!isEdit) {







        payload.append(



          "joiningDate",



          formData.joiningDate



        );



      }











      // ======================================================



      // FILES



      // ======================================================

if (



        formData.livePhoto



      ) {







        payload.append(



          "livePhoto",



          formData.livePhoto



        );



      }











      if (



        formData.aadhaarFront



      ) {







        payload.append(



          "aadhaarFront",



          formData.aadhaarFront



        );



      }











      if (



        formData.aadhaarBack



      ) {







        payload.append(



          "aadhaarBack",



          formData.aadhaarBack



        );



      }











      if (



        formData.panCard



      ) {







        payload.append(



          "panCard",



          formData.panCard



        );



      }











      if (



        formData.degreeCertificate



      ) {







        payload.append(



          "degreeCertificate",



          formData.degreeCertificate



        );



      }

// ======================================================



      // API



      // ======================================================







      const response =



        isEdit



          ? await updatePhysiotherapist(



              id,



              payload



            )



          : await addPhysiotherapist(



              payload



            );











      if (



        response?.success === false



      ) {







        throw new Error(



          response.message ||



            "Unable to save physiotherapist."



        );



      }











      setSuccessMessage(



        response?.message ||



          (



            isEdit



              ? "Physiotherapist updated successfully."



              : "Physiotherapist registered successfully."



          )



      );











      setTimeout(() => {







        navigate(



          "/admin/physiotherapist-management"



        );







      }, 1000);







    } catch (error) {







      console.error(



        "Physiotherapist save error:",



        error



      );











      setErrors(



        (previous) => ({



          ...previous,



          general:



            getPhysiotherapistErrorMessage(



              error



            ),



        })



      );







    } finally {







      setLoading(false);



    }



  };













  const handleViewDocument = async (field) => {



    const preview = documentPreviews[field];



    if (!preview) return;



    if (preview !== "existing") {

      window.open(preview, "_blank", "noopener,noreferrer");

      return;

    }



    const documentTypeMap = {

      livePhoto: "live-photo",

      aadhaarFront: "aadhaar-front",

      aadhaarBack: "aadhaar-back",

      panCard: "pan",

      degreeCertificate: "degree",

    };



    const documentType = documentTypeMap[field];



    if (!documentType || !id) return;



    try {

      const blob = await getPhysiotherapistDocument(id, documentType);

      const url = URL.createObjectURL(blob);



      window.open(url, "_blank", "noopener,noreferrer");



      setTimeout(() => {

        URL.revokeObjectURL(url);

      }, 60000);

    } catch (error) {

      console.error("Unable to view document:", error);



      setErrors((previous) => ({

        ...previous,

        [field]: getPhysiotherapistErrorMessage(error),

      }));

    }

  };





  const handleDeleteDocument = (field) => {



    const preview = documentPreviews[field];



    if (!preview || preview === "existing") {

      return;

    }



    URL.revokeObjectURL(preview);



    setFormData((previous) => ({

      ...previous,

      [field]: null,

    }));



    setDocumentPreviews((previous) => ({

      ...previous,

      [field]: null,

    }));



    setErrors((previous) => ({

      ...previous,

      [field]: "",

    }));



    const input = document.getElementById(`file-${field}`);



    if (input) {

      input.value = "";

    }

  };





  // ==========================================================



  // FILE CARD



  // ==========================================================









  const FileCard = ({

    field,

    label,

    description,

    accept,

    required = true,

  }) => {



    const preview = documentPreviews[field];

    const existing = preview === "existing";

    const hasFile = Boolean(preview);



    return (



      <div className="border border-slate-200 rounded-2xl p-5 bg-white">



        <div className="flex items-start justify-between gap-3">



          <div>



            <p className="font-semibold text-slate-800">

              {label}



              {required && (

                <span className="text-rose-500">

                  {" "}*

                </span>

              )}

            </p>



            <p className="text-xs text-slate-400 mt-1">

              {description}

            </p>



          </div>



          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">

            <Upload className="w-5 h-5 text-sky-600" />

          </div>



        </div>





        <div className="mt-4">



          <input

            id={`file-${field}`}

            type="file"

            accept={accept}

            className="hidden"

            onChange={(event) => handleFileChange(event, field)}

          />



          <div className="flex flex-wrap items-center gap-2">



            <label

              htmlFor={`file-${field}`}

              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 text-sky-700 text-sm font-medium cursor-pointer transition"

            >

              <Upload className="w-4 h-4" />

              {hasFile ? "Change File" : "Upload File"}

            </label>



            {hasFile && (

              <>



                <button

                  type="button"

                  onClick={() => handleViewDocument(field)}

                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 text-sm font-medium transition"

                >

                  <Eye className="w-4 h-4" />

                  View

                </button>



                {!existing && (

                  <button

                    type="button"

                    onClick={() => handleDeleteDocument(field)}

                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-medium transition"

                  >

                    <Trash2 className="w-4 h-4" />

                    Delete

                  </button>

                )}



              </>

            )}



          </div>



        </div>





        {preview && !existing && (

          <div className="mt-3 text-xs text-emerald-600 font-medium">

            ✓ File selected

          </div>

        )}





        {existing && (

          <div className="mt-3 text-xs text-emerald-600 font-medium">

            ✓ Existing document available

          </div>

        )}





        {errors[field] && (

          <p className="text-xs text-rose-600 mt-2">

            {errors[field]}

          </p>

        )}



      </div>



    );

  };





  // ==========================================================



  // LOADING



  // ==========================================================







  if (fetching) {







    return (







      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">







        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-8 py-6 text-slate-500">







          Loading physiotherapist details...







        </div>







      </div>







    );



  }











  // ==========================================================



  // RENDER

  // ==========================================================

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full min-h-screen bg-white overflow-hidden">

        {/* HEADER */}
        <div className="shrink-0 min-h-[200px] bg-[#0f172a] text-white px-5 md:px-6 pt-20 pb-10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isEdit
                ? "Edit Physiotherapist"
                : "Register New Physiotherapist"}
            </h1>

            <p className="mt-3 text-sm md:text-base text-sky-100">
              Yashree Sports Academy
            </p>
          </div>

          <div className="flex items-center gap-5">
            <Maximize2 className="w-5 h-5 text-slate-400" />

            <button
              type="button"
              onClick={() =>
                navigate("/admin/physiotherapist-management")
              }
              className="text-slate-300 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto h-[calc(100vh-225px)]">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="px-5 md:px-8 lg:px-10 pt-10 pb-8 flex flex-col gap-10"
          >

            {errors.general && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                {errors.general}
              </div>
            )}

            {successMessage && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                {successMessage}
              </div>
            )}

            {/* 1. PERSONAL INFORMATION */}
            <section>
              <div className="pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <User className="w-6 h-6 text-sky-600" />
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">
                    1. PERSONAL INFORMATION
                  </h2>
                </div>
              </div>

              <div className="pt-7">

                {/* LIVE PHOTO */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden mb-8">
                  <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Camera className="w-6 h-6 text-sky-600" />
                      <h3 className="text-xl md:text-2xl font-medium text-slate-800">
                        Live Profile Photo Capture
                      </h3>
                    </div>

                    <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium">
                      {livePhotoPreview ||
                      documentPreviews.livePhoto === "existing"
                        ? "CAPTURED"
                        : "READY"}
                    </span>
                  </div>

                  <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-7 items-center">
                    <div className="w-52 h-52 rounded-2xl overflow-hidden bg-[#0f172a] border border-slate-200 flex items-center justify-center shrink-0">
                      {livePhotoPreview ? (
                        <img
                          src={livePhotoPreview}
                          alt="Live"
                          className="w-full h-full object-cover"
                        />
                      ) : documentPreviews.livePhoto === "existing" ? (
                        <div className="text-center text-white">
                          <HeartPulse className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                          <p className="text-sm text-slate-300">
                            Existing photo saved
                          </p>
                        </div>
                      ) : (
                        <div className="text-center text-slate-400">
                          <User className="w-14 h-14 mx-auto mb-3" />
                          <p className="text-sm">No Photo Captured</p>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full">
                      <p className="text-slate-700 mb-5 text-base">
                        Capture a clear frontal photo for official academy
                        physiotherapist identification.
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={openCamera}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold transition"
                        >
                          <Camera className="w-5 h-5" />
                          Open Camera & Capture
                        </button>

                        <label
                          htmlFor="livePhotoUpload"
                          className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-slate-700 cursor-pointer transition"
                        >
                          <Upload className="w-5 h-5" />
                          Upload File Instead
                        </label>

                        <input
                          id="livePhotoUpload"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(event) =>
                            handleFileChange(event, "livePhoto")
                          }
                        />
                      </div>

                      <p className="text-sm text-slate-400 mt-4">
                        JPG or PNG • Maximum 2 MB
                      </p>

                      {errors.livePhoto && (
                        <p className="text-xs text-rose-600 mt-2">
                          {errors.livePhoto}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-7">
                  <InputField
                    label="FIRST NAME"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    placeholder="First name"
                    required
                  />

                  <InputField
                    label="LAST NAME"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    placeholder="Last name"
                    required
                  />

                  <SelectField
                    label="GENDER"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    error={errors.gender}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </SelectField>

                  <InputField
                    label="DATE OF BIRTH"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    error={errors.dateOfBirth}
                    required
                  />

                  <SelectField
                    label="BLOOD GROUP"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    error={errors.bloodGroup}
                    required
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A_POSITIVE">A+</option>
                    <option value="A_NEGATIVE">A-</option>
                    <option value="B_POSITIVE">B+</option>
                    <option value="B_NEGATIVE">B-</option>
                    <option value="AB_POSITIVE">AB+</option>
                    <option value="AB_NEGATIVE">AB-</option>
                    <option value="O_POSITIVE">O+</option>
                    <option value="O_NEGATIVE">O-</option>
                  </SelectField>

                  <InputField
                    label="MOBILE NUMBER"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    error={errors.mobileNumber}
                    placeholder="10 digit mobile number"
                    maxLength={10}
                    required
                  />

                  <div className="lg:col-span-3">
                    <InputField
                      label="EMAIL"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      placeholder="physio@example.com"
                      required
                    />
                  </div>

                  <div className="lg:col-span-3">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      ADDRESS <span className="text-rose-500">*</span>
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Complete address"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none"
                    />

                    {errors.address && (
                      <p className="text-xs text-rose-600 mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 2. QUALIFICATION & PROFESSIONAL DETAILS */}
            <section>
              <div className="pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <Briefcase className="w-6 h-6 text-sky-600" />
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">
                    2. QUALIFICATION & PROFESSIONAL DETAILS
                  </h2>
                </div>
              </div>

              <div className="pt-7 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                <InputField
                  label="HIGHEST QUALIFICATION"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  error={errors.qualification}
                  placeholder="e.g. BPT, MPT"
                  required
                />

                <InputField
                  label="SPECIALIZATION"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  error={errors.specialization}
                  placeholder="e.g. Sports Physiotherapy"
                  required
                />

                <InputField
                  label="EXPERIENCE"
                  name="experienceYears"
                  type="number"
                  min="0"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  error={errors.experienceYears}
                  placeholder="e.g. 3"
                  required
                />

                <InputField
                  label="MONTHLY SALARY"
                  name="monthlySalary"
                  type="number"
                  min="0"
                  value={formData.monthlySalary}
                  onChange={handleChange}
                  error={errors.monthlySalary}
                  placeholder="e.g. 35000"
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    JOINING DATE <span className="text-rose-500">*</span>
                  </label>

                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    disabled={isEdit}
                    className={`w-full border rounded-xl px-4 py-3.5 text-sm focus:outline-none ${
                      isEdit
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        : "border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    }`}
                  />

                  {isEdit && (
                    <p className="text-xs text-slate-400 mt-1">
                      Joining date cannot be changed.
                    </p>
                  )}

                  {errors.joiningDate && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.joiningDate}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* 3. DOCUMENTS */}
            <section>
              <div className="pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <FileText className="w-6 h-6 text-sky-600" />
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">
                    3. PHYSIOTHERAPIST VERIFICATION & QUALIFICATION DOCUMENTS
                  </h2>
                </div>
              </div>

              <div className="pt-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileCard
                  field="aadhaarFront"
                  label="Aadhaar Card - Front"
                  description="Government identity proof"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  required
                />

                <FileCard
                  field="aadhaarBack"
                  label="Aadhaar Card - Back"
                  description="Government identity proof"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  required
                />

                <FileCard
                  field="panCard"
                  label="PAN Card"
                  description="Income tax identity document"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  required
                />

                <FileCard
                  field="degreeCertificate"
                  label="Degree Certificate"
                  description="Educational qualification certificate"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  required
                />
              </div>
            </section>

            {/* 4. BANK DETAILS */}
            <section>
              <div className="pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <Briefcase className="w-6 h-6 text-sky-600" />
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">
                    4. BANK DETAILS
                  </h2>
                </div>
              </div>

              <div className="pt-7 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                <InputField
                  label="BANK NAME"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  error={errors.bankName}
                  placeholder="e.g. HDFC Bank"
                  required
                />

                <InputField
                  label="BRANCH NAME"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleChange}
                  error={errors.branchName}
                  placeholder="e.g. Pune Branch"
                  required
                />

                <InputField
                  label="ACCOUNT HOLDER NAME"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  error={errors.accountHolderName}
                  placeholder="Account holder name"
                  required
                />

                <InputField
                  label="ACCOUNT NUMBER"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  error={errors.accountNumber}
                  placeholder="Bank account number"
                  required
                />

                <InputField
                  label="IFSC CODE"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  error={errors.ifscCode}
                  placeholder="e.g. HDFC0001234"
                  maxLength={11}
                  required
                />
              </div>
            </section>

            {/* 5. ACCOUNT & CREDENTIALS */}
            <section>
              <div className="pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <Lock className="w-6 h-6 text-sky-600" />
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">
                    5. ACCOUNT & CREDENTIALS
                  </h2>
                </div>
              </div>

              <div className="pt-7 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                <InputField
                  label="USERNAME"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  placeholder="Username"
                  required
                />

                <InputField
                  label="EMAIL"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="physio@example.com"
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    PASSWORD{" "}
                    {!isEdit && <span className="text-rose-500">*</span>}
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={isEdit ? "" : formData.password}
                      onChange={handleChange}
                      disabled={isEdit}
                      placeholder={
                        isEdit
                          ? "Password cannot be changed"
                          : "Create password"
                      }
                      className={`w-full border rounded-xl px-4 py-3.5 pr-11 text-sm focus:outline-none ${
                        isEdit
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      }`}
                    />

                    {!isEdit && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((value) => !value)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {errors.password && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() =>
                  navigate("/admin/physiotherapist-management")
                }
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition"
              >
                Back to Management
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading
                  ? "Saving..."
                  : isEdit
                  ? "Update Physiotherapist"
                  : "Register Physiotherapist"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CAMERA MODAL */}
      {cameraOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">

            <div className="bg-[#0f172a] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-semibold">
                Capture Live Profile Photo
              </h3>

              <button type="button" onClick={closeCamera}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-2xl overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-h-[60vh] object-contain"
                />
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex justify-center gap-3 mt-5">
                <button
                  type="button"
                  onClick={closeCamera}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={captureLivePhoto}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium"
                >
                  <Camera className="w-5 h-5" />
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

// INPUT FIELD



// ============================================================







function InputField({



  label,



  name,



  type = "text",



  value,



  onChange,



  error,



  placeholder,



  required = false,



  min,



  maxLength,



}) {







  return (







    <div>







      <label className="block text-xs font-semibold text-slate-600 mb-2">







        {label}







        {required && (



          <span className="text-rose-500">



            {" "}*



          </span>



        )}







      </label>











      <input



        type={type}



        name={name}



        value={value ?? ""}



        onChange={onChange}



        placeholder={placeholder}



        min={min}



        maxLength={maxLength}



        className={`w-full border rounded-xl px-4 py-3.5 text-sm focus:outline-none ${



          error



            ? "border-rose-300 focus:ring-2 focus:ring-rose-200"



            : "border-slate-200 focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"



        }`}



      />











      {error && (







        <p className="text-xs text-rose-600 mt-1">



          {error}



        </p>







      )}







    </div>



  );



}











// ============================================================



// SELECT FIELD



// ============================================================







function SelectField({



  label,



  name,



  value,



  onChange,



  error,



  children,



  required = false,



}) {







  return (







    <div>







      <label className="block text-xs font-semibold text-slate-600 mb-2">







        {label}







        {required && (



          <span className="text-rose-500">



            {" "}*



          </span>



        )}







      </label>











      <select



        name={name}



        value={value ?? ""}



        onChange={onChange}



        className={`w-full border rounded-xl px-4 py-3.5 text-sm bg-white focus:outline-none ${



          error



            ? "border-rose-300"



            : "border-slate-200 focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"



        }`}



      >







        {children}







      </select>











      {error && (







        <p className="text-xs text-rose-600 mt-1">



          {error}



        </p>







      )}







    </div>



  );



}