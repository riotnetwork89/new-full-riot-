import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function VaultPage() {
  const [vods, setVods] = useState([]);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function check() {
      const mockUser = localStorage.getItem('mockUser');
      if (!mockUser) {
        router.push('/login');
        return;
      }
      
      setAuthorized(true);
      const mockVods = [
        {
          id: 1,
          title: 'Riot Network Live Event #1',
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Riot Network Live Event #2',
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Riot Network Special Event',
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          created_at: new Date().toISOString()
        }
      ];
      setVods(mockVods);
    }
    check();
  }, []);

  if (!authorized) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

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
          fontSize: '3rem', 
          fontWeight: '900',
          marginBottom: '2rem',
          background: 'linear-gradient(45deg, #ff0000, #ffffff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          THE RIOT VAULT
        </h1>
        <p style={{ 
          fontSize: '1.2rem',
          textAlign: 'center', 
          marginBottom: '3rem', 
          opacity: 0.8,
          fontWeight: '300'
        }}>
          Access your exclusive video content and past live events
        </p>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          {vods.map(v => (
            <div key={v.id} style={{ 
              background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2rem',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              textAlign: 'left'
            }}>
              <h3 style={{ 
                color: '#ff0000',
                fontSize: '1.3rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '1rem'
              }}>
                {v.title}
              </h3>
              <video 
                controls 
                src={v.video_url} 
                style={{ 
                  width: '100%', 
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)'
                }} 
              />
              <p style={{ 
                fontSize: '0.9rem', 
                color: 'rgba(255, 255, 255, 0.7)', 
                marginTop: '0.5rem'
              }}>
                Added: {new Date(v.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
