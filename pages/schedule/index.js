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
    <div className="min-h-screen bg-black font-riot">
      <Nav />
      <Toaster position="top-center" />
      
      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <div className="riot-underline inline-block">
            <h1 className="text-6xl font-black text-white uppercase tracking-tight">
              Events
            </h1>
          </div>
          <p className="text-gray-500 text-sm uppercase tracking-[0.2em] mt-8">Upcoming Events & Live Shows</p>
        </div>

        {isAdmin && (
          <div className="mb-16 text-center">
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
              className="bg-riot-red text-white px-12 py-4 font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              {showCreateForm ? 'Cancel' : 'Create New Event'}
            </button>
          </div>
        )}

        {showCreateForm && isAdmin && (
          <div className="bg-black border border-gray-800 p-12 mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-white uppercase tracking-wide mb-12">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">Event Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-6 py-4 bg-black text-white border border-gray-800 focus:outline-none focus:border-riot-red font-medium"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">Event Date</label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-6 py-4 bg-black text-white border border-gray-800 focus:outline-none focus:border-riot-red font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">PPV Price ($)</label>
                  <input
                    type="number"
                    value={formData.ppv_price}
                    onChange={(e) => setFormData({ ...formData, ppv_price: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-6 py-4 bg-black text-white border border-gray-800 focus:outline-none focus:border-riot-red font-medium"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">Ticket Price ($)</label>
                  <input
                    type="number"
                    value={formData.ticket_price}
                    onChange={(e) => setFormData({ ...formData, ticket_price: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-6 py-4 bg-black text-white border border-gray-800 focus:outline-none focus:border-riot-red font-medium"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-white font-medium">Active Event</label>
              </div>
              <button
                type="submit"
                className="w-full bg-riot-red text-white py-4 px-6 font-bold uppercase tracking-[0.1em] hover:bg-red-700 transition-colors"
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </form>
          </div>
        )}

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
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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
                  
                  {isAdmin && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleEdit(event)}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="flex-1 bg-red-600 text-white py-3 px-4 font-bold uppercase tracking-widest hover:bg-red-700 transition-colors text-xs"
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
          <div className="text-center py-32">
            <p className="text-gray-500 text-xl uppercase tracking-widest">No events scheduled at this time.</p>
            {isAdmin && (
              <p className="text-gray-600 text-sm uppercase tracking-widest mt-4">Create your first event using the button above.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
