import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCompass,
  FiHeart,
  FiImage,
  FiMessageCircle,
  FiRefreshCw,
  FiRepeat,
  FiSend,
  FiTrendingUp,
  FiUsers,
  FiUserPlus,
  FiCheck,
  FiX,
  FiFlag,
  FiSlash,
} from 'react-icons/fi';

import { useAuth } from '../../context/AuthContext';
import socialPlatformService from '../../services/socialPlatformService';

const formatTimeAgo = (value) => {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

const initialsFor = (name) =>
  (name || 'CC')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const AvatarImage = ({ src, alt, size = 'normal' }) => {
  const [hasError, setHasError] = useState(false);
  const imageSrc = src || '';

  if (!imageSrc || hasError) {
    return <div className={`social-avatar social-avatar--${size}`}>{initialsFor(alt)}</div>;
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`social-avatar social-avatar--image social-avatar--${size}`}
      onError={() => setHasError(true)}
    />
  );
};

const roleLabel = (role) => {
  if (!role) return 'member';
  return role.replace(/_/g, ' ');
};

const SocialDashboardSection = ({
  audience = 'community',
  title = 'Community Pulse',
  subtitle = 'A shared feed for wins, questions, media, events, and collaboration updates.',
}) => {
  const { currentUser, userProfile } = useAuth();
  const isSuperAdmin = userProfile?.isSuperAdmin === true
    || userProfile?.adminLevel === 'super_admin'
    || userProfile?.role === 'super_admin'
    || userProfile?.userRole === 'super_admin';
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [composerText, setComposerText] = useState('');
  const [composerTags, setComposerTags] = useState('');
  const [composerVisibility, setComposerVisibility] = useState('public');
  const [composerFiles, setComposerFiles] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [network, setNetwork] = useState({ incoming: [], outgoing: [], connections: [] });
  const [networkBusy, setNetworkBusy] = useState('');
  const connectedIds = useMemo(() => new Set(network.connections.flatMap((item) => item.userIds || []).filter((id) => id !== currentUser?.uid)), [network.connections, currentUser?.uid]);

  const displayName = useMemo(
    () =>
      userProfile?.displayName ||
      userProfile?.fullName ||
      userProfile?.companyName ||
      currentUser?.displayName ||
      currentUser?.email?.split('@')[0] ||
      'Community Member',
    [currentUser, userProfile]
  );

  const refreshFeed = async () => {
    setLoading(true);

    try {
      const [feed, people, trending] = await Promise.all([
        socialPlatformService.getFeed(userProfile),
        socialPlatformService.getSuggestions(userProfile),
        socialPlatformService.getTrendingTopics(userProfile),
      ]);

      setPosts(feed?.data || []);
      setSuggestions(people.data || []);
      setTopics(trending.data || []);
      if (!feed?.success) setActionError(feed?.error || 'The live feed could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    refreshFeed();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return undefined;
    return socialPlatformService.subscribeToFeed(
      (nextPosts) => setPosts(nextPosts),
      (error) => console.error('Live social feed subscription failed:', error),
      12,
      userProfile
    );
  }, [currentUser?.uid, isSuperAdmin]);

  useEffect(() => {
    if (!currentUser?.uid) return undefined;
    return socialPlatformService.subscribeToNetwork(currentUser.uid, setNetwork, (error) => {
      console.error('Live social connections subscription failed:', error);
      setActionError(error.message || 'Connection requests could not be loaded.');
    });
  }, [currentUser?.uid]);

  if (!currentUser) {
    return null;
  }

  const handleFilesSelected = (event) => {
    setComposerFiles(Array.from(event.target.files || []));
  };

  const handleCreatePost = async () => {
    const tags = composerTags
      .split(',')
      .map((tag) => tag.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (!composerText.trim() && composerFiles.length === 0) {
      return;
    }

    setPosting(true);
    setActionError('');
    try {
      const result = await socialPlatformService.createPost(
        {
          content: composerText,
          visibility: composerVisibility,
          tags,
          files: composerFiles,
        },
        userProfile
      );

      if (result.success && result.data) {
        setPosts((prev) => [result.data, ...prev]);
        setComposerText('');
        setComposerTags('');
        setComposerFiles([]);
      }
    } catch (error) {
      setActionError(error.message || 'Unable to publish this post.');
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (postId, hasLiked) => {
    try {
      await socialPlatformService.toggleLike(postId, hasLiked);
    } catch (error) {
      setActionError(error.message || 'Unable to update this reaction.');
      return;
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              hasLiked: !hasLiked,
              likeCount: Math.max(0, (post.likeCount || 0) + (hasLiked ? -1 : 1)),
            }
          : post
      )
    );
  };

  const handleCommentSubmit = async (postId) => {
    const draft = (commentDrafts[postId] || '').trim();
    if (!draft) {
      return;
    }

    let result;
    try {
      result = await socialPlatformService.addComment(postId, draft, userProfile);
    } catch (error) {
      setActionError(error.message || 'Unable to add your comment.');
      return;
    }
    if (!result.success) return;

    const savedComment = result.data || {
      id: `comment-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`,
      authorName: displayName,
      authorRole: userProfile?.userType || 'member',
      body: draft,
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? (() => {
              const comments = [...new Map([...(post.comments || []), savedComment].map((comment) => [comment.id, comment])).values()];
              return { ...post, comments, commentCount: Math.max(post.commentCount || 0, comments.length) };
            })()
          : post
      )
    );
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleShare = async (postId) => {
    try {
      await socialPlatformService.sharePost(postId, userProfile);
    } catch (error) {
      setActionError(error.message || 'Unable to share this post.');
      return;
    }
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, shareCount: (post.shareCount || 0) + 1 } : post
      )
    );
  };

  const handleAddFriend = async (person) => {
    setNetworkBusy(person.id);
    setActionError('');
    try { await socialPlatformService.sendFriendRequest(person, userProfile); }
    catch (error) { setActionError(error.message || 'Could not send the connection request.'); }
    finally { setNetworkBusy(''); }
  };

  const handleRespondFriend = async (request, status) => {
    setNetworkBusy(request.id);
    setActionError('');
    try { await socialPlatformService.respondFriendRequest(request, status); }
    catch (error) { setActionError(error.message || 'Could not update the connection request.'); }
    finally { setNetworkBusy(''); }
  };

  const getProfileRoute = (person) => {
    const role = (person?.role || person?.userType || '').toLowerCase();
    const routeMap = {
      admin: '/admin/profile',
      student: '/student/profile',
      company: '/company/profile',
      institute: '/institute/profile',
      mentor: '/mentor/profile',
      youth: '/youth/profile',
      entrepreneur: '/entrepreneur/profile',
      alumni: '/alumni/profile',
      parent: '/parent/dashboard',
    };

    return routeMap[role] || '/settings';
  };

  const handleSuggestionClick = (person) => {
    if (!person?.id) {
      return;
    }

    navigate(getProfileRoute(person));
  };

  const handleBlock = async (personId, name) => {
    if (!window.confirm(`Block ${name || 'this member'}? They will no longer see your social posts or contact you.`)) return;
    try {
      await socialPlatformService.blockUser(personId, name);
      setSuggestions((items) => items.filter((person) => person.id !== personId));
      setPosts((items) => items.filter((post) => post.authorId !== personId));
    } catch (error) { setActionError(error.message || 'Unable to block this member.'); }
  };

  const handleReport = async (targetType, targetId, ownerId, label) => {
    const reason = window.prompt(`Why are you reporting this ${label}?`);
    if (!reason?.trim()) return;
    try {
      await socialPlatformService.reportContent({ targetType, targetId, ownerId, reason });
      setActionError('Report submitted privately for review.');
    } catch (error) { setActionError(error.message || 'Unable to submit the report.'); }
  };

  return (
    <section className="social-section">
      <div className="social-section__header">
        <div>
          <div className="social-section__eyebrow">{audience} social layer</div>
          <h2 className="social-section__title">{title}</h2>
          <p className="social-section__subtitle">{subtitle}</p>
        </div>
        <div className="social-section__meta">
          <div className="social-pill">{posts.length} live posts</div>
          <div className="social-pill">{suggestions.length} people to know</div>
          <button
            className="social-button social-button--ghost"
            onClick={refreshFeed}
            title="Refresh feed"
            aria-label="Refresh feed"
            style={{ width: 42, height: 42, borderRadius: '50%', padding: 0 }}
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      <div className="social-section__body">
        {actionError && <div role="alert" className="social-card" style={{ color: '#b91c1c' }}>{actionError}</div>}
        <div className="social-section__main">
          <div className="social-card social-composer">
            <div className="social-composer__top">
              <AvatarImage src={userProfile?.photoURL || currentUser?.photoURL || userProfile?.logo} alt={displayName} size="normal" />
              <div style={{ flex: 1 }}>
                <div className="social-card__title">Post as {displayName}</div>
                <div className="social-card__subtitle">
                  Share progress, opportunities, wins, photos, or questions with the network.
                </div>
                <textarea
                  className="social-composer__input"
                  placeholder="What would make the community smarter, more connected, or more inspired today?"
                  value={composerText}
                  onChange={(event) => setComposerText(event.target.value)}
                />
              </div>
            </div>

      <div className="social-media-preview">
              {composerFiles.map((file) => (
                <div key={`${file.name}-${file.size}`} className="social-media-preview__item">
                  {file.type.startsWith('video/') ? <video src={URL.createObjectURL(file)} aria-label={file.name} controls /> : <img src={URL.createObjectURL(file)} alt={file.name} />}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '0.9rem' }}>
              <input
                className="social-tag-input"
                placeholder="Add tags like career, funding, hiring, mentorship"
                value={composerTags}
                onChange={(event) => setComposerTags(event.target.value)}
              />
            </div>

            <div className="social-composer__controls" style={{ marginTop: '1rem' }}>
              <div className="social-composer__toolbar">
                <label className="social-action" htmlFor={`social-media-${audience}`}>
                  <FiImage /> Add media
                </label>
                <input
                  id={`social-media-${audience}`}
                  hidden
                  multiple
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFilesSelected}
                />
              </div>

              <div className="social-composer__visibility">
                <span>Visibility</span>
                <select
                  className="social-select"
                  value={composerVisibility}
                  onChange={(event) => setComposerVisibility(event.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends only</option>
                </select>
                <button
                  className="social-button social-button--primary"
                  disabled={posting}
                  onClick={handleCreatePost}
                >
                  <FiSend /> {posting ? 'Posting...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>

          <div className="social-card">
            <div className="social-card__title">Live Feed</div>
            <div className="social-card__subtitle">
              Built to feel closer to Facebook and LinkedIn: status updates, media, reactions, and
              comments.
            </div>
          </div>

          {loading ? (
            <div className="social-card social-loading">Loading the community feed...</div>
          ) : null}

          {!loading && posts.length === 0 ? (
            <div className="social-card social-empty">
              <div className="fw-semibold mb-2">No live posts yet</div>
              <div className="small text-muted">
                The platform is ready for real updates from staff, users, and partners.
              </div>
            </div>
          ) : null}

          {posts.map((post) => (
            <article key={post.id} className="social-card social-post">
              <div className="social-post__header">
                <AvatarImage
                  src={post.author?.avatar || post.authorPhoto || post.author?.profilePhoto || ''}
                  alt={post.author?.name || 'Post author'}
                  size="small"
                />
                <div style={{ flex: 1 }}>
                  <div className="social-post__name">{post.author?.name}</div>
                  <p className="social-post__headline">
                    {post.author?.headline || roleLabel(post.author?.role)}
                  </p>
                  <p className="social-post__time">{formatTimeAgo(post.createdAt)}</p>
                </div>
                {post.authorId !== currentUser.uid && <div className="flex gap-2"><button type="button" className="social-action" title="Report post" aria-label="Report post" onClick={() => handleReport('post', post.id, post.authorId, 'post')}><FiFlag /></button><button type="button" className="social-action" title="Block author" aria-label="Block author" onClick={() => handleBlock(post.authorId, post.author?.name)}><FiSlash /></button></div>}
              </div>

              <div className="social-post__content">{post.content}</div>

              {post.media?.length ? (
                <div className="social-post__media">
                  {post.media.map((asset) => (
                    <img key={asset.url} src={asset.url} alt={asset.name || 'Post media'} />
                  ))}
                </div>
              ) : null}

              {post.tags?.length ? (
                <div className="social-post__taglist">
                  {post.tags.map((tag) => (
                    <span key={`${post.id}-${tag}`} className="social-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="social-post__stats">
                <span>{post.likeCount || 0} reactions</span>
                <span>{post.commentCount || 0} comments</span>
                <span>{post.shareCount || 0} shares</span>
              </div>

              <div className="social-post__actions">
                <div className="social-composer__toolbar">
                  <button
                    className="social-action"
                    onClick={() => handleToggleLike(post.id, post.hasLiked)}
                  >
                    <FiHeart /> {post.hasLiked ? 'Liked' : 'Like'}
                  </button>
                  <button className="social-action">
                    <FiMessageCircle /> Comment
                  </button>
                  <button className="social-action" onClick={() => handleShare(post.id)}>
                    <FiRepeat /> Share
                  </button>
                </div>
              </div>

              <div className="social-post__comment-bar">
                <input
                  className="social-comment-input"
                  placeholder="Write a comment..."
                  value={commentDrafts[post.id] || ''}
                  onChange={(event) =>
                    setCommentDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))
                  }
                />
                <button
                  className="social-button social-button--primary"
                  onClick={() => handleCommentSubmit(post.id)}
                >
                  Reply
                </button>
              </div>

              {post.comments?.length ? (
                <div className="social-comment-list">
                  {post.comments.slice(-3).map((comment) => (
                    <div key={comment.id} className="social-comment">
                      <div className="social-comment__meta">
                        <strong>{comment.authorName}</strong> · {roleLabel(comment.authorRole)} ·{' '}
                        {formatTimeAgo(comment.createdAt)}
                      </div>
                      <div>{comment.body || comment.content}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}

          {!loading && posts.length === 0 ? null : null}
        </div>

        <aside className="social-section__sidebar">
          <div className="social-card">
            <div className="social-card__title">Trending Now</div>
            <div className="social-card__subtitle">
              Topics people are already pushing around the network.
            </div>
            <div style={{ marginTop: '0.8rem' }}>
              {topics.length > 0 ? (
                topics.map((topic) => (
                  <div key={topic.tag} className="social-side-item">
                    <FiTrendingUp style={{ marginTop: '0.15rem', color: '#f97316' }} />
                    <div>
                      <p className="social-side-item__title">#{topic.tag}</p>
                      <p className="social-side-item__copy">{topic.count} active mentions</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="social-side-item">
                  <div>
                    <p className="social-side-item__title">No active topics yet</p>
                    <p className="social-side-item__copy">
                      Real community conversations will appear here as they start.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="social-card">
            <div className="social-card__title">People To Know</div>
            <div className="social-card__subtitle">
              More normal-app energy means more discovery, not only job listings.
            </div>
            <div style={{ marginTop: '0.8rem' }}>
              {suggestions.length > 0 ? (
                suggestions.map((person) => (
                  <div
                    key={person.id}
                    className="social-side-item social-side-item--clickable"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSuggestionClick(person)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleSuggestionClick(person);
                      }
                    }}
                  >
                    <AvatarImage
                      src={person.avatar || person.photoURL || person.profilePhoto || ''}
                      alt={person.name}
                      size="small"
                    />
                    <div style={{ flex: 1 }}>
                      <p className="social-side-item__title">{person.name}</p>
                      <p className="social-side-item__copy">{person.headline}</p>
                      <p className="social-side-item__copy">
                        {person.role ? roleLabel(person.role) : 'Community member'}
                      </p>
                    </div>
                    {isSuperAdmin ? <span className="social-network-badge"><FiCheck /> Platform access</span> : connectedIds.has(person.id) ? <span className="social-network-badge"><FiCheck /> Connected</span> : network.outgoing.some((request) => request.recipientId === person.id) ? <span className="social-network-badge">Request sent</span> : <button type="button" disabled={networkBusy === person.id} className="social-button social-button--ghost social-network-action" onClick={(event) => { event.stopPropagation(); handleAddFriend(person); }}><FiUserPlus /> Add</button>}
                    <button type="button" className="social-action" title="Report profile" aria-label="Report profile" onClick={(event) => { event.stopPropagation(); handleReport('profile', person.id, person.id, 'profile'); }}><FiFlag /></button>
                    <button type="button" className="social-action" title="Block profile" aria-label="Block profile" onClick={(event) => { event.stopPropagation(); handleBlock(person.id, person.name); }}><FiSlash /></button>
                  </div>
                ))
              ) : (
                <div className="social-side-item">
                  <div>
                    <p className="social-side-item__title">No recommendations yet</p>
                    <p className="social-side-item__copy">
                      Insightful profiles will appear here as the community grows.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="social-card">
            <div className="social-card__title">Connection requests <span className="social-request-count">{network.incoming.length}</span></div>
            <div className="social-card__subtitle">{isSuperAdmin ? 'Platform-wide visibility is enabled; no friend requests are needed.' : 'Accept or decline requests. Friends can see friends-only posts.'}</div>
            {!isSuperAdmin && (network.incoming.length ? network.incoming.map((request) => <div key={request.id} className="social-side-item"><AvatarImage src={request.senderAvatar} alt={request.senderName}/><div className="social-request-person"><p className="social-side-item__title">{request.senderName || 'Community member'}</p><p className="social-side-item__copy">{roleLabel(request.senderRole)}</p><div className="social-request-actions"><button type="button" disabled={networkBusy === request.id} onClick={() => handleRespondFriend(request, 'accepted')} aria-label={`Accept ${request.senderName}'s request`}><FiCheck/> Accept</button><button type="button" disabled={networkBusy === request.id} onClick={() => handleRespondFriend(request, 'rejected')} aria-label={`Decline ${request.senderName}'s request`}><FiX/> Decline</button></div></div></div>) : <div className="social-side-item"><p className="social-side-item__copy">No pending requests.</p></div>)}
          </div>

          <div className="social-card">
            <div className="social-card__title">What This Unlocks</div>
            <div className="social-card__subtitle">
              The product starts behaving more like a daily-use platform.
            </div>
            <div style={{ marginTop: '0.8rem' }}>
              <div className="social-side-item">
                <FiCompass style={{ marginTop: '0.15rem', color: '#1d4ed8' }} />
                <div>
                  <p className="social-side-item__title">Live discovery</p>
                  <p className="social-side-item__copy">
                    Follow progress, opportunities, and event media in one stream.
                  </p>
                </div>
              </div>
              <div className="social-side-item">
                <FiUsers style={{ marginTop: '0.15rem', color: '#1d4ed8' }} />
                <div>
                  <p className="social-side-item__title">Human presence</p>
                  <p className="social-side-item__copy">
                    Alumni, students, parents, mentors, companies, and institutions can all show up.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default SocialDashboardSection;
