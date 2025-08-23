import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';

export default function Nav() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsReady(router.isReady);
    
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

    return () => {
      subscription.unsubscribe();
    };
  }, [router.isReady]);

  const handleNavigation = (path) => {
    if (router.isReady && isReady) {
      router.push(path);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      if (router.isReady) {
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-black px-6 py-8 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="group">
          <div className="riot-underline">
            <span className="text-white text-4xl font-black tracking-tight">The Riot</span>
          </div>
        </Link>
        
        <div className="hidden md:flex space-x-16">
          <button 
            onClick={() => handleNavigation('/')}
            disabled={!isReady || !router.isReady}
            className="text-white hover:text-riot-red transition-colors font-medium text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Home
          </button>
          <button 
            onClick={() => handleNavigation('/stream')}
            disabled={!isReady || !router.isReady}
            className="text-white hover:text-riot-red transition-colors font-medium text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Stream
          </button>
          <button 
            onClick={() => handleNavigation('/schedule')}
            disabled={!isReady || !router.isReady}
            className="text-white hover:text-riot-red transition-colors font-medium text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Schedule
          </button>
          <button 
            onClick={() => handleNavigation('/merch')}
            disabled={!isReady || !router.isReady}
            className="text-white hover:text-riot-red transition-colors font-medium text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Merch
          </button>
          <button 
            onClick={() => handleNavigation('/vod')}
            disabled={!isReady || !router.isReady}
            className="text-white hover:text-riot-red transition-colors font-medium text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            VOD
          </button>
          {isAdmin && (
            <button 
              onClick={() => handleNavigation('/admin')}
              disabled={!isReady || !router.isReady}
              className="text-riot-red hover:text-red-400 transition-colors font-medium text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Admin
            </button>
          )}
        </div>

        <div className="flex items-center space-x-8">
          {user ? (
            <>
              <button 
                onClick={() => handleNavigation('/profile')}
                disabled={!isReady || !router.isReady}
                className="text-gray-400 hover:text-white transition-colors font-medium text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Profile
              </button>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors font-medium text-sm uppercase tracking-widest"
              >
                Logout
              </button>
            </>
          ) : (
            <button 
              onClick={() => handleNavigation('/login')}
              disabled={!isReady || !router.isReady}
              className="text-gray-400 hover:text-white transition-colors font-medium text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
