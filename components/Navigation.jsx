import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabase';

export default function Navigation() {
  const [user, setUser] = useState(null);
  const router = useRouter();


  useEffect(() => {
    const checkUser = () => {
      const mockUser = localStorage.getItem('mockUser');
      const user = mockUser ? JSON.parse(mockUser) : null;
      setUser(user && user.authenticated ? user : null);
    };
    
    checkUser();
    
    const interval = setInterval(checkUser, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
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
        <div style={{
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
        }} onClick={(e) => {
          e.preventDefault();
          console.log('Home navigation clicked');
          if (router.asPath !== '/') {
            router.push('/');
          } else {
            console.log('Already on home page, skipping navigation');
          }
        }}>
          RIOT NETWORK
        </div>
        
        <div style={{
          display: 'flex',
          gap: '2.5rem',
          alignItems: 'center'
        }}>
          <div style={{
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
          onClick={(e) => {
            console.log('🔥 VOD onClick handler triggered!', e);
            e.preventDefault();
            e.stopPropagation();
            console.log('VOD navigation clicked - using router.push');
            if (router.asPath !== '/vault') {
              router.push('/vault');
            } else {
              console.log('Already on VOD page, skipping navigation');
            }
          }}
          onMouseDown={(e) => {
            console.log('🔥 VOD onMouseDown triggered!', e);
          }}
          onMouseUp={(e) => {
            console.log('🔥 VOD onMouseUp triggered!', e);
          }}
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
          </div>
          <div style={{
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
          onClick={(e) => {
            console.log('🔥 STREAM onClick handler triggered!', e);
            e.preventDefault();
            e.stopPropagation();
            console.log('STREAM navigation clicked - using router.push');
            if (router.asPath !== '/stream') {
              router.push('/stream');
            } else {
              console.log('Already on STREAM page, skipping navigation');
            }
          }}
          onMouseDown={(e) => {
            console.log('🔥 STREAM onMouseDown triggered!', e);
          }}
          onMouseUp={(e) => {
            console.log('🔥 STREAM onMouseUp triggered!', e);
          }}
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
          </div>
          <div style={{
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
          onClick={(e) => {
            console.log('🔥 MERCH onClick handler triggered!', e);
            e.preventDefault();
            e.stopPropagation();
            console.log('Merch navigation clicked - preventing default and pushing route');
            if (router.asPath !== '/merch') {
              router.push('/merch');
            } else {
              console.log('Already on MERCH page, skipping navigation');
            }
          }}
          onMouseDown={(e) => {
            console.log('🔥 MERCH onMouseDown triggered!', e);
          }}
          onMouseUp={(e) => {
            console.log('🔥 MERCH onMouseUp triggered!', e);
          }}
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
          </div>
          <div style={{
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
          onClick={(e) => {
            console.log('🔥 SCHEDULE onClick handler triggered!', e);
            e.preventDefault();
            e.stopPropagation();
            console.log('Schedule navigation clicked - preventing default and pushing route');
            if (router.asPath !== '/schedule') {
              router.push('/schedule');
            } else {
              console.log('Already on SCHEDULE page, skipping navigation');
            }
          }}
          onMouseDown={(e) => {
            console.log('🔥 SCHEDULE onMouseDown triggered!', e);
          }}
          onMouseUp={(e) => {
            console.log('🔥 SCHEDULE onMouseUp triggered!', e);
          }}
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
          </div>
          {user ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{
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
              onClick={(e) => {
                e.preventDefault();
                console.log('Profile navigation clicked');
                if (router.asPath !== '/profile') {
                  router.push('/profile');
                } else {
                  console.log('Already on PROFILE page, skipping navigation');
                }
              }}
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
              </div>
              {user.email === 'kevinparxmusic@gmail.com' && (
                <div style={{
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
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Admin navigation clicked');
                  if (router.asPath !== '/admin') {
                    router.push('/admin');
                  } else {
                    console.log('Already on ADMIN page, skipping navigation');
                  }
                }}
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
                </div>
              )}
              <span style={{ color: 'white', fontSize: '0.9rem' }}>
                {user.email}
              </span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Logout clicked');
                  handleLogout();
                }}
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
            <div style={{
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
            onClick={(e) => {
              e.preventDefault();
              console.log('Login navigation clicked');
              if (router.asPath !== '/login') {
                router.push('/login');
              } else {
                console.log('Already on LOGIN page, skipping navigation');
              }
            }}
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
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
