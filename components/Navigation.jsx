import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Navigation() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      setUser(JSON.parse(mockUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mockUser');
    setUser(null);
    router.push('/login');
  };

  return (
    <nav style={{
      background: 'linear-gradient(90deg, #000000, #1a0000)',
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link href="/" style={{
          fontSize: '1.5rem',
          fontWeight: '900',
          color: 'white',
          textDecoration: 'none',
          background: 'linear-gradient(45deg, #ff0000, #ffffff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '2px'
        }}>
          RIOT NETWORK
        </Link>
        
        <div style={{
          display: 'flex',
          gap: '2.5rem',
          alignItems: 'center'
        }}>
          <Link href="/vault" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 0.9,
            cursor: 'pointer',
            userSelect: 'none',
            display: 'block',
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            transition: 'color 0.2s ease'
          }}>
            VOD
          </Link>
          <Link href="/stream" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 0.9,
            cursor: 'pointer',
            userSelect: 'none',
            display: 'block',
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            transition: 'color 0.2s ease'
          }}>
            STREAM
          </Link>
          <Link href="/chat" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 0.9,
            cursor: 'pointer',
            userSelect: 'none',
            display: 'block',
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            transition: 'color 0.2s ease'
          }}>
            CHAT
          </Link>
          <Link href="/merch" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 0.9,
            cursor: 'pointer',
            userSelect: 'none',
            display: 'block',
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            transition: 'color 0.2s ease'
          }}>
            MERCH
          </Link>
          <Link href="/schedule" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 0.9,
            cursor: 'pointer',
            userSelect: 'none',
            display: 'block',
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            transition: 'color 0.2s ease'
          }}>
            SCHEDULE
          </Link>
          {user ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link href="/profile" style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: 0.9,
                cursor: 'pointer',
                userSelect: 'none',
                display: 'block',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                transition: 'color 0.2s ease'
              }}>
                PROFILE
              </Link>
              {user.email === 'kevinparxmusic@gmail.com' && (
                <Link href="/admin" style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: 0.9,
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'block',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '4px',
                  transition: 'color 0.2s ease'
                }}>
                  ADMIN
                </Link>
              )}
              <span style={{ color: 'white', fontSize: '0.9rem' }}>
                {user.email}
              </span>
              <button 
                onClick={handleLogout}
                style={{
                  background: 'linear-gradient(45deg, #ff0000, #cc0000)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease'
                }}
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <Link href="/login" style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.9,
              cursor: 'pointer',
              userSelect: 'none',
              display: 'block',
              padding: '0.5rem 0.75rem',
              borderRadius: '4px',
              transition: 'color 0.2s ease'
            }}>
              LOGIN
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
