import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import Nav from '../../components/Nav';
import Link from 'next/link';

export default function Merch() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  const merchItems = [
    {
      id: 1,
      name: 'RIOT HOODIE',
      price: 65,
      image: '/api/placeholder/400/400',
      description: 'Premium heavyweight hoodie with embroidered logo'
    },
    {
      id: 2,
      name: 'RIOT TEE',
      price: 35,
      image: '/api/placeholder/400/400',
      description: 'Classic fit t-shirt with screen printed design'
    },
    {
      id: 3,
      name: 'RIOT CAP',
      price: 25,
      image: '/api/placeholder/400/400',
      description: 'Snapback cap with 3D embroidered logo'
    },
    {
      id: 4,
      name: 'RIOT POSTER',
      price: 15,
      image: '/api/placeholder/400/400',
      description: 'Limited edition event poster - high quality print'
    },
    {
      id: 5,
      name: 'RIOT STICKERS',
      price: 10,
      image: '/api/placeholder/400/400',
      description: 'Pack of 5 vinyl stickers - weatherproof'
    },
    {
      id: 6,
      name: 'RIOT KEYCHAIN',
      price: 12,
      image: '/api/placeholder/400/400',
      description: 'Metal keychain with laser engraved logo'
    }
  ];

  return (
    <div className="min-h-screen bg-black font-riot">
      <Nav />
      
      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <div className="riot-underline inline-block">
            <h1 className="text-6xl font-black text-white uppercase tracking-tight">
              Merch
            </h1>
          </div>
          <p className="text-gray-500 text-sm uppercase tracking-[0.2em] mt-8">Official Riot Network Merchandise</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {merchItems.map((item) => (
            <div key={item.id} className="bg-black border border-gray-800 p-8 hover:border-riot-red transition-colors group">
              <div className="space-y-6">
                <div className="aspect-square bg-riot-gray border border-gray-800 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-riot-red mx-auto flex items-center justify-center">
                      <span className="text-white font-black text-xl">R</span>
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest">Product Image</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black text-white uppercase tracking-wide">{item.name}</h3>
                    <span className="text-white font-black text-xl">${item.price}</span>
                  </div>
                  
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>

                <div className="space-y-4">
                  {user ? (
                    <button className="w-full bg-riot-red text-white py-4 px-6 font-bold uppercase tracking-[0.1em] hover:bg-red-700 transition-colors">
                      ADD TO CART - ${item.price}
                    </button>
                  ) : (
                    <Link href="/login" className="block w-full bg-riot-red text-white py-4 px-6 font-bold uppercase tracking-[0.1em] hover:bg-red-700 transition-colors text-center">
                      LOGIN TO PURCHASE
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 py-16 border-t border-gray-800">
          <div className="space-y-8">
            <h2 className="text-3xl font-black text-white uppercase tracking-wide">Coming Soon</h2>
            <p className="text-gray-500 text-sm uppercase tracking-[0.2em] max-w-2xl mx-auto">
              More exclusive merchandise dropping soon. Follow our social media for updates on new releases and limited edition items.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
