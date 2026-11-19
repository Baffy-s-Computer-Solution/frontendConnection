import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';

const PageShell = ({ title, subtitle, actions, children, loading, error }) => (
  <div className="min-h-screen bg-slate-50">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/parent/dashboard" className="hover:text-sky-700">Parent</Link>
            <span>/</span>
            <span className="font-medium text-slate-700">{title}</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </header>
      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, idx) => <div key={idx} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div> : children}
    </div>
  </div>
);

const Btn = ({ children, variant = 'primary', size = 'md', onClick, type = 'button', disabled, loading, className = '' }) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' };
  const variants = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  };

  return (
    <button type={type} disabled={disabled || loading} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm16 0a8 8 0 01-8 8v4c6.627 0 12-5.373 12-12h-4z" fill="currentColor" className="opacity-75" />
        </svg>
      ) : null}
      {children}
    </button>
  );
};

const Card = ({ title, subtitle, action, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    {(title || action) && (
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </header>
    )}
    <div className="p-5">{children}</div>
  </section>
);

const syncSupabase = async (table, payload, id) => {
  if (!supabase) return;
  try {
    if (id) {
      const { error } = await supabase.from(table).upsert({ id, ...payload });
      if (error) throw error;
    } else {
      const { error } = await supabase.from(table).insert(payload);
      if (error) throw error;
    }
  } catch (error) {
    console.warn(`[supabase:${table}]`, error.message);
  }
};

const ParentRewards = () => {
  const { user, profile } = useAuth();
  const parentId = user?.uid ?? profile?.uid;
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ title: '', points: 100, tier: 'family', description: '' });

  useEffect(() => {
    if (!parentId) return;
    const q = query(collection(db, 'parent_rewards'), where('parentId', '==', parentId), orderBy('points', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => setRewards(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))),
      (e) => setError(e.message)
    );
    setLoading(false);
    return () => unsubscribe();
  }, [parentId]);

  const totalPoints = rewards.reduce((sum, item) => sum + Number(item.points || 0), 0);
  const tier = totalPoints >= 500 ? 'Gold' : totalPoints >= 250 ? 'Silver' : 'Bronze';

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 2600);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, parentId };
      const ref = await addDoc(collection(db, 'parent_rewards'), { ...payload, createdAt: serverTimestamp() });
      await syncSupabase('parent_rewards', payload, ref.id);
      setForm({ title: '', points: 100, tier: 'family', description: '' });
      showToast('Reward added');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'parent_rewards', id));
      await supabase?.from('parent_rewards').delete().eq('id', id);
      showToast('Reward removed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <PageShell title="Rewards & Recognition" subtitle="Celebrate family learning wins, school habits, and positive engagement." loading={loading} error={error} actions={<Btn onClick={handleSave}>Add reward</Btn>}>
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${toast.tone === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Family points</p><p className="mt-2 text-3xl font-bold text-slate-900">{totalPoints}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.2em] text-sky-600">Tier</p><p className="mt-2 text-3xl font-bold text-sky-900">{tier}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Badges</p><p className="mt-2 text-3xl font-bold text-emerald-900">{rewards.length}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.2em] text-violet-600">Next reward</p><p className="mt-2 text-3xl font-bold text-violet-900">{Math.max(0, 500 - totalPoints)}</p></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Recognition center" subtitle="Positive family achievement stream">
          <div className="space-y-3">
            {rewards.length === 0 ? <p className="text-sm text-slate-500">No rewards recorded yet.</p> : rewards.map((reward) => (
              <div key={reward.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{reward.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{reward.tier} • {reward.points} points</p>
                  </div>
                  <Btn size="sm" variant="danger" onClick={() => handleDelete(reward.id)}>Delete</Btn>
                </div>
                {reward.description && <p className="mt-2 text-sm text-slate-600">{reward.description}</p>}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Add reward" subtitle="Create a family encouragement item">
          <div className="space-y-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Reward title" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
            <input value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} type="number" placeholder="Points" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
              <option value="family">Family</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Reward details or encouragement message" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
            <Btn className="w-full" onClick={handleSave}>Save reward</Btn>
          </div>
        </Card>
      </div>
    </PageShell>
  );
};

export default ParentRewards;
