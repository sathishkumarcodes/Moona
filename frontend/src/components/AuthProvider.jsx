import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // No mock user
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start unauthenticated

  // Check for existing session on app load
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Handle session ID from URL fragment after OAuth redirect
  useEffect(() => {
    const handleSessionId = async () => {
      const fragment = window.location.hash;
      if (fragment.includes('session_id=')) {
        setIsLoading(true);
        const sessionId = fragment.split('session_id=')[1]?.split('&')[0];
        
        if (sessionId) {
          try {
            // Clean URL fragment immediately
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Exchange session_id for user data and session_token
            const response = await axios.get('https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data', {
              headers: { 'X-Session-ID': sessionId }
            });
            
            const userData = response.data;
            
            // Store user session in backend
            await axios.post(`${API}/auth/session`, userData, {
              withCredentials: true
            });
            
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              picture: userData.picture
            });
            setIsAuthenticated(true);
            
            // Redirect to dashboard after successful authentication
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 100);
          } catch (error) {
            console.error('Authentication error:', error);
          }
        }
        setIsLoading(false);
      }
    };

    handleSessionId();
  }, []);

  const checkExistingSession = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        withCredentials: true
      });
      
      if (response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // No existing session, user needs to login
      console.log('No existing session found');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, {
        withCredentials: true
      });
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if backend call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    logout,
    checkExistingSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};