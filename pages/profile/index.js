import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (router.pathname !== '/login') {
          router.push('/login');
        }
        return;
      }
      
      setUser(user);
      
      try {
        const { data: coinData } = await supabase
          .from('coin_ledger')
          .select('coins')
          .eq('user_email', user.email)
          .order('created_at', { ascending: false });
        
        const totalCoins = coinData?.reduce((sum, entry) => sum + entry.coins, 0) || 0;
        setCoins(totalCoins);
        
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('email', user.email)
          .order('timestamp', { ascending: false });
        
        setOrders(ordersData || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setCoins(0);
        setOrders([]);
      }
      
      setLoading(false);
    };
    fetchUserData();
  }, [router]);

  if (loading) {
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
      <h1>Your Profile</h1>
      <div className="grid">
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Riot Coins</h2>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ff0000', textAlign: 'center' }}>
            {coins}
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Your Orders</h3>
          {orders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {orders.map((o) => (
                <div key={o.id} style={{ 
                  padding: '1rem', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 0, 0, 0.2)'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#ff0000' }}>{o.product}</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    {o.type} - {new Date(o.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
