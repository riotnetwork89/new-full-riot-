import Link from "next/link";
import Nav from '../../components/Nav';

export default function Merch() {
  const items = [
    { id: 1, name: "RIOT TEE (BLACK/RED)", price: 35 },
    { id: 2, name: "RIOT DAD HAT", price: 28 },
    { id: 3, name: "RIOT HOODIE", price: 60 },
    { id: 4, name: "RIOT POSTER", price: 15 },
    { id: 5, name: "RIOT STICKERS", price: 10 },
    { id: 6, name: "RIOT KEYCHAIN", price: 12 },
  ];

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map(item => (
            <div key={item.id} className="bg-black border border-gray-800 p-8 hover:border-riot-red transition-colors group">
              <div className="space-y-6">
                <div className="aspect-[4/3] bg-riot-gray border border-gray-800 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-riot-red mx-auto flex items-center justify-center">
                      <span className="text-white font-black text-xl">R</span>
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest">Product Image</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xl font-black text-white uppercase tracking-wide">{item.name}</p>
                    <p className="text-gray-400 text-lg font-bold">${item.price}</p>
                  </div>
                  <button className="px-6 py-3 bg-riot-red text-white font-bold uppercase tracking-[0.1em] hover:bg-red-700 transition-colors">
                    Add to cart
                  </button>
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
      </section>
    </main>
  );
}
