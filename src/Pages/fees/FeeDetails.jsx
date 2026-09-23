import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, RefreshCw, Eye, CreditCard, Users, CheckCircle2,
  Clock3, ChevronDown, X, IndianRupee, CalendarDays, Layers3, Trophy
} from "lucide-react";
import enrollmentService from "./enrollmentService";
import PaymentService from "../payment/PaymentService";

const getData = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const normalizeStatus = (value) => String(value || "").toUpperCase();
const isSuccessfulPayment = (payment) =>
  ["RECEIVED", "COMPLETED", "SUCCESS", "PAID"].includes(normalizeStatus(payment?.status));

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(Number(value || 0));

const FeeDetails = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState({});
  const [installments, setInstallments] = useState({});
  const [selectedSport, setSelectedSport] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  const loadFees = useCallback(async () => {
    try {
      setLoading(true);
      const enrollmentData = getData(await enrollmentService.getAll());
      setEnrollments(enrollmentData);

      const paymentMap = {};
      const installmentMap = {};
      await Promise.all(enrollmentData.map(async (enrollment) => {
        const id = enrollment.id;
        try { paymentMap[id] = getData(await PaymentService.getByEnrollment(id)); }
        catch { paymentMap[id] = []; }
        try { installmentMap[id] = getData(await PaymentService.getInstallments(id)); }
        catch { installmentMap[id] = []; }
      }));
      setPayments(paymentMap);
      setInstallments(installmentMap);
    } catch (error) {
      console.error("Failed to load fee details:", error);
      setEnrollments([]);
      setPayments({});
      setInstallments({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadFees(); }, [loadFees]);

  const sports = useMemo(() => {
    const map = new Map();
    enrollments.forEach((e) => {
      if (e.sportId && e.sportName) map.set(e.sportId, e.sportName);
    });
    return [...map].map(([id, name]) => ({ id, name }));
  }, [enrollments]);

  const getFeeInfo = useCallback((enrollment) => {
    const paid = (payments[enrollment.id] || [])
      .filter(isSuccessfulPayment)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const total = Number(enrollment.finalAmount || 0);
    const remaining = Math.max(total - paid, 0);
    const list = installments[enrollment.id] || [];

    const pending = list.filter((i) => normalizeStatus(i.status) === "PENDING");
    return { total, paid, remaining, list, pending, status: remaining <= 0 ? "COMPLETED" : "PENDING" };
  }, [payments, installments]);

  const filtered = useMemo(() => enrollments.filter((e) => {
    const info = getFeeInfo(e);
    const q = search.trim().toLowerCase();
    const text = `${e.playerName || ""} ${e.sportName || ""} ${e.batchName || ""}`.toLowerCase();
    return (!q || text.includes(q)) &&
      (selectedSport === "ALL" || String(e.sportId) === String(selectedSport)) &&
      (selectedStatus === "ALL" || info.status === selectedStatus);
  }), [enrollments, search, selectedSport, selectedStatus, getFeeInfo]);

  const openPayment = (enrollment) => {
    const info = getFeeInfo(enrollment);
    const next = info.pending[0];
    navigate("/receptionist/payment-form", {
      state: {
        playerId: enrollment.playerId,
        playerName: enrollment.playerName,
        playerEnrollmentId: enrollment.id,
        enrollmentId: enrollment.id,
        sportId: enrollment.sportId,
        sportName: enrollment.sportName,
        batchId: enrollment.batchId,
        batchName: enrollment.batchName,
        finalAmount: info.total,
        paidAmount: info.paid,
        remainingAmount: next ? Number(next.amount || 0) : info.remaining,
        installmentId: next?.id || null,
        installmentNumber: next?.installmentNumber || null,
      },
    });
  };

  if (loading) return (
    <div className="min-h-[500px] flex items-center justify-center text-gray-600">
      <RefreshCw className="animate-spin mr-3" size={22} /> Loading fee details...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f9fc] px-4 md:px-6 py-6 md:py-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold text-[#10213f]">Fees Collection</h1>
          <p className="mt-2 text-gray-500">View player fees, payment status and remaining installments.</p>
        </div>
        <button type="button" onClick={async () => { setRefreshing(true); await loadFees(); }} disabled={refreshing}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-[#10213f] hover:bg-gray-50">
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Filter label="Sport">
            <Select value={selectedSport} onChange={setSelectedSport}>
              <option value="ALL">All Sports</option>
              {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Filter>
          <Filter label="Search Player">
            <div className="relative"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search player, sport or batch..."
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
            </div>
          </Filter>
          <Filter label="Payment Status">
            <Select value={selectedStatus} onChange={setSelectedStatus}>
              <option value="ALL">All Status</option><option value="PENDING">Pending</option><option value="COMPLETED">Completed</option>
            </Select>
          </Filter>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <Summary title="Players" value={filtered.length} icon={<Users size={23} />} cls="text-blue-600 bg-blue-50" />
        <Summary title="Pending Fees" value={filtered.filter(e => getFeeInfo(e).status === "PENDING").length} icon={<Clock3 size={23} />} cls="text-orange-500 bg-orange-50" />
        <Summary title="Completed Fees" value={filtered.filter(e => getFeeInfo(e).status === "COMPLETED").length} icon={<CheckCircle2 size={23} />} cls="text-green-600 bg-green-50" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#10213f]">Player Fee Details</h2>
          <p className="text-sm text-gray-500 mt-1">Use View for complete information or Pay Remaining to collect the next due amount.</p>
        </div>
        {filtered.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-[#f8fafc]"><tr>
                {['Player','Sport','Batch','Payment Status','Remaining Fee','Remaining Installments','Actions'].map((h,i)=><th key={h} className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i===6?'text-right':''}`}>{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((e) => {
                  const info = getFeeInfo(e);
                  return <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-5"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">{(e.playerName || 'P').charAt(0).toUpperCase()}</div><div><p className="font-semibold text-[#10213f]">{e.playerName || 'Unknown Player'}</p><p className="text-xs text-gray-400 mt-1">Enrollment #{e.id}</p></div></div></td>
                    <td className="px-6 py-5"><span className="flex items-center gap-2"><Trophy size={17} className="text-blue-500" />{e.sportName || '-'}</span></td>
                    <td className="px-6 py-5"><span className="flex items-center gap-2"><Layers3 size={17} className="text-gray-400" />{e.batchName || '-'}</span></td>
                    <td className="px-6 py-5">{info.status === 'COMPLETED' ? <Badge green icon={<CheckCircle2 size={15}/>}>Completed</Badge> : <Badge icon={<Clock3 size={15}/>}>Pending</Badge>}</td>
                   
                   
                   
                   
                   
                    <td className="px-6 py-5"><p className={`font-bold ${info.remaining > 0 ? 'text-orange-600':'text-green-600'}`}>{formatCurrency(info.remaining)}</p><p className="text-xs text-gray-400 mt-1">Total {formatCurrency(info.total)}</p></td>
                  
                  
                  
                  <td className="px-6 py-5">
  {normalizeStatus(e.paymentPlan) === "ONE_TIME" ? (
    <span className="text-gray-400">One Time</span>
  ) : info.pending.length === 0 ? (
    <span className="text-green-600 font-medium">
      All Paid
    </span>
  ) : (
    <span className="font-semibold text-[#10213f]">
      {info.pending.length} remaining
    </span>
  )}
</td>
                
                
                    <td className="px-6 py-5"><div className="flex justify-end items-center gap-2">
                      <button type="button" title="View complete details" onClick={() => setSelectedEnrollment(e)} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:text-blue-600 hover:bg-blue-50"><Eye size={18}/></button>
                      {info.remaining > 0 && <button type="button" onClick={() => openPayment(e)} className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">{info.list.length ? 'Pay Installment' : 'Pay Remaining'}</button>}
                    </div></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedEnrollment && <FeeModal enrollment={selectedEnrollment} info={getFeeInfo(selectedEnrollment)} onClose={() => setSelectedEnrollment(null)} onPay={() => openPayment(selectedEnrollment)} />}
    </div>
  );
};

const Filter = ({label,children}) => <div><label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>{children}</div>;
const Select = ({value,onChange,children}) => <div className="relative"><select value={value} onChange={e=>onChange(e.target.value)} className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3.5 pr-10 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white">{children}</select><ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"/></div>;
const Summary = ({title,value,icon,cls}) => <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-center justify-between"><div><p className="text-gray-500 text-sm">{title}</p><p className="text-2xl font-bold text-[#10213f] mt-2">{value}</p></div><div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cls}`}>{icon}</div></div>;
const Badge = ({children,icon,green=false}) => <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${green?'bg-green-50 text-green-700':'bg-orange-50 text-orange-700'}`}>{icon}{children}</span>;
const Empty = () => <div className="py-20 text-center"><CreditCard size={42} className="mx-auto text-gray-300"/><h3 className="mt-4 text-lg font-semibold text-gray-700">No fee records found</h3><p className="text-gray-400 mt-1">Try changing your search or filters.</p></div>;

const FeeModal = ({enrollment,info,onClose,onPay}) => <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
  <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden">
    <div className="flex items-center justify-between px-6 py-5 border-b"><div><h2 className="text-xl font-bold text-[#10213f]">Player Fee Details</h2><p className="text-sm text-gray-500 mt-1">Enrollment and payment information</p></div><button type="button" onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center"><X size={20}/></button></div>
    <div className="p-6 overflow-y-auto max-h-[calc(90vh-90px)]">
      
      
      
      <div className="bg-blue-50 rounded-2xl p-5 mb-6 flex items-center gap-4"><div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">{(enrollment.playerName||'P').charAt(0).toUpperCase()}</div><div><h3 className="text-xl font-bold text-[#10213f]">{enrollment.playerName}</h3><p className="text-gray-600 mt-1">{enrollment.sportName||'-'} • {enrollment.batchName||'-'}</p></div></div>
      
      
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Box label="Total Fee" value={formatCurrency(info.total)}/>
        <Box label="Paid" value={formatCurrency(info.paid)} cls="text-green-600"/>
        <Box label="Remaining" value={formatCurrency(info.remaining)} cls="text-orange-600"/>
      <Box
  label="Plan"
  value={
    normalizeStatus(enrollment.paymentPlan) ===
    "ONE_TIME"
      ? "One Time"
      : `${info.pending.length} Remaining`
  }
/>     </div>
      
      
      
      <div className="border rounded-2xl p-5 mb-6"><h3 className="font-bold text-[#10213f] mb-4">Enrollment Information</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-5"><Info label="Sport" value={enrollment.sportName}/><Info label="Batch" value={enrollment.batchName}/><Info label="Enrollment Date" value={enrollment.enrollmentDate}/><Info label="Payment Plan" value={enrollment.paymentPlan}/><Info label="Fee Structure" value={`#${enrollment.feeStructureId||'-'}`}/><Info label="Duration" value={enrollment.duration ? `${enrollment.duration} ${enrollment.durationUnit||''}` : '-'}/></div></div>
      {info.list.length>0 && <div className="border rounded-2xl overflow-hidden"><div className="px-5 py-4 bg-gray-50 border-b font-bold text-[#10213f]">Installment Details</div><div className="divide-y">{info.list.map(i=><div key={i.id} className="px-5 py-4 flex items-center justify-between"><div><p className="font-semibold">Installment {i.installmentNumber}</p><p className="text-sm text-gray-500 mt-1">Due: {i.dueDate||'-'} {i.paidDate ? `• Paid: ${i.paidDate}` : ''}</p></div><div className="text-right"><p className="font-bold">{formatCurrency(i.amount)}</p><p className={`text-sm font-medium ${normalizeStatus(i.status)==='PAID'?'text-green-600':'text-orange-600'}`}>{normalizeStatus(i.status)==='PAID'?'Paid':'Pending'}</p></div></div>)}</div></div>}
    
    
      {info.remaining > 0 && <div className="mt-6 flex justify-end">
        <button type="button" onClick={onPay}
         className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">
          <CreditCard size={18} className="inline mr-2"/> 
         {normalizeStatus(enrollment.paymentPlan) ===
"THREE_INSTALLMENTS"
  ? "Pay Installment"
  : "Pay Remaining"}
          
          </button>   </div>}


    </div>
  </div>
</div>;
const Box=({label,value,cls='text-[#10213f]'})=><div className="border rounded-xl p-4"><p className="text-sm text-gray-500">{label}</p><p className={`text-lg font-bold mt-2 ${cls}`}>{value}</p></div>;
const Info=({label,value})=><div><p className="text-xs uppercase tracking-wide text-gray-400">{label}</p><p className="font-semibold text-gray-800 mt-2">{value||'-'}</p></div>;
export default FeeDetails;
