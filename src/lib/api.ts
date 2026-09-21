export const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL as string | undefined;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  const hostname = window.location.hostname;
  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname)) {
    return 'http://localhost:5000';
  }

  return window.location.origin;
};