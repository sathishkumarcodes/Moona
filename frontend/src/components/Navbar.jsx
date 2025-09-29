import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { TrendingUp, Activity, LogOut, User, Settings, Sparkles } from 'lucide-react';
import { useAuth } from './AuthProvider';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">
              🥇 Gold & Silver tracking coming soon! 🥈 Enhanced precious metals portfolio management
            </span>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                InvestTracker
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Portfolio Management</p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Status Badge */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700">Live Data</span>
              </div>
            </div>

            {/* Refresh Button */}
            <Button variant="outline" size="sm" className="hidden sm:flex items-center space-x-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
              <Activity className="w-4 h-4" />
              <span>Refresh</span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors duration-200">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold">
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                <div className="flex items-center space-x-3 p-3 border-b border-gray-100">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold">
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="py-2">
                  <DropdownMenuItem className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span>Preferences</span>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem 
                  className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-red-50 text-red-600 font-medium"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;