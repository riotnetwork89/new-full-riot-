import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export default function Nav() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    let authTimeout;
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      
      clearTimeout(authTimeout);
      authTimeout = setTimeout(() => {
        if (!mounted) return;
        setUser(user);
        
        if (user?.email === 'kevinparxmusic@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }, 50);
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      clearTimeout(authTimeout);
      authTimeout = setTimeout(() => {
        if (!mounted) return;
        
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser?.email === 'kevinparxmusic@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }, 50);
    });

    return () => {
      mounted = false;
      clearTimeout(authTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  };

  return (
    <nav className="bg-black px-6 py-8 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <a href="/" className="group">
          <div className="riot-underline">
            <span className="text-white text-4xl font-black tracking-tight">The Riot</span>
          </div>
        </a>
        
        <div className="hidden md:flex space-x-16">
          <a 
            href="/"
            className="text-white hover:text-riot-red transition-colors font-medium text-sm uppercase tracking-widest"
          >
            Home
          </a>
          <a 
            href="/stream"
            className="text-white hover:text-riot-red transition-colors font-medium text-sm uppercase tracking-widest"
          >
            Stream
          </a>
          <a 
            href="/schedule"
            className="text-white hover:text-riot-red transition-colors font-medium text-sm uppercase tracking-widest"
          >
            Schedule
          </a>
          <a 
            href="/merch"
            className="text-white hover:text-riot-red transition-colors font-medium text-sm uppercase tracking-widest"
          >
            Merch
          </a>
          <a 
            href="/vod"
            className="text-white hover:text-riot-red transition-colors font-medium text-sm uppercase tracking-widest"
          >
            VOD
          </a>
          {isAdmin && (
            <a 
              href="/admin"
              className="text-riot-red hover:text-red-400 transition-colors font-medium text-sm uppercase tracking-widest"
            >
              Admin
            </a>
          )}
        </div>

        <div className="flex items-center space-x-8">
          {user ? (
            <>
              <a 
                href="/profile"
                className="text-gray-400 hover:text-white transition-colors font-medium text-sm uppercase tracking-widest"
              >
                Profile
              </a>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors font-medium text-sm uppercase tracking-widest"
              >
                Logout
              </button>
            </>
          ) : (
            <a 
              href="/login"
              className="text-gray-400 hover:text-white transition-colors font-medium text-sm uppercase tracking-widest"
            >
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
