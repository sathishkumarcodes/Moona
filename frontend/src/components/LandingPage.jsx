import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { TrendingUp, Shield, BarChart3, Wallet, ArrowRight, Play, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MoonaLogo from './MoonaLogo';
import AnimatedMoon from './AnimatedMoon';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 relative overflow-hidden">
      {/* Animated Moon Background */}
      <AnimatedMoon className="fixed top-32 right-32 pointer-events-none opacity-40" />
      
      {/* Background Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* 1. Header - Slim (56-64px) */}
      <div className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <MoonaLogo size="md" showTagline={false} />

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleGetStarted}
                className="text-white hover:bg-white/10"
              >
                Sign in
              </Button>
              <Button
                onClick={handleGetStarted}
                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all rounded-lg"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        {/* Vignette for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50 pointer-events-none" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-100">
              Trusted by thousands of investors
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Where your portfolio
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              shines brighter
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Track your stocks, crypto, and retirement accounts with real-time insights and clear portfolio explanations.
          </p>

          {/* Primary CTA Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Start Tracking Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-lg backdrop-blur-sm"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Microcopy */}
          <p className="text-sm text-gray-400">
            No credit card required. Read-only access to your accounts.
          </p>
        </div>
      </div>

      {/* 3. Feature Row */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Investment tracking that's out of this world
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1: Stellar Analytics */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all cursor-pointer rounded-xl shadow-sm hover:shadow-md">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Stellar Analytics</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Real-time portfolio insights & performance tracking.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2: Cosmic Security */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all cursor-pointer rounded-xl shadow-sm hover:shadow-md">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Cosmic Security</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Bank-level security & read-only brokerage connections.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3: Multi-Asset Galaxy */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all cursor-pointer rounded-xl shadow-sm hover:shadow-md">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Multi-Asset Galaxy</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Stocks, crypto, and retirement in one place.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4: Market Constellation */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all cursor-pointer rounded-xl shadow-sm hover:shadow-md">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Market Constellation</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Compare against SPY, QQQ, and custom benchmarks.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Bottom CTA Band */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 backdrop-blur-md border border-emerald-400/30 rounded-2xl p-12 text-center shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to launch your portfolio into orbit?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join investors who trust Moona to understand their portfolios with clarity.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Get Started for Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="relative z-10 border-t border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Trust Statement */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-400">
              🔒 Bank-level encryption. We never sell your data.
            </p>
          </div>

          {/* Footer Content */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © 2024 Moona. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <span>·</span>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
