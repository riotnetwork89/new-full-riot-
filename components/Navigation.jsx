import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabase';

export default function Navigation() {
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
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 107, 107, 0.3)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <div className="nav-brand" style={{ 
              fontSize: '1.8rem', 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #ff0000, #ff6b6b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '1px'
            }}>
              RIOT NETWORK
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <Link href="/" className="nav-link" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontWeight: '600', 
              fontSize: '1rem',
              transition: 'color 0.3s ease',
              letterSpacing: '0.5px'
            }}>
              VAULT
            </Link>
            <Link href="/stream" className="nav-link" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontWeight: '600', 
              fontSize: '1rem',
              transition: 'color 0.3s ease',
              letterSpacing: '0.5px'
            }}>
              STREAM
            </Link>
            <Link href="/chat" className="nav-link" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontWeight: '600', 
              fontSize: '1rem',
              transition: 'color 0.3s ease',
              letterSpacing: '0.5px'
            }}>
              CHAT
            </Link>
            <Link href="/trivia" className="nav-link" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontWeight: '600', 
              fontSize: '1rem',
              transition: 'color 0.3s ease',
              letterSpacing: '0.5px'
            }}>
              TRIVIA
            </Link>
            {user && (
              <>
                <Link href="/profile" className="nav-link" style={{ 
                  color: 'white', 
                  textDecoration: 'none', 
                  fontWeight: '600', 
                  fontSize: '1rem',
                  transition: 'color 0.3s ease',
                  letterSpacing: '0.5px'
                }}>
                  PROFILE
                </Link>
                <Link href="/admin" className="nav-link" style={{ 
                  color: 'white', 
                  textDecoration: 'none', 
                  fontWeight: '600', 
                  fontSize: '1rem',
                  transition: 'color 0.3s ease',
                  letterSpacing: '0.5px'
                }}>
                  ADMIN
                </Link>
                <button 
                  onClick={handleLogout}
                  className="nav-link"
                  style={{ 
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'color 0.3s ease',
                    letterSpacing: '0.5px',
                    padding: 0
                  }}
                >
                  LOGOUT
                </button>
              </>
            )}
            {!user && (
              <Link href="/login" className="nav-link" style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontWeight: '600', 
                fontSize: '1rem',
                transition: 'color 0.3s ease',
                letterSpacing: '0.5px'
              }}>
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
