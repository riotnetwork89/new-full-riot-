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
        <section className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-riot-red/10 via-transparent to-riot-red/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-20 flex items-center min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="inline-block">
                    <span className="bg-riot-red text-white px-4 py-2 text-sm font-bold tracking-wider rounded-full uppercase">
                      Live Event
                    </span>
                  </div>
                  <h1 className="text-8xl lg:text-9xl font-black text-white leading-none tracking-tight">
                    RIOT
                  </h1>
                  <h2 className="text-5xl lg:text-6xl font-bold text-riot-red leading-tight">
                    {featuredEvent.title.toUpperCase()}
                  </h2>
                </div>
                
                <div className="space-y-6 border-l-4 border-riot-red pl-6">
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Event Date</p>
                    <p className="text-white text-2xl font-bold">
                      {new Date(featuredEvent.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-300 text-lg">
                      {new Date(featuredEvent.date).toLocaleDateString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">PPV Price</p>
                    <p className="text-white text-4xl font-black">${featuredEvent.ppv_price}.00</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => handlePurchase(featuredEvent)}
                    className="group bg-riot-red text-white px-10 py-5 rounded-xl text-xl font-bold hover:bg-red-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-riot-red/25 relative overflow-hidden"
                  >
                    <span className="relative z-10">BUY ACCESS</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <Link href="/stream" className="group border-2 border-white text-white px-10 py-5 rounded-xl text-xl font-bold hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 text-center">
                    <span>WATCH PREVIEW</span>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-10 shadow-2xl border border-gray-700">
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-riot-red rounded-full animate-pulse"></div>
                      <span className="text-riot-red text-sm font-bold uppercase tracking-wider">Live</span>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-8">
                    <div className="relative">
                      <div className="w-40 h-40 bg-gradient-to-br from-riot-red to-red-700 rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-riot-red/30">
                        <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-2"></div>
                        </div>
                      </div>
                      <div className="absolute -inset-4 bg-gradient-to-r from-riot-red/20 to-transparent rounded-full blur-xl"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold text-white">LIVE STREAMING</h3>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        Premium pay-per-view events with<br />
                        interactive live chat experience
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-700">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">HD</p>
                        <p className="text-gray-400 text-sm">Quality</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">24/7</p>
                        <p className="text-gray-400 text-sm">Support</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 py-16">
        {!user && (
          <div className="text-center mb-20 py-16 bg-gradient-to-r from-transparent via-gray-900/50 to-transparent">
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                JOIN THE <span className="text-riot-red">RIOT</span> NETWORK
              </h2>
              <p className="text-gray-300 text-xl lg:text-2xl mb-8 leading-relaxed max-w-3xl mx-auto">
                Access exclusive live events, connect with the community,<br />
                and experience premium entertainment like never before
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login" className="group bg-riot-red text-white px-10 py-5 rounded-xl text-xl font-bold hover:bg-red-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-riot-red/25 relative overflow-hidden">
                  <span className="relative z-10">LOGIN / REGISTER</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link href="/schedule" className="group border-2 border-gray-600 text-white px-10 py-5 rounded-xl text-xl font-bold hover:border-white hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105">
                  <span>VIEW SCHEDULE</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <Link href="/stream" className="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-3xl hover:from-gray-700 hover:to-gray-800 transition-all duration-500 transform hover:scale-105 border border-gray-700 hover:border-riot-red/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-riot-red/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-riot-red to-red-700 rounded-2xl flex items-center justify-center group-hover:animate-pulse shadow-lg shadow-riot-red/30">
                  <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-riot-red rounded-full animate-pulse"></div>
                  <span className="text-riot-red text-sm font-bold uppercase tracking-wider">Live</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">WATCH LIVE</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Premium live streams with real-time interactive chat and community engagement
              </p>
              <div className="flex items-center text-gray-400 text-sm">
                <span>HD Quality • Interactive Chat • Mobile Friendly</span>
              </div>
            </div>
          </Link>
          
          <Link href="/schedule" className="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-3xl hover:from-gray-700 hover:to-gray-800 transition-all duration-500 transform hover:scale-105 border border-gray-700 hover:border-riot-red/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-riot-red/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-gray-400 text-sm">
                  {events.length} Events
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">EVENT SCHEDULE</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                View upcoming events, manage your calendar, and never miss a live show
              </p>
              <div className="flex items-center text-gray-400 text-sm">
                <span>Event Management • Notifications • Calendar Sync</span>
              </div>
            </div>
          </Link>
        </section>

        {events.length > 1 && (
          <section className="py-16 bg-gradient-to-r from-transparent via-gray-900/30 to-transparent">
            <div className="text-center mb-12">
              <h2 className="text-5xl lg:text-6xl font-black text-white mb-4">
                UPCOMING <span className="text-riot-red">EVENTS</span>
              </h2>
              <p className="text-gray-400 text-xl">Don't miss out on these exclusive live experiences</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.slice(1).map((event) => (
                <div key={event.id} className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 hover:from-gray-700 hover:to-gray-800 transition-all duration-500 transform hover:scale-105 border border-gray-700 hover:border-riot-red/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-riot-red/10 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                  <div className="relative z-10 space-y-6">
                    <div className="space-y-3">
                      <div className="inline-block bg-riot-red/10 text-riot-red px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                        Live Event
                      </div>
                      <h3 className="text-2xl font-bold text-white leading-tight">{event.title}</h3>
                    </div>
                    
                    <div className="space-y-2 border-l-2 border-gray-600 pl-4">
                      <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Event Date</p>
                      <p className="text-white font-bold">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-300 text-sm">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                      <div className="space-y-1">
                        <p className="text-gray-400 text-sm">PPV Price</p>
                        <span className="text-riot-red font-black text-2xl">${event.ppv_price}</span>
                      </div>
                      <button
                        onClick={() => handlePurchase(event)}
                        className="bg-riot-red text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-riot-red/25"
                      >
                        Buy Access
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
