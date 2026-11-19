/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Card,
  ListGroup,
  Badge,
  Spinner,
  Alert,
  Button,
  Row,
  Col,
  ProgressBar,
} from '../../components/ui/tailwindCompat';
import {
  collection,
  query,
  where,
  limit,
  onSnapshot,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';
import { getStudentApplications, getApplicationStats } from '../../services/applicationService';
import { getStudentDocuments, subscribeToStudentApplications, subscribeToStudentDocuments } from '../../services/studentServices';
import { db } from '../../config/firebase';

const ActivityFeed = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    applications: 0,
    courses: 0,
    documents: 0,
    interviews: 0,
    pendingApplications: 0,
    successRate: 0,
  });
  const [realtimeActivities, setRealtimeActivities] = useState([]);

  // Activity types configuration
  const ACTIVITY_TYPES = {
    application: {
      icon: 'bi-briefcase',
      color: 'primary',
      label: 'Application',
      firebaseCollection: 'applications',
    },
    course: {
      icon: 'bi-book',
      color: 'success',
      label: 'Course',
      firebaseCollection: 'student_courses',
    },
    document: {
      icon: 'bi-file-earmark',
      color: 'info',
      label: 'Document',
      firebaseCollection: 'student_documents',
    },
    recommendation: {
      icon: 'bi-star',
      color: 'warning',
      label: 'Recommendation',
      firebaseCollection: 'recommendations',
    },
    deadline: {
      icon: 'bi-calendar-check',
      color: 'danger',
      label: 'Deadline',
      firebaseCollection: 'deadlines',
    },
    interview: {
      icon: 'bi-camera-video',
      color: 'purple',
      label: 'Interview',
      firebaseCollection: 'interviews',
    },
    notification: {
      icon: 'bi-bell',
      color: 'secondary',
      label: 'Notification',
      firebaseCollection: 'notifications',
    },
  };

  // Format timestamp to time ago
  const formatTimeAgo = useCallback((timestamp) => {
    if (!timestamp) return 'Recently';

    let date;
    if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp?.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: new Date().getFullYear() !== date.getFullYear() ? 'numeric' : undefined,
    });
  }, []);

  // Fetch all activity data
  const fetchActivities = useCallback(async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch applications
      const applicationsResult = await getStudentApplications(currentUser.uid, {
        limitCount: 5,
      });

      // Fetch documents
      const documentsResult = await getStudentDocuments(currentUser.uid);

      // Fetch application stats
      const statsResult = await getApplicationStats(currentUser.uid);

      // Transform data into activities
      const allActivities = [];

      // Add applications as activities
      if (applicationsResult.success && applicationsResult.data) {
        applicationsResult.data.forEach((app) => {
          allActivities.push({
            id: `app_${app.id}`,
            type: 'application',
            title: `Application: ${app.jobTitle || app.jobName || app.job?.title || 'Job'}`,
            details: app.companyName || app.company?.name || app.job?.companyName || app.status || 'Application submitted',
            time: app.appliedAt || app.appliedDate || app.createdAt,
            icon: ACTIVITY_TYPES.application.icon,
            color: ACTIVITY_TYPES.application.color,
            metadata: app,
            timestamp: app.appliedAt || app.appliedDate || app.createdAt,
          });
        });
      }

      // Add documents as activities
      if (documentsResult.success && documentsResult.data) {
        documentsResult.data.slice(0, 3).forEach((doc) => {
          allActivities.push({
            id: `doc_${doc.id}`,
            type: 'document',
            title: `Uploaded ${doc.documentType || doc.type || 'Document'}`,
            details: doc.fileName || doc.name || doc.filename || 'Document',
            time: doc.uploadedAt || doc.uploadDate || doc.createdAt,
            icon: ACTIVITY_TYPES.document.icon,
            color: ACTIVITY_TYPES.document.color,
            metadata: doc,
            timestamp: doc.uploadedAt || doc.uploadDate || doc.createdAt,
          });
        });
      }

      // Sort by timestamp (newest first)
      allActivities.sort((a, b) => {
        const timeA = a.timestamp || a.time;
        const timeB = b.timestamp || b.time;
        return new Date(timeB) - new Date(timeA);
      });

      setActivities(allActivities.slice(0, 10));

      // Update stats
      if (statsResult.success && statsResult.data) {
        setStats((prev) => ({
          ...prev,
          applications: statsResult.data.total || 0,
          pendingApplications: statsResult.data.pending || 0,
          successRate: Number.isFinite(Number(statsResult.data.successRate)) ? Number(statsResult.data.successRate) : 0,
        }));
      }

      // Update document count
      if (documentsResult.success && documentsResult.data) {
        setStats((prev) => ({
          ...prev,
          documents: documentsResult.data.length || 0,
        }));
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities from your profile.');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Setup realtime listener for new activities
  useEffect(() => {
    if (!currentUser?.uid) return;

    const activitiesRef = collection(db, 'activities');
    const q = query(
      activitiesRef,
      where('userId', '==', currentUser.uid),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newActivities = snapshot.docs.map((doc) => ({
          id: `act_${doc.id}`,
          ...doc.data(),
          type: doc.data().activityType || 'notification',
          icon: ACTIVITY_TYPES[doc.data().activityType]?.icon || 'bi-bell',
          color: ACTIVITY_TYPES[doc.data().activityType]?.color || 'secondary',
        })).sort((left, right) => {
          const dateValue = (value) => value?.toDate ? value.toDate().getTime() : new Date(value || 0).getTime();
          return dateValue(right.createdAt) - dateValue(left.createdAt);
        });
        setRealtimeActivities(newActivities);
      },
      (error) => {
        console.error('Realtime listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.uid) return undefined;
    const stopApplications = subscribeToStudentApplications(currentUser.uid, (records) => {
      setActivities((previous) => {
        const documents = previous.filter((item) => item.type === 'document');
        const applications = records.slice(0, 10).map((app) => ({
          id: `app_${app.id}`, type: 'application', title: `Application: ${app.jobTitle || app.jobName || app.job?.title || 'Job'}`,
          details: app.companyName || app.company?.name || app.status || 'Application submitted', time: app.appliedAt || app.createdAt,
          timestamp: app.appliedAt || app.createdAt, icon: ACTIVITY_TYPES.application.icon, color: ACTIVITY_TYPES.application.color, metadata: app,
        }));
        setStats((statsBefore) => ({ ...statsBefore, applications: records.length, interviews: records.filter((item) => item.interviewAt || item.interviewDate).length, pendingApplications: records.filter((item) => ['pending', 'submitted', 'reviewing'].includes(String(item.status || '').toLowerCase())).length }));
        return [...applications, ...documents];
      });
      setLoading(false);
    }, (loadError) => setError(loadError.message || 'Could not load application activity.'));
    const stopDocuments = subscribeToStudentDocuments(currentUser.uid, (records) => {
      setActivities((previous) => {
        const applications = previous.filter((item) => item.type === 'application');
        const documents = records.slice(0, 10).map((record) => ({
          id: `doc_${record.id}`, type: 'document', title: `Uploaded ${record.documentType || record.type || 'Document'}`,
          details: record.fileName || record.name || 'Document', time: record.uploadedAt || record.createdAt,
          timestamp: record.uploadedAt || record.createdAt, icon: ACTIVITY_TYPES.document.icon, color: ACTIVITY_TYPES.document.color, metadata: record,
        }));
        setStats((statsBefore) => ({ ...statsBefore, documents: records.length }));
        return [...applications, ...documents];
      });
      setLoading(false);
    }, (loadError) => setError(loadError.message || 'Could not load document activity.'));
    const stopEnrollments = onSnapshot(collection(db, 'students', currentUser.uid, 'enrollments'), (snapshot) => {
      setStats((statsBefore) => ({ ...statsBefore, courses: snapshot.docs.filter((item) => item.data().status === 'completed' || Number(item.data().progress) >= 100).length }));
    }, (loadError) => setError(loadError.message || 'Could not load course activity.'));
    return () => { stopApplications(); stopDocuments(); stopEnrollments(); };
  }, [currentUser?.uid]);

  // Mark activity as read
  const markAsRead = async (activityId) => {
    try {
      const activityRef = doc(db, 'activities', activityId.replace(/^act_/, ''));
      await updateDoc(activityRef, {
        read: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Load more activities
  const loadMoreActivities = async () => {
    try {
      const moreResult = await getStudentApplications(currentUser.uid, {
        limitCount: 5,
        lastDoc: activities[activities.length - 1]?.metadata?.lastDoc,
      });

      if (moreResult.success && moreResult.data.length > 0) {
        const newActivities = moreResult.data.map((app) => ({
          id: `app_${app.id}`,
          type: 'application',
          title: `Applied for ${app.job?.title || 'Job'}`,
          details: app.company?.name || app.job?.companyName || 'Unknown Company',
          time: app.appliedDate,
          icon: ACTIVITY_TYPES.application.icon,
          color: ACTIVITY_TYPES.application.color,
          metadata: app,
        }));

        setActivities((prev) => [...prev, ...newActivities]);
      }
    } catch (error) {
      console.error('Error loading more activities:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Combine realtime and fetched activities
  const allActivities = [...new Map([...realtimeActivities, ...activities].map((activity) => [activity.id, activity])).values()]
    .sort((a, b) => {
      const timeA = a.createdAt || a.timestamp || a.time;
      const timeB = b.createdAt || b.timestamp || b.time;
      return new Date(timeB) - new Date(timeA);
    })
    .slice(0, 10);

  if (loading && activities.length === 0) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading activities...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Activity Feed</h2>

      {error && (
        <Alert variant="warning" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Upload Section */}
      <Card className="shadow-sm mb-4"><Card.Body><h5 className="mb-2">Document library</h5><p className="mb-0 text-muted">Upload and manage your files on the <a href="/student/documents">Documents page</a>.</p></Card.Body></Card>

      {/* Activity Feed */}
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Recent Activities</h5>
            <Badge bg="light" text="dark" pill>
              {allActivities.length} activities
            </Badge>
          </div>

          {allActivities.length === 0 ? (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              No activities yet. Your applications and documents will appear here.
            </Alert>
          ) : (
            <>
              <ListGroup variant="flush">
                {allActivities.map((activity) => (
                  <ListGroup.Item
                    key={activity.id}
                    className="py-3 hover-effect"
                    onClick={() => activity.id?.startsWith('act_') && markAsRead(activity.id)}
                    style={{ cursor: activity.id?.startsWith('act_') ? 'pointer' : 'default' }}
                  >
                    <div className="d-flex align-items-start">
                      <div className={`bg-${activity.color}-subtle p-2 rounded me-3`}>
                        <i
                          className={`bi ${activity.icon} text-${activity.color}`}
                          style={{ fontSize: '1.2rem' }}
                        ></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">
                          {activity.title}
                          {activity.id?.startsWith('act_') && !activity.read && (
                            <Badge bg="danger" className="ms-2" pill>
                              New
                            </Badge>
                          )}
                        </h6>
                        <p className="text-muted mb-1 small">{activity.details}</p>
                        <small className="text-muted">
                          {formatTimeAgo(activity.time || activity.createdAt || activity.timestamp)}
                        </small>
                      </div>
                      <Badge bg={activity.color} className="ms-2">
                        {ACTIVITY_TYPES[activity.type]?.label || activity.type}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <div className="text-center mt-4">
                <Button variant="outline-primary" onClick={loadMoreActivities} disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" />
                      <span className="ms-2">Loading...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Load More Activities
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Stats Card */}
      <Card className="shadow-sm mt-4">
        <Card.Body>
          <h5 className="mb-3">Quick Stats</h5>
          <Row className="text-center">
            <Col md={3} className="mb-3 mb-md-0">
              <div className="p-3 border rounded">
                <h3 className="text-primary">{stats.applications}</h3>
                <p className="text-muted mb-0">Total Applications</p>
                {stats.pendingApplications > 0 && (
                  <small className="text-warning">{stats.pendingApplications} pending</small>
                )}
              </div>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <div className="p-3 border rounded">
                <h3 className="text-success">{stats.courses}</h3>
                <p className="text-muted mb-0">Courses Completed</p>
              </div>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <div className="p-3 border rounded">
                <h3 className="text-warning">{stats.documents}</h3>
                <p className="text-muted mb-0">Documents Uploaded</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3 border rounded">
                <h3 className="text-info">{stats.successRate}%</h3>
                <p className="text-muted mb-0">Success Rate</p>
                <ProgressBar
                  now={stats.successRate}
                  variant="info"
                  className="mt-2"
                  style={{ height: '6px' }}
                />
              </div>
            </Col>
          </Row>

          {/* Additional Stats */}
          <Row className="mt-4 text-center">
            <Col md={4} className="mb-3">
              <div className="p-3 border rounded bg-light">
                <h5 className="text-purple">{stats.interviews}</h5>
                <p className="text-muted mb-0">Interviews Scheduled</p>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="p-3 border rounded bg-light">
                <h5 className="text-danger">{realtimeActivities.filter((a) => !a.read).length}</h5>
                <p className="text-muted mb-0">Unread Activities</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 border rounded bg-light">
                <h5 className="text-success">
                  {allActivities.filter((a) => a.type === 'application').length}
                </h5>
                <p className="text-muted mb-0">Recent Applications</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Cloudinary Integration Info */}
      <Card className="shadow-sm mt-4 bg-info bg-opacity-10 border-info">
        <Card.Body>
          <h5 className="text-info">
            <i className="bi bi-cloud me-2"></i>
            Cloudinary Integration
          </h5>
          <p className="mb-0">Documents you upload are stored through the configured media service and reflected here as the library syncs.</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ActivityFeed;



