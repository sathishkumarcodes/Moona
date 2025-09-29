import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import LoadingSpinner from "./components/LoadingSpinner";
import Navbar from "./components/Navbar";
import { Toaster } from "./components/ui/toaster";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // For testing purposes, bypass authentication  
  // if (isAuthenticated) {
  //   return <Navigate to="/dashboard" replace />;
  // }
  
  return children;
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}

export default App;