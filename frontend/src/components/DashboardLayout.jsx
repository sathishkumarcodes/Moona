import React from 'react';

/**
 * DashboardLayout - Main layout wrapper for dashboard
 * Provides consistent 12-column grid with max-width and padding
 */
const DashboardLayout = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

