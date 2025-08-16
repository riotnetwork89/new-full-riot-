import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import Nav from '../components/Nav';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true });
      setEvents(data || []);
      setFeaturedEvent(data?.[0] || null);
    };
    fetchEvents();
  }, []);

  const handlePurchase = (event) => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/checkout?event_id=${event.id}`);
  };

  return (
    <div className="min-h-screen bg-black font-riot">
      <Nav />
      
      {featuredEvent && (
        <section className="relative bg-black">
          <div className="max-w-7xl mx-auto px-8 py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-16">
                <div className="space-y-8">
                  <div className="riot-underline inline-block">
                    <h1 className="text-11xl lg:text-12xl font-black text-white leading-none tracking-tighter">
                      RIOT
                    </h1>
                  </div>
                  <h2 className="text-5xl lg:text-6xl font-black text-white leading-tight">
                    {featuredEvent.title || 'VOLUME 5'}
                  </h2>
                </div>
                
                <div className="space-y-12">
                  <div className="space-y-4">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Event Date</p>
                    <p className="text-white text-2xl font-medium">
                      {new Date(featuredEvent.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Price</p>
                    <p className="text-white text-4xl font-black">${featuredEvent.ppv_price}.00</p>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(featuredEvent)}
                  className="bg-riot-red text-white px-16 py-6 text-xl font-black uppercase tracking-[0.1em] hover:bg-red-700 transition-colors"
                >
                  BUY ACCESS
                </button>
              </div>

              <div className="relative">
                <div className="aspect-square bg-riot-gray border border-gray-800">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-8">
                      <div className="w-32 h-32 bg-riot-red mx-auto flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[24px] border-l-white border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent ml-2"></div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-3xl font-black text-white uppercase tracking-wide">LIVE STREAM</h3>
                        <p className="text-gray-400 text-sm uppercase tracking-widest">Premium HD Quality</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-8 py-32">
        {!user && (
          <div className="text-center mb-32 py-32">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="riot-underline inline-block">
                <h2 className="text-7xl lg:text-8xl font-black text-white leading-tight">
                  PURCHASE ACCESS
                </h2>
              </div>
              <div className="space-y-8">
                <div className="text-center">
                  <p className="text-white text-5xl font-black mb-4">${featuredEvent?.ppv_price || '20'}.00</p>
                  <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">Per Event Access</p>
                </div>
                <Link href="/login" className="inline-block bg-riot-red text-white px-20 py-6 text-xl font-black uppercase tracking-[0.1em] hover:bg-red-700 transition-colors">
                  Continue to Payment →
                </Link>
              </div>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
          <Link href="/stream" className="group bg-black border border-gray-800 p-12 hover:border-riot-red transition-colors">
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-riot-red"></div>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Live</span>
              </div>
              <h3 className="text-3xl font-black text-white uppercase">Watch</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Premium live streaming with interactive community chat
              </p>
              <div className="text-riot-red text-lg font-bold">→</div>
            </div>
          </Link>
          
          <Link href="/schedule" className="group bg-black border border-gray-800 p-12 hover:border-riot-red transition-colors">
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-gray-600"></div>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Schedule</span>
              </div>
              <h3 className="text-3xl font-black text-white uppercase">Events</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                View upcoming shows and manage your event calendar
              </p>
              <div className="text-riot-red text-lg font-bold">→</div>
            </div>
          </Link>

          {user && (
            <Link href="/profile" className="group bg-black border border-gray-800 p-12 hover:border-riot-red transition-colors">
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-gray-600"></div>
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Account</span>
                </div>
                <h3 className="text-3xl font-black text-white uppercase">Profile</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Manage your account settings and purchase history
                </p>
                <div className="text-riot-red text-lg font-bold">→</div>
              </div>
            </Link>
          )}
        </section>

        {events.length > 1 && (
          <section className="py-32">
            <div className="text-center mb-24">
              <div className="riot-underline inline-block">
                <h2 className="text-6xl lg:text-7xl font-black text-white">
                  UPCOMING EVENTS
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {events.slice(1).map((event) => (
                <div key={event.id} className="bg-black border border-gray-800 p-12 hover:border-riot-red transition-colors group">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-riot-red"></div>
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Live Event</span>
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase">{event.title}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-8 border-t border-gray-800">
                      <span className="text-white font-black text-xl">${event.ppv_price}</span>
                      <button
                        onClick={() => handlePurchase(event)}
                        className="text-riot-red text-sm font-bold uppercase tracking-[0.1em] hover:text-red-400 transition-colors"
                      >
                        Buy Access →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
