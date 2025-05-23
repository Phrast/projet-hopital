export const setAuth = (userData, token) => {
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('token', token);
};


export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};


export const getToken = () => {
  return localStorage.getItem('token');
};


export const isAuthenticated = () => {
  const user = getUser();
  const token = getToken();
  return !!user && !!token;
};


export const hasRole = (role) => {
  const user = getUser();
  return user && user.role === role;
};


export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};


export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};


export const checkAuth = (navigate, role) => {
  if (!isAuthenticated() || isTokenExpired()) {
    const loginPage = role === 'medecin' ? '/login-medecin' : '/login-patient';
    navigate(loginPage);
    return false;
  }
  
  if (role && !hasRole(role)) {
    navigate('/');
    return false;
  }
  
  return true;
};