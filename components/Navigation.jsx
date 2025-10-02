import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabase';

export default function Navigation() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  const handleNavClick = (path, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.target) {
      e.target.style.opacity = '0.7';
      setTimeout(() => {
        if (e.target) e.target.style.opacity = '1';
      }, 100);
    }
    
    setTimeout(() => {
      router.push(path);
    }, 50);
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
          letterSpacing: '2px',
          cursor: 'pointer',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }} onClick={(e) => handleNavClick('/', e)}>
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
            cursor: 'pointer',
            display: 'inline-block',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            transition: 'all 0.15s ease',
            background: router.pathname === '/vault' ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
            border: '1px solid transparent',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: 'auto'
          }}
          onClick={(e) => handleNavClick('/vault', e)}
          onMouseEnter={(e) => {
            if (router.pathname !== '/vault') {
              e.target.style.background = 'rgba(255, 0, 0, 0.1)';
              e.target.style.borderColor = 'rgba(255, 0, 0, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (router.pathname !== '/vault') {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'transparent';
            }
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
            cursor: 'pointer',
            display: 'inline-block',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            transition: 'all 0.15s ease',
            background: router.pathname === '/stream' ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
            border: '1px solid transparent',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: 'auto'
          }}
          onClick={(e) => handleNavClick('/stream', e)}
          onMouseEnter={(e) => {
            if (router.pathname !== '/stream') {
              e.target.style.background = 'rgba(255, 0, 0, 0.1)';
              e.target.style.borderColor = 'rgba(255, 0, 0, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (router.pathname !== '/stream') {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'transparent';
            }
          }}>
            STREAM
          </Link>
          <Link href="/merch" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            display: 'inline-block',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            transition: 'all 0.15s ease',
            background: router.pathname === '/merch' ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
            border: '1px solid transparent',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: 'auto'
          }}
          onClick={(e) => handleNavClick('/merch', e)}
          onMouseEnter={(e) => {
            if (router.pathname !== '/merch') {
              e.target.style.background = 'rgba(255, 0, 0, 0.1)';
              e.target.style.borderColor = 'rgba(255, 0, 0, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (router.pathname !== '/merch') {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'transparent';
            }
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
            cursor: 'pointer',
            display: 'inline-block',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            transition: 'all 0.15s ease',
            background: router.pathname === '/schedule' ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
            border: '1px solid transparent',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: 'auto'
          }}
          onClick={(e) => handleNavClick('/schedule', e)}
          onMouseEnter={(e) => {
            if (router.pathname !== '/schedule') {
              e.target.style.background = 'rgba(255, 0, 0, 0.1)';
              e.target.style.borderColor = 'rgba(255, 0, 0, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (router.pathname !== '/schedule') {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'transparent';
            }
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
                cursor: 'pointer',
                display: 'inline-block',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                transition: 'all 0.15s ease',
                background: router.pathname === '/profile' ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
                border: '1px solid transparent',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                pointerEvents: 'auto'
              }}
              onClick={(e) => handleNavClick('/profile', e)}
              onMouseEnter={(e) => {
                if (router.pathname !== '/profile') {
                  e.target.style.background = 'rgba(255, 0, 0, 0.1)';
                  e.target.style.borderColor = 'rgba(255, 0, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (router.pathname !== '/profile') {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'transparent';
                }
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
                  cursor: 'pointer',
                  display: 'inline-block',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  transition: 'all 0.15s ease',
                  background: router.pathname === '/admin' ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
                  border: '1px solid transparent',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  pointerEvents: 'auto'
                }}
                onClick={(e) => handleNavClick('/admin', e)}
                onMouseEnter={(e) => {
                  if (router.pathname !== '/admin') {
                    e.target.style.background = 'rgba(255, 0, 0, 0.1)';
                    e.target.style.borderColor = 'rgba(255, 0, 0, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (router.pathname !== '/admin') {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = 'transparent';
                  }
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
                  padding: '0.75rem 1.25rem',
                  borderRadius: '25px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 8px rgba(255, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(255, 0, 0, 0.3)';
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(0)';
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
              cursor: 'pointer',
              display: 'inline-block',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              transition: 'all 0.15s ease',
              background: router.pathname === '/login' ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
              border: '1px solid transparent',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              pointerEvents: 'auto'
            }}
            onClick={(e) => handleNavClick('/login', e)}
            onMouseEnter={(e) => {
              if (router.pathname !== '/login') {
                e.target.style.background = 'rgba(255, 0, 0, 0.1)';
                e.target.style.borderColor = 'rgba(255, 0, 0, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (router.pathname !== '/login') {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = 'transparent';
              }
            }}>
              LOGIN
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
