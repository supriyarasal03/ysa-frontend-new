import { useEffect, useMemo, useState } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import {
  addBatch,
  updateBatch,
  getBatchById,
  getSports,
  getAvailableCoaches,
} from "./BatchService";

const DAYS = [
  { key: "MONDAY", label: "Mon" },
  { key: "TUESDAY", label: "Tue" },
  { key: "WEDNESDAY", label: "Wed" },
  { key: "THURSDAY", label: "Thu" },
  { key: "FRIDAY", label: "Fri" },
  { key: "SATURDAY", label: "Sat" },
  { key: "SUNDAY", label: "Sun" },
];

const INITIAL_FORM = {
  sportId: "",
  coachId: "",

  startDate: "",
  endDate: "",

  startHour: "",
  startMinute: "00",
  startPeriod: "AM",

  endHour: "",
  endMinute: "00",
  endPeriod: "AM",

  trainingDays: [],

  courseDuration: "",
  courseDurationUnit: "MONTHS",

  fee: "",
  discount: "",

  capacity: "",
};

export default function BatchForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [sports, setSports] = useState([]);
  const [coaches, setCoaches] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [fetching, setFetching] =
    useState(true);

  const [loadingCoaches, setLoadingCoaches] =
    useState(false);

  const [errors, setErrors] =
    useState({});

  const [successMessage, setSuccessMessage] =
    useState("");

  // ==========================================================
  // HELPERS
  // ==========================================================

  const getSportStatus = (sport) =>
    String(
      sport?.status ??
        sport?.Status ??
        ""
    )
      .trim()
      .toUpperCase();

  const getCoachName = (coach) => {
    if (coach?.name) {
      return coach.name;
    }

    if (coach?.fullName) {
      return coach.fullName;
    }

    const firstName =
      coach?.firstName ??
      coach?.user?.firstName ??
      "";

    const lastName =
      coach?.lastName ??
      coach?.user?.lastName ??
      "";

    const fullName =
      `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }

    return (
      coach?.username ||
      "Coach"
    );
  };

  const getSportName = (sport) =>
    sport?.sportsName ??
    sport?.sportName ??
    sport?.name ??
    "Sport";

  const getCoachSportId = (coach) =>
    coach?.sportId ??
    coach?.sport?.id ??
    null;

  const activeSports = useMemo(() => {
    return sports.filter((sport) => {
      const status =
        getSportStatus(sport);

      return (
        !status ||
        status === "ACTIVE"
      );
    });
  }, [sports]);

  // ==========================================================
  // TIME HELPERS
  // ==========================================================

  const to24Hour = (
    hour,
    period
  ) => {
    let value = Number(hour);

    if (
      period === "PM" &&
      value !== 12
    ) {
      value += 12;
    }

    if (
      period === "AM" &&
      value === 12
    ) {
      value = 0;
    }

    return value;
  };

  const toLocalTime = (
    hour,
    minute,
    period
  ) => {
    if (!hour) {
      return null;
    }

    const value =
      to24Hour(
        hour,
        period
      );

    return `${String(
      value
    ).padStart(
      2,
      "0"
    )}:${String(
      minute || "00"
    ).padStart(
      2,
      "0"
    )}:00`;
  };

  const getTimeMinutes = (
    hour,
    minute,
    period
  ) => {
    if (!hour) {
      return null;
    }

    return (
      to24Hour(
        hour,
        period
      ) *
        60 +
      Number(
        minute || 0
      )
    );
  };

  // ==========================================================
  // AUTOMATIC COURSE DURATION
  // ==========================================================

  // Calculates the course duration from Start Date -> End Date.
  // Example: 26-08-2026 to 26-11-2026 = 3 Months.
  const calculateCourseDuration = (
    startDate,
    endDate
  ) => {
    if (!startDate || !endDate) {
      return {
        value: "",
        unit: "MONTHS",
      };
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end < start
    ) {
      return {
        value: "",
        unit: "MONTHS",
      };
    }

    let months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    // If the end day is before the start day, the period is
    // not a complete number of calendar months.
    if (end.getDate() < start.getDate()) {
      months -= 1;
    }

    // For the same date, or any period shorter than one month,
    // keep the minimum duration as 1 month.
    months = Math.max(1, months);

    return {
      value: String(months),
      unit: "MONTHS",
    };
  };

  // ==========================================================
  // AUTO UPDATE COURSE DURATION WHEN DATES CHANGE
  // ==========================================================

  useEffect(() => {
    const duration = calculateCourseDuration(
      formData.startDate,
      formData.endDate
    );

    setFormData((prev) => {
      if (
        prev.courseDuration === duration.value &&
        prev.courseDurationUnit === duration.unit
      ) {
        return prev;
      }

      return {
        ...prev,
        courseDuration: duration.value,
        courseDurationUnit: duration.unit,
      };
    });

    // Clear date-related duration error after valid dates.
    if (duration.value) {
      setErrors((prev) => ({
        ...prev,
        courseDuration: "",
        courseDurationUnit: "",
      }));
    }
  }, [formData.startDate, formData.endDate]);

  // ==========================================================
  // LOAD SPORTS
  // ==========================================================

  useEffect(() => {
    const loadSports = async () => {
      try {
        const response =
          await getSports();

        const list =
          Array.isArray(
            response?.data
          )
            ? response.data
            : Array.isArray(
                response
              )
            ? response
            : [];

        setSports(list);
      } catch (error) {
        console.error(
          "Failed to load sports:",
          error
        );

        setErrors({
          general:
            error.message ||
            "Failed to load sports.",
        });
      }
    };

    loadSports();
  }, []);

  // ==========================================================
  // LOAD BATCH FOR EDIT
  // ==========================================================

  useEffect(() => {
    if (!isEdit) {
      setFetching(false);
      return;
    }

    const loadBatch = async () => {
      try {
        setFetching(true);

        const response =
          await getBatchById(id);

        const batch =
          response?.data ||
          response;

        if (!batch) {
          throw new Error(
            "Batch not found."
          );
        }

        const parseTime = (
          timeString
        ) => {
          if (!timeString) {
            return {
              hour: "",
              minute: "00",
              period: "AM",
            };
          }

          const parts =
            String(
              timeString
            ).split(":");

          const hourValue =
            Number(
              parts[0]
            );

          const minuteValue =
            Number(
              parts[1] || 0
            );

          const period =
            hourValue >= 12
              ? "PM"
              : "AM";

          let hour =
            hourValue % 12;

          if (hour === 0) {
            hour = 12;
          }

          return {
            hour: String(
              hour
            ),
            minute: String(
              minuteValue
            ).padStart(
              2,
              "0"
            ),
            period,
          };
        };

        const normalizeDays = (
          value
        ) => {
          if (!value) {
            return [];
          }

          const shortToFull = {
            MON: "MONDAY",
            TUE: "TUESDAY",
            WED: "WEDNESDAY",
            THU: "THURSDAY",
            FRI: "FRIDAY",
            SAT: "SATURDAY",
            SUN: "SUNDAY",
          };

          return String(
            value
          )
            .split(",")
            .map((day) =>
              day
                .trim()
                .toUpperCase()
            )
            .filter(Boolean)
            .map(
              (day) =>
                shortToFull[
                  day
                ] || day
            );
        };

        const start =
          parseTime(
            batch.startTime
          );

        const end =
          parseTime(
            batch.endTime
          );

        setFormData({
          sportId:
            batch.sportId !=
            null
              ? String(
                  batch.sportId
                )
              : "",

          coachId:
            batch.coachId !=
            null
              ? String(
                  batch.coachId
                )
              : "",

          startDate:
            batch.startDate ||
            "",

          endDate:
            batch.endDate ||
            "",

          startHour:
            start.hour,

          startMinute:
            start.minute,

          startPeriod:
            start.period,

          endHour:
            end.hour,

          endMinute:
            end.minute,

          endPeriod:
            end.period,

          trainingDays:
            normalizeDays(
              batch.trainingDays
            ),

          courseDuration:
            calculateCourseDuration(
              batch.startDate || "",
              batch.endDate || ""
            ).value,

          courseDurationUnit:
            "MONTHS",

          fee:
            batch.fee != null
              ? String(
                  batch.fee
                )
              : "",

          discount:
            batch.discount !=
            null
              ? String(
                  batch.discount
                )
              : "0",

          capacity:
            batch.capacity !=
            null
              ? String(
                  batch.capacity
                )
              : "",
        });
      } catch (error) {
        console.error(
          "Failed to load batch:",
          error
        );

        setErrors({
          general:
            error.message ||
            "Failed to load batch.",
        });
      } finally {
        setFetching(false);
      }
    };

    loadBatch();
  }, [id, isEdit]);

  // ==========================================================
  // LOAD AVAILABLE COACHES
  // ==========================================================

  const loadAvailableCoaches =
    async () => {
      if (
        !formData.sportId ||
        !formData.startDate ||
        !formData.endDate ||
        !formData.startHour ||
        !formData.endHour ||
        formData.trainingDays.length === 0
      ) {
        setCoaches([]);

        setFormData(
          (prev) => ({
            ...prev,
            coachId: "",
          })
        );

        return;
      }

      const startTime =
        toLocalTime(
          formData.startHour,
          formData.startMinute,
          formData.startPeriod
        );

      const endTime =
        toLocalTime(
          formData.endHour,
          formData.endMinute,
          formData.endPeriod
        );

      if (
        !startTime ||
        !endTime
      ) {
        return;
      }

      const startMinutes =
        getTimeMinutes(
          formData.startHour,
          formData.startMinute,
          formData.startPeriod
        );

      const endMinutes =
        getTimeMinutes(
          formData.endHour,
          formData.endMinute,
          formData.endPeriod
        );

      if (
        startMinutes >=
        endMinutes
      ) {
        setCoaches([]);

        setFormData(
          (prev) => ({
            ...prev,
            coachId: "",
          })
        );

        setErrors(
          (prev) => ({
            ...prev,
            endTime:
              "End time must be after start time.",
          })
        );

        return;
      }

      if (
        formData.startDate >
        formData.endDate
      ) {
        setCoaches([]);

        setFormData(
          (prev) => ({
            ...prev,
            coachId: "",
          })
        );

        setErrors(
          (prev) => ({
            ...prev,
            endDate:
              "End date must be after start date.",
          })
        );

        return;
      }

      try {
        setLoadingCoaches(
          true
        );

        setErrors(
          (prev) => ({
            ...prev,
            coachId: "",
            endTime: "",
            endDate: "",
          })
        );

        const response =
          await getAvailableCoaches({
            sportId:
              Number(
                formData.sportId
              ),

            startDate:
              formData.startDate,

            endDate:
              formData.endDate,

            startTime,

            endTime,

            trainingDays:
              formData.trainingDays.join(
                ","
              ),

            excludeBatchId:
              isEdit
                ? Number(id)
                : null,
          });

        const list =
          Array.isArray(
            response?.data
          )
            ? response.data
            : Array.isArray(
                response
              )
            ? response
            : [];

        setCoaches(list);

        setFormData(
          (prev) => {
            const exists =
              list.some(
                (coach) =>
                  String(
                    coach.id
                  ) ===
                  String(
                    prev.coachId
                  )
              );

            return {
              ...prev,
              coachId:
                exists
                  ? prev.coachId
                  : "",
            };
          }
        );
      } catch (error) {
        console.error(
          "Failed to load available coaches:",
          error
        );

        setCoaches([]);

        setFormData(
          (prev) => ({
            ...prev,
            coachId: "",
          })
        );

        setErrors(
          (prev) => ({
            ...prev,
            coachId:
              error.message ||
              "Failed to load available coaches.",
          })
        );
      } finally {
        setLoadingCoaches(
          false
        );
      }
    };

  // ==========================================================
  // COACH FILTER EFFECT
  // ==========================================================

  useEffect(() => {
    if (fetching) {
      return;
    }

    const timer =
      setTimeout(
        () => {
          loadAvailableCoaches();
        },
        300
      );

    return () =>
      clearTimeout(
        timer
      );
  }, [
    formData.sportId,
    formData.startDate,
    formData.endDate,
    formData.startHour,
    formData.startMinute,
    formData.startPeriod,
    formData.endHour,
    formData.endMinute,
    formData.endPeriod,
    formData.trainingDays,
  ]);

  // ==========================================================
  // SUCCESS MESSAGE
  // ==========================================================

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer =
      setTimeout(
        () => {
          setSuccessMessage(
            ""
          );
        },
        5000
      );

    return () =>
      clearTimeout(
        timer
      );
  }, [
    successMessage,
  ]);

  // ==========================================================
  // HANDLE CHANGE
  // ==========================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    if (
      name ===
        "capacity" ||
      name ===
        "courseDuration" ||
      name === "discount"
    ) {
      if (
        value === "" ||
        /^\d*\.?\d*$/.test(
          value
        )
      ) {
        setFormData(
          (prev) => ({
            ...prev,
            [name]: value,
          })
        );

        setErrors(
          (prev) => ({
            ...prev,
            [name]: "",
            general: "",
          })
        );
      }

      return;
    }

    setFormData(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );

    setErrors(
      (prev) => ({
        ...prev,
        [name]: "",
        general: "",
      })
    );

    if (
      name ===
      "sportId"
    ) {
      setFormData(
        (prev) => ({
          ...prev,
          sportId: value,
          coachId: "",
        })
      );

      setCoaches([]);

      setErrors(
        (prev) => ({
          ...prev,
          sportId: "",
          coachId: "",
          general: "",
        })
      );
    }
  };

  // ==========================================================
  // TOGGLE DAY
  // ==========================================================

  const toggleDay = (
    day
  ) => {
    setFormData(
      (prev) => {
        const exists =
          prev.trainingDays.includes(
            day
          );

        return {
          ...prev,
          trainingDays:
            exists
              ? prev.trainingDays.filter(
                  (
                    item
                  ) =>
                    item !==
                    day
                )
              : [
                  ...prev.trainingDays,
                  day,
                ],
        };
      }
    );

    setErrors(
      (prev) => ({
        ...prev,
        trainingDays: "",
        coachId: "",
        general: "",
      })
    );

    setCoaches([]);
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validate =
    () => {
      const newErrors =
        {};

      if (
        !formData.sportId
      ) {
        newErrors.sportId =
          "Sport is required.";
      }

      if (
        !formData.startDate
      ) {
        newErrors.startDate =
          "Start date is required.";
      }

      if (
        !formData.endDate
      ) {
        newErrors.endDate =
          "End date is required.";
      }

      if (
        formData.startDate &&
        formData.endDate &&
        formData.startDate >
          formData.endDate
      ) {
        newErrors.endDate =
          "End date must be after start date.";
      }

      if (
        !formData.startHour
      ) {
        newErrors.startTime =
          "Start time is required.";
      }

      if (
        !formData.endHour
      ) {
        newErrors.endTime =
          "End time is required.";
      }

      if (
        formData.startHour &&
        formData.endHour
      ) {
        const startMinutes =
          getTimeMinutes(
            formData.startHour,
            formData.startMinute,
            formData.startPeriod
          );

        const endMinutes =
          getTimeMinutes(
            formData.endHour,
            formData.endMinute,
            formData.endPeriod
          );

        if (
          startMinutes >=
          endMinutes
        ) {
          newErrors.endTime =
            "End time must be after start time.";
        }
      }

      if (
        formData.trainingDays.length === 0
      ) {
        newErrors.trainingDays =
          "Select at least one training day.";
      }

      if (
        !formData.coachId
      ) {
        newErrors.coachId =
          "Coach is required.";
      }

      const calculatedDuration =
        calculateCourseDuration(
          formData.startDate,
          formData.endDate
        );

      if (!calculatedDuration.value) {
        newErrors.courseDuration =
          "Course duration could not be calculated from the selected dates.";
      }

      if (
        formData.fee === ""
      ) {
        newErrors.fee =
          "Fee is required.";
      } else if (
        Number(
          formData.fee
        ) < 0
      ) {
        newErrors.fee =
          "Fee cannot be negative.";
      }

      if (
        formData.discount === ""
      ) {
        // Empty discount is treated as 0.
      } else if (
        Number(
          formData.discount
        ) < 0
      ) {
        newErrors.discount =
          "Discount cannot be negative.";
      } else if (
        Number(
          formData.discount
        ) >
        Number(
          formData.fee || 0
        )
      ) {
        newErrors.discount =
          "Discount cannot exceed fee.";
      }

      if (
        !formData.capacity
      ) {
        newErrors.capacity =
          "Capacity is required.";
      } else {
        const capacity =
          Number(
            formData.capacity
          );

        if (
          capacity < 1
        ) {
          newErrors.capacity =
            "Capacity must be at least 1.";
        } else if (
          capacity > 500
        ) {
          newErrors.capacity =
            "Capacity cannot exceed 500.";
        }
      }

      if (
        formData.sportId &&
        formData.coachId
      ) {
        const selectedCoach =
          coaches.find(
            (coach) =>
              String(
                coach.id
              ) ===
              String(
                formData.coachId
              )
          );

        if (
          selectedCoach
        ) {
          const coachSportId =
            getCoachSportId(
              selectedCoach
            );

          if (
            coachSportId !=
              null &&
            String(
              coachSportId
            ) !==
              String(
                formData.sportId
              )
          ) {
            newErrors.coachId =
              "Selected coach is not assigned to this sport.";
          }
        }
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
  // SUBMIT
  // ==========================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!validate()) {
        return;
      }

      setLoading(true);
      setSuccessMessage(
        ""
      );

      setErrors(
        (prev) => ({
          ...prev,
          general: "",
        })
      );

      const payload =
        {
          sportId:
            Number(
              formData.sportId
            ),

          coachId:
            Number(
              formData.coachId
            ),

          startDate:
            formData.startDate,

          endDate:
            formData.endDate,

          startTime:
            toLocalTime(
              formData.startHour,
              formData.startMinute,
              formData.startPeriod
            ),

          endTime:
            toLocalTime(
              formData.endHour,
              formData.endMinute,
              formData.endPeriod
            ),

          trainingDays:
            formData.trainingDays.join(
              ","
            ),

          courseDuration:
            Number(
              calculateCourseDuration(
                formData.startDate,
                formData.endDate
              ).value
            ),

          courseDurationUnit:
            "MONTHS",

          fee:
            Number(
              formData.fee
            ),

          discount:
            formData.discount ===
            ""
              ? 0
              : Number(
                  formData.discount
                ),

          capacity:
            Number(
              formData.capacity
            ),
        };

      try {
        if (isEdit) {
          await updateBatch(
            id,
            payload
          );

          setSuccessMessage(
            "Batch updated successfully."
          );

          navigate(
            "/admin/batch-managmnet"
          );
        } else {
          await addBatch(
            payload
          );

          setSuccessMessage(
            "Batch created successfully."
          );

          navigate(
            "/admin/batch-managmnet"
          );
        }
      } catch (error) {
        console.error(
          "Batch save error:",
          error
        );

        const responseData =
          error?.response
            ?.data || {};

        const backendMessage =
          responseData?.message ||
          error?.message ||
          "Something went wrong.";

        const fieldErrors =
          error?.data &&
          typeof error.data ===
            "object" &&
          !Array.isArray(
            error.data
          )
            ? error.data
            : responseData?.data &&
              typeof responseData.data ===
                "object" &&
              !Array.isArray(
                responseData.data
              )
            ? responseData.data
            : null;

        if (
          fieldErrors &&
          Object.keys(
            fieldErrors
          ).length
        ) {
          const mapped =
            {};

          Object.entries(
            fieldErrors
          ).forEach(
            ([
              field,
              message,
            ]) => {
              if (
                typeof message ===
                "string"
              ) {
                mapped[
                  field
                ] =
                  message;
              }
            }
          );

          setErrors({
            ...mapped,
            general:
              mapped.general ||
              backendMessage,
          });
        } else {
          setErrors({
            general:
              backendMessage,
          });
        }
      } finally {
        setLoading(
          false
        );
      }
    };

  // ==========================================================
  // ERROR TEXT
  // ==========================================================

  const ErrorText = ({
    name,
  }) => {
    if (!errors[name]) {
      return null;
    }

    return (
      <p className="mt-1.5 text-sm text-red-600">
        {errors[name]}
      </p>
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto" />

          <p className="mt-3 text-sm text-slate-500">
            Loading batch data...
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
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="bg-slate-900 text-white rounded-t-2xl px-6 md:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              {isEdit
                ? "Edit Batch"
                : "Create New Batch"}
            </h1>

            <p className="text-slate-300 text-xs md:text-sm mt-1">
              Yashree Sports Academy
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/batch-managmnet"
              )
            }
            className="p-2 rounded-lg hover:bg-white/10 transition"
            title="Close"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-b-2xl shadow-sm"
        >

          {/* GENERAL ERROR */}
          {errors.general && (
            <div className="mx-6 md:mx-8 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errors.general}
            </div>
          )}

          {/* ==================================================
              1. BASIC INFORMATION
              ================================================== */}
          <section className="p-6 md:p-8">

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
                1
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  BATCH INFORMATION
                </h2>

                <p className="text-xs text-slate-400 mt-0.5">
                  Select sport and batch duration
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* SPORT */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  SPORT{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <select
                  name="sportId"
                  value={
                    formData.sportId
                  }
                  onChange={
                    handleChange
                  }
                  className={`w-full h-11 px-4 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    errors.sportId
                      ? "border-red-500"
                      : "border-slate-200"
                  }`}
                >
                  <option value="">
                    Select Sport
                  </option>

                  {activeSports.map(
                    (sport) => (
                      <option
                        key={
                          sport.id
                        }
                        value={
                          sport.id
                        }
                      >
                        {getSportName(
                          sport
                        )}
                      </option>
                    )
                  )}
                </select>

                <ErrorText name="sportId" />
              </div>

              {/* START DATE */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  START DATE{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={
                    formData.startDate
                  }
                  onChange={
                    handleChange
                  }
                  className={`w-full h-11 px-4 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    errors.startDate
                      ? "border-red-500"
                      : "border-slate-200"
                  }`}
                />

                <ErrorText name="startDate" />
              </div>

              {/* END DATE */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  END DATE{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={
                    formData.endDate
                  }
                  min={
                    formData.startDate ||
                    undefined
                  }
                  onChange={
                    handleChange
                  }
                  className={`w-full h-11 px-4 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    errors.endDate
                      ? "border-red-500"
                      : "border-slate-200"
                  }`}
                />

                <ErrorText name="endDate" />
              </div>

            </div>
          </section>

          {/* ==================================================
              2. SCHEDULE
              ================================================== */}
          <section className="border-t border-slate-100 p-6 md:p-8">

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
                2
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  BATCH SCHEDULE
                </h2>

                <p className="text-xs text-slate-400 mt-0.5">
                  Set training time and days
                </p>
              </div>
            </div>

            {/* TIME */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* START */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  START TIME{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <div className="flex gap-2">

                  <select
                    name="startHour"
                    value={
                      formData.startHour
                    }
                    onChange={
                      handleChange
                    }
                    className={`flex-1 h-11 px-3 border rounded-xl text-sm bg-white ${
                      errors.startTime
                        ? "border-red-500"
                        : "border-slate-200"
                    }`}
                  >
                    <option value="">
                      Hour
                    </option>

                    {Array.from(
                      {
                        length: 12,
                      },
                      (
                        _,
                        index
                      ) =>
                        index + 1
                    ).map(
                      (
                        hour
                      ) => (
                        <option
                          key={
                            hour
                          }
                          value={
                            hour
                          }
                        >
                          {hour}
                        </option>
                      )
                    )}
                  </select>

                  <select
                    name="startMinute"
                    value={
                      formData.startMinute
                    }
                    onChange={
                      handleChange
                    }
                    className="w-24 h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    {[
                      "00",
                      "15",
                      "30",
                      "45",
                    ].map(
                      (
                        minute
                      ) => (
                        <option
                          key={
                            minute
                          }
                          value={
                            minute
                          }
                        >
                          {minute}
                        </option>
                      )
                    )}
                  </select>

                  <select
                    name="startPeriod"
                    value={
                      formData.startPeriod
                    }
                    onChange={
                      handleChange
                    }
                    className="w-24 h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="AM">
                      AM
                    </option>
                    <option value="PM">
                      PM
                    </option>
                  </select>

                </div>

                <ErrorText name="startTime" />
              </div>

              {/* END */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  END TIME{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <div className="flex gap-2">

                  <select
                    name="endHour"
                    value={
                      formData.endHour
                    }
                    onChange={
                      handleChange
                    }
                    className={`flex-1 h-11 px-3 border rounded-xl text-sm bg-white ${
                      errors.endTime
                        ? "border-red-500"
                        : "border-slate-200"
                    }`}
                  >
                    <option value="">
                      Hour
                    </option>

                    {Array.from(
                      {
                        length: 12,
                      },
                      (
                        _,
                        index
                      ) =>
                        index + 1
                    ).map(
                      (
                        hour
                      ) => (
                        <option
                          key={
                            hour
                          }
                          value={
                            hour
                          }
                        >
                          {hour}
                        </option>
                      )
                    )}
                  </select>

                  <select
                    name="endMinute"
                    value={
                      formData.endMinute
                    }
                    onChange={
                      handleChange
                    }
                    className="w-24 h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    {[
                      "00",
                      "15",
                      "30",
                      "45",
                    ].map(
                      (
                        minute
                      ) => (
                        <option
                          key={
                            minute
                          }
                          value={
                            minute
                          }
                        >
                          {minute}
                        </option>
                      )
                    )}
                  </select>

                  <select
                    name="endPeriod"
                    value={
                      formData.endPeriod
                    }
                    onChange={
                      handleChange
                    }
                    className="w-24 h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="AM">
                      AM
                    </option>
                    <option value="PM">
                      PM
                    </option>
                  </select>

                </div>

                <ErrorText name="endTime" />
              </div>

            </div>

            {/* TRAINING DAYS */}
            <div className="mt-6">

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                TRAINING DAYS{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <div className="flex flex-wrap gap-2">

                {DAYS.map(
                  (day) => {
                    const selected =
                      formData.trainingDays.includes(
                        day.key
                      );

                    return (
                      <button
                        key={
                          day.key
                        }
                        type="button"
                        onClick={() =>
                          toggleDay(
                            day.key
                          )
                        }
                        className={`min-w-[58px] px-4 py-2.5 rounded-xl text-sm font-semibold border ${
                          selected
                            ? "bg-sky-600 text-white border-sky-600"
                            : "bg-white text-slate-600 border-slate-200 hover:border-sky-400 hover:bg-sky-50"
                        }`}
                      >
                        {
                          day.label
                        }
                      </button>
                    );
                  }
                )}

              </div>

              <ErrorText name="trainingDays" />
            </div>

            {/* COACH */}
            <div className="mt-6">

              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                COACH{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                name="coachId"
                value={
                  formData.coachId
                }
                onChange={
                  handleChange
                }
                disabled={
                  !formData.sportId ||
                  !formData.startDate ||
                  !formData.endDate ||
                  !formData.startHour ||
                  !formData.endHour ||
                  formData.trainingDays.length ===
                    0 ||
                  loadingCoaches
                }
                className={`w-full h-11 px-4 border rounded-xl text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400 ${
                  errors.coachId
                    ? "border-red-500"
                    : "border-slate-200"
                }`}
              >
                <option value="">
                  {loadingCoaches
                    ? "Finding available coaches..."
                    : !formData.sportId
                    ? "Select Sport First"
                    : !formData.startDate ||
                      !formData.endDate
                    ? "Select Dates First"
                    : !formData.startHour ||
                      !formData.endHour
                    ? "Select Time First"
                    : formData.trainingDays.length ===
                      0
                    ? "Select Training Days First"
                    : coaches.length ===
                      0
                    ? "No Coach Available"
                    : "Select Coach"}
                </option>

                {coaches.map(
                  (coach) => (
                    <option
                      key={
                        coach.id
                      }
                      value={
                        coach.id
                      }
                    >
                      {getCoachName(
                        coach
                      )}
                    </option>
                  )
                )}
              </select>

              <p className="mt-1.5 text-xs text-slate-400">
                Only available coaches for the selected sport, dates, days and time are shown.
              </p>

              <ErrorText name="coachId" />
            </div>

          </section>

          {/* ==================================================
              3. COURSE + FEES
              ================================================== */}
          <section className="border-t border-slate-100 p-6 md:p-8">

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">

              <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
                3
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  COURSE & FEES
                </h2>

                <p className="text-xs text-slate-400 mt-0.5">
                  Set course duration and batch fees
                </p>
              </div>

            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* COURSE DURATION */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  COURSE DURATION{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <div className="flex gap-2">

                  <input
                    type="text"
                    name="courseDuration"
                    value={
                      formData.courseDuration
                        ? `${formData.courseDuration} ${
                            formData.courseDurationUnit === "MONTHS"
                              ? Number(formData.courseDuration) === 1
                                ? "Month"
                                : "Months"
                              : formData.courseDurationUnit
                        }`
                        : ""
                    }
                    readOnly
                    placeholder="Select start and end dates"
                    className={`flex-1 h-11 px-4 border rounded-xl text-sm bg-slate-50 text-slate-700 cursor-not-allowed ${
                      errors.courseDuration
                        ? "border-red-500"
                        : "border-slate-200"
                    }`}
                  />

                  <div className="w-36 h-11 px-3 border border-slate-200 rounded-xl text-sm bg-slate-50 flex items-center justify-center text-slate-600">
                    Automatically
                  </div>

                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Automatically calculated from the selected start date and end date.
                </p>

                <ErrorText name="courseDuration" />
                <ErrorText name="courseDurationUnit" />
              </div>

              {/* FEE */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  FEE{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  inputMode="decimal"
                  name="fee"
                  value={
                    formData.fee
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. 5000"
                  className={`w-full h-11 px-4 border rounded-xl text-sm ${
                    errors.fee
                      ? "border-red-500"
                      : "border-slate-200"
                  }`}
                />

                <ErrorText name="fee" />
              </div>

              {/* DISCOUNT */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  DISCOUNT
                </label>

 
<div className="relative">
  <input
    type="text"
    inputMode="decimal"
    name="discount"
    value={formData.discount}
    onChange={handleChange}
    placeholder="0"
    className={`w-full h-11 px-4 pr-10 border rounded-xl text-sm ${
      errors.discount
        ? "border-red-500"
        : "border-slate-200"
    }`}
  />

  {formData.discount !== "" && (
    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-slate-900 pointer-events-none">
      %
    </span>
  )}
</div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Enter 0 if no discount is applicable.
                </p>

                <ErrorText name="discount" />
              </div>

            </div>

          </section>

          {/* ==================================================
              4. CAPACITY
              ================================================== */}
          <section className="border-t border-slate-100 p-6 md:p-8">

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">

              <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
                4
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  BATCH CAPACITY
                </h2>

                <p className="text-xs text-slate-400 mt-0.5">
                  Set the maximum number of players
                </p>
              </div>

            </div>

            <div className="mt-6 max-w-sm">

              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                MAXIMUM PLAYERS{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                inputMode="numeric"
                name="capacity"
                value={
                  formData.capacity
                }
                onChange={
                  handleChange
                }
                maxLength={3}
                placeholder="e.g. 25"
                className={`w-full h-11 px-4 border rounded-xl text-sm ${
                  errors.capacity
                    ? "border-red-500"
                    : "border-slate-200"
                }`}
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Minimum 1 player and maximum 500 players.
              </p>

              <ErrorText name="capacity" />

            </div>

          </section>

          {/* SUCCESS */}
          {successMessage && (
            <div className="mx-6 md:mx-8 mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
              {successMessage}
            </div>
          )}

          {/* BUTTONS */}
          <div className="border-t border-slate-100 px-6 md:px-8 py-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/batch-managmnet"
                )
              }
              disabled={
                loading
              }
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading
              }
              className="px-7 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />

                  {isEdit
                    ? "Updating Batch..."
                    : "Creating Batch..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 inline mr-2" />

                  {isEdit
                    ? "Update Batch"
                    : "Create Batch"}
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}