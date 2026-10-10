export const getAdminAccessToken = () =>
  sessionStorage.getItem('mommycare_admin_access_token') || '';

export const getAdminAuthHeaders = (): Record<string, string> => {
  const token = getAdminAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
