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
      if (!email) return router.push('/');
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
    <div style={{ padding: 40 }}>
      <h1>THE RIOT VAULT</h1>
      {vods.map(v => (
        <div key={v.id} style={{ marginTop: 20 }}>
          <h3>{v.title}</h3>
          <video controls src={v.video_url} style={{ width: '100%', maxWidth: 640 }} />
        </div>
      ))}
    </div>
  );
}
