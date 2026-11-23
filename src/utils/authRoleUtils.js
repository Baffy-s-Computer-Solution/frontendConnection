const USER_TYPE_ALIASES = {
  student: 'student',
  graduates: 'student',
  graduate: 'student',
  company: 'company',
  company_staff: 'company_staff',
  employer: 'company',
  institute: 'institute',
  educationalinstitute: 'institute',
  government: 'government',
  ministry: 'government',
  mentor: 'mentor',
  advisor: 'mentor',
  youth: 'youth',
  'youth entrepreneur': 'youth',
  entrepreneur: 'entrepreneur',
  parent: 'parent',
  guardian: 'parent',
  alumni: 'alumni',
  alumnus: 'alumni',
  alumin: 'alumni',
  admin: 'admin',
};

export const normalizeUserType = (userType) => {
  if (!userType || typeof userType !== 'string') {
    return 'student';
  }

  const normalized = userType.trim().toLowerCase();
  const alias = USER_TYPE_ALIASES[normalized];
  if (alias) {
    return alias;
  }

  if (normalized.includes('student')) {
    return 'student';
  }
  if (normalized.includes('company') || normalized.includes('employer')) {
    return 'company';
  }
  if (normalized.includes('institute') || normalized.includes('education')) {
    return 'institute';
  }
  if (normalized.includes('government') || normalized.includes('ministry')) {
    return 'government';
  }
  if (normalized.includes('mentor') || normalized.includes('advisor')) {
    return 'mentor';
  }
  if (normalized.includes('youth')) {
    return 'youth';
  }
  if (normalized.includes('entrepreneur')) {
    return 'entrepreneur';
  }
  if (normalized.includes('parent') || normalized.includes('guardian')) {
    return 'parent';
  }
  if (normalized.includes('alumni')) {
    return 'alumni';
  }
  if (normalized.includes('admin')) {
    return 'admin';
  }

  return 'student';
};

export const getDashboardPathByUserType = (userType) => {
  const normalized = normalizeUserType(userType);

  switch (normalized) {
    case 'admin':
      return '/admin/dashboard';
    case 'company':
      return '/company/dashboard';
    case 'company_staff':
      return '/company/teams';
    case 'institute':
      return '/institute/dashboard';
    case 'government':
      return '/government/dashboard';
    case 'mentor':
      return '/mentor/dashboard';
    case 'youth':
      return '/youth/dashboard';
    case 'entrepreneur':
      return '/entrepreneur/dashboard';
    case 'parent':
      return '/parent/dashboard';
    case 'alumni':
      return '/alumni/dashboard';
    default:
      return '/student/dashboard';
  }
};
