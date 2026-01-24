import React, { createContext, useState, useEffect } from 'react';
import api from './config/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user');
    const storedToken =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Initialize face capture if needed (only after user is set)
        // This assumes you have a faceCaptureService available
        if (parsedUser.id) {
          // Start face capture with a delay
          setTimeout(() => {
            // Check if faceCaptureService exists before calling
            if (window.faceCaptureService) {
              window.faceCaptureService.initialize(parsedUser.id);
            }
            // Or if you import it:
            // import { faceCaptureService } from './services/faceCaptureService';
            // faceCaptureService.initialize(parsedUser.id);
          }, 1000);
        }
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  async function login(email, password, rememberMe = true) {
    try {
      setError(null);
      const { data } = await api.post('/auth/login', { email, password });
      const userPayload = {
        id: data.userId,
        email: data.email,
        role: data.role,
        username: data.username
      };

      if (rememberMe) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userPayload));
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } else {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(userPayload));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      setUser(userPayload);
      console.log('✓ Login successful:', userPayload);
      
      // Initialize face capture after successful login
      if (userPayload.id) {
        setTimeout(() => {
          if (window.faceCaptureService) {
            window.faceCaptureService.initialize(userPayload.id);
          }
        }, 1000);
      }
      
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMsg);
      console.error('Login error:', errorMsg);
      throw error;
    }
  }

  async function signup(payload) {
    try {
      setError(null);
      await api.post('/auth/signup', payload);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Signup failed. Please try again.';
      setError(errorMsg);
      throw error;
    }
  }

  function logout() {
    // Clean up face capture if needed
    if (window.faceCaptureService) {
      window.faceCaptureService.cleanup();
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setError(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      signup,
      logout,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
}