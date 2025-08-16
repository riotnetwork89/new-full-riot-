import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';

export default function Nav() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        if (user.email === 'kevinparxmusic@gmail.com') {
          setIsAdmin(true);
        } else {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('email', user.email)
              .single();
            
            if (!error && profile && profile.role === 'admin') {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } catch (err) {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        if (currentUser.email === 'kevinparxmusic@gmail.com') {
          setIsAdmin(true);
        } else {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('email', currentUser.email)
              .single();
            
            if (!error && profile && profile.role === 'admin') {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } catch (err) {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-black/95 backdrop-blur-md border-b border-gray-800 p-4 sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="group flex items-center space-x-3">
          <div className="bg-gradient-to-r from-riot-red to-red-700 px-4 py-2 rounded-xl shadow-lg shadow-riot-red/25 group-hover:shadow-riot-red/40 transition-all duration-300">
            <span className="text-white text-2xl font-black tracking-wider">RIOT</span>
          </div>
        </Link>
        
        <div className="hidden md:flex space-x-8">
          <Link href="/" className="relative text-white hover:text-riot-red transition-all duration-300 font-bold tracking-wide text-sm uppercase group">
            <span>HOME</span>
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-riot-red group-hover:w-full transition-all duration-300"></div>
          </Link>
          <Link href="/stream" className="relative text-white hover:text-riot-red transition-all duration-300 font-bold tracking-wide text-sm uppercase group">
            <span>STREAM</span>
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-riot-red group-hover:w-full transition-all duration-300"></div>
          </Link>
          <Link href="/schedule" className="relative text-white hover:text-riot-red transition-all duration-300 font-bold tracking-wide text-sm uppercase group">
            <span>SCHEDULE</span>
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-riot-red group-hover:w-full transition-all duration-300"></div>
          </Link>
          {isAdmin && (
            <Link href="/admin" className="relative text-riot-red hover:text-red-400 transition-all duration-300 font-bold tracking-wide text-sm uppercase group">
              <span>ADMIN</span>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-riot-red"></div>
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/profile" className="text-gray-300 hover:text-white transition-colors font-medium text-sm uppercase tracking-wide">
                Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm uppercase tracking-wide"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-gradient-to-r from-riot-red to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-800 transition-all duration-300 font-bold text-sm uppercase tracking-wide shadow-lg shadow-riot-red/25 hover:shadow-riot-red/40 transform hover:scale-105">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
