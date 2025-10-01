import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabase';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-red-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-red-500">
              RIOT NETWORK
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-red-500 transition-colors font-medium">
              VAULT
            </Link>
            <Link href="/stream" className="text-white hover:text-red-500 transition-colors font-medium">
              STREAM
            </Link>
            <Link href="/chat" className="text-white hover:text-red-500 transition-colors font-medium">
              CHAT
            </Link>
            <Link href="/trivia" className="text-white hover:text-red-500 transition-colors font-medium">
              TRIVIA
            </Link>
            {user && (
              <>
                <Link href="/profile" className="text-white hover:text-red-500 transition-colors font-medium">
                  PROFILE
                </Link>
                <Link href="/admin" className="text-white hover:text-red-500 transition-colors font-medium">
                  ADMIN
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-white hover:text-red-500 transition-colors font-medium"
                >
                  LOGOUT
                </button>
              </>
            )}
            {!user && (
              <Link href="/login" className="text-white hover:text-red-500 transition-colors font-medium">
                LOGIN
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-red-500 transition-colors"
            >
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/95 backdrop-blur-md">
              <Link
                href="/"
                className="block px-3 py-2 text-white hover:text-red-500 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                VAULT
              </Link>
              <Link
                href="/stream"
                className="block px-3 py-2 text-white hover:text-red-500 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                STREAM
              </Link>
              <Link
                href="/chat"
                className="block px-3 py-2 text-white hover:text-red-500 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                CHAT
              </Link>
              <Link
                href="/trivia"
                className="block px-3 py-2 text-white hover:text-red-500 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                TRIVIA
              </Link>
              {user && (
                <>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-white hover:text-red-500 transition-colors font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    PROFILE
                  </Link>
                  <Link
                    href="/admin"
                    className="block px-3 py-2 text-white hover:text-red-500 transition-colors font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    ADMIN
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-white hover:text-red-500 transition-colors font-medium"
                  >
                    LOGOUT
                  </button>
                </>
              )}
              {!user && (
                <Link
                  href="/login"
                  className="block px-3 py-2 text-white hover:text-red-500 transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  LOGIN
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
