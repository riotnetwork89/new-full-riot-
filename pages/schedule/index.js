import { useState } from 'react';

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return '#4ade80';
      case 'completed': return '#94a3b8';
      default: return '#ff6b6b';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="container">
      <h1>Event Schedule</h1>
      <p style={{ textAlign: 'center', marginBottom: '2rem', opacity: 0.8 }}>
        Don't miss out on our upcoming live events and exclusive content!
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {events.map(event => (
          <div key={event.id} className="card">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '1rem'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{event.title}</h3>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  marginBottom: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ 
                    color: '#ff6b6b', 
                    fontWeight: 'bold' 
                  }}>
                    📅 {formatDate(event.date)}
                  </span>
                  <span style={{ 
                    color: '#ff6b6b', 
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
                <p style={{ opacity: 0.8, marginBottom: '1rem' }}>
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
                  color: '#ff6b6b',
                  marginBottom: '0.5rem'
                }}>
                  ${event.ticketPrice}
                </div>
                <button style={{
                  background: event.status === 'upcoming' 
                    ? 'linear-gradient(90deg, #ff6b6b, #ff5252)' 
                    : 'linear-gradient(90deg, #94a3b8, #64748b)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}>
                  {event.status === 'upcoming' ? 'Buy Ticket' : 'Watch Replay'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
