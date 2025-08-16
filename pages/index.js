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
    <div className="min-h-screen bg-riot-black">
      <Nav />
      
      {featuredEvent && (
        <section className="relative bg-gradient-to-r from-riot-black via-gray-900 to-riot-black py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <h1 className="text-7xl font-bold text-white mb-4">RIOT</h1>
                  <h2 className="text-4xl font-bold text-riot-red mb-6">
                    {featuredEvent.title.toUpperCase()}
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-300 text-xl">
                    {new Date(featuredEvent.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-white text-3xl font-bold">${featuredEvent.ppv_price}.00</p>
                </div>

                <button
                  onClick={() => handlePurchase(featuredEvent)}
                  className="bg-riot-red text-white px-12 py-4 rounded-lg text-xl font-bold hover:bg-red-700 transition-colors transform hover:scale-105"
                >
                  BUY ACCESS
                </button>
              </div>

              <div className="relative">
                <div className="bg-riot-gray rounded-lg p-8 text-center">
                  <div className="w-32 h-32 bg-riot-red rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">🔴</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">LIVE STREAMING</h3>
                  <p className="text-gray-300">Premium pay-per-view events with live chat interaction</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 py-16">
        {!user && (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Join The Riot Network</h2>
            <p className="text-gray-300 text-xl mb-8">
              Access exclusive live events, chat with the community, and never miss a show
            </p>
            <Link href="/login" className="bg-riot-red text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors inline-block transform hover:scale-105">
              Login / Register
            </Link>
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Link href="/stream" className="group bg-riot-gray p-8 rounded-lg hover:bg-gray-700 transition-all transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-riot-red rounded-full mx-auto mb-4 flex items-center justify-center group-hover:animate-pulse">
                <span className="text-white text-2xl">🔴</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Watch</h3>
              <p className="text-gray-300">Live streams with interactive chat</p>
            </div>
          </Link>
          
          <Link href="/schedule" className="group bg-riot-gray p-8 rounded-lg hover:bg-gray-700 transition-all transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-riot-red rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">📅</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Schedule</h3>
              <p className="text-gray-300">Upcoming events and shows</p>
            </div>
          </Link>
        </section>

        {events.length > 1 && (
          <section>
            <h2 className="text-4xl font-bold text-riot-red mb-8 text-center">All Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.slice(1).map((event) => (
                <div key={event.id} className="bg-riot-gray rounded-lg p-6 hover:bg-gray-700 transition-colors">
                  <h3 className="text-2xl font-bold text-white mb-4">{event.title}</h3>
                  <p className="text-gray-300 mb-4">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-riot-red font-bold text-xl">${event.ppv_price}</span>
                    <button
                      onClick={() => handlePurchase(event)}
                      className="bg-riot-red text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                      Buy Access
                    </button>
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
