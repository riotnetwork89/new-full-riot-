import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';

export default function Profile() {
  const router = useRouter();
  const [coins, setCoins] = useState(0);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      // fetch coins from coin_ledger table
      const { data: coinData } = await supabase
        .from('coin_ledger')
        .select('coins')
        .eq('user_email', user.email);
      const coinsEarned = coinData ? coinData.reduce((sum, entry) => sum + entry.coins, 0) : 0;
      setCoins(coinsEarned);
      // fetch orders for user
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('email', user.email);
      setOrders(ordersData || []);
    };
    fetchData();
  }, [router]);

  return (
    <div className="container">
      <h1>Your Profile</h1>
      <div className="grid">
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Riot Coins</h2>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ff6b6b', textAlign: 'center' }}>
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
                  border: '1px solid rgba(255, 107, 107, 0.2)'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#ff6b6b' }}>{o.product}</div>
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
