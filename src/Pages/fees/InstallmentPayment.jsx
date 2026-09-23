import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  CheckCircle,
  CreditCard,
  Image as ImageIcon,
  Loader2,
  QrCode,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PaymentService from "../payment/PaymentService";

const InstallmentPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const enrollmentId = searchParams.get("enrollmentId");
  const installmentId = searchParams.get("installmentId");

  const fieldRefs = {
    paymentMethod: useRef(null),
    screenshot: useRef(null),
  };

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [installment, setInstallment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  // =========================================================
  // LOAD INSTALLMENT
  // =========================================================

  useEffect(() => {
    loadInstallment();
  }, [installmentId, enrollmentId]);

  const loadInstallment = async () => {
    try {
      setLoading(true);
      setGeneralError("");

      let response;

      if (installmentId) {
        response = await PaymentService.getByInstallment(
          installmentId
        );
      } else if (enrollmentId) {
        response = await PaymentService.getInstallments(
          enrollmentId
        );

        const list = response?.data || [];

        const pending = list.find(
          (item) => item.status === "PENDING"
        );

        setInstallment(pending || null);
        return;
      }

      const list = response?.data || [];

      if (Array.isArray(list)) {
        const pending = list.find(
          (item) =>
            item.status === "PENDING" ||
            String(item.id) === String(installmentId)
        );

        setInstallment(pending || list[0] || null);
      } else {
        setInstallment(response?.data || null);
      }
    } catch (error) {
      console.error("Installment loading error:", error);

      setGeneralError(
        error?.message ||
          "Unable to load installment details."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FIELD FOCUS
  // =========================================================

  const focusField = (fieldName) => {
    const ref = fieldRefs[fieldName];

    if (ref?.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      setTimeout(() => {
        ref.current.focus?.();
      }, 300);
    }
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validate = () => {
    const newErrors = {};

    if (!paymentMethod) {
      newErrors.paymentMethod =
        "Please select a payment method.";
    }

    if (paymentMethod === "UPI" && !screenshot) {
      newErrors.screenshot =
        "UPI payment screenshot is required.";
    }

    setErrors(newErrors);

    const firstError = Object.keys(newErrors)[0];

    if (firstError) {
      focusField(firstError);
      return false;
    }

    return true;
  };

  // =========================================================
  // PAYMENT METHOD
  // =========================================================

  const handlePaymentMethodChange = async (method) => {
    setPaymentMethod(method);

    setErrors((prev) => ({
      ...prev,
      paymentMethod: "",
      screenshot: "",
    }));

    setQrData(null);

    if (method === "UPI") {
      await generateQr();
    }
  };

  // =========================================================
  // GENERATE QR
  // =========================================================

  const generateQr = async () => {
    const amount = installment?.amount;

    if (!amount) {
      return;
    }

    try {
      setQrLoading(true);
      setGeneralError("");

      const response =
        await PaymentService.generateQr(amount);

      setQrData(response?.data || null);
    } catch (error) {
      console.error("QR generation error:", error);

      setGeneralError(
        error?.message ||
          "Unable to generate UPI QR."
      );
    } finally {
      setQrLoading(false);
    }
  };

  // =========================================================
  // SCREENSHOT UPLOAD
  // =========================================================

  const handleScreenshotChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Frontend validation
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        screenshot:
          "Please upload a valid image file.",
      }));

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        screenshot:
          "Screenshot size must be less than 5 MB.",
      }));

      event.target.value = "";
      return;
    }

    setScreenshot(file);

    setPreviewUrl(URL.createObjectURL(file));

    setErrors((prev) => ({
      ...prev,
      screenshot: "",
    }));
  };

  // =========================================================
  // REMOVE SCREENSHOT
  // =========================================================

  const removeScreenshot = () => {
    setScreenshot(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");

    if (fieldRefs.screenshot.current) {
      fieldRefs.screenshot.current.value = "";
    }
  };

  // =========================================================
  // SUBMIT PAYMENT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setGeneralError("");

    if (!validate()) {
      return;
    }

    if (!installment) {
      setGeneralError(
        "Installment details are not available."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payment = {
        playerId: installment.playerId,
        playerEnrollmentId:
          installment.playerEnrollmentId,
        installmentId: installment.id,
        amount: installment.amount,
        paymentMethod: paymentMethod,
      };

      const formData = new FormData();

      formData.append(
        "payment",
        JSON.stringify(payment)
      );

      if (paymentMethod === "UPI" && screenshot) {
        formData.append(
          "upiScreenshot",
          screenshot
        );
      }

      await PaymentService.create(formData);

      // Successful payment
      navigate(
        "/receptionist/payment-management",
        {
          state: {
            successMessage:
              "Installment payment created successfully.",
          },
        }
      );
    } catch (error) {
      console.error("Payment error:", error);

      const backend =
        error?.response?.data;

      const backendMessage =
        backend?.message ||
        error?.message ||
        "Payment failed.";

      setGeneralError(backendMessage);

      // Handle backend field validation if available
      const backendErrors =
        backend?.data;

      if (
        backendErrors &&
        typeof backendErrors === "object" &&
        !Array.isArray(backendErrors)
      ) {
        const mappedErrors = {};

        Object.entries(backendErrors).forEach(
          ([key, value]) => {
            const fieldMap = {
              paymentMethod: "paymentMethod",
              amount: "paymentMethod",
              installmentId: "paymentMethod",
              playerId: "paymentMethod",
              playerEnrollmentId:
                "paymentMethod",
            };

            const field =
              fieldMap[key] || key;

            mappedErrors[field] = value;
          }
        );

        setErrors(mappedErrors);

        const firstField =
          Object.keys(mappedErrors)[0];

        if (firstField) {
          focusField(firstField);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">
            Loading installment details...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // NO INSTALLMENT
  // =========================================================

  if (!installment) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />

          <h2 className="text-xl font-semibold text-gray-900">
            Installment Not Found
          </h2>

          <p className="text-gray-500 mt-2">
            No pending installment was found for this
            enrollment.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/receptionist/payment-management"
              )
            }
            className="mt-6 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            Back to Payments
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">

      {/* HEADER */}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Installment Payment
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Collect the pending installment payment
          </p>
        </div>
      </div>

      {/* GENERAL ERROR */}

      {generalError && (
        <div className="flex gap-3 items-start rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />

          <div>
            <p className="font-medium text-red-800">
              Payment Error
            </p>

            <p className="text-sm text-red-700 mt-1">
              {generalError}
            </p>
          </div>
        </div>
      )}

      {/* INSTALLMENT DETAILS */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Installment Details
          </h2>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          <div>
            <p className="text-xs text-gray-500">
              Player
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {installment.playerName || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Installment
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              #{installment.installmentNumber}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Due Date
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {installment.dueDate || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Status
            </p>

            <span className="inline-flex mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
              {installment.status || "PENDING"}
            </span>
          </div>

        </div>

        <div className="px-6 pb-6">
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-5 flex items-center justify-between">

            <div>
              <p className="text-sm text-blue-700">
                Installment Amount
              </p>

              <p className="text-3xl font-bold text-blue-900 mt-1">
                ₹
                {Number(
                  installment.amount || 0
                ).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <CreditCard className="w-10 h-10 text-blue-500" />
          </div>
        </div>
      </div>

      {/* PAYMENT FORM */}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm"
      >

        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Method
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Select how the installment was paid.
          </p>
        </div>

        <div className="p-6 space-y-6">

          {/* PAYMENT METHOD */}

          <div ref={fieldRefs.paymentMethod} tabIndex={-1}>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
              <span className="text-red-500 ml-1">
                *
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* CASH */}

              <button
                type="button"
                onClick={() =>
                  handlePaymentMethodChange("CASH")
                }
                className={`text-left p-5 rounded-xl border-2 transition ${
                  paymentMethod === "CASH"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-4">

                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      paymentMethod === "CASH"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Banknote className="w-6 h-6" />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      Cash
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Payment received in cash
                    </p>
                  </div>

                </div>
              </button>

              {/* UPI */}

              <button
                type="button"
                onClick={() =>
                  handlePaymentMethodChange("UPI")
                }
                className={`text-left p-5 rounded-xl border-2 transition ${
                  paymentMethod === "UPI"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-4">

                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      paymentMethod === "UPI"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <QrCode className="w-6 h-6" />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      UPI
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Pay using UPI QR
                    </p>
                  </div>

                </div>
              </button>

            </div>

            {errors.paymentMethod && (
              <p className="text-sm text-red-600 mt-2">
                {errors.paymentMethod}
              </p>
            )}
          </div>

          {/* UPI SECTION */}

          {paymentMethod === "UPI" && (
            <div className="space-y-6 border-t border-gray-100 pt-6">

              {/* QR */}

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">

                <div className="flex items-center justify-between mb-5">

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Scan & Pay
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Scan this QR code using any UPI app.
                    </p>
                  </div>

                  <QrCode className="w-6 h-6 text-blue-600" />
                </div>

                <div className="flex flex-col items-center">

                  {qrLoading ? (
                    <div className="w-56 h-56 bg-white rounded-xl flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : qrData?.qrCodeBase64 ? (
                    <img
                      src={`data:image/png;base64,${qrData.qrCodeBase64}`}
                      alt="UPI QR Code"
                      className="w-56 h-56 bg-white p-3 rounded-xl border border-gray-200"
                    />
                  ) : (
                    <div className="w-56 h-56 bg-white rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center">
                      <QrCode className="w-10 h-10 text-gray-300" />

                      <p className="text-sm text-gray-400 mt-2">
                        QR unavailable
                      </p>

                      <button
                        type="button"
                        onClick={generateQr}
                        className="mt-3 text-sm text-blue-600 font-medium"
                      >
                        Generate Again
                      </button>
                    </div>
                  )}

                  {qrData && (
                    <div className="text-center mt-4">

                      <p className="text-sm font-medium text-gray-800">
                        {qrData.payeeName}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        UPI: {qrData.upiId}
                      </p>

                      <p className="text-lg font-bold text-blue-700 mt-2">
                        ₹{qrData.amount}
                      </p>

                    </div>
                  )}

                </div>
              </div>

              {/* SCREENSHOT */}

           <div tabIndex={-1}>

                <label className="block text-sm font-medium text-gray-700 mb-3">
                  UPI Payment Screenshot
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                {!screenshot ? (
                  <label className="block cursor-pointer">

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                    
                      onChange={handleScreenshotChange}
                    />

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition">

                      <Upload className="w-8 h-8 mx-auto text-gray-400" />

                      <p className="font-medium text-gray-700 mt-3">
                        Upload payment screenshot
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG or JPEG — maximum 5 MB
                      </p>

                    </div>
                  </label>
                ) : (
                  <div className="border border-green-200 bg-green-50 rounded-xl p-4">

                    <div className="flex items-center gap-4">

                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Payment screenshot"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-white flex items-center justify-center">
                          <ImageIcon className="w-7 h-7 text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">

                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />

                          <p className="font-medium text-green-800">
                            Uploaded
                          </p>
                        </div>

                        <p className="text-sm text-gray-600 truncate mt-1">
                          {screenshot.name}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {(
                            screenshot.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={removeScreenshot}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100"
                        title="Remove file"
                      >
                        <X className="w-5 h-5" />
                      </button>

                    </div>
                  </div>
                )}

                {errors.screenshot && (
                  <p className="text-sm text-red-600 mt-2">
                    {errors.screenshot}
                  </p>
                )}

              </div>

            </div>
          )}

        </div>

        {/* ACTIONS */}

        <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">

          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Confirm Payment
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
};

export default InstallmentPayment;