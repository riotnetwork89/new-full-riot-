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
    if (router.isReady) {
      router.push('/');
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
          <Link href="/" className="text-white hover:text-riot-red transition-colors font-medium text-sm uppercase tracking-widest">
            Home
          </Link>
          <Link href="/stream" className="text-white hover:text-riot-red transition-colors font-medium text-sm uppercase tracking-widest">
            Stream
          </Link>
          <Link href="/schedule" className="text-white hover:text-riot-red transition-colors font-medium text-sm uppercase tracking-widest">
            Schedule
          </Link>
          <Link href="/merch" className="text-white hover:text-riot-red transition-colors font-medium text-sm uppercase tracking-widest">
            Merch
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-riot-red hover:text-red-400 transition-colors font-medium text-sm uppercase tracking-widest">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-8">
          {user ? (
            <>
              <Link href="/profile" className="text-gray-400 hover:text-white transition-colors font-medium text-sm uppercase tracking-widest">
                Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors font-medium text-sm uppercase tracking-widest"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors font-medium text-sm uppercase tracking-widest">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
