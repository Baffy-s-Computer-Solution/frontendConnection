import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { normalizeUserType } from '../../utils/authRoleUtils';
import { LoadingSpinner } from './LoadingSpinner';

const DashboardRedirect = () => {
  const { userProfile, loading, currentUser } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Redirecting to dashboard..." />;
  }

  if (!currentUser || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  const dashboardMap = {
    admin: '/admin/dashboard',
    student: '/student/dashboard',
    company: '/company/dashboard',
    institute: '/institute/dashboard',
    mentor: '/mentor/dashboard',
    youth: '/youth/dashboard',
    entrepreneur: '/entrepreneur/dashboard',
    parent: '/parent/dashboard',
    alumni: '/alumni/dashboard',
    government: '/government/dashboard',
    system: '/system/dashboard',
  };

  const userType = normalizeUserType(userProfile.userType || userProfile.role || 'student');
  const isAdmin = userProfile.isAdmin || userType === 'admin';

  // If admin, redirect to admin dashboard
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const redirectPath = dashboardMap[userType] || '/student/dashboard';
  return <Navigate to={redirectPath} replace />;
};

export default DashboardRedirect;
