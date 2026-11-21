/**
 * Administrator provisioning is intentionally server-only.
 * This compatibility module fails safely for stale imports and has no Firebase
 * Auth/Firestore write capability.
 */
export const initializeAdminUser = async () => ({
  success: false,
  message: 'Administrator provisioning is only available through the secured backend.',
});

export const checkAdminStatus = async () => ({
  success: false,
  available: false,
  message: 'Administrator status must be checked through authenticated server APIs.',
});

export const validateEnvVars = () => false;

export default { initializeAdminUser, checkAdminStatus, validateEnvVars };
