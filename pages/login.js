import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import Nav from '../components/Nav';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth check error:', error);
          toast.error('Authentication service unavailable. Please try again.');
          return;
        }
        
        if (user) {
          setTimeout(() => {
            if (router.isReady) {
              router.push('/');
            }
          }, 100);
        }
      } catch (error) {
        console.error('Connection error:', error);
        toast.error('Unable to connect to authentication service.');
      }
    };
    checkUser();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const loginPromise = supabase.auth.signInWithPassword({ email, password });
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Login timeout - please try again')), 10000)
        );
        
        const { error } = await Promise.race([loginPromise, timeoutPromise]);
        if (error) throw error;
        
        toast.success('Login successful!');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Authentication verification failed');
        }
        
        setTimeout(() => {
          if (router.isReady) {
            router.push('/');
          }
        }, 100);
      } else {
        const signupPromise = supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              email: email
            }
          }
        });
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Registration timeout - please try again')), 10000)
        );
        
        const { data, error } = await Promise.race([signupPromise, timeoutPromise]);
        if (error) throw error;
        
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            role: 'user'
          });
        }
        
        toast.success('Registration successful! Check your email for verification.');
        setIsLogin(true);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black font-riot">
      <Nav />
      <Toaster position="top-center" />
      
      <main className="flex items-center justify-center py-32 px-8">
        <div className="max-w-md w-full bg-black border border-gray-800 p-16">
          <div className="text-center mb-12">
            <div className="riot-underline inline-block">
              <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">
                {isLogin ? 'Welcome Back' : 'Join The Riot'}
              </h1>
            </div>
            <p className="text-gray-500 text-sm uppercase tracking-[0.2em]">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-8">
            <div>
              <label className="block text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-6 py-4 bg-black text-white border border-gray-800 focus:outline-none focus:border-riot-red font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="w-full px-6 py-4 bg-black text-white border border-gray-800 focus:outline-none focus:border-riot-red font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-riot-red text-white py-4 px-6 font-bold uppercase tracking-[0.1em] hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-riot-red hover:text-red-400 transition-colors text-sm uppercase tracking-widest"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
