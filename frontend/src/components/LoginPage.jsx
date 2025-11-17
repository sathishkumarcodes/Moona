import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { TrendingUp, Shield, BarChart3, Wallet, Chrome, Mail } from 'lucide-react';
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
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    if (!googleClientId || googleClientId === 'your_google_client_id_here') {
      setError('Google OAuth is not configured. Please use Moona account login or contact support to enable Google login.');
      return;
    }

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
    
    window.location.href = googleAuthUrl;
  };

  // Check if Google OAuth is configured
  const isGoogleOAuthEnabled = () => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    return googleClientId && googleClientId !== 'your_google_client_id_here';
  };

  // Handle Google OAuth callback
  React.useEffect(() => {
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const storedState = localStorage.getItem('oauth_state');
      
      if (code && state === storedState) {
        localStorage.removeItem('oauth_state');
        setIsLoading(true);
        setError('');
        
        try {
          // Exchange code for ID token via backend
          const response = await fetch(`${BACKEND_URL}/api/auth/google/callback?code=${code}&state=${state}`, {
            method: 'GET',
            credentials: 'include'
          });
          
          if (response.ok) {
            const userData = await response.json();
            // Clean URL
            window.history.replaceState({}, document.title, '/login');
            window.location.href = '/dashboard';
          } else {
            const errorData = await response.json();
            setError(errorData.detail || 'Google authentication failed.');
            // Clean URL
            window.history.replaceState({}, document.title, '/login');
          }
        } catch (error) {
          console.error('Google auth error:', error);
          setError('Google authentication failed. Please try again.');
          window.history.replaceState({}, document.title, '/login');
        } finally {
          setIsLoading(false);
        }
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
                          className="w-full h-12 bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Chrome className="w-5 h-5 mr-3" />
                          Continue with Google
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
                          className="w-full h-12 bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Chrome className="w-5 h-5 mr-3" />
                          Sign up with Google
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
