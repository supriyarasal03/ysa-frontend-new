import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, QrCode, Upload, Loader2, CreditCard, User, Trophy, Layers3, IndianRupee } from "lucide-react";
import PaymentService from "./PaymentService";

const money = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const getData = (response) => Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
const statusUpper = (v) => String(v || "").toUpperCase();

const PaymentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initial = location.state || {};

  const [enrollments, setEnrollments] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [form, setForm] = useState({ playerEnrollmentId: initial.playerEnrollmentId || "", installmentId: initial.installmentId || "", amount: initial.remainingAmount ?? "", paymentMethod: "" });
  const [qrData, setQrData] = useState(null);
  const [upiScreenshot, setUpiScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const refs = { enrollment: useRef(null), installment: useRef(null), amount: useRef(null), method: useRef(null), screenshot: useRef(null) };

  const focusField = (key) => setTimeout(() => refs[key]?.current?.focus?.(), 50);
  const clearErrors = () => { setFieldErrors({}); setFormError(""); };
  const setError = (key, message) => { setFieldErrors(prev => ({ ...prev, [key]: message })); focusField(key); };

  const extractBackendErrors = (error) => {
    const data = error?.response?.data;
    const map = data?.data;
    if (map && typeof map === "object" && !Array.isArray(map)) {
      const fieldMap = {};
      const aliases = { playerId: "enrollment", playerEnrollmentId: "enrollment", installmentId: "installment", amount: "amount", paymentMethod: "method", upiScreenshot: "screenshot" };
      Object.entries(map).forEach(([key, value]) => { const target = aliases[key] || key; fieldMap[target] = String(value); });
      if (Object.keys(fieldMap).length) return fieldMap;
    }
    return null;
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await PaymentService.getEnrollments();
        const list = getData(response);
        setEnrollments(list);
        if (initial.playerEnrollmentId) {
          const found = list.find(e => String(e.id) === String(initial.playerEnrollmentId));
          if (found) setSelectedEnrollment(found);
        }
      } catch (error) {
        setFormError(error?.response?.data?.message || "Unable to load enrollments.");
      } finally { setLoadingEnrollments(false); }
    })();
  }, []);



  useEffect(() => {
    if (!form.playerEnrollmentId) return;
    loadInstallments(form.playerEnrollmentId, initial.installmentId);
  }, [form.playerEnrollmentId]);



const loadInstallments = async (enrollmentId, preferredId = null) => {
  try {
    setLoading(true);
    setFieldErrors({});

    const response =
      await PaymentService.getInstallments(enrollmentId);

    const list = getData(response);

    setInstallments(list);

    // =====================================================
    // GET ONLY PENDING INSTALLMENTS
    // =====================================================

    const pending = list
      .filter(
        (i) =>
          statusUpper(i.status) === "PENDING"
      )
      .sort(
        (a, b) =>
          Number(a.installmentNumber) -
          Number(b.installmentNumber)
      );

    // =====================================================
    // ONLY NEXT INSTALLMENT IS ALLOWED
    // =====================================================

    const nextInstallment = pending[0];

    if (nextInstallment) {

      setForm((prev) => ({
        ...prev,
        installmentId: nextInstallment.id,
        amount: nextInstallment.amount,
      }));

    } else {

      const enrollment =
        selectedEnrollment ||
        enrollments.find(
          (e) =>
            String(e.id) ===
            String(enrollmentId)
        );

      if (
        enrollment &&
        !enrollment.paymentPlan?.includes(
          "INSTALLMENT"
        )
      ) {
        setForm((prev) => ({
          ...prev,
          installmentId: "",
          amount:
            prev.amount ||
            enrollment.finalAmount ||
            "",
        }));
      }
    }

  } catch (error) {

    setFormError(
      error?.response?.data?.message ||
      "Unable to load installments."
    );

  } finally {
    setLoading(false);
  }
};  




const handlePlayerChange = async (e) => {
  const playerId = e.target.value;

  clearErrors();
  setQrData(null);
  setUpiScreenshot(null);
  setInstallments([]);

  const enrollment = enrollments.find(
    (item) =>
      String(item.playerId) === String(playerId)
  );

  setSelectedEnrollment(enrollment || null);

  setForm({
    playerEnrollmentId: enrollment?.id || "",
    installmentId: "",
    amount: "",
    paymentMethod: "",
  });

  if (enrollment?.id) {
    await loadInstallments(enrollment.id);
  }
};




  const handleInstallmentChange = (e) => {
    const id = e.target.value;
    const item = installments.find(i => String(i.id) === String(id));
    setQrData(null); setUpiScreenshot(null);
    setForm(prev => ({ ...prev, installmentId: id, amount: item?.amount ?? "" }));
    setFieldErrors(prev => ({ ...prev, installment: "", amount: "" }));
  };

  const generateQr = async () => {
    if (!form.amount || Number(form.amount) <= 0) return setError("amount", "Payment amount must be greater than zero.");
    try {
      setLoading(true); setFormError("");
      const response = await PaymentService.generateQr(form.amount);
      if (!response?.success) throw new Error(response?.message || "QR generation failed.");
      setQrData(response.data);
    } catch (error) { setFormError(error?.response?.data?.message || error.message || "Unable to generate QR."); }
    finally { setLoading(false); }
  };

  const validate = () => {
    const errors = {};


   if (!form.playerEnrollmentId)
  errors.enrollment = "Player is required.";



    if (installments.length > 0 && !form.installmentId) errors.installment = "Please select an installment.";
    if (!form.amount || Number(form.amount) <= 0) errors.amount = "Payment amount must be greater than zero.";
    const selectedInstallment = installments.find(i => String(i.id) === String(form.installmentId));
    if (selectedInstallment && Number(form.amount) >
     Number(selectedInstallment.amount)) errors.amount = `Amount cannot exceed ${money(selectedInstallment.amount)}.`;
    if (!form.paymentMethod) errors.method = "Payment method is required.";
    if (form.paymentMethod === "UPI" && !upiScreenshot) errors.screenshot = "UPI payment screenshot is required.";
    setFieldErrors(errors);
    const first = Object.keys(errors)[0];
    if (first) focusField(first);
    return Object.keys(errors).length === 0;
  };



const handleSubmit = async (e) => {
  e.preventDefault();
  clearErrors();
  setSuccess("");

  if (!validate()) return;

  if (!selectedEnrollment?.playerId) {
    setFormError("Player information is missing from enrollment.");
    focusField("enrollment");
    return;
  }

  try {
    setLoading(true);
const payment = {
  playerId: Number(selectedEnrollment.playerId),
  playerEnrollmentId: Number(form.playerEnrollmentId),
  installmentId: form.installmentId
    ? Number(form.installmentId)
    : null,
  amount: Number(form.amount),
  paymentMethod: form.paymentMethod,

  // This is a normal installment payment,
  // not the initial registration payment.
  registrationPayment: false
};




    const data = new FormData();

    data.append(
      "payment",
      JSON.stringify(payment)
    );

    if (
      form.paymentMethod === "UPI" &&
      upiScreenshot
    ) {
      data.append(
        "upiScreenshot",
        upiScreenshot
      );
    }

    const response =
      await PaymentService.create(data);

    if (!response?.success) {
      throw new Error(
        response?.message ||
        "Payment creation failed."
      );
    }

    // ⭐ THIS IS THE IMPORTANT CHANGE
    // Works for both CASH and UPI

  if (
  response?.data?.id &&
  statusUpper(response?.data?.status) !== "RECEIVED"
) {
  await PaymentService.markAsReceived(
    response.data.id
  );
}




    setSuccess(
      "Payment received successfully."
    );

    setTimeout(() => {
      navigate("/receptionist/fees", {
        replace: true
      });
    }, 900);

  } catch (error) {
    const backendErrors =
      extractBackendErrors(error);

    if (backendErrors) {
      setFieldErrors(backendErrors);

      const first =
        Object.keys(backendErrors)[0];

      focusField(first);
    }

    setFormError(
      error?.response?.data?.message ||
      error.message ||
      "Failed to create payment."
    );

  } finally {
    setLoading(false);
  }
};






  return <div className="min-h-screen bg-[#f7f9fc] px-4 md:px-6 py-6 md:py-8">
    <div className="max-w-5xl mx-auto">
      <div className="mb-6"><h1 className="text-3xl font-bold text-[#10213f]">Collect Payment</h1><p className="mt-2 text-gray-500">Collect the next pending fee for a player enrollment.</p></div>
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-7">
          {(formError || success) && <div className={`rounded-xl px-4 py-3 text-sm border ${success ? 'border-emerald-200 bg-emerald-50 text-emerald-700':'border-red-200 bg-red-50 text-red-700'}`}>{success || formError}</div>}

          <section><SectionTitle icon={<User size={19}/>} title="Player & Enrollment" />



{selectedEnrollment && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl bg-blue-50 p-5">

    <Info
      label="Player"
      value={
        selectedEnrollment.playerName ||
        `Player #${selectedEnrollment.playerId}`
      }
      icon={<User size={16} />}
    />

    <Info
      label="Sport"
      value={selectedEnrollment.sportName || "-"}
      icon={<Trophy size={16} />}
    />

    <Info
      label="Batch"
      value={selectedEnrollment.batchName || "-"}
      icon={<Layers3 size={16} />}
    />

  </div>
)}









          </section>





<section>
  <SectionTitle
    icon={<CreditCard size={19} />}
    title="Payment Details"
  />

  {form.installmentId && (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Next Installment
      </label>

      <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5">
        {(() => {
          const installment = installments.find(
            (i) =>
              String(i.id) ===
              String(form.installmentId)
          );

          return installment ? (
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#10213f]">
                Installment {installment.installmentNumber}
              </span>

              <span className="font-semibold text-blue-600">
                ₹{money(installment.amount)}
              </span>
            </div>
          ) : (
            "-"
          );
        })()}
      </div>

      <p className="text-xs text-gray-400 mt-2">
        The next pending installment is selected automatically.
      </p>
    </div>
  )}

  <div className="mt-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Amount *
    </label>

    <div className="relative">
      <IndianRupee
        size={17}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        ref={refs.amount}
        type="number"
        min="0.01"
        step="0.01"
        value={form.amount}
        disabled={Boolean(form.installmentId)}
        onChange={(e) =>
          setForm((p) => ({
            ...p,
            amount: e.target.value,
          }))
        }
        className={`w-full rounded-xl border pl-10 pr-4 py-3.5 outline-none ${
          fieldErrors.amount
            ? "border-red-500"
            : "border-gray-200 focus:border-blue-500"
        }`}
      />
    </div>

    {fieldErrors.amount && (
      <FieldError>
        {fieldErrors.amount}
      </FieldError>
    )}

    <p className="text-xs text-gray-400 mt-2">
      For installments, the amount is automatically set to the installment amount.
    </p>
  </div>
</section>











          <section><SectionTitle icon={<CreditCard size={19}/>} title="Payment Method" />
            <div ref={refs.method} tabIndex={-1} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['CASH','UPI'].map(method => <button type="button" key={method} onClick={()=>{setForm(p=>({...p,paymentMethod:method}));setFieldErrors(p=>({...p,method:'',screenshot:''}));setQrData(null);setUpiScreenshot(null);}} className={`rounded-xl border-2 p-5 text-left transition ${form.paymentMethod===method?'border-blue-600 bg-blue-50':'border-gray-200 hover:border-gray-300'}`}><p className="font-bold text-[#10213f]">{method==='CASH'?'Cash':'UPI'}</p><p className="text-sm text-gray-500 mt-1">{method==='CASH'?'Receive payment at the counter.':'Generate QR and upload payment proof.'}</p></button>)}
            </div>{fieldErrors.method && <FieldError>{fieldErrors.method}</FieldError>}
          </section>



          {form.paymentMethod==='UPI' && <section className="rounded-2xl border border-purple-100 bg-purple-50 p-5"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><div className="flex items-center gap-2"><QrCode className="text-purple-600" size={20}/><h3 className="font-bold">UPI Payment</h3></div><p className="text-sm text-gray-500 mt-1">Generate a QR for ₹{money(form.amount)}.</p></div><button type="button" onClick={generateQr} disabled={loading || !form.amount} className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50">{loading?'Generating...':'Generate QR'}</button></div>
            {qrData?.qrCodeBase64 && <div className="mt-5 bg-white rounded-2xl p-5 text-center"><img src={`data:image/png;base64,${qrData.qrCodeBase64}`} alt="UPI QR" className="w-64 h-64 mx-auto"/><p className="font-bold text-xl mt-3">₹{qrData.amount}</p><p className="text-sm text-gray-600">{qrData.payeeName}</p><p className="text-xs text-gray-500">{qrData.upiId}</p><label className={`mt-5 flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer ${fieldErrors.screenshot?'border-red-400 bg-red-50':'border-purple-200'}`}><Upload className="text-purple-600" size={20}/><span className="text-sm">{upiScreenshot ? upiScreenshot.name : 'Upload payment screenshot *'}</span><input ref={refs.screenshot} type="file" accept="image/*" className="hidden" onChange={e=>{setUpiScreenshot(e.target.files?.[0]||null);setFieldErrors(p=>({...p,screenshot:''}));}}/></label>{fieldErrors.screenshot && <FieldError>{fieldErrors.screenshot}</FieldError>}</div>}
          </section>}




        </div>
        <div className="px-6 md:px-8 py-5 bg-gray-50 border-t flex flex-col-reverse sm:flex-row justify-end gap-3"><button type="button" onClick={()=>navigate('/receptionist/fees')} className="px-6 py-3 border border-gray-200 bg-white rounded-xl font-semibold text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">{loading?<><Loader2 size={18} className="animate-spin"/> Processing...</>:<><CheckCircle2 size={18}/> Collect Payment</>}</button></div>
      </form>
    </div>
  </div>;
};

const SectionTitle=({icon,title})=><div className="flex items-center gap-2 mb-4 text-[#10213f]"><div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">{icon}</div><h2 className="text-lg font-bold">{title}</h2></div>;
const FieldError=({children})=><p className="mt-1.5 text-sm text-red-600">{children}</p>;
const Info=({label,value,icon})=><div><div className="flex items-center gap-2 text-sm text-gray-500">{icon}{label}</div><p className="font-semibold text-[#10213f] mt-1">{value}</p></div>;
export default PaymentForm;
