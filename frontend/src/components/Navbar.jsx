import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { TrendingUp, Activity, LogOut, User, Settings, Sparkles } from 'lucide-react';
import { useAuth } from './AuthProvider';
import MoonaLogo from './MoonaLogo';

const Navbar = () => {
  // Slimmer navbar - 56-64px height
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      {/* Slim Announcement Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-1.5">
            <Sparkles className="w-3 h-3 text-amber-600 mr-2" />
            <span className="text-xs font-medium text-amber-800">
              ⚙️ Gold & Silver tracking coming soon · Enhanced portfolio tagging in beta
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar - Slim (56-64px) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <MoonaLogo size="md" showTagline={true} />

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