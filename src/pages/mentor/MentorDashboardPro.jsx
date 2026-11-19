/**
 * MentorDashboardPro.jsx
 * Production-ready Mentor Dashboard with Firebase & PostgreSQL Integration
 * Version: 2.0.0
 * Last Updated: 2026-06-21
 *
 * Features:
 * - Real-time session management with Firebase Firestore
 * - Earnings tracking with PostgreSQL backend
 * - AI-powered recommendations using HF Spaces API
 * - Cloudinary image integration
 * - Advanced analytics and charts
 * - Social engagement metrics
 * - Real-time notifications
 * - Performance analytics
 */

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  Users,
  TrendingUp,
  Video,
  MessageCircle,
  Bell,
  Settings,
  ChevronRight,
  Activity,
  Award,
  BookOpen,
  Briefcase,
  Eye,
  EyeOff,
  Download,
  Share2,
  BarChart3,
  PieChart,
  AlertCircle,
  CheckCircle,
  Clock3,
  Zap,
  Target,
} from 'lucide-react';
import { Line, Doughnut, Bar, AreaChart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { useAuth } from '../../hooks/useAuth';
import { mentorService } from '../../services/mentorService';
import { aiService } from '../../services/aiService';
import { cloudinaryService } from '../../services/cloudinaryService';
import SocialDashboardSection from '../../components/social/SocialDashboardSection';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const MentorDashboardPro = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State Management
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    noShowSessions: 0,
    averageRating: 0,
    totalReviews: 0,
    studentsServed: 0,
    hoursDelivered: 0,
  });

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [studentReviews, setStudentReviews] = useState([]);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [chartData, setChartData] = useState(null);
  const [earningsChartData, setEarningsChartData] = useState(null);
  const [sessionStatusData, setSessionStatusData] = useState(null);
  const [studentDemographics, setStudentDemographics] = useState(null);

  const [showEarnings, setShowEarnings] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const notificationRef = useRef(null);

  // Fetch Dashboard Data
  useEffect(() => {
    if (user?.uid) {
      loadDashboardData();
    }
  }, [user?.uid, selectedPeriod]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch mentor profile from Firestore
      const profileResponse = await mentorService.getMentorProfile(user.uid);
      if (profileResponse?.success) {
        setProfile(profileResponse.data);
      }

      // Fetch dashboard statistics from PostgreSQL
      const statsResponse = await mentorService.getDashboardStats(user.uid, selectedPeriod);
      if (statsResponse?.success) {
        setDashboardStats(statsResponse.data);
      }

      // Fetch upcoming sessions from Firestore (real-time)
      const upcomingResponse = await mentorService.getUpcomingSessions(user.uid);
      if (upcomingResponse?.success) {
        const upcoming = upcomingResponse.data
          .filter((s) => new Date(s.scheduledAt) > new Date())
          .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
          .slice(0, 8);
        setUpcomingSessions(upcoming);
      }

      // Fetch past sessions for history
      const pastResponse = await mentorService.getPastSessions(user.uid, { limit: 10 });
      if (pastResponse?.success) {
        setPastSessions(pastResponse.data);
      }

      // Fetch student reviews from PostgreSQL
      const reviewsResponse = await mentorService.getStudentReviews(user.uid, { limit: 5 });
      if (reviewsResponse?.success) {
        setStudentReviews(reviewsResponse.data);
      }

      // Fetch earnings history
      const earningsResponse = await mentorService.getEarningsHistory(user.uid, selectedPeriod);
      if (earningsResponse?.success) {
        setEarningsHistory(earningsResponse.data);
        processEarningsChart(earningsResponse.data);
      }

      // Fetch session analytics
      const analyticsResponse = await mentorService.getSessionAnalytics(user.uid, selectedPeriod);
      if (analyticsResponse?.success) {
        processChartData(analyticsResponse.data);
      }

      // Fetch notifications (real-time from Firestore)
      const notificationsResponse = await mentorService.getMentorNotifications(user.uid);
      if (notificationsResponse?.success) {
        setNotifications(notificationsResponse.data.slice(0, 6));
      }

      // Fetch recent activity
      const activityResponse = await mentorService.getRecentActivity(user.uid, { limit: 10 });
      if (activityResponse?.success) {
        setRecentActivity(activityResponse.data);
      }

      // Get AI Recommendations
      await loadAIRecommendations();
    } catch (err) {
      console.error('[MentorDashboard] Error loading data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, selectedPeriod]);

  const loadAIRecommendations = async () => {
    try {
      if (!profile) return;

      const recResponse = await aiService.getMentorRecommendations({
        mentorId: user.uid,
        profile: {
          expertise: profile.expertise,
          completedSessions: dashboardStats.completedSessions,
          averageRating: dashboardStats.averageRating,
        },
      });

      if (recResponse?.success) {
        setRecommendations(recResponse.data.recommendations.slice(0, 3));
      }
    } catch (err) {
      console.error('Error loading AI recommendations:', err);
    }
  };

  const processChartData = (analyticsData) => {
    if (!analyticsData?.sessionsByDay) return;

    const labels = Object.keys(analyticsData.sessionsByDay);
    const data = Object.values(analyticsData.sessionsByDay);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Sessions per Day',
          data,
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#4F46E5',
        },
      ],
    });

    // Session status breakdown
    setSessionStatusData({
      labels: ['Completed', 'Cancelled', 'No-Show'],
      datasets: [
        {
          data: [
            analyticsData.completed || 0,
            analyticsData.cancelled || 0,
            analyticsData.noShow || 0,
          ],
          backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    });

    // Student demographics
    setStudentDemographics({
      labels: analyticsData.studentsByLevel || ['Beginner', 'Intermediate', 'Advanced'],
      datasets: [
        {
          label: 'Students by Level',
          data: analyticsData.studentCountByLevel || [0, 0, 0],
          backgroundColor: [
            'rgba(99, 102, 241, 0.6)',
            'rgba(34, 197, 94, 0.6)',
            'rgba(249, 115, 22, 0.6)',
          ],
          borderColor: ['rgb(99, 102, 241)', 'rgb(34, 197, 94)', 'rgb(249, 115, 22)'],
          borderWidth: 2,
        },
      ],
    });
  };

  const processEarningsChart = (earningsData) => {
    if (!earningsData?.byDate) return;

    const labels = Object.keys(earningsData.byDate);
    const data = Object.values(earningsData.byDate);

    setEarningsChartData({
      labels,
      datasets: [
        {
          label: 'Daily Earnings ($)',
          data,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#10B981',
        },
      ],
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  const handleScheduleSession = () => {
    navigate('/mentor/sessions/new');
  };

  const handleViewProfile = () => {
    navigate('/mentor/profile');
  };

  const handleViewAllSessions = () => {
    navigate('/mentor/sessions');
  };

  const handleViewEarnings = () => {
    navigate('/mentor/earnings');
  };

  const handleViewReviews = () => {
    navigate('/mentor/reviews');
  };

  const handleDownloadReport = async () => {
    try {
      const reportResponse = await mentorService.generateReport(user.uid, selectedPeriod);
      if (reportResponse?.success) {
        // Trigger download
        const element = document.createElement('a');
        element.setAttribute(
          'href',
          `data:text/plain;charset=utf-8,${encodeURIComponent(reportResponse.data)}`
        );
        element.setAttribute('download', `mentor-report-${selectedPeriod}.txt`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    } catch (err) {
      console.error('Error downloading report:', err);
      setError('Failed to download report');
    }
  };

  const handleDismissNotification = async (notificationId) => {
    try {
      await mentorService.dismissNotification(notificationId);
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error('Error dismissing notification:', err);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format time difference
  const getTimeUntil = (date) => {
    const now = new Date();
    const diff = new Date(date) - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `in ${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    }
    return `in ${minutes}m`;
  };

  if (loading) {
    return (
      <motion.div
        className="mentor-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mentor-dashboard-pro"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="dashboard-header mb-5">
        <div className="header-content">
          <div className="header-left">
            <div className="profile-section">
              {profile?.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.name}
                  className="profile-avatar"
                  onError={(e) => {
                    e.target.src =
                      'https://ui-avatars.com/api/?name=' +
                      encodeURIComponent(profile?.name || 'Mentor');
                  }}
                />
              ) : (
                <div className="avatar-placeholder">{profile?.name?.charAt(0) || 'M'}</div>
              )}
              <div className="profile-info">
                <h1>Welcome back, {profile?.name?.split(' ')[0]}</h1>
                <p className="text-muted">
                  {profile?.title || 'Professional Mentor'} • Joined{' '}
                  {profile?.joinDate ? new Date(profile.joinDate).getFullYear() : '2024'}
                </p>
              </div>
            </div>
          </div>

          <div className="header-right">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary btn-lg"
              onClick={handleScheduleSession}
            >
              <Calendar className="me-2" />
              Schedule Session
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-outline-secondary"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <TrendingUp className={refreshing ? 'spinning' : ''} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <AlertCircle className="me-2" />
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div
        className="quick-stats mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="stats-grid">
          {/* Total Earnings */}
          <motion.div
            className="stat-card earnings-card"
            whileHover={{ y: -5 }}
            onClick={() => setShowEarnings(!showEarnings)}
          >
            <div className="stat-header">
              <h3>Total Earnings</h3>
              <button className="btn btn-sm btn-outline-secondary">
                {showEarnings ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            <div className="stat-value">
              {showEarnings ? formatCurrency(dashboardStats.totalEarnings) : '••••••'}
            </div>
            <div className="stat-footer">
              <span className="text-success">
                <TrendingUp size={16} /> {dashboardStats.monthlyEarnings > 0 ? '+' : ''}
                {formatCurrency(dashboardStats.monthlyEarnings)} this month
              </span>
            </div>
          </motion.div>

          {/* Sessions */}
          <motion.div className="stat-card sessions-card" whileHover={{ y: -5 }}>
            <div className="stat-header">
              <h3>Total Sessions</h3>
              <Video size={20} className="text-primary" />
            </div>
            <div className="stat-value">{dashboardStats.totalSessions}</div>
            <div className="stat-breakdown">
              <span className="success">
                <CheckCircle size={14} /> {dashboardStats.completedSessions} Completed
              </span>
              <span className="danger">
                <Clock3 size={14} /> {dashboardStats.cancelledSessions} Cancelled
              </span>
            </div>
          </motion.div>

          {/* Ratings */}
          <motion.div className="stat-card rating-card" whileHover={{ y: -5 }}>
            <div className="stat-header">
              <h3>Average Rating</h3>
              <Star size={20} className="text-warning" />
            </div>
            <div className="stat-value">
              {dashboardStats.averageRating.toFixed(2)} <span className="text-muted">/5</span>
            </div>
            <div className="stat-footer">
              <span className="text-muted">Based on {dashboardStats.totalReviews} reviews</span>
            </div>
          </motion.div>

          {/* Students */}
          <motion.div className="stat-card students-card" whileHover={{ y: -5 }}>
            <div className="stat-header">
              <h3>Students Served</h3>
              <Users size={20} className="text-info" />
            </div>
            <div className="stat-value">{dashboardStats.studentsServed}</div>
            <div className="stat-footer">
              <span className="text-muted">{dashboardStats.hoursDelivered} hours delivered</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Period Selection */}
      <motion.div
        className="period-selector mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="btn-group" role="group">
          {['7d', '30d', '90d', '1y'].map((period) => (
            <button
              key={period}
              className={`btn ${selectedPeriod === period ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period === '7d'
                ? '7 Days'
                : period === '30d'
                  ? '30 Days'
                  : period === '90d'
                    ? '3 Months'
                    : '1 Year'}
            </button>
          ))}
        </div>
        <div className="period-actions">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-outline-primary"
            onClick={handleDownloadReport}
          >
            <Download size={18} />
            Download Report
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-outline-secondary"
            onClick={() => {}}
          >
            <Share2 size={18} />
            Share
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="dashboard-tabs mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {['overview', 'sessions', 'earnings', 'reviews'].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          className="tab-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="row g-4 mb-5">
            {/* Charts */}
            <div className="col-lg-6">
              <div className="card chart-card h-100">
                <div className="card-header">
                  <h5>Sessions Trend</h5>
                  <BarChart3 size={20} />
                </div>
                <div className="card-body">
                  {chartData ? (
                    <Line
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: { legend: { position: 'bottom' } },
                      }}
                      height={300}
                    />
                  ) : (
                    <p className="text-muted text-center">No data available</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card chart-card h-100">
                <div className="card-header">
                  <h5>Earnings Trend</h5>
                  <DollarSign size={20} />
                </div>
                <div className="card-body">
                  {earningsChartData ? (
                    <Line
                      data={earningsChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: { legend: { position: 'bottom' } },
                      }}
                      height={300}
                    />
                  ) : (
                    <p className="text-muted text-center">No data available</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card chart-card h-100">
                <div className="card-header">
                  <h5>Session Status</h5>
                  <PieChart size={20} />
                </div>
                <div className="card-body">
                  {sessionStatusData ? (
                    <Doughnut
                      data={sessionStatusData}
                      options={{ responsive: true, maintainAspectRatio: true }}
                      height={250}
                    />
                  ) : (
                    <p className="text-muted text-center">No data available</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              {/* Upcoming Sessions */}
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5>Upcoming Sessions</h5>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="btn btn-sm btn-primary"
                    onClick={handleViewAllSessions}
                  >
                    View All <ChevronRight size={16} />
                  </motion.button>
                </div>
                <div className="card-body">
                  {upcomingSessions.length > 0 ? (
                    <div className="sessions-list">
                      {upcomingSessions.map((session) => (
                        <motion.div key={session.id} className="session-item" whileHover={{ x: 5 }}>
                          <div className="session-time">
                            <div className="time-badge">
                              {new Date(session.scheduledAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="time-text">
                              {new Date(session.scheduledAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                          <div className="session-details">
                            <h6>{session.studentName}</h6>
                            <p className="text-muted">{session.topic}</p>
                          </div>
                          <div className="session-status">
                            <span className="badge bg-success">
                              {getTimeUntil(session.scheduledAt)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted text-center">No upcoming sessions</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Social Section */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <SocialDashboardSection
              audience="mentor"
              title="Mentor Community Hub"
              subtitle="Connect with other mentors, share insights, and grow together"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <motion.div
          className="tab-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="card">
            <div className="card-header">
              <h5>Recent Sessions</h5>
            </div>
            <div className="card-body">
              {pastSessions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Topic</th>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastSessions.map((session) => (
                        <tr key={session.id}>
                          <td>
                            <strong>{session.studentName}</strong>
                          </td>
                          <td>{session.topic}</td>
                          <td>{formatDate(session.scheduledAt)}</td>
                          <td>{session.duration} min</td>
                          <td>
                            <span
                              className={`badge bg-${
                                session.status === 'completed'
                                  ? 'success'
                                  : session.status === 'cancelled'
                                    ? 'danger'
                                    : 'warning'
                              }`}
                            >
                              {session.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center">No past sessions</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <motion.div
          className="tab-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="card">
            <div className="card-header d-flex justify-content-between">
              <h5>Earnings History</h5>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="btn btn-sm btn-primary"
                onClick={handleViewEarnings}
              >
                View Details <ChevronRight size={16} />
              </motion.button>
            </div>
            <div className="card-body">
              {earningsHistory.length > 0 ? (
                <div className="earnings-list">
                  {earningsHistory.map((earning) => (
                    <motion.div key={earning.id} className="earning-item" whileHover={{ x: 5 }}>
                      <div className="earning-date">
                        {new Date(earning.date).toLocaleDateString('en-US')}
                      </div>
                      <div className="earning-description">
                        <strong>{earning.description}</strong>
                        <p className="text-muted">{earning.details}</p>
                      </div>
                      <div className="earning-amount">
                        <span className="text-success">+{formatCurrency(earning.amount)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">No earnings history</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <motion.div
          className="tab-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="card">
            <div className="card-header d-flex justify-content-between">
              <h5>Student Reviews</h5>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="btn btn-sm btn-primary"
                onClick={handleViewReviews}
              >
                View All <ChevronRight size={16} />
              </motion.button>
            </div>
            <div className="card-body">
              {studentReviews.length > 0 ? (
                <div className="reviews-list">
                  {studentReviews.map((review) => (
                    <motion.div key={review.id} className="review-item" whileHover={{ y: -2 }}>
                      <div className="review-header">
                        <div className="reviewer-info">
                          {review.studentImage ? (
                            <img
                              src={review.studentImage}
                              alt={review.studentName}
                              className="reviewer-avatar"
                              onError={(e) => {
                                e.target.src =
                                  'https://ui-avatars.com/api/?name=' +
                                  encodeURIComponent(review.studentName || 'Student');
                              }}
                            />
                          ) : (
                            <div className="reviewer-avatar-placeholder">
                              {review.studentName?.charAt(0) || 'S'}
                            </div>
                          )}
                          <div>
                            <strong>{review.studentName}</strong>
                            <p className="text-muted text-small">
                              {new Date(review.date).toLocaleDateString('en-US')}
                            </p>
                          </div>
                        </div>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i < review.rating ? 'text-warning fill-current' : 'text-muted'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="review-text">{review.comment}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">No reviews yet</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <motion.div
          className="notifications-panel mt-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          ref={notificationRef}
        >
          <div className="card">
            <div className="card-header">
              <h5>
                <Bell size={20} /> Recent Notifications
              </h5>
            </div>
            <div className="card-body">
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  className={`notification-item notification-${notif.type}`}
                  whileHover={{ x: 5 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="notification-content">
                    <p>{notif.message}</p>
                    <span className="text-muted text-small">{notif.time}</span>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleDismissNotification(notif.id)}
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <motion.div
          className="recommendations-section mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <div className="card">
            <div className="card-header">
              <h5>
                <Zap size={20} /> AI-Powered Recommendations
              </h5>
            </div>
            <div className="card-body">
              {recommendations.map((rec, idx) => (
                <motion.div key={idx} className="recommendation-item" whileHover={{ x: 5 }}>
                  <div className="recommendation-icon">
                    <Target size={24} />
                  </div>
                  <div className="recommendation-content">
                    <strong>{rec.title}</strong>
                    <p className="text-muted">{rec.description}</p>
                    <small className="text-info">Impact: {rec.impact}</small>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MentorDashboardPro;
