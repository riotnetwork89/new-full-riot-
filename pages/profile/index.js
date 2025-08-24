import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';
import Nav from '../../components/Nav';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (router.isReady) {
          router.push('/login');
        }
        return;
      }
      
      setUser(user);

      const [responsesResult, ordersResult] = await Promise.all([
        supabase
          .from('trivia_responses')
          .select('*')
          .eq('user_email', user.email)
          .eq('correct', true),
        supabase
          .from('orders')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false })
      ]);

      const coinsEarned = responsesResult.data ? responsesResult.data.length * 10 : 0;
      setCoins(coinsEarned);
      setOrders(ordersResult.data || []);
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-riot-black">
        <Nav />
        <div className="flex justify-center items-center h-96">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-riot-black">
      <Nav />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-riot-gray rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-riot-red mb-6">Profile</h1>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-riot-black p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-2">Account Info</h2>
              <p className="text-gray-300">Email: {user?.email}</p>
              <p className="text-gray-300">Member since: {new Date(user?.created_at).toLocaleDateString()}</p>
            </div>
            
            <div className="bg-riot-black p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-2">Rewards</h2>
              <p className="text-3xl font-bold text-riot-red">{coins} Coins</p>
              <p className="text-gray-300 text-sm">Earned from trivia questions</p>
            </div>
          </div>
        </div>

        <div className="bg-riot-gray rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Order History</h2>
          
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full bg-riot-black rounded-lg overflow-hidden">
                <thead className="bg-riot-red">
                  <tr>
                    <th className="px-4 py-3 text-left text-white font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Provider</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-riot-gray">
                      <td className="px-4 py-3 text-white">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-white">
                        ${order.amount}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'COMPLETED' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-yellow-600 text-white'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white capitalize">
                        {order.provider || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No orders found</p>
              <button
                onClick={() => {
                  if (router.isReady) {
                    router.push('/checkout');
                  }
                }}
                className="bg-riot-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Purchase Your First Ticket
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
