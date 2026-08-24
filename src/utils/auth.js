import Cookies from 'js-cookie';

const TOKEN_KEY = 'admin_auth_token';

// auth.js
export const setAuthToken = (token) => {
  const isProduction = window.location.protocol === 'https:';
  Cookies.set(TOKEN_KEY, token, { expires: 7, secure: isProduction }); 
  localStorage.setItem(TOKEN_KEY, token); // Fallback
};

export const getAuthToken = () => {
  return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = () => {
  Cookies.remove(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};