import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';

export default function Nav() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-riot-black border-b border-riot-red p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-riot-red">
          THE RIOT NETWORK
        </Link>
        
        <div className="flex space-x-6">
          <Link href="/stream" className="text-white hover:text-riot-red transition-colors">
            LIVE
          </Link>
          <Link href="/chat" className="text-white hover:text-riot-red transition-colors">
            CHAT
          </Link>
          <Link href="/schedule" className="text-white hover:text-riot-red transition-colors">
            SCHEDULE
          </Link>
          <Link href="/merch" className="text-white hover:text-riot-red transition-colors">
            MERCH
          </Link>
        </div>

        <div className="flex space-x-4">
          {user ? (
            <>
              <Link href="/profile" className="text-white hover:text-riot-red transition-colors">
                Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="text-white hover:text-riot-red transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="text-white hover:text-riot-red transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
