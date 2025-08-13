import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import Nav from '../components/Nav';
import ChatBox from '../components/ChatBox';
import Link from 'next/link';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-riot-black">
      <Nav />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-riot-red mb-4">
            THE RIOT NETWORK
          </h1>
          <p className="text-xl text-white mb-8">
            Premium Pay-Per-View Combat Sports Entertainment
          </p>
          
          {!user ? (
            <div className="space-x-4">
              <Link 
                href="/login"
                className="bg-riot-red text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors inline-block"
              >
                Login / Register
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Link 
                href="/stream"
                className="bg-riot-red text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors inline-block"
              >
                Watch Live
              </Link>
              <Link 
                href="/checkout"
                className="bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-600 transition-colors inline-block"
              >
                Buy Tickets
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Upcoming Events</h2>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="bg-riot-gray p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-riot-red mb-2">{event.title}</h3>
                    <p className="text-white mb-2">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-gray-300">
                      PPV Price: ${event.ppv_price} | Ticket Price: ${event.ticket_price}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No upcoming events scheduled.</p>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Live Chat</h2>
            <ChatBox />
          </div>
        </div>
      </main>
    </div>
  );
}
