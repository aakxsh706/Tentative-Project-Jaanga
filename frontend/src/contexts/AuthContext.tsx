import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string; // 'patient' | 'doctor' | 'admin'
}
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => void;
  api: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Base Axios instance
const API_URL = 'http://localhost:8080';
const api = axios.create({
  baseURL: API_URL,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Set auth header helper
  const setAuthHeader = (jwtToken: string | null) => {
    if (jwtToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    // Load credentials from localStorage on boot
    const savedToken = localStorage.getItem('tinnicare_token');
    const savedUser = localStorage.getItem('tinnicare_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setAuthHeader(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { access_token, role, user_id, full_name } = response.data;
      
      const loggedUser: User = { id: user_id, email, fullName: full_name, role };
      
      localStorage.setItem('tinnicare_token', access_token);
      localStorage.setItem('tinnicare_user', JSON.stringify(loggedUser));
      
      setToken(access_token);
      setUser(loggedUser);
      setAuthHeader(access_token);
      
      return loggedUser;
    } catch (error: any) {
      throw error.response?.data?.detail || 'Login failed. Please try again.';
    }
  };

  const register = async (data: any) => {
    try {
      const response = await api.post('/api/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.detail || 'Registration failed.';
    }
  };

  const logout = () => {
    localStorage.removeItem('tinnicare_token');
    localStorage.removeItem('tinnicare_user');
    setToken(null);
    setUser(null);
    setAuthHeader(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export { api };
