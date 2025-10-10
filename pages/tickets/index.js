import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';

export default function TicketsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          ticket_tiers(*)
        `)
        .eq('is_active', true)
        .gte('sale_end', new Date().toISOString())
        .order('start_datetime', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventPriceRange = (ticketTiers) => {
    if (!ticketTiers || ticketTiers.length === 0) return 'TBA';
    
    const prices = ticketTiers.map(tier => tier.price_cents);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return `$${(minPrice / 100).toFixed(2)}`;
    }
    return `$${(minPrice / 100).toFixed(2)} - $${(maxPrice / 100).toFixed(2)}`;
  };

  const getAvailableTickets = (ticketTiers) => {
    if (!ticketTiers || ticketTiers.length === 0) return 0;
    return ticketTiers.reduce((total, tier) => total + (tier.quantity_total - tier.quantity_sold), 0);
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Loading events...</h2>
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
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '900',
          marginBottom: '1rem',
          background: 'linear-gradient(45deg, #ff0000, #ffffff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textAlign: 'center'
        }}>
          RIOT TICKETS
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem',
          textAlign: 'center', 
          marginBottom: '3rem', 
          opacity: 0.8,
          fontWeight: '300'
        }}>
          Get your tickets to exclusive Riot Network live events
        </p>

        {events.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ color: '#ff0000', marginBottom: '1rem' }}>No Events Available</h3>
            <p style={{ opacity: 0.7 }}>Check back soon for upcoming events!</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem'
          }}>
            {events.map(event => {
              const availableTickets = getAvailableTickets(event.ticket_tiers);
              const priceRange = getEventPriceRange(event.ticket_tiers);
              const isOnSale = new Date() >= new Date(event.sale_start) && new Date() <= new Date(event.sale_end);
              
              return (
                <div key={event.id} style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '2rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 10px 30px rgba(255, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
                onClick={() => router.push(`/tickets/${event.slug}`)}>
                  
                  {event.image_url && (
                    <img 
                      src={event.image_url} 
                      alt={event.title}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '1.5rem'
                      }}
                    />
                  )}
                  
                  <h3 style={{ 
                    color: '#ff0000',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '1rem'
                  }}>
                    {event.title}
                  </h3>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ margin: '0.5rem 0', fontSize: '1rem' }}>
                      <strong>📍 Venue:</strong> {event.venue}
                    </p>
                    <p style={{ margin: '0.5rem 0', fontSize: '1rem' }}>
                      <strong>📅 Date:</strong> {new Date(event.start_datetime).toLocaleDateString()}
                    </p>
                    <p style={{ margin: '0.5rem 0', fontSize: '1rem' }}>
                      <strong>🕒 Time:</strong> {new Date(event.start_datetime).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <div>
                      <p style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '700', 
                        color: '#ff0000',
                        margin: 0
                      }}>
                        {priceRange}
                      </p>
                      <p style={{ 
                        fontSize: '0.9rem', 
                        opacity: 0.7,
                        margin: 0
                      }}>
                        {availableTickets} tickets available
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      {!isOnSale ? (
                        <span style={{ 
                          color: '#ffa500',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          Sale {new Date() < new Date(event.sale_start) ? 'Starts' : 'Ended'}
                        </span>
                      ) : availableTickets === 0 ? (
                        <span style={{ 
                          color: '#ff6b6b',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          SOLD OUT
                        </span>
                      ) : (
                        <span style={{ 
                          color: '#4ade80',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          ON SALE
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button style={{
                    width: '100%',
                    padding: '1rem',
                    background: isOnSale && availableTickets > 0 
                      ? 'linear-gradient(45deg, #ff0000, #cc0000)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: isOnSale && availableTickets > 0 ? 'pointer' : 'not-allowed',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    transition: 'all 0.3s ease',
                    opacity: isOnSale && availableTickets > 0 ? 1 : 0.5
                  }}
                  disabled={!isOnSale || availableTickets === 0}>
                    {!isOnSale ? 'Not Available' : availableTickets === 0 ? 'Sold Out' : 'Buy Tickets'}
                  </button>
                  
                  {event.description && (
                    <p style={{ 
                      fontSize: '0.9rem', 
                      opacity: 0.7, 
                      marginTop: '1rem',
                      lineHeight: '1.5'
                    }}>
                      {event.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
