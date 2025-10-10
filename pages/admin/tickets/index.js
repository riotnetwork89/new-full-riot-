import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../utils/supabase';

export default function AdminTicketsPage() {
  const [events, setEvents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const mockUser = localStorage.getItem('mockUser');
      const userData = mockUser ? JSON.parse(mockUser) : null;
      
      if (!userData || !userData.authenticated || (userData.email !== 'kevinparxmusic@gmail.com' && userData.email !== 'test@riot.com')) {
        router.push('/login');
        return;
      }
      
      setUser(userData);
      fetchData();
    };
    
    checkAuth();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchEvents(),
        fetchOrders(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        ticket_tiers(*)
      `)
      .order('start_datetime', { ascending: false });

    if (!error) setEvents(data || []);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('ticket_orders')
      .select(`
        *,
        order_items(
          *,
          ticket_tiers(
            *,
            events(*)
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error) setOrders(data || []);
  };

  const fetchStats = async () => {
    const { data: salesData } = await supabase
      .from('ticket_orders')
      .select('total_cents')
      .eq('status', 'paid');

    const totalSales = salesData?.reduce((sum, order) => sum + order.total_cents, 0) || 0;

    const today = new Date().toISOString().split('T')[0];
    const { data: todayOrders } = await supabase
      .from('ticket_orders')
      .select('total_cents')
      .eq('status', 'paid')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    const todaySales = todayOrders?.reduce((sum, order) => sum + order.total_cents, 0) || 0;

    const { count: upcomingEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .gte('start_datetime', new Date().toISOString());

    setStats({
      totalSales,
      todaySales,
      upcomingEvents: upcomingEvents || 0,
      totalOrders: salesData?.length || 0
    });
  };

  const createEvent = () => {
    router.push('/admin/tickets/create-event');
  };

  const editEvent = (eventId) => {
    router.push(`/admin/tickets/edit-event/${eventId}`);
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Loading admin dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '900',
          marginBottom: '2rem',
          background: 'linear-gradient(45deg, #ff0000, #ffffff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          TICKETMASTER ADMIN
        </h1>

        {/* Stats Dashboard */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#ff0000', margin: '0 0 0.5rem 0' }}>Total Sales</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>
              ${(stats.totalSales / 100).toFixed(2)}
            </p>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#ff0000', margin: '0 0 0.5rem 0' }}>Today's Sales</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>
              ${(stats.todaySales / 100).toFixed(2)}
            </p>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#ff0000', margin: '0 0 0.5rem 0' }}>Upcoming Events</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>
              {stats.upcomingEvents}
            </p>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#ff0000', margin: '0 0 0.5rem 0' }}>Total Orders</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>
              {stats.totalOrders}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '1rem'
        }}>
          {['events', 'orders', 'scanner'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
                border: activeTab === tab ? '1px solid #ff0000' : '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '1px'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{ color: '#ff0000', margin: 0 }}>Events Management</h2>
              <button
                onClick={createEvent}
                style={{
                  background: 'linear-gradient(45deg, #ff0000, #cc0000)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}
              >
                Create Event
              </button>
            </div>
            
            <div style={{ 
              display: 'grid',
              gap: '1rem'
            }}>
              {events.map(event => (
                <div key={event.id} style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '1.5rem'
                }}>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ color: '#ff0000', margin: '0 0 0.5rem 0' }}>
                        {event.title}
                      </h3>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Venue:</strong> {event.venue}
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Date:</strong> {new Date(event.start_datetime).toLocaleDateString()}
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Status:</strong> {event.is_active ? '🟢 Active' : '🔴 Inactive'}
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Ticket Tiers:</strong> {event.ticket_tiers.length}
                      </p>
                    </div>
                    
                    <div style={{ 
                      display: 'flex',
                      gap: '0.5rem'
                    }}>
                      <button
                        onClick={() => editEvent(event.id)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => router.push(`/tickets/${event.slug}`)}
                        style={{
                          background: 'rgba(255, 0, 0, 0.2)',
                          border: '1px solid #ff0000',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ color: '#ff0000', marginBottom: '2rem' }}>Recent Orders</h2>
            
            <div style={{ 
              display: 'grid',
              gap: '1rem'
            }}>
              {orders.map(order => (
                <div key={order.id} style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '1.5rem'
                }}>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div>
                      <h3 style={{ color: '#ff0000', margin: '0 0 0.5rem 0' }}>
                        Order #{order.order_uuid.slice(0, 8)}
                      </h3>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Customer:</strong> {order.user_email}
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Event:</strong> {order.order_items[0]?.ticket_tiers?.events?.title}
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Total:</strong> ${(order.total_cents / 100).toFixed(2)}
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        background: order.status === 'paid' ? 'rgba(34, 197, 94, 0.2)' : 
                                   order.status === 'pending' ? 'rgba(255, 165, 0, 0.2)' : 
                                   'rgba(239, 68, 68, 0.2)',
                        color: order.status === 'paid' ? '#22c55e' : 
                               order.status === 'pending' ? '#ffa500' : 
                               '#ef4444',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <div>
            <h2 style={{ color: '#ff0000', marginBottom: '2rem' }}>Ticket Scanner</h2>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
                Scan ticket QR codes to validate and mark as used
              </p>
              
              <button
                onClick={() => router.push('/admin/tickets/scanner')}
                style={{
                  background: 'linear-gradient(45deg, #ff0000, #cc0000)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}
              >
                Open Scanner
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
