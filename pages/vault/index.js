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
    <div className="container">
      <h1>THE RIOT VAULT</h1>
      <p style={{ textAlign: 'center', marginBottom: '2rem', opacity: 0.8 }}>
        Access your exclusive video content and past live events
      </p>
      <div className="grid">
        {vods.map(v => (
          <div key={v.id} className="card">
            <h3 style={{ marginBottom: '1rem' }}>{v.title}</h3>
            <video controls src={v.video_url} style={{ width: '100%', borderRadius: '8px' }} />
            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
              Added: {new Date(v.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
