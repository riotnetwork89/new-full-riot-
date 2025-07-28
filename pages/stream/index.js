import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';

export default function Stream() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('email', user.email)
        .eq('product', 'ppv_ticket')
        .single();
      if (data) {
        setHasAccess(true);
      } else {
        router.push('/checkout');
      }
      setLoading(false);
    };
    checkAccess();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
      <h1>Live Stream</h1>
      {hasAccess ? (
        <div style={{ width: '100%', maxWidth: '800px' }}>
          <iframe
            src={`https://stream.mux.com/${process.env.NEXT_PUBLIC_MUX_PLAYBACK_ID}.m3u8`}
            width="100%"
            height="480"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      ) : (
        <p>You do not have access.</p>
      )}
    </div>
  );
}
