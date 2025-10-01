import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';

export default function VodPage() {
  const [vods, setVods] = useState([]);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function check() {
      const { data: session } = await supabase.auth.getUser();
      const email = session?.user?.email;
      if (!email) return router.push('/login');
      const { data } = await supabase.from('orders').select('*').eq('email', email);
      if (data && data.length > 0) {
        setAuthorized(true);
        const res = await supabase.from('vods').select('*').order('created_at', { ascending: false });
        setVods(res.data || []);
      } else {
        router.push('/checkout');
      }
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
