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
      // fetch correct trivia responses for user
      const { data: responses } = await supabase
        .from('trivia_responses')
        .select('*')
        .eq('user_email', user.email)
        .eq('correct', true);
      const coinsEarned = responses ? responses.length * 10 : 0;
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
