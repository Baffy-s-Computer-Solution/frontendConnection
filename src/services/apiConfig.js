const isLocalHost = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
};

const isFirebaseHosted = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host.endsWith('.web.app') || host.endsWith('.firebaseapp.com');
};

const resolveApiBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_APP_API_URL ||
    import.meta.env.VITE_BASE_URL_API ||
    '';

  if (envUrl && envUrl.trim()) {
    try {
      return new URL(envUrl).toString().replace(/\/+$/, '');
    } catch (e) {
      console.warn('Invalid API URL configured:', envUrl);
    }
  }

  // For production/hosted environments
  if (isFirebaseHosted()) {
    // Firebase Hosting is static; send API traffic to the deployed backend.
    return (
      import.meta.env.VITE_API_BASE_URL ||
      'https://career-connect-backend-79v0.onrender.com'
    );
  }

  // For local development
  if (isLocalHost()) {
    // Use localhost with appropriate port
    const port = import.meta.env.VITE_API_PORT || '5000';
    return `http://localhost:${port}`;
  }

  // Final fallback: use current origin if everything else fails
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
};

export const API_BASE_URL = resolveApiBaseUrl();

if (
  import.meta.env.VITE_APP_ENVIRONMENT === 'production' &&
  !API_BASE_URL.startsWith('https://')
) {
  console.warn('Production alumni API URL must use HTTPS.');
}

console.log('🔧 API Base URL resolved:', API_BASE_URL);

export default API_BASE_URL;
