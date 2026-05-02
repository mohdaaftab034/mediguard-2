import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [chemist, setChemist] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}/auth`;

  useEffect(() => {
    const savedUser = localStorage.getItem('mediguard-user');
    const savedChemist = localStorage.getItem('mediguard-chemist');
    const token = localStorage.getItem('mediguard-token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      if (savedChemist) setChemist(JSON.parse(savedChemist));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      if (response.data.success) {
        const { user, chemist, accessToken } = response.data.data;
        setUser(user);
        setChemist(chemist);
        localStorage.setItem('mediguard-user', JSON.stringify(user));
        if (chemist) localStorage.setItem('mediguard-chemist', JSON.stringify(chemist));
        localStorage.setItem('mediguard-token', accessToken);
        localStorage.setItem('token', accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        return { success: true, user };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, formData);
      if (response.data.success) {
        const { user, chemist, accessToken } = response.data.data;
        setUser(user);
        setChemist(chemist);
        localStorage.setItem('mediguard-user', JSON.stringify(user));
        if (chemist) localStorage.setItem('mediguard-chemist', JSON.stringify(chemist));
        localStorage.setItem('mediguard-token', accessToken);
        localStorage.setItem('token', accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`);
    } catch (err) {
      console.log('Logout error', err);
    } finally {
      setUser(null);
      setChemist(null);
      localStorage.removeItem('mediguard-user');
      localStorage.removeItem('mediguard-chemist');
      localStorage.removeItem('mediguard-token');
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  return (
    <AuthContext.Provider value={{ user, chemist, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
