// frontend/src/test/factories/userFactory.js
// ============================================================
// Test Data Factories
// ============================================================
let idCounter = 0;
const nextId = (prefix) => `${prefix}-${++idCounter}`;

export const createUser = (overrides = {}) => ({
  id: nextId('user'),
  uid: nextId('uid'),
  email: `user${idCounter}@example.com`,
  displayName: `Test User ${idCounter}`,
  firstName: 'Test',
  lastName: 'User',
  role: 'student',
  photoURL: null,
  emailVerified: true,
  phoneNumber: '+1234567890',
  bio: 'A test user bio',
  location: 'Test City',
  skills: ['JavaScript', 'React'],
  interests: ['Technology', 'Education'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createStudent = (overrides = {}) =>
  createUser({ role: 'student', ...overrides });

export const createCompany = (overrides = {}) =>
  createUser({
    role: 'company',
    companyName: `Company ${idCounter}`,
    industry: 'Technology',
    ...overrides,
  });

export const createMentor = (overrides = {}) =>
  createUser({
    role: 'mentor',
    expertise: ['Career Development', 'Leadership'],
    ...overrides,
  });

export const createAdmin = (overrides = {}) =>
  createUser({ role: 'admin', ...overrides });

export const createJob = (overrides = {}) => ({
  id: nextId('job'),
  title: 'Software Engineer',
  companyId: nextId('company'),
  companyName: 'Tech Corp',
  location: 'Remote',
  description: 'We are looking for a talented engineer.',
  requirements: ['3+ years experience', 'React', 'Node.js'],
  responsibilities: ['Build features', 'Review code'],
  salary: { min: 60000, max: 90000, currency: 'USD' },
  type: 'full-time',
  experienceLevel: 'mid',
  status: 'active',
  tags: ['react', 'nodejs'],
  postedAt: new Date().toISOString(),
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
});

export const createApplication = (overrides = {}) => ({
  id: nextId('app'),
  jobId: nextId('job'),
  userId: nextId('user'),
  status: 'pending',
  coverLetter: 'I am interested in this position.',
  resumeUrl: 'https://example.com/resume.pdf',
  appliedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createNotification = (overrides = {}) => ({
  id: nextId('notif'),
  userId: nextId('user'),
  type: 'info',
  title: 'Test Notification',
  message: 'This is a test notification',
  read: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMessage = (overrides = {}) => ({
  id: nextId('msg'),
  senderId: nextId('user'),
  receiverId: nextId('user'),
  content: 'Test message content',
  read: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMentorshipSession = (overrides = {}) => ({
  id: nextId('session'),
  mentorId: nextId('mentor'),
  menteeId: nextId('student'),
  title: 'Career Guidance Session',
  description: 'Discuss career paths',
  scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  duration: 60,
  status: 'scheduled',
  meetingLink: 'https://meet.example.com/session',
  ...overrides,
});

export const resetFactories = () => {
  idCounter = 0;
};