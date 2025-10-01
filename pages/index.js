import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      setUser(JSON.parse(mockUser));
    }
  }, []);

  if (user) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
        color: 'white',
        padding: '2rem'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '900',
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #ff0000, #ffffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            Welcome Back, {user.email.split('@')[0]}!
          </h1>
          <p style={{ 
            fontSize: '1.3rem', 
            opacity: 0.9,
            marginBottom: '3rem',
            fontWeight: '300'
          }}>
            Your premium streaming experience awaits
          </p>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            <Link href="/stream" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.2), rgba(255, 255, 255, 0.1))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔴</div>
                <h3 style={{ 
                  color: '#ff0000', 
                  marginBottom: '1rem',
                  fontSize: '1.5rem',
                  fontWeight: '700'
                }}>
                  LIVE STREAM
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
                  Join exclusive live events with real-time interaction and premium content
                </p>
              </div>
            </Link>
            
            <Link href="/chat" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.2), rgba(255, 255, 255, 0.1))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</div>
                <h3 style={{ 
                  color: '#ff0000', 
                  marginBottom: '1rem',
                  fontSize: '1.5rem',
                  fontWeight: '700'
                }}>
                  LIVE CHAT
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
                  Connect with the community and share your thoughts during live events
                </p>
              </div>
            </Link>
            
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.2), rgba(255, 255, 255, 0.1))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👤</div>
                <h3 style={{ 
                  color: '#ff0000', 
                  marginBottom: '1rem',
                  fontSize: '1.5rem',
                  fontWeight: '700'
                }}>
                  YOUR PROFILE
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
                  Manage your account, check Riot Coins, and view your order history
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.3,
        zIndex: 1
      }} />
      
      <div style={{ 
        position: 'relative',
        zIndex: 2,
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '4rem' }}>
          <h1 style={{ 
            fontSize: '5rem', 
            fontWeight: '900',
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #ff0000, #ffffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            textShadow: '0 0 30px rgba(255, 0, 0, 0.5)'
          }}>
            RIOT NETWORK
          </h1>
          <p style={{ 
            fontSize: '1.8rem', 
            marginBottom: '1.5rem',
            fontWeight: '300',
            opacity: 0.9
          }}>
            ⚡ EXCLUSIVE LIVE EVENTS ⚡
          </p>
          <p style={{ 
            fontSize: '1.2rem', 
            opacity: 0.8,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            NEW EPISODE EVERY WEEK<br />
            ONLY ON THE RIOT NETWORK
          </p>
        </div>
        
        <div style={{ marginBottom: '3rem' }}>
          <Link href="/login">
            <button style={{
              background: 'linear-gradient(45deg, #ff0000, #cc0000)',
              color: 'white',
              border: 'none',
              padding: '1.2rem 3rem',
              borderRadius: '50px',
              fontSize: '1.3rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginRight: '1rem',
              boxShadow: '0 10px 30px rgba(255, 0, 0, 0.3)'
            }}>
              SUBSCRIBE NOW
            </button>
          </Link>
          <Link href="/schedule">
            <button style={{
              background: 'transparent',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              padding: '1.2rem 3rem',
              borderRadius: '50px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              backdropFilter: 'blur(10px)'
            }}>
              ▶ Trailer
            </button>
          </Link>
        </div>
        
        <p style={{ 
          fontSize: '1.1rem',
          opacity: 0.7,
          marginBottom: '2rem'
        }}>
          $15.99 a month or $149.99 a year
        </p>
        
        <div style={{ marginBottom: '4rem' }}>
          <p style={{ 
            fontSize: '1rem',
            opacity: 0.8,
            marginBottom: '1.5rem'
          }}>
            Available on multiple devices. <span style={{ color: '#ff0000' }}>View All &gt;</span>
          </p>
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            opacity: 0.7
          }}>
            <div style={{ fontSize: '2rem' }}>📱</div>
            <div style={{ fontSize: '2rem' }}>📺</div>
            <div style={{ fontSize: '2rem' }}>💻</div>
            <div style={{ fontSize: '2rem' }}>🎮</div>
          </div>
        </div>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginTop: '4rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ 
              color: '#ff0000', 
              marginBottom: '1rem',
              fontSize: '1.3rem',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              UNLIMITED STREAMING
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
              Get streaming access to all the content and all future releases
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ 
              color: '#ff0000', 
              marginBottom: '1rem',
              fontSize: '1.3rem',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              WATCH ANYWHERE
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
              Enjoy on your favorite device
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ 
              color: '#ff0000', 
              marginBottom: '1rem',
              fontSize: '1.3rem',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              SUPPORT THE CREATORS
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
              Directly support the creators and help them provide you with more content
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
