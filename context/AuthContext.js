import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Create axios instance
const api = axios.create({
  baseURL: 'https://ratemytone.com',
});

export const AuthProvider = ({ children }) => {
  const [user_id, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Attach token to axios automatically
  const setAuthHeader = (jwt) => {
    if (jwt) {
      api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  };

  // Load token on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      setToken(storedToken);
      setAuthHeader(storedToken);
    }

    setLoading(false);
  }, []);

  // 🔐 LOGIN
  const login = async (username, password) => {
    try {
      const res = await api.post('/wp-json/jwt-auth/v1/token', {
        username,
        password,
      });

      const { token, user_id } = res.data;

      if (token) {
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user_id);
        setAuthHeader(token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      return false;
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthHeader(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ user_id, token, login, logout, isAuthenticated, loading, api }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
