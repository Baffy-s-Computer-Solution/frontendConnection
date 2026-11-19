// frontend/src/pages/alumni/AlumniDonations.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FaArrowDown, FaArrowUp, FaAward, FaBookOpen, FaCalendarAlt, FaChartLine,
  FaCheckCircle, FaChevronLeft, FaChevronRight, FaClock, FaCreditCard,
  FaDonate, FaDownload, FaEnvelope, FaExclamationCircle, FaFileInvoiceDollar,
  FaFilter, FaGift, FaHandHoldingHeart, FaHeart, FaInfoCircle, FaMoneyBillWave,
  FaPrint, FaReceipt, FaRegClock, FaSearch, FaShieldAlt, FaSync, FaTimes,
  FaTimesCircle, FaTrophy, FaUniversity, FaUsers, FaWallet,
} from 'react-icons/fa';
import {
  AreaChart, Area, BarChart, Bar, CartesianGrid, Cell, Legend, Line,
  LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { alumniService } from '../../services/alumniService';
import { formatCurrency, formatDate } from '../../utils/formatters';

// ============================================================
// Environment
// ============================================================
const ENV = import.meta.env.VITE_APP_ENVIRONMENT || 'production';
const APP_NAME = import.meta.env.VITE_APP_NAME || 'Career Connect Lesotho';
const MAX_DONATION = 50000;
const MIN_DONATION = 1;
const safeLog = (...a) => { if (ENV !== 'production') console.debug('[Donations]', ...a); };
const safe = (v) => (v == null ? '' : String(v));

// ============================================================
// Static data
// ============================================================
const DONATION_TIERS = [
  { amount: 50, label: 'Supporter', color: '#94a3b8', benefits: ['Recognition on website', 'Monthly newsletter'] },
  { amount: 100, label: 'Friend', color: '#3b82f6', benefits: ['All Supporter benefits', 'Digital certificate', 'Social media shoutout'] },
  { amount: 250, label: 'Advocate', color: '#8b5cf6', benefits: ['All Friend benefits', 'Name in annual report', 'Invitation to exclusive events'] },
  { amount: 500, label: 'Champion', color: '#10b981', benefits: ['All Advocate benefits', 'Recognition plaque', 'Meet and greet with leadership'] },
  { amount: 1000, label: 'Leader', color: '#f59e0b', benefits: ['All Champion benefits', 'Named scholarship opportunity', 'Lifetime recognition'] },
  { amount: 5000, label: 'Visionary', color: '#ef4444', benefits: ['All Leader benefits', 'Custom impact report', 'Legacy society membership'] },
];

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit / Debit Card', icon: FaCreditCard, note: 'Visa, Mastercard, Amex' },
  { id: 'paypal', name: 'PayPal', icon: FaWallet, note: 'Secure third-party' },
  { id: 'bank', name: 'Bank Transfer', icon: FaUniversity, note: 'Manual clearance (1–3 days)' },
];

const DONATION_TYPES = [
  { id: 'one-time', name: 'One-time Donation', description: 'Make a single gift today', icon: FaGift },
  { id: 'monthly', name: 'Monthly Donation', description: 'Sustain impact with recurring monthly gifts', icon: FaCalendarAlt },
  { id: 'yearly', name: 'Yearly Donation', description: 'Annual commitment to support our mission', icon: FaAward },
];

const CAMPAIGNS = [
  { id: 'general', name: 'General Fund', description: 'Support overall operations and programs', color: '#3b82f6' },
  { id: 'scholarship', name: 'Scholarship Fund', description: 'Provide education opportunities for students', color: '#10b981' },
  { id: 'mentorship', name: 'Mentorship Program', description: 'Support mentorship initiatives', color: '#f59e0b' },
  { id: 'infrastructure', name: 'Infrastructure', description: 'Improve facilities and resources', color: '#8b5cf6' },
  { id: 'innovation', name: 'Innovation Lab', description: 'Fund research and innovation', color: '#ef4444' },
];

const PAYMENT_METHOD_ICON = {
  card: FaCreditCard, paypal: FaWallet, bank: FaUniversity,
};

// ============================================================
// Reusable primitives
// ============================================================
const StatCard = ({ icon: Icon, label, value, accent = 'text-brand-600', bg = 'bg-brand-100', trend, trendUp, sub }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
      </div>
      <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${bg}`}>
        <Icon className={`h-4 w-4 ${accent}`} />
      </span>
    </div>
    {trend !== undefined && (
      <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
        {trendUp ? <FaArrowUp /> : <FaArrowDown />}
        <span>{trend}</span>
        <span className="font-normal text-slate-400">vs last period</span>
      </div>
    )}
  </div>
);

const ProgressBar = ({ value, max, color = '#3b82f6', height = 8 }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={`w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800`} style={{ height }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
    <Icon className="mx-auto mb-3 h-10 w-10 text-slate-300" />
    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
    <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    {action}
  </div>
);

const SkeletonRow = () => (
  <tr>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <td key={i} className="px-3 py-3"><div className="h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" /></td>
    ))}
  </tr>
);

// ============================================================
// Donation form (used inside modal)
// ============================================================
const DonationForm = ({ onClose, onSubmitted }) => {
  const { addSuccessNotification, addErrorNotification } = useNotification();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    amount: '', customAmount: '', donationType: 'one-time',
    campaignId: 'general', paymentMethod: 'card', currency: 'USD',
    message: '', isAnonymous: false, taxReceipt: true,
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const steps = ['Amount', 'Campaign', 'Payment', 'Review'];
  const parsedAmount = parseFloat(form.amount) || 0;
  const impact = {
    students: Math.floor(parsedAmount / 100),
    scholarships: Math.floor(parsedAmount / 500),
    programs: Math.floor(parsedAmount / 1000),
    meals: Math.floor(parsedAmount / 10),
    books: Math.floor(parsedAmount / 25),
  };

  const setField = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((p) => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(parsedAmount) || parsedAmount < MIN_DONATION) e.amount = `Minimum ${MIN_DONATION} USD`;
    if (parsedAmount > MAX_DONATION) e.amount = `Maximum ${MAX_DONATION.toLocaleString()} USD — contact us for larger gifts`;
    if (!form.paymentMethod) e.paymentMethod = 'Select a payment method';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setProcessing(true);
    try {
      const res = await alumniService.createDonation({
        amount: parsedAmount, campaign: form.campaignId, campaignId: form.campaignId,
        donationType: form.donationType, paymentMethod: form.paymentMethod,
        currency: form.currency, message: form.message.slice(0, 500),
        isAnonymous: form.isAnonymous, taxReceipt: form.taxReceipt,
      });
      if (res?.success) {
        addSuccessNotification('Thank you', 'Your donation has been recorded.');
        onSubmitted?.();
        onClose?.();
      } else {
        addErrorNotification('Donation', res?.error || 'Donation failed');
      }
    } catch (e) {
      safeLog(e);
      addErrorNotification('Donation', 'Network error, please retry');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="donation-title">
      <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 id="donation-title" className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <FaDonate className="text-brand-600" /> Make a donation
          </h3>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-red-500" aria-label="Close"><FaTimes /></button>
        </div>

        <ol className="mb-4 flex gap-1 text-[11px] font-semibold">
          {steps.map((s, i) => (
            <li key={s} className={`flex-1 rounded-lg px-2 py-1.5 text-center ${i === step ? 'bg-brand-600 text-white' : i < step ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{i + 1}. {s}</li>
          ))}
        </ol>

        {step === 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Donation type</p>
            {DONATION_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} type="button" onClick={() => setField('donationType', t.id)} className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left ${form.donationType === t.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 dark:border-slate-700'}`}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700"><Icon className="h-3.5 w-3.5" /></span>
                  <div>
                    <p className="text-xs font-semibold">{t.name}</p>
                    <p className="text-[11px] text-slate-500">{t.description}</p>
                  </div>
                </button>
              );
            })}
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">Amount</p>
              <div className="mb-2 grid grid-cols-3 gap-2">
                {DONATION_TIERS.map((t) => (
                  <button key={t.amount} type="button" onClick={() => { setField('amount', String(t.amount)); setField('customAmount', ''); }} className={`rounded-lg border p-2 text-center ${form.amount === String(t.amount) ? 'border-brand-500 bg-brand-50' : 'border-slate-200 dark:border-slate-700'}`}>
                    <p className="text-sm font-bold">${t.amount}</p>
                    <p className="text-[10px] text-slate-500">{t.label}</p>
                  </button>
                ))}
              </div>
              <input type="number" min={MIN_DONATION} max={MAX_DONATION} value={form.customAmount} onChange={(e) => { setField('customAmount', e.target.value); setField('amount', e.target.value); }} placeholder={`Custom amount (${MIN_DONATION}–${MAX_DONATION.toLocaleString()})`} className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              {errors.amount && <p className="mt-1 text-[11px] text-red-600">{errors.amount}</p>}
            </div>
            {parsedAmount > 0 && (
              <div className="rounded-lg bg-emerald-50 p-3 text-[11px] text-emerald-800">
                <p className="font-semibold">Your donation of {formatCurrency(parsedAmount)} will:</p>
                <ul className="mt-1 list-inside list-disc">
                  <li>Support {impact.students} students</li>
                  <li>Provide {impact.scholarships} scholarships</li>
                  <li>Fund {impact.programs} programs</li>
                  <li>Provide {impact.meals} meals</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Choose campaign</p>
            {CAMPAIGNS.map((c) => (
              <button key={c.id} type="button" onClick={() => setField('campaignId', c.id)} className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left ${form.campaignId === c.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 dark:border-slate-700'}`}>
                <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                <div>
                  <p className="text-xs font-semibold">{c.name}</p>
                  <p className="text-[11px] text-slate-500">{c.description}</p>
                </div>
              </button>
            ))}
            <textarea value={form.message} onChange={(e) => setField('message', e.target.value.slice(0, 500))} rows={3} placeholder="Personal message (optional)…" className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={form.isAnonymous} onChange={(e) => setField('isAnonymous', e.target.checked)} /> Make this donation anonymous
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={form.taxReceipt} onChange={(e) => setField('taxReceipt', e.target.checked)} /> Email tax receipt
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Payment method</p>
            {PAYMENT_METHODS.map((p) => {
              const Icon = p.icon;
              return (
                <button key={p.id} type="button" onClick={() => setField('paymentMethod', p.id)} className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left ${form.paymentMethod === p.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 dark:border-slate-700'}`}>
                  <Icon className="text-brand-600" />
                  <div>
                    <p className="text-xs font-semibold">{p.name}</p>
                    <p className="text-[11px] text-slate-500">{p.note}</p>
                  </div>
                </button>
              );
            })}
            {errors.paymentMethod && <p className="text-[11px] text-red-600">{errors.paymentMethod}</p>}
            {form.paymentMethod === 'card' && (
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <p className="mb-2 text-[11px] text-slate-500">Card details — handled by PCI-compliant gateway</p>
                <input placeholder="Card number" className="mb-2 w-full rounded border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="MM/YY" className="rounded border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
                  <input placeholder="CVV" type="password" className="rounded border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
                </div>
              </div>
            )}
            <p className="flex items-center gap-1 rounded bg-slate-50 p-2 text-[11px] text-slate-500"><FaShieldAlt /> Payment data is never stored on our servers.</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2 rounded-lg border border-slate-200 p-4 text-xs dark:border-slate-700">
            <div className="flex justify-between"><span className="text-slate-500">Amount</span><strong>{formatCurrency(parsedAmount)}</strong></div>
            <div className="flex justify-between"><span className="text-slate-500">Type</span><span>{DONATION_TYPES.find((t) => t.id === form.donationType)?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Campaign</span><span>{CAMPAIGNS.find((c) => c.id === form.campaignId)?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Method</span><span>{PAYMENT_METHODS.find((p) => p.id === form.paymentMethod)?.name}</span></div>
            {form.message && <div className="rounded bg-slate-50 p-2 italic text-slate-600">"{form.message}"</div>}
            <p className="flex items-center gap-1 rounded bg-blue-50 p-2 text-[11px] text-blue-700"><FaReceipt /> Tax receipt will be emailed.</p>
          </div>
        )}

        <div className="mt-4 flex justify-between">
          <button onClick={() => (step > 0 ? setStep(step - 1) : onClose())} className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">{step === 0 ? 'Cancel' : 'Back'}</button>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)} disabled={step === 0 && parsedAmount < MIN_DONATION} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Continue</button>
          ) : (
            <button onClick={submit} disabled={processing} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{processing ? 'Processing…' : 'Complete donation'}</button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Main
// ============================================================
const AlumniDonations = () => {
  const { currentUser, userProfile } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalAmount: 0, totalCount: 0, averageAmount: 0,
    recognitionLevel: 'Start Your Journey', monthlySeries: [], campaignBreakdown: [],
  });

  const [tab, setTab] = useState(0); // 0 history | 1 impact | 2 campaigns | 3 receipts
  const [search, setSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [histRes, campRes] = await Promise.allSettled([
        alumniService.getDonationHistory?.(),
        alumniService.getDonationCampaigns?.(),
      ]);
      if (histRes.status === 'fulfilled' && histRes.value?.success) {
        const d = histRes.value.data || {};
        setHistory(Array.isArray(d.donations) ? d.donations : []);
        setStats((prev) => ({ ...prev, ...(d.summary || {}) }));
      }
      if (campRes.status === 'fulfilled' && campRes.value?.success) {
        setCampaigns(Array.isArray(campRes.value.data) ? campRes.value.data : CAMPAIGNS);
      } else {
        setCampaigns(CAMPAIGNS);
      }
    } catch (e) {
      safeLog(e);
      addErrorNotification('Donations', 'Failed to load donations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addErrorNotification]);

  useEffect(() => { load(); }, [load]);

  const refresh = () => { setRefreshing(true); load(); };

  const filtered = useMemo(() => {
    return history.filter((d) => {
      const q = search.trim().toLowerCase();
      if (q && !`${d.campaignName || ''} ${d.message || ''}`.toLowerCase().includes(q)) return false;
      if (campaignFilter && d.campaignId !== campaignFilter) return false;
      if (statusFilter && d.status !== statusFilter) return false;
      const date = d.createdAt?.toDate?.() || (d.createdAt ? new Date(d.createdAt) : null);
      if (fromDate && date && date < new Date(fromDate)) return false;
      if (toDate && date && date > new Date(toDate)) return false;
      return true;
    });
  }, [history, search, campaignFilter, statusFilter, fromDate, toDate]);

  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const chartData = useMemo(() => {
    return (stats.monthlySeries && stats.monthlySeries.length > 0) ? stats.monthlySeries : [
      { month: 'Jan', amount: 0 }, { month: 'Feb', amount: 0 }, { month: 'Mar', amount: 0 },
      { month: 'Apr', amount: 0 }, { month: 'May', amount: 0 }, { month: 'Jun', amount: 0 },
    ];
  }, [stats.monthlySeries]);

  const campaignChartData = useMemo(() => {
    const map = {};
    history.forEach((d) => {
      const k = d.campaignName || d.campaignId || 'Other';
      map[k] = (map[k] || 0) + (d.amount || 0);
    });
    return Object.entries(map).map(([name, value], i) => ({ name, value, fill: CAMPAIGNS[i % CAMPAIGNS.length]?.color || '#3b82f6' }));
  }, [history]);

  const getTier = () => {
    const total = stats.totalAmount || 0;
    for (let i = DONATION_TIERS.length - 1; i >= 0; i--) if (total >= DONATION_TIERS[i].amount) return DONATION_TIERS[i];
    return null;
  };
  const currentTier = getTier();

  const handleDownload = async (d) => {
    try {
      const res = await alumniService.downloadReceipt?.(d.id);
      if (res?.success && res.data?.url && /^https?:\/\//i.test(res.data.url)) {
        window.open(res.data.url, '_blank', 'noopener,noreferrer');
      } else {
        addSuccessNotification('Receipt', 'Receipt request submitted');
      }
    } catch {
      addErrorNotification('Receipt', 'Could not download receipt');
    }
  };

  const handleDelete = async (d) => {
    try {
      const res = await alumniService.deleteDonation?.(d.id);
      if (res?.success) {
        setHistory((prev) => prev.filter((x) => x.id !== d.id));
        setConfirmDelete(null);
        addSuccessNotification('Deleted', 'Donation record removed');
      }
    } catch {
      addErrorNotification('Delete', 'Could not remove record');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Alumni · Donations · {APP_NAME}</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Donations & impact</h1>
              <p className="mt-1 text-sm text-slate-500">Make a difference, track your giving, and see the impact of every dollar.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowDonationForm(true)} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"><FaDonate /> Donate now</button>
              <button onClick={refresh} disabled={refreshing} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"><FaSync className={refreshing ? 'animate-spin' : ''} /> Refresh</button>
            </div>
          </div>
        </header>

        {/* Stat grid */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total donated" value={formatCurrency(stats.totalAmount || 0)} icon={FaDonate} bg="bg-brand-100" accent="text-brand-600" sub="Lifetime giving" />
          <StatCard label="Total donations" value={stats.totalCount || 0} icon={FaReceipt} bg="bg-emerald-100" accent="text-emerald-600" sub={`Avg ${formatCurrency(stats.averageAmount || 0)}`} />
          <StatCard label="Recognition" value={currentTier?.label || 'Supporter'} icon={FaTrophy} bg="bg-amber-100" accent="text-amber-600" sub={`Next tier at ${formatCurrency((currentTier?.amount || 0) + 500)}`} />
          <StatCard label="Students impacted" value={Math.floor((stats.totalAmount || 0) / 100)} icon={FaBookOpen} bg="bg-violet-100" accent="text-violet-600" sub={`${Math.floor((stats.totalAmount || 0) / 500)} scholarships`} />
        </div>

        {/* Tabs */}
        <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {['History', 'Impact dashboard', 'Campaigns', 'Tax receipts'].map((t, i) => (
            <button key={t} onClick={() => setTab(i)} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${tab === i ? 'bg-brand-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{t}</button>
          ))}
        </div>

        {/* History tab */}
        {tab === 0 && (
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-2 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => { setSearch(e.target.value.slice(0, 100)); setPage(1); }} placeholder="Search donations…" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <button onClick={() => setShowFilters((v) => !v)} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700"><FaFilter /> Filters</button>
            </div>
            {showFilters && (
              <div className="grid gap-2 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
                <select value={campaignFilter} onChange={(e) => { setCampaignFilter(e.target.value); setPage(1); }} className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"><option value="">All campaigns</option>{CAMPAIGNS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"><option value="">All statuses</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option></select>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Campaign</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2">Method</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)
                  ) : paged.length === 0 ? (
                    <tr><td colSpan={6} className="px-3 py-10 text-center">
                      <EmptyState icon={FaHandHoldingHeart} title="No donations yet" subtitle="Make your first donation to start tracking impact." action={<button onClick={() => setShowDonationForm(true)} className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Donate now</button>} />
                    </td></tr>
                  ) : (
                    paged.map((d) => {
                      const Icon = PAYMENT_METHOD_ICON[d.paymentMethod] || FaCreditCard;
                      return (
                        <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                          <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{formatDate(d.createdAt?.toDate?.() || d.createdAt)}</td>
                          <td className="px-3 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold dark:bg-slate-800">{safe(d.campaignName || d.campaignId)}</span></td>
                          <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-slate-100">{formatCurrency(d.amount)}</td>
                          <td className="px-3 py-3"><span className="flex items-center gap-1 text-slate-600 dark:text-slate-300"><Icon /> {safe(d.paymentMethod)}</span></td>
                          <td className="px-3 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${d.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : d.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{safe(d.status || 'pending')}</span></td>
                          <td className="px-3 py-3 text-center">
                            <button onClick={() => setActiveReceipt(d)} className="mr-2 rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Receipt"><FaReceipt /></button>
                            <button onClick={() => handleDownload(d)} className="mr-2 rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Download"><FaDownload /></button>
                            <button onClick={() => setConfirmDelete(d)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label="Delete"><FaTimesCircle /></button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 p-3 text-xs dark:border-slate-800">
                <span className="text-slate-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded border p-1.5 disabled:opacity-50 dark:border-slate-700"><FaChevronLeft /></button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded border p-1.5 disabled:opacity-50 dark:border-slate-700"><FaChevronRight /></button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Impact tab */}
        {tab === 1 && (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">📈 Donations over time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="gradAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="url(#gradAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">🎯 Campaign breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={campaignChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {campaignChartData.map((c, i) => <Cell key={i} fill={c.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">🏆 Recognition journey</h3>
              {DONATION_TIERS.map((t) => {
                const achieved = (stats.totalAmount || 0) >= t.amount;
                return (
                  <div key={t.label} className="mb-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={achieved ? 'font-semibold text-emerald-700' : 'text-slate-500'}>
                        {achieved ? <FaCheckCircle className="inline text-emerald-500" /> : <FaAward className="inline" />} {t.label} (${t.amount.toLocaleString()})
                      </span>
                      <span className="text-slate-500">{Math.min(100, Math.round(((stats.totalAmount || 0) / t.amount) * 100))}%</span>
                    </div>
                    <ProgressBar value={stats.totalAmount || 0} max={t.amount} color={t.color} />
                  </div>
                );
              })}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">💡 Impact summary</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Students supported', val: Math.floor((stats.totalAmount || 0) / 100), bg: 'bg-blue-50 text-blue-700' },
                  { label: 'Scholarships', val: Math.floor((stats.totalAmount || 0) / 500), bg: 'bg-emerald-50 text-emerald-700' },
                  { label: 'Books purchased', val: Math.floor((stats.totalAmount || 0) / 25), bg: 'bg-amber-50 text-amber-700' },
                  { label: 'Meals provided', val: Math.floor((stats.totalAmount || 0) / 10), bg: 'bg-violet-50 text-violet-700' },
                  { label: 'Programs funded', val: Math.floor((stats.totalAmount || 0) / 1000), bg: 'bg-rose-50 text-rose-700' },
                  { label: 'Mentorships', val: Math.floor((stats.totalAmount || 0) / 750), bg: 'bg-sky-50 text-sky-700' },
                ].map((s) => (
                  <div key={s.label} className={`rounded-lg p-3 text-center ${s.bg}`}>
                    <p className="text-xl font-bold">{s.val}</p>
                    <p className="text-[11px]">{s.label}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Campaigns tab */}
        {tab === 2 && (
          <section className="grid gap-3 md:grid-cols-2">
            {(campaigns.length > 0 ? campaigns : CAMPAIGNS).map((c) => {
              const raised = (c.raisedAmount || 0);
              const goal = (c.goalAmount || 10000);
              return (
                <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{safe(c.name)}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{safe(c.description)}</p>
                    </div>
                    <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: c.color || '#3b82f6' }} />
                  </div>
                  <div className="mb-1 flex justify-between text-xs text-slate-500"><span>{formatCurrency(raised)} raised</span><span>{formatCurrency(goal)} goal</span></div>
                  <ProgressBar value={raised} max={goal} color={c.color || '#3b82f6'} />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500"><FaUsers className="inline" /> {c.donorCount || 0} donors</span>
                    <button onClick={() => setShowDonationForm(true)} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">Donate</button>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Receipts tab */}
        {tab === 3 && (
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tax receipts</h3>
              <p className="mt-1 text-xs text-slate-500">Download your tax receipts for the last 7 years.</p>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800">
                <tr><th className="px-3 py-2">Tax year</th><th className="px-3 py-2">Total donations</th><th className="px-3 py-2 text-center">Receipt</th></tr>
              </thead>
              <tbody>
                {[2024, 2023, 2022, 2021, 2020].map((year) => {
                  const totals = history.filter((d) => {
                    const date = d.createdAt?.toDate?.() || new Date(d.createdAt);
                    return date && date.getFullYear() === year;
                  }).reduce((s, d) => s + (d.amount || 0), 0);
                  return (
                    <tr key={year} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-3">{year}</td>
                      <td className="px-3 py-3">{formatCurrency(totals)}</td>
                      <td className="px-3 py-3 text-center">
                        <button disabled={totals === 0} onClick={() => addSuccessNotification('Receipt', `Generating ${year} receipt…`)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs disabled:opacity-40 dark:border-slate-700">Download PDF</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {/* Donation form modal */}
        {showDonationForm && <DonationForm onClose={() => setShowDonationForm(false)} onSubmitted={load} />}

        {/* Receipt modal */}
        {activeReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-semibold"><FaReceipt className="text-brand-600" /> Donation receipt</h3>
                <button onClick={() => setActiveReceipt(null)} className="text-slate-400 hover:text-red-500" aria-label="Close"><FaTimes /></button>
              </div>
              <dl className="space-y-1 text-xs">
                <div className="flex justify-between"><dt className="text-slate-500">Reference</dt><dd className="font-mono">{safe(activeReceipt.id)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Date</dt><dd>{formatDate(activeReceipt.createdAt?.toDate?.() || activeReceipt.createdAt)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Amount</dt><dd className="font-bold">{formatCurrency(activeReceipt.amount)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Campaign</dt><dd>{safe(activeReceipt.campaignName)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Method</dt><dd>{safe(activeReceipt.paymentMethod)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd>{safe(activeReceipt.status)}</dd></div>
              </dl>
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700"><FaPrint /> Print</button>
                <button onClick={() => handleDownload(activeReceipt)} className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white"><FaDownload /> Download</button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm delete modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Delete donation record?</h3>
              <p className="mt-1 text-xs text-slate-500">This removes the record from your history. Tax receipts remain available for compliance.</p>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AlumniDonations;