import { useState, useEffect } from 'react';

export default function SchedulePage() {
  const [events] = useState([
    {
      id: 1,
      title: 'Riot Network Live Stream #1',
      date: '2025-10-15',
      time: '8:00 PM EST',
      description: 'Join us for an exclusive live streaming event with special guests and performances.',
      status: 'upcoming',
      ticketPrice: 15
    },
    {
      id: 2,
      title: 'Riot Network Live Stream #2',
      date: '2025-10-22',
      time: '7:30 PM EST',
      description: 'Another amazing night of entertainment and community interaction.',
      status: 'upcoming',
      ticketPrice: 20
    },
    {
      id: 3,
      title: 'Riot Network Special Event',
      date: '2025-10-29',
      time: '9:00 PM EST',
      description: 'Halloween special with costume contest and prizes!',
      status: 'upcoming',
      ticketPrice: 25
    },
    {
      id: 4,
      title: 'Previous Event Replay',
      date: '2025-09-30',
      time: '8:00 PM EST',
      description: 'Missed our last event? Watch the replay anytime.',
      status: 'completed',
      ticketPrice: 10
    }
  ]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return '#4ade80';
      case 'completed': return '#94a3b8';
      default: return '#ff6b6b';
    }
  };

  const formatDate = (dateString) => {
    if (!isClient) {
      return dateString;
    }
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '900',
          marginBottom: '1rem',
          background: 'linear-gradient(45deg, #ff0080, #ff6600)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          EVENT SCHEDULE
        </h1>
        <p style={{ 
          fontSize: '1.2rem',
          textAlign: 'center', 
          marginBottom: '3rem', 
          opacity: 0.8,
          fontWeight: '300'
        }}>
          Don't miss out on our upcoming live events and exclusive content!
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
          {events.map(event => (
            <div key={event.id} style={{ 
              background: 'linear-gradient(135deg, rgba(255, 0, 128, 0.1), rgba(255, 102, 0, 0.1))',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2rem',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '1rem'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  marginBottom: '0.5rem',
                  color: '#ff0080',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {event.title}
                </h3>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  marginBottom: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ 
                    color: '#8B5CF6', 
                    fontWeight: 'bold' 
                  }}>
                    📅 {formatDate(event.date)}
                  </span>
                  <span style={{ 
                    color: '#8B5CF6', 
                    fontWeight: 'bold' 
                  }}>
                    🕐 {event.time}
                  </span>
                  <span style={{ 
                    color: getStatusColor(event.status),
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '0.8rem'
                  }}>
                    ● {event.status}
                  </span>
                </div>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  marginBottom: '1rem',
                  lineHeight: '1.6'
                }}>
                  {event.description}
                </p>
              </div>
              <div style={{ 
                textAlign: 'right',
                marginLeft: '1rem'
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#ff0080',
                  marginBottom: '0.5rem'
                }}>
                  ${event.ticketPrice}
                </div>
                <button style={{
                  background: event.status === 'upcoming' 
                    ? 'linear-gradient(45deg, #ff0080, #ff6600)' 
                    : 'linear-gradient(45deg, #6B46C1, #8B5CF6)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '50px',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {event.status === 'upcoming' ? 'Buy Ticket' : 'Watch Replay'}
                </button>
              </div>
            </div>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
}
