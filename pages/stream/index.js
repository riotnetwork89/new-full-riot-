import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';
import { accessCache } from '../../utils/cache';

export default function Stream() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamStatus, setStreamStatus] = useState('live');

  useEffect(() => {
    const checkAccess = async () => {
      const mockUser = localStorage.getItem('mockUser');
      if (!mockUser) {
        router.push('/login');
        return;
      }
      
      const user = JSON.parse(mockUser);
      setHasAccess(true);
      setLoading(false);
    };
    
    const updateViewerCount = async () => {
      const { data } = await supabase
        .from('stream_logs')
        .select('user_email')
        .eq('action', 'stream_access')
        .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes
      
      if (data) {
        const uniqueViewers = new Set(data.map(log => log.user_email)).size;
        setViewerCount(uniqueViewers);
      }
    };
    
    checkAccess();
    updateViewerCount();
    
    const viewerInterval = setInterval(updateViewerCount, 30000);
    
    return () => {
      clearInterval(viewerInterval);
    };
  }, [router]);

  if (loading) return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center' }}>
        <p>Loading stream...</p>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Live Stream</h1>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            background: 'rgba(255, 107, 107, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 107, 107, 0.3)'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: streamStatus === 'live' ? '#4ade80' : '#6b7280',
              animation: streamStatus === 'live' ? 'pulse 2s infinite' : 'none'
            }}></div>
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
              {streamStatus === 'live' ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#ff6b6b',
            fontWeight: '600'
          }}>
            👥 {viewerCount} viewers
          </div>
        </div>
      </div>
      
      {hasAccess ? (
        <div className="card">
          <div style={{
            width: '100%',
            height: '480px',
            background: 'linear-gradient(45deg, #ff0000, #000000)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            border: '2px solid #ff6b6b'
          }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔴</div>
              <h3>RIOT NETWORK LIVE</h3>
              <p>Stream is currently offline</p>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Demo mode - Mux integration ready for production
              </p>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 107, 107, 0.2)'
          }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#ff6b6b' }}>Stream Quality</h3>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
              <button style={{ 
                padding: '0.25rem 0.75rem', 
                background: 'rgba(255, 107, 107, 0.2)',
                border: '1px solid rgba(255, 107, 107, 0.3)',
                borderRadius: '4px',
                fontSize: '0.8rem'
              }}>
                Auto
              </button>
              <button style={{ 
                padding: '0.25rem 0.75rem', 
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                fontSize: '0.8rem'
              }}>
                1080p
              </button>
              <button style={{ 
                padding: '0.25rem 0.75rem', 
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                fontSize: '0.8rem'
              }}>
                720p
              </button>
              <button style={{ 
                padding: '0.25rem 0.75rem', 
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                fontSize: '0.8rem'
              }}>
                480p
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem' }}>You do not have access to this stream.</p>
          <button 
            onClick={() => router.push('/checkout')}
            style={{ 
              marginTop: '1rem',
              padding: '1rem 2rem',
              fontSize: '1.1rem'
            }}
          >
            Purchase Ticket
          </button>
        </div>
      )}
    </div>
  );
}
