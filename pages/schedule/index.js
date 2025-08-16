import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import Nav from '../../components/Nav';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    ppv_price: 25,
    ticket_price: 40,
    is_active: true
  });
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(profile?.role === 'admin');
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(formData)
          .eq('id', editingEvent.id);
        
        if (error) throw error;
        toast.success('Event updated successfully!');
      } else {
        const { error } = await supabase
          .from('events')
          .insert([formData]);
        
        if (error) throw error;
        toast.success('Event created successfully!');
      }
      
      setFormData({
        title: '',
        date: '',
        ppv_price: 25,
        ticket_price: 40,
        is_active: true
      });
      setShowCreateForm(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date.split('T')[0],
      ppv_price: event.ppv_price,
      ticket_price: event.ticket_price,
      is_active: event.is_active
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      toast.success('Event deleted successfully!');
      fetchEvents();
    } catch (error) {
      toast.error(error.message);
    }
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
    <div className="min-h-screen bg-riot-black">
      <Nav />
      <Toaster position="top-center" />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            RIOT <span className="text-riot-red">SCHEDULE</span>
          </h1>
          <p className="text-gray-300 text-xl">Upcoming Events & Live Shows</p>
        </div>

        {isAdmin && (
          <div className="mb-8 text-center">
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setEditingEvent(null);
                setFormData({
                  title: '',
                  date: '',
                  ppv_price: 25,
                  ticket_price: 40,
                  is_active: true
                });
              }}
              className="bg-riot-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              {showCreateForm ? 'Cancel' : 'Create New Event'}
            </button>
          </div>
        )}

        {showCreateForm && isAdmin && (
          <div className="bg-riot-gray rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-riot-red mb-6">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Event Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-riot-black text-white border border-riot-red rounded-lg focus:outline-none focus:border-riot-red"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Event Date</label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-riot-black text-white border border-riot-red rounded-lg focus:outline-none focus:border-riot-red"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">PPV Price ($)</label>
                  <input
                    type="number"
                    value={formData.ppv_price}
                    onChange={(e) => setFormData({ ...formData, ppv_price: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-riot-black text-white border border-riot-red rounded-lg focus:outline-none focus:border-riot-red"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Ticket Price ($)</label>
                  <input
                    type="number"
                    value={formData.ticket_price}
                    onChange={(e) => setFormData({ ...formData, ticket_price: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-riot-black text-white border border-riot-red rounded-lg focus:outline-none focus:border-riot-red"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-white">Active Event</label>
              </div>
              <button
                type="submit"
                className="w-full bg-riot-red text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-riot-gray rounded-lg overflow-hidden shadow-lg">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-white">{event.title}</h3>
                  {event.is_active && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      ACTIVE
                    </span>
                  )}
                </div>
                
                <div className="text-gray-300 mb-4">
                  <p className="mb-2">
                    📅 {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="mb-1">💰 PPV: ${event.ppv_price}</p>
                  <p>🎫 Ticket: ${event.ticket_price}</p>
                </div>

                <div className="flex flex-col space-y-3">
                  {user ? (
                    <button
                      onClick={() => handlePurchase(event)}
                      className="bg-riot-red text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      BUY ACCESS - ${event.ppv_price}
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push('/login')}
                      className="bg-riot-red text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      LOGIN TO PURCHASE
                    </button>
                  )}
                  
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="flex-1 bg-red-600 text-white py-2 px-3 rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-xl">No events scheduled at this time.</p>
            {isAdmin && (
              <p className="text-gray-500 mt-2">Create your first event using the button above.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
