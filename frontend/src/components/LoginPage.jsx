import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, Shield, BarChart3, Wallet, Chrome } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const handleGoogleLogin = () => {
    const redirectUrl = encodeURIComponent(window.location.origin + '/dashboard');
    window.location.href = `https://auth.emergentagent.com/?redirect=${redirectUrl}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
        }}></div>
      </div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  InvestTracker
                </h1>
              </div>
              <p className="text-xl text-gray-300 max-w-lg">
                Your comprehensive investment portfolio tracker for stocks, crypto, and retirement accounts
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Real-time Analytics</h3>
                  <p className="text-sm text-gray-400">Live portfolio tracking</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure & Private</h3>
                  <p className="text-sm text-gray-400">Bank-level security</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Multi-Asset Support</h3>
                  <p className="text-sm text-gray-400">Stocks, crypto, Roth IRA</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold">SPY Comparison</h3>
                  <p className="text-sm text-gray-400">Benchmark analysis</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <CardTitle className="text-2xl text-white font-bold">
                  Welcome Back
                </CardTitle>
                <p className="text-gray-300">
                  Sign in with your Google account to access your investment dashboard
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Button 
                  onClick={handleGoogleLogin}
                  className="w-full h-12 bg-white text-gray-900 hover:bg-gray-100 transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Chrome className="w-5 h-5 mr-3" />
                  Continue with Google
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;