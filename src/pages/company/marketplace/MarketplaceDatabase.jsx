import { useEffect, useMemo, useState } from 'react';
import { FaEdit, FaPlus, FaSearch, FaStore, FaTrash, FaTimes, FaBookmark, FaRegBookmark, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';

const categories = ['recruitment', 'assessment', 'training', 'compliance', 'payroll', 'consulting', 'technology', 'other'];
const emptyListing = { name: '', category: 'recruitment', description: '', price: '', priceType: 'quote', contactEmail: '' };
const dateText = (value) => value?.toDate ? value.toDate().toLocaleDateString() : '';

export default function MarketplaceDatabase() {
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();
  const companyId = userProfile?.companyId || currentUser?.uid;
  const companyRole = userProfile?.companyRole || userProfile?.teamRole || userProfile?.role;
  const canManageListings = ['company_admin', 'supervisor'].includes(companyRole);
  const [services, setServices] = useState([]);
  const [ownedListings, setOwnedListings] = useState([]);
  const [saved, setSaved] = useState(new Set());
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyListing);
  const [contacting, setContacting] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!companyId) { setLoading(false); return undefined; }
    let pending = 4;
    const done = () => { pending -= 1; if (pending <= 0) setLoading(false); };
    const fail = (label) => (err) => { console.error(`${label} subscription failed`, err); setError('Some marketplace data could not be loaded. Check your company access and Firestore indexes.'); done(); };
    const subscriptions = [
      onSnapshot(query(collection(db, 'marketplaceServices'), where('status', '==', 'published'), orderBy('createdAt', 'desc')), (snap) => { setServices(snap.docs.map((item) => ({ id: item.id, ...item.data() }))); done(); }, fail('Published marketplace listings')),
      onSnapshot(query(collection(db, 'marketplaceServices'), where('companyId', '==', companyId), orderBy('createdAt', 'desc')), (snap) => { setOwnedListings(snap.docs.map((item) => ({ id: item.id, ...item.data() }))); done(); }, fail('Company listings')),
      onSnapshot(query(collection(db, 'savedMarketplaceServices'), where('companyId', '==', companyId)), (snap) => { setSaved(new Set(snap.docs.map((item) => item.data().serviceId))); done(); }, fail('Saved marketplace listings')),
      onSnapshot(query(collection(db, 'marketplaceInquiries'), where('companyId', '==', companyId), orderBy('createdAt', 'desc')), (snap) => { setInquiries(snap.docs.map((item) => ({ id: item.id, ...item.data() }))); done(); }, fail('Company inquiries')),
    ];
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }, [companyId]);

  const visibleServices = useMemo(() => {
    const term = search.trim().toLowerCase();
    return services.filter((item) => !term || `${item.name} ${item.description} ${item.category} ${item.providerName}`.toLowerCase().includes(term));
  }, [services, search]);

  const openListingForm = (listing = null) => {
    setEditing(listing);
    setForm(listing ? { ...emptyListing, ...listing, price: listing.price ?? '' } : emptyListing);
    setActiveTab('listings');
  };

  const saveListing = async (event) => {
    event.preventDefault();
    if (!canManageListings || !companyId || !form.name.trim() || !form.description.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(), category: form.category, description: form.description.trim(),
      price: form.price === '' ? null : Number(form.price), priceType: form.priceType,
      contactEmail: form.contactEmail.trim() || currentUser.email || '',
      companyId, ownerId: currentUser.uid, providerName: userProfile?.companyName || userProfile?.displayName || currentUser.email,
      status: editing?.status || 'published', updatedAt: serverTimestamp(),
    };
    try {
      if (editing?.id) await updateDoc(doc(db, 'marketplaceServices', editing.id), payload);
      else await addDoc(collection(db, 'marketplaceServices'), { ...payload, createdAt: serverTimestamp() });
      showNotification('success', editing ? 'Listing updated.' : 'Listing published.');
      setEditing(null); setForm(emptyListing);
    } catch (err) {
      console.error('Marketplace listing save failed', err);
      showNotification('error', 'Unable to save this listing. Check Firestore permissions.');
    } finally { setSaving(false); }
  };

  const removeListing = async (listing) => {
    if (!canManageListings || listing.companyId !== companyId) return;
    try { await deleteDoc(doc(db, 'marketplaceServices', listing.id)); showNotification('success', 'Listing deleted.'); }
    catch (err) { console.error(err); showNotification('error', 'Unable to delete this listing.'); }
  };

  const toggleSaved = async (service) => {
    if (!companyId) return;
    const id = `${companyId}_${service.id}`;
    try {
      if (saved.has(service.id)) await deleteDoc(doc(db, 'savedMarketplaceServices', id));
      else await setDoc(doc(db, 'savedMarketplaceServices', id), { companyId, serviceId: service.id, savedAt: serverTimestamp() });
    } catch (err) { console.error(err); showNotification('error', 'Unable to update saved listings.'); }
  };

  const sendInquiry = async (event) => {
    event.preventDefault();
    if (!contacting || !message.trim() || !companyId) return;
    try {
      await addDoc(collection(db, 'marketplaceInquiries'), {
        companyId, companyName: userProfile?.companyName || userProfile?.displayName || '',
        providerId: contacting.companyId || contacting.ownerId, serviceId: contacting.id, serviceName: contacting.name,
        message: message.trim(), status: 'pending', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      showNotification('success', 'Inquiry sent.'); setContacting(null); setMessage('');
    } catch (err) { console.error(err); showNotification('error', 'Unable to send the inquiry.'); }
  };

  const updateInquiry = async (inquiry, changes) => {
    try { await updateDoc(doc(db, 'marketplaceInquiries', inquiry.id), { ...changes, updatedAt: serverTimestamp() }); }
    catch (err) { console.error(err); showNotification('error', 'Unable to update this inquiry.'); }
  };

  const deleteInquiry = async (inquiry) => {
    try { await deleteDoc(doc(db, 'marketplaceInquiries', inquiry.id)); showNotification('success', 'Inquiry deleted.'); }
    catch (err) { console.error(err); showNotification('error', 'Unable to delete this inquiry.'); }
  };

  return (
    <main className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-950 dark:text-blue-300"><FaStore /></span><div><p className="text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">Company workspace</p><h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Marketplace</h1><p className="text-sm text-slate-600 dark:text-slate-400">Browse published services, manage your listings, and follow inquiries.</p></div></div>
          {canManageListings && <button type="button" onClick={() => openListingForm()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"><FaPlus /> Add listing</button>}
        </header>
        <nav className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900" aria-label="Marketplace sections">
          {[['browse', 'Browse'], ['listings', `My listings (${ownedListings.length})`], ['inquiries', `My inquiries (${inquiries.length})`]].map(([key, label]) => <button key={key} type="button" onClick={() => setActiveTab(key)} className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium ${activeTab === key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{label}</button>)}
        </nav>
        {error && <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{error}</div>}
        {activeTab === 'browse' && <>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"><FaSearch className="text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" placeholder="Search published services" /></label>
          {loading ? <div className="flex justify-center p-12"><FaSpinner className="animate-spin text-blue-600" /></div> : visibleServices.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visibleServices.map((service) => <article key={service.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div><span className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">{service.category}</span><h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{service.name}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{service.providerName || 'Provider'}</p></div><button title={saved.has(service.id) ? 'Remove saved listing' : 'Save listing'} aria-label={saved.has(service.id) ? 'Remove saved listing' : 'Save listing'} onClick={() => toggleSaved(service)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">{saved.has(service.id) ? <FaBookmark /> : <FaRegBookmark />}</button></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{service.description}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800"><span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{service.price == null ? 'Contact for pricing' : `${service.currency || 'M'}${service.price}`} <small className="font-normal text-slate-500">{service.priceType}</small></span>{(service.companyId || service.ownerId) !== companyId && <button type="button" onClick={() => { setContacting(service); setMessage(''); }} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white"><FaPaperPlane /> Contact</button>}</div></article>)}</div> : <Empty title="No published services" body="There are no marketplace listings to show yet. Try again later or publish a listing from My listings." />}
        </>}
        {activeTab === 'listings' && <>
          {editing && canManageListings && <form onSubmit={saveListing} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"><h2 className="text-lg font-semibold text-slate-900 dark:text-white sm:col-span-2">{editing.id ? 'Edit listing' : 'Create listing'}</h2><input required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Service name" className={inputClass} /><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>{categories.map((item) => <option key={item}>{item}</option>)}</select><textarea required maxLength={3000} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the service" className={`${inputClass} sm:col-span-2`} /><input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (optional)" className={inputClass} /><select value={form.priceType} onChange={(e) => setForm({ ...form, priceType: e.target.value })} className={inputClass}><option value="quote">Quote</option><option value="one-time">One time</option><option value="per-candidate">Per candidate</option><option value="per-month">Per month</option></select><input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="Contact email (optional)" className={`${inputClass} sm:col-span-2`} /><div className="flex gap-2 sm:col-span-2"><button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : 'Publish listing'}</button><button type="button" onClick={() => { setEditing(null); setForm(emptyListing); }} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 dark:border-slate-700 dark:text-slate-200">Cancel</button></div></form>}
          {ownedListings.length ? <div className="space-y-3">{ownedListings.map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div><h3 className="font-semibold text-slate-900 dark:text-white">{item.name}</h3><p className="text-sm text-slate-500">{item.category} · {item.status} · Updated {dateText(item.updatedAt)}</p></div>{canManageListings && <div className="flex gap-2"><button type="button" onClick={() => openListingForm(item)} aria-label={`Edit ${item.name}`} title="Edit listing" className="rounded-lg border border-slate-300 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-200"><FaEdit /></button><button type="button" onClick={() => removeListing(item)} aria-label={`Delete ${item.name}`} title="Delete listing" className="rounded-lg border border-red-200 p-2 text-red-700 dark:border-red-900 dark:text-red-300"><FaTrash /></button></div>}</article>)}</div> : !editing && <Empty title="No listings yet" body="Create a listing to make your company service available in the marketplace." />}
        </>}
        {activeTab === 'inquiries' && (inquiries.length ? <div className="space-y-3">{inquiries.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-wrap justify-between gap-2"><div><h3 className="font-semibold text-slate-900 dark:text-white">{item.serviceName}</h3><span className="text-xs capitalize text-slate-500">{item.status} · {dateText(item.createdAt)}</span></div>{item.status === 'pending' && <div className="flex gap-2"><button type="button" onClick={() => updateInquiry(item, { status: 'cancelled' })} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">Cancel</button><button type="button" onClick={() => deleteInquiry(item)} aria-label="Delete inquiry" className="rounded-lg border border-red-200 p-2 text-red-700 dark:border-red-900 dark:text-red-300"><FaTrash /></button></div>}</div><p className="mt-3 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{item.message}</p></article>)}</div> : <Empty title="No inquiries" body="Inquiries you send to service providers will appear here." />)}
      </div>
      {contacting && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setContacting(null); }}><form onSubmit={sendInquiry} role="dialog" aria-modal="true" className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900"><div className="flex justify-between"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Contact {contacting.providerName || 'provider'}</h2><button type="button" onClick={() => setContacting(null)} aria-label="Close"><FaTimes /></button></div><p className="text-sm text-slate-500">{contacting.name}</p><textarea required minLength={5} maxLength={2000} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell the provider what you need" className={inputClass + ' w-full'} /><button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white">Send inquiry</button></form></div>}
    </main>
  );
}

const inputClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white';
function Empty({ title, body }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900"><FaStore className="mx-auto text-2xl text-slate-400" /><h2 className="mt-3 font-semibold text-slate-900 dark:text-white">{title}</h2><p className="mx-auto mt-1 max-w-xl text-sm text-slate-500 dark:text-slate-400">{body}</p></div>; }
