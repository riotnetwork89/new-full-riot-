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
    <div style={{ padding: '2rem' }}>
      <h1>Your Profile</h1>
      <p>Riot Coins: {coins}</p>
      <h2>Your Orders</h2>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            {o.product} – {o.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}
