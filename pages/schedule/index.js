import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import Nav from '../../components/Nav';
import { useRouter } from 'next/router';

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };


  const handlePurchase = (event) => {
    router.push(`/checkout?event_id=${event.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-riot-black">
        <Nav />
        <div className="flex justify-center items-center h-96">
          <div className="text-white text-xl">Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-riot">
      <Nav />
      
      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <div className="riot-underline inline-block">
            <h1 className="text-6xl font-black text-white uppercase tracking-tight">
              Events
            </h1>
          </div>
          <p className="text-gray-500 text-sm uppercase tracking-[0.2em] mt-8">Upcoming Events & Live Shows</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {events.map((event) => (
            <div key={event.id} className="bg-black border border-gray-800 p-12">
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-black text-white uppercase tracking-wide">{event.title}</h3>
                  {event.is_active && (
                    <span className="bg-green-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">
                      ACTIVE
                    </span>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Event Date</p>
                    <p className="text-white font-medium">
                      {event.date && !isNaN(new Date(event.date)) ? new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Date TBD'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">PPV Price</p>
                    <p className="text-white text-2xl font-black">${event.ppv_price}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {user ? (
                    <button
                      onClick={() => handlePurchase(event)}
                      className="w-full bg-riot-red text-white py-4 px-6 font-bold uppercase tracking-[0.1em] hover:bg-red-700 transition-colors"
                    >
                      BUY ACCESS - ${event.ppv_price}
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full bg-riot-red text-white py-4 px-6 font-bold uppercase tracking-[0.1em] hover:bg-red-700 transition-colors"
                    >
                      LOGIN TO PURCHASE
                    </button>
                  )}
                  
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-32">
            <p className="text-gray-500 text-xl uppercase tracking-widest">No events scheduled at this time.</p>
          </div>
        )}
      </main>
    </div>
  );
}
