import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';

export default function VodPage() {
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
        }
      ];
      setVods(mockVods);
    }
    check();
  }, []);

  return (
    <div className="container">
      <h1>THE RIOT VAULT</h1>
      <div className="grid">
        {vods.map(v => (
          <div key={v.id} className="card">
            <h3>{v.title}</h3>
            <video controls src={v.video_url} style={{ width: '100%', borderRadius: '8px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
