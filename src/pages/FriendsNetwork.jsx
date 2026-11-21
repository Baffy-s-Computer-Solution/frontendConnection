import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, Check, Clock3, Inbox, RefreshCw, Search, Send, SlidersHorizontal, UserMinus, UserPlus, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import socialPlatformService from '../services/socialPlatformService';
import { setCompanyFollow, subscribeToCompanyFollows } from '../services/studentServices';

const TABS = [
  { id: 'incoming', label: 'Requests', Icon: Inbox },
  { id: 'sent', label: 'Sent', Icon: Send },
  { id: 'friends', label: 'Friends', Icon: Users },
  { id: 'following', label: 'Following', Icon: Building2 },
  { id: 'discover', label: 'Discover', Icon: UserPlus },
];
const roleName = (value = 'member') => value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

function PersonAvatar({ person }) {
  const [failed, setFailed] = useState(false);
  const image = person.avatar || person.photoURL || person.profilePhoto || person.logo;
  if (image && !failed) return <img src={image} alt="" onError={() => setFailed(true)} className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-slate-900" />;
  const initials = String(person.name || 'Member').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 ring-2 ring-white dark:bg-indigo-500/20 dark:text-indigo-200 dark:ring-slate-900">{initials || 'M'}</span>;
}

export default function FriendsNetwork() {
  const { currentUser, userProfile } = useAuth();
  const uid = currentUser?.uid;
  const role = String(userProfile?.userType || userProfile?.role || currentUser?.userType || 'student').toLowerCase();
  const canFollowCompanies = ['student', 'mentor'].includes(role);
  const canAddFriends = ['student', 'mentor'].includes(role);
  const [tab, setTab] = useState('incoming');
  const [network, setNetwork] = useState({ incoming: [], outgoing: [], connections: [] });
  const [directory, setDirectory] = useState([]);
  const [followedCompanies, setFollowedCompanies] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const loadDirectory = useCallback(async () => {
    const result = await socialPlatformService.getNetworkDirectory(userProfile);
    if (!result.success) throw new Error(result.error || 'Could not load member profiles.');
    setDirectory(result.data || []);
  }, [userProfile]);

  useEffect(() => {
    if (!uid) return undefined;
    setLoading(true);
    setError('');
    const stop = socialPlatformService.subscribeToNetwork(uid, (data) => {
      setNetwork(data);
      setLoading(false);
    }, (subscriptionError) => {
      setError(subscriptionError?.code === 'permission-denied' ? 'Your account cannot read connection records. Check the social friend request and connection rules.' : subscriptionError?.message || 'Unable to load connection activity.');
      setLoading(false);
    });
    loadDirectory().catch((directoryError) => {
      setError(directoryError?.code === 'permission-denied' ? 'Your account cannot read discoverable member profiles.' : directoryError.message || 'Unable to load member profiles.');
      setLoading(false);
    });
    return stop;
  }, [uid, loadDirectory]);

  useEffect(() => {
    if (!uid || !canFollowCompanies) {
      setFollowedCompanies(new Set());
      return undefined;
    }
    return subscribeToCompanyFollows(uid, setFollowedCompanies, (subscriptionError) => {
      setError(subscriptionError?.message || 'Unable to load followed companies.');
    });
  }, [uid, canFollowCompanies]);

  const peopleById = useMemo(() => new Map(directory.map((person) => [person.id, person])), [directory]);
  const connectionPeople = useMemo(() => network.connections.map((connection) => {
    const personId = (connection.userIds || []).find((id) => id !== uid);
    return { connection, person: peopleById.get(personId) || { id: personId, name: 'Connected member', role: 'member' } };
  }), [network.connections, peopleById, uid]);
  const incomingIds = useMemo(() => new Set(network.incoming.map((request) => request.senderId)), [network.incoming]);
  const outgoingIds = useMemo(() => new Set(network.outgoing.map((request) => request.recipientId)), [network.outgoing]);
  const connectedIds = useMemo(() => new Set(connectionPeople.map(({ person }) => person.id)), [connectionPeople]);

  const currentItems = useMemo(() => {
    if (tab === 'incoming') return network.incoming.map((request) => ({ kind: 'request', id: request.id, request, person: { id: request.senderId, name: request.senderName || 'Community member', role: String(request.senderRole || 'member').toLowerCase(), avatar: request.senderAvatar || '' }, createdAt: request.createdAt }));
    if (tab === 'sent') return network.outgoing.map((request) => ({ kind: 'sent', id: request.id, request, person: { id: request.recipientId, name: request.recipientName || 'Community member', role: String(request.recipientRole || 'member').toLowerCase(), avatar: request.recipientAvatar || '' }, createdAt: request.createdAt }));
    if (tab === 'friends') return connectionPeople.map(({ connection, person }) => ({ kind: 'friend', id: connection.id, connection, person, createdAt: connection.createdAt }));
    if (tab === 'following') return [...followedCompanies].map((companyId) => ({
      kind: 'following',
      id: companyId,
      person: peopleById.get(companyId) || { id: companyId, name: 'Company', role: 'company' },
    }));
    return directory.filter((person) => person.role === 'company'
      ? !followedCompanies.has(person.id)
      : !connectedIds.has(person.id) && !incomingIds.has(person.id) && !outgoingIds.has(person.id))
      .map((person) => ({ kind: 'discover', id: person.id, person }));
  }, [tab, network.incoming, network.outgoing, connectionPeople, directory, peopleById, followedCompanies, connectedIds, incomingIds, outgoingIds]);

  const filteredItems = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return currentItems.filter(({ person }) => roleFilter === 'all' || person.role === roleFilter)
      .filter(({ person }) => !searchValue || `${person.name} ${person.role} ${person.headline || ''}`.toLowerCase().includes(searchValue))
      .sort((left, right) => {
        if (sortBy === 'name') return left.person.name.localeCompare(right.person.name);
        if (sortBy === 'role') return left.person.role.localeCompare(right.person.role) || left.person.name.localeCompare(right.person.name);
        const time = (item) => item.createdAt?.toMillis?.() ?? new Date(item.createdAt || 0).getTime();
        return time(right) - time(left);
      });
  }, [currentItems, roleFilter, search, sortBy]);

  const refresh = async () => {
    setRefreshing(true);
    setError('');
    try { await loadDirectory(); } catch (refreshError) { setError(refreshError.message || 'Unable to refresh the network.'); }
    finally { setRefreshing(false); }
  };
  const runAction = async (id, action, successMessage) => {
    setBusyId(id); setError(''); setNotice('');
    try { await action(); setNotice(successMessage); }
    catch (actionError) { setError(actionError.message || 'That connection action could not be completed.'); }
    finally { setBusyId(''); }
  };
  const respond = (item, status) => runAction(item.id, () => socialPlatformService.respondFriendRequest(item.request, status), status === 'accepted' ? 'Request accepted. You are now connected.' : 'Request declined.');
  const cancel = (item) => runAction(item.id, () => socialPlatformService.cancelFriendRequest(item.request), 'Sent request cancelled.');
  const remove = (item) => { if (window.confirm(`Remove ${item.person.name} from your friends?`)) runAction(item.id, () => socialPlatformService.removeConnection(item.connection), 'Connection removed.'); };
  const toggleCompanyFollow = (item) => runAction(item.id, async () => {
    const following = !followedCompanies.has(item.person.id);
    const result = await setCompanyFollow(uid, item.person.id, following, role);
    if (!result.success) throw new Error(result.error || 'Unable to update company follow.');
    setFollowedCompanies((current) => {
      const next = new Set(current);
      if (following) next.add(item.person.id);
      else next.delete(item.person.id);
      return next;
    });
  }, followedCompanies.has(item.person.id) ? 'Company unfollowed.' : 'Company followed.');
  const connect = (item) => runAction(item.id, async () => {
    const result = await socialPlatformService.sendFriendRequest(item.person, userProfile);
    if (result.alreadyConnected) throw new Error('You are already connected.');
    if (result.alreadyPending) throw new Error('A request is already pending.');
    if (result.incomingRequest) throw new Error('This person already sent you a request. Accept it in Requests.');
  }, 'Connection request sent.');

  const tabCount = (id) => id === 'incoming' ? network.incoming.length : id === 'sent' ? network.outgoing.length : id === 'friends' ? network.connections.length : id === 'following' ? followedCompanies.size : directory.filter((person) => person.role === 'company' ? !followedCompanies.has(person.id) : !connectedIds.has(person.id) && !incomingIds.has(person.id) && !outgoingIds.has(person.id)).length;
  const pageTitle = role === 'mentor' ? 'Your connections' : 'Friends';

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"><Users size={23} /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">Community</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{pageTitle}</h1><p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-400">Connect with students and mentors. Follow companies to keep up with their opportunities and updates.</p></div></div>
          <div className="flex items-center gap-2 self-end sm:self-auto"><span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{network.connections.length} connections · {followedCompanies.size} companies followed</span><button type="button" onClick={refresh} disabled={refreshing} aria-label="Refresh network" title="Refresh network" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"><RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} /></button></div>
        </header>
        {error && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}
        {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{notice}</div>}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-label="Connections, company follows and requests">
          <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 pt-2 dark:border-slate-800 sm:px-5" aria-label="Network sections">
            {TABS.map(({ id, label, Icon }) => <button type="button" key={id} onClick={() => setTab(id)} aria-pressed={tab === id} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition sm:px-4 ${tab === id ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300' : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}><Icon size={16} />{id === 'friends' && role === 'mentor' ? 'Connections' : label}<span className={`rounded-full px-2 py-0.5 text-xs ${tab === id ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{tabCount(id)}</span></button>)}
          </nav>
          <div className="grid gap-3 border-b border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-[minmax(0,1fr)_190px_180px] sm:p-5">
            <label className="relative block"><span className="sr-only">Search people</span><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or role" className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500" /></label>
            <label className="relative"><span className="sr-only">Filter by role</span><SlidersHorizontal size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"><option value="all">All roles</option><option value="student">Students</option><option value="mentor">Mentors</option><option value="company">Companies</option></select></label>
            <label className="relative"><span className="sr-only">Sort people</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"><option value="recent">Most recent</option><option value="name">Name A to Z</option><option value="role">Role</option></select></label>
          </div>
          <div className="p-3 sm:p-5">
            {loading ? <div className="flex min-h-52 items-center justify-center gap-3 text-sm text-slate-500"><RefreshCw size={18} className="animate-spin" />Loading your network...</div> : filteredItems.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center px-4 py-12 text-center"><span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"><Users size={24} /></span><h2 className="text-lg font-semibold text-slate-900 dark:text-white">{search || roleFilter !== 'all' ? 'No matching people' : tab === 'incoming' ? 'No friend requests' : tab === 'sent' ? 'No sent requests' : tab === 'friends' ? 'Your friends will appear here' : tab === 'following' ? 'No followed companies yet' : 'No people to discover right now'}</h2><p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{tab === 'incoming' ? 'New requests from students and mentors will show up here.' : tab === 'following' ? 'Companies you follow will appear here.' : tab === 'discover' ? 'Discover students and mentors to connect with, or follow companies.' : 'Use Discover to find people to connect with.'}</p>{tab !== 'discover' && <button type="button" onClick={() => setTab('discover')} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"><UserPlus size={16} />Discover people</button>}</div> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => {
                const pending = busyId === item.id;
                const isCompany = String(item.person.role || '').toLowerCase() === 'company';
                const isFollowing = followedCompanies.has(item.person.id);
                return <article key={item.id} className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800 sm:p-5">
                  <div className="flex min-w-0 items-center gap-3"><PersonAvatar person={item.person} /><div className="min-w-0 flex-1"><h2 className="truncate font-semibold text-slate-900 dark:text-white">{item.person.name}</h2><p className="mt-0.5 truncate text-xs capitalize text-slate-500 dark:text-slate-400">{roleName(item.person.role)}</p></div>{item.kind === 'request' && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">Request</span>}{item.kind === 'friend' && <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isCompany ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'}`}>{isCompany ? 'Legacy company link' : 'Friend'}</span>}{item.kind === 'following' && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">Following</span>}</div>
                  <p className="mt-3 min-h-10 text-sm leading-5 text-slate-600 dark:text-slate-300">{item.kind === 'request' && isCompany ? 'Company accounts are followed, not added as friends. Decline this old request.' : item.kind === 'sent' && isCompany ? 'Company accounts are followed, not added as friends. Cancel this old request.' : item.kind === 'friend' && isCompany ? 'This is an older company connection. Follow the company instead.' : item.kind === 'following' ? item.person.headline || 'Company you follow.' : item.kind === 'request' ? 'Would like to connect with you.' : item.kind === 'sent' ? 'Your connection request is waiting for a response.' : item.person.headline || (item.kind === 'friend' ? 'You are connected.' : 'Member of the Career Connect community.')}</p>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                    {item.kind === 'request' && <>{!isCompany && <button type="button" disabled={pending} onClick={() => respond(item, 'accepted')} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"><Check size={16} />Accept</button>}<button type="button" disabled={pending} onClick={() => respond(item, 'rejected')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><X size={16} />Decline</button></>}
                    {item.kind === 'sent' && <button type="button" disabled={pending} onClick={() => cancel(item)} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Clock3 size={16} />Cancel request</button>}
                    {item.kind === 'friend' && <>{isCompany && canFollowCompanies && !isFollowing && <button type="button" disabled={pending} onClick={() => toggleCompanyFollow(item)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"><Building2 size={16} />Follow company</button>}{isCompany && canFollowCompanies && isFollowing && <button type="button" disabled={pending} onClick={() => toggleCompanyFollow(item)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-300 px-3 text-sm font-semibold text-indigo-700 disabled:opacity-50 dark:border-indigo-800 dark:text-indigo-200"><Building2 size={16} />Unfollow company</button>}<button type="button" disabled={pending} onClick={() => remove(item)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-200"><UserMinus size={16} />{isCompany ? 'Remove old link' : 'Remove friend'}</button></>}
                    {(item.kind === 'following' || item.kind === 'discover' && isCompany) && canFollowCompanies && <button type="button" disabled={pending} onClick={() => toggleCompanyFollow(item)} className={`inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold disabled:opacity-50 ${isFollowing ? 'border border-indigo-300 text-indigo-700 dark:border-indigo-800 dark:text-indigo-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}><Building2 size={16} />{isFollowing ? 'Unfollow company' : 'Follow company'}</button>}
                    {item.kind === 'discover' && !isCompany && canAddFriends && <button type="button" disabled={pending} onClick={() => connect(item)} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"><UserPlus size={16} />Add friend</button>}
                  </div>
                </article>;
              })}
            </div>}
          </div>
        </section>
        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">Connection requests and friend lists are private to the signed-in account.</p>
      </div>
    </main>
  );
}
