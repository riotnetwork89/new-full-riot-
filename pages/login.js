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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/stream');
      }
    };
    checkUser();
  }, [router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        toast.success('Login successful!');
        router.push('/stream');
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              email: email
            }
          }
        });
        
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
      toast.error(error.message);
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
                className="w-full px-6 py-4 bg-black text-white border border-gray-800 focus:outline-none focus:border-riot-red font-medium"
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
                className="w-full px-6 py-4 bg-black text-white border border-gray-800 focus:outline-none focus:border-riot-red font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-riot-red text-white py-4 px-6 font-bold uppercase tracking-[0.1em] hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
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
