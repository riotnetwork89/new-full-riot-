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
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', user.email)
          .single();
        
        console.log('Nav.js - Profile query result:', { profile, error, userEmail: user.email });
        setIsAdmin(profile?.role === 'admin');
        console.log('Nav.js - Setting isAdmin to:', profile?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', currentUser.email)
          .single();
        
        console.log('Nav.js - Auth state change profile query:', { profile, error, userEmail: currentUser.email });
        setIsAdmin(profile?.role === 'admin');
        console.log('Nav.js - Auth state change setting isAdmin to:', profile?.role === 'admin');
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
    <nav className="bg-riot-black border-b border-riot-red p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold text-white tracking-wider">
          <span className="bg-riot-red px-3 py-1 rounded">RIOT</span>
        </Link>
        
        <div className="flex space-x-8">
          <Link href="/" className="text-white hover:text-riot-red transition-colors font-semibold tracking-wide">
            HOME
          </Link>
          <Link href="/stream" className="text-white hover:text-riot-red transition-colors font-semibold tracking-wide">
            STREAM
          </Link>
          <Link href="/schedule" className="text-white hover:text-riot-red transition-colors font-semibold tracking-wide">
            SCHEDULE
          </Link>
          <Link href="/trivia" className="text-white hover:text-riot-red transition-colors font-semibold tracking-wide">
            TRIVIA
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-riot-red hover:text-red-400 transition-colors font-semibold tracking-wide">
              ADMIN
            </Link>
          )}
        </div>

        <div className="flex space-x-4">
          {user ? (
            <>
              <Link href="/profile" className="text-white hover:text-riot-red transition-colors font-medium">
                Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="text-white hover:text-riot-red transition-colors font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-riot-red text-white px-4 py-2 rounded hover:bg-red-700 transition-colors font-semibold">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
