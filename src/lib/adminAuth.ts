export const getAdminAccessToken = () =>
  sessionStorage.getItem('Tmommycare_admin_access_token') || '';

export const getAdminAuthHeaders = (): Record<string, string> => {
  const token = getAdminAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
