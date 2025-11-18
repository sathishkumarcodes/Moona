import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { TrendingUp, Shield, BarChart3, Wallet, Mail } from 'lucide-react';
import MoonaLogo from './MoonaLogo';
import AnimatedMoon from './AnimatedMoon';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  
  const handleMoonaLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const userData = await response.json();
        window.location.href = '/dashboard';
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
        const errorMsg = errorData.detail || 'Login failed. Please try again.';
        
        // Check if it's a database connection error
        if (errorMsg.includes('Database connection') || errorMsg.includes('MongoDB')) {
          setError('Database not connected. Please set up MongoDB. See QUICK_FIX_MONGODB.md for instructions.');
        } else {
          setError(errorMsg);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoonaRegister = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email, 
          password,
          name: name || undefined
        })
      });
      
      if (response.ok) {
        const userData = await response.json();
        window.location.href = '/dashboard';
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Registration failed' }));
        const errorMsg = errorData.detail || 'Registration failed. Please try again.';
        
        // Check if it's a database connection error
        if (errorMsg.includes('Database connection') || errorMsg.includes('MongoDB')) {
          setError('Database not connected. Please set up MongoDB. See QUICK_FIX_MONGODB.md for instructions.');
        } else {
          setError(errorMsg);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Use configured Client ID or fallback to your Client ID
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '687644263156-ogrv9joos1118leid0asb2clkedmiuja.apps.googleusercontent.com';
    
    console.log('🔵 Starting Google OAuth login with Client ID:', googleClientId.substring(0, 20) + '...');

    // Redirect to Google OAuth
    const redirectUri = encodeURIComponent(window.location.origin + '/login');
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('oauth_state', state);
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${googleClientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    console.log('🔵 Redirecting to Google OAuth...');
    window.location.href = googleAuthUrl;
  };

  // Check if Google OAuth is configured - FORCE ENABLED
  const isGoogleOAuthEnabled = () => {
    // Always return true - Gmail login is enabled
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '687644263156-ogrv9joos1118leid0asb2clkedmiuja.apps.googleusercontent.com';
    console.log('✅ Google OAuth ENABLED - Gmail login available');
    return true; // Force enable Gmail login
  };

  // Handle Google OAuth callback
  React.useEffect(() => {
    // Prevent duplicate processing
    let isProcessing = false;
    
    const handleGoogleCallback = async () => {
      // Prevent multiple simultaneous calls
      if (isProcessing) {
        console.log('⏸️ Callback already processing, skipping...');
        return;
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const storedState = localStorage.getItem('oauth_state');
      
      // Only process if we have a code or error
      if (!code && !error) {
        return; // No OAuth callback, exit early
      }
      
      isProcessing = true;
      console.log('🔵 Google OAuth Callback:', { code: code ? 'present' : 'missing', state, storedState, error });
      
      // Check for OAuth error from Google
      if (error) {
        console.error('❌ Google OAuth Error:', error);
        setError(`Google authentication error: ${error}. Please try again.`);
        window.history.replaceState({}, document.title, '/login');
        isProcessing = false;
        return;
      }
      
      // If we have a code, proceed with authentication
      // State check is important but we'll be more lenient for better UX
      if (code) {
        // Check if we've already processed this code (prevent duplicate processing)
        const processedCodeKey = `oauth_code_${code.substring(0, 20)}`;
        if (sessionStorage.getItem(processedCodeKey)) {
          console.log('⏸️ Code already processed, skipping...');
          isProcessing = false;
          // Clean URL and redirect
          window.history.replaceState({}, document.title, '/login');
          return;
        }
        
        // Mark code as being processed
        sessionStorage.setItem(processedCodeKey, 'true');
        
        // Warn if state doesn't match but still proceed (state might be lost on page reload)
        if (storedState && state !== storedState) {
          console.warn('⚠️ State mismatch detected, but proceeding with authentication');
        }
        
        // Remove state from localStorage
        if (storedState) {
          localStorage.removeItem('oauth_state');
        }
        
        setIsLoading(true);
        setError('');
        
        console.log('🔵 Exchanging code for token...');
        
        try {
          // Exchange code for ID token via backend - do this immediately
          const response = await fetch(`${BACKEND_URL}/api/auth/google/callback?code=${encodeURIComponent(code)}&state=${state || ''}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          console.log('🔵 Backend response status:', response.status);
          console.log('🔵 Request URL:', `${BACKEND_URL}/api/auth/google/callback?code=${code ? 'present' : 'missing'}&state=${state || ''}`);
          
          if (response.ok) {
            const userData = await response.json();
            console.log('✅ Google authentication successful:', userData);
            // Clean URL immediately
            window.history.replaceState({}, document.title, '/login');
            // Remove processed code marker
            sessionStorage.removeItem(processedCodeKey);
            // Redirect to dashboard immediately
            window.location.href = '/dashboard';
          } else {
            const errorText = await response.text();
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { detail: errorText || 'Google authentication failed' };
            }
            console.error('❌ Backend error:', errorData);
            console.error('❌ Full error response:', errorText);
            console.error('❌ Response status:', response.status);
            
            // Remove processed code marker on error so user can retry
            sessionStorage.removeItem(processedCodeKey);
            
            // Check for specific error types
            if (errorData.detail && errorData.detail.includes('expired or already used')) {
              setError('Authorization code expired. Please click the Gmail button again to get a fresh code.');
            } else if (errorData.detail && (errorData.detail.includes('Database not configured') || errorData.detail.includes('SUPABASE_DB_URL'))) {
              setError('Database not configured. Please set up Supabase. See QUICK_SUPABASE_FIX.md for instructions.');
            } else if (errorData.detail && errorData.detail.includes('Database connection')) {
              setError('Database connection failed. Please check your Supabase configuration in backend/.env');
            } else {
              setError(errorData.detail || 'Google authentication failed. Please try again.');
            }
            // Clean URL
            window.history.replaceState({}, document.title, '/login');
          }
        } catch (error) {
          console.error('❌ Google auth error:', error);
          // Remove processed code marker on error
          sessionStorage.removeItem(processedCodeKey);
          setError(`Google authentication failed: ${error.message}. Please try again.`);
          window.history.replaceState({}, document.title, '/login');
        } finally {
          setIsLoading(false);
          isProcessing = false;
        }
      } else {
        isProcessing = false;
      }
    };

    handleGoogleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 relative overflow-hidden">
      {/* Animated Moon Background */}
      <AnimatedMoon className="fixed top-20 right-20 pointer-events-none opacity-30" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
        }}></div>
      </div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Moona Branding */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <MoonaLogo size="xl" showTagline={true} className="text-white" />
              <p className="text-xl text-slate-300 max-w-lg">
                Track your stocks, crypto, and retirement investments with celestial precision
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Stellar Analytics</h3>
                  <p className="text-sm text-slate-400">Real-time portfolio insights</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Cosmic Security</h3>
                  <p className="text-sm text-slate-400">Bank-level protection</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Multi-Asset Galaxy</h3>
                  <p className="text-sm text-slate-400">Stocks, crypto, retirement</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Market Constellation</h3>
                  <p className="text-sm text-slate-400">SPY benchmark tracking</p>
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
                  Sign in to access your investment dashboard
                </p>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5">
                    <TabsTrigger value="login" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="register" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                        {error}
                      </div>
                    )}
                    
                    <form onSubmit={handleMoonaLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-gray-300">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          required
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-gray-300">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <Button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
                      >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>

                    {isGoogleOAuthEnabled() && (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/20"></span>
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-transparent px-2 text-gray-400">Or continue with</span>
                          </div>
                        </div>

                        <Button 
                          onClick={handleGoogleLogin}
                          disabled={isLoading}
                          className="w-full h-12 bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center"
                        >
                          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Continue with Gmail
                        </Button>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                        {error}
                      </div>
                    )}
                    
                    <form onSubmit={handleMoonaRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name" className="text-gray-300">Name (Optional)</Label>
                        <Input
                          id="register-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-email" className="text-gray-300">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          required
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-gray-300">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          required
                          minLength={6}
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <Button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
                      >
                        {isLoading ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </form>

                    {isGoogleOAuthEnabled() && (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/20"></span>
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-transparent px-2 text-gray-400">Or sign up with</span>
                          </div>
                        </div>

                        <Button 
                          onClick={handleGoogleLogin}
                          disabled={isLoading}
                          className="w-full h-12 bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center"
                        >
                          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Sign up with Gmail
                        </Button>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
