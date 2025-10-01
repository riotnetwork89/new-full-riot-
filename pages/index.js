import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      setUser(JSON.parse(mockUser));
    }
  }, []);

  if (user) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome Back!</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
            Hey {user.email.split('@')[0]}, ready to dive into the Riot Network experience?
          </p>
        </div>
        
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <Link href="/stream" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ 
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 82, 82, 0.1))'
            }}>
              <h3 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>🔴 Live Stream</h3>
              <p>Join our exclusive live streaming events and interact with the community in real-time.</p>
            </div>
          </Link>
          
          <Link href="/chat" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ 
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 82, 82, 0.1))'
            }}>
              <h3 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>💬 Live Chat</h3>
              <p>Connect with other fans and share your thoughts during live events.</p>
            </div>
          </Link>
          
          <Link href="/profile" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ 
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 82, 82, 0.1))'
            }}>
              <h3 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>👤 Your Profile</h3>
              <p>Check your Riot Coins, order history, and manage your account settings.</p>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', background: 'linear-gradient(90deg, #ff6b6b, #ff5252)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          RIOT NETWORK
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.8 }}>
          Premium Pay-Per-View Streaming Experience
        </p>
        <p style={{ fontSize: '1.1rem', opacity: 0.7, maxWidth: '600px', margin: '0 auto' }}>
          Join thousands of fans for exclusive live events, interactive chat, and premium content. 
          Get access to our streaming platform and become part of the Riot Network community.
        </p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem' }}>
        <Link href="/login">
          <button style={{
            background: 'linear-gradient(90deg, #ff6b6b, #ff5252)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}>
            Login to Stream
          </button>
        </Link>
        <Link href="/schedule">
          <button style={{
            background: 'transparent',
            color: '#ff6b6b',
            border: '2px solid #ff6b6b',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            View Schedule
          </button>
        </Link>
      </div>
      
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card">
          <h3 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>🎥 Premium Streaming</h3>
          <p>High-quality live streams with interactive features and real-time chat.</p>
        </div>
        
        <div className="card">
          <h3 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>🎁 Exclusive Content</h3>
          <p>Access to special events, behind-the-scenes content, and member-only streams.</p>
        </div>
        
        <div className="card">
          <h3 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>🏆 Rewards System</h3>
          <p>Earn Riot Coins through participation and redeem them for exclusive perks.</p>
        </div>
      </div>
    </div>
  );
}
