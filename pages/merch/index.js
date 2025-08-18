import { useState, useEffect } from 'react';
import Link from "next/link";
import Nav from '../../components/Nav';
import { supabase } from '../../utils/supabase';

export default function Merch() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMerchandise();
  }, []);

  const fetchMerchandise = async () => {
    try {
      const { data, error } = await supabase
        .from('merchandise')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching merchandise:', error);
      setItems([
        { id: 1, name: "RIOT TEE (BLACK/RED)", price: 35 },
        { id: 2, name: "RIOT DAD HAT", price: 28 },
        { id: 3, name: "RIOT HOODIE", price: 60 },
        { id: 4, name: "RIOT POSTER", price: 15 },
        { id: 5, name: "RIOT STICKERS", price: 10 },
        { id: 6, name: "RIOT KEYCHAIN", price: 12 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white font-riot">
        <Nav />
        <div className="flex justify-center items-center h-96">
          <div className="text-white text-xl">Loading merchandise...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-riot">
      <Nav />
      
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <div className="riot-underline inline-block">
            <h1 className="text-6xl font-black text-white uppercase tracking-tight">
              Merch
            </h1>
          </div>
          <p className="text-gray-500 text-sm uppercase tracking-[0.2em] mt-8">Official Riot Network Merchandise</p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map(item => (
              <div key={item.id} className="bg-black border border-gray-800 p-8 hover:border-riot-red transition-colors group">
                <div className="space-y-6">
                  <div className="aspect-[4/3] bg-riot-gray border border-gray-800 flex items-center justify-center">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-riot-red mx-auto flex items-center justify-center">
                          <span className="text-white font-black text-xl">R</span>
                        </div>
                        <p className="text-gray-500 text-xs uppercase tracking-widest">Product Image</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-xl font-black text-white uppercase tracking-wide">{item.name}</p>
                      {item.description && (
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      )}
                      <p className="text-gray-400 text-lg font-bold">${item.price}</p>
                      {item.stock_quantity !== null && (
                        <p className="text-gray-500 text-xs uppercase tracking-widest">
                          {item.stock_quantity > 0 ? `${item.stock_quantity} in stock` : 'Out of stock'}
                        </p>
                      )}
                    </div>
                    <button 
                      className={`w-full px-6 py-3 font-bold uppercase tracking-[0.1em] transition-colors ${
                        item.stock_quantity === 0 
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                          : 'bg-riot-red text-white hover:bg-red-700'
                      }`}
                      disabled={item.stock_quantity === 0}
                    >
                      {item.stock_quantity === 0 ? 'Out of Stock' : 'Add to cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <p className="text-gray-500 text-xl uppercase tracking-widest">No merchandise available at this time.</p>
          </div>
        )}

        <div className="text-center mt-16 py-16 border-t border-gray-800">
          <div className="space-y-8">
            <h2 className="text-3xl font-black text-white uppercase tracking-wide">Coming Soon</h2>
            <p className="text-gray-500 text-sm uppercase tracking-[0.2em] max-w-2xl mx-auto">
              More exclusive merchandise dropping soon. Follow our social media for updates on new releases and limited edition items.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
