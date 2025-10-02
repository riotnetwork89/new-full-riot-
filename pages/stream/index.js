import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';
import { accessCache } from '../../utils/cache';

export default function Stream() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamStatus, setStreamStatus] = useState('live');
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);
  const messagesEndRef = useRef(null);
  
  const [vods, setVods] = useState([]);
  const [currentView, setCurrentView] = useState('live'); // 'live' or 'vod'
  const [selectedVod, setSelectedVod] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('email', user.email)
        .eq('product', 'ppv_ticket')
        .single();
      
      if (order) {
        setUser(user);
        setHasAccess(true);
        
        await supabase.from('stream_logs').insert({
          user_email: user.email,
          action: 'stream_access',
          status: 'active'
        });
      } else {
        router.push('/checkout');
        return;
      }
      
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
    
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) {
        setMessages(data.reverse());
      }
    };
    fetchMessages();

    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages((current) => {
            const newMessages = [...current, payload.new];
            return newMessages.slice(-50);
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    const fetchVods = async () => {
      const { data, error } = await supabase
        .from('vods')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setVods(data);
      }
    };
    fetchVods();
    
    checkAccess();
    updateViewerCount();
    
    const viewerInterval = setInterval(updateViewerCount, 30000);
    
    return () => {
      clearInterval(viewerInterval);
    };
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!user) return;
    if (rateLimited) return;
    
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    if (messageCount >= 5) {
      setRateLimited(true);
      setTimeout(() => {
        setRateLimited(false);
        setMessageCount(0);
      }, 60000);
      return;
    }
    
    try {
      await supabase.from('chat_messages').insert({
        user_email: user.email,
        message: newMessage.slice(0, 500),
      });
      setNewMessage('');
      setMessageCount(prev => prev + 1);
      
      setTimeout(() => {
        setMessageCount(prev => Math.max(0, prev - 1));
      }, 60000);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleVodSelect = (vod) => {
    setSelectedVod(vod);
    setCurrentView('vod');
  };

  const handleBackToLive = () => {
    setCurrentView('live');
    setSelectedVod(null);
  };

  if (loading) return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center' }}>
        <p>Loading stream...</p>
      </div>
    </div>
  );

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>{currentView === 'live' ? 'Live Stream' : 'VOD Player'}</h1>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {currentView === 'vod' && (
              <button 
                onClick={handleBackToLive}
                style={{
                  background: 'linear-gradient(45deg, #ff0000, #cc0000)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                ← Back to Live
              </button>
            )}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              background: 'rgba(255, 0, 0, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: '1px solid rgba(255, 0, 0, 0.3)'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: currentView === 'live' && streamStatus === 'live' ? '#4ade80' : '#6b7280',
                animation: currentView === 'live' && streamStatus === 'live' ? 'pulse 2s infinite' : 'none'
              }}></div>
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                {currentView === 'live' ? (streamStatus === 'live' ? 'LIVE' : 'OFFLINE') : 'VOD'}
              </span>
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#ff0000',
              fontWeight: '600'
            }}>
              👥 {viewerCount} viewers
            </div>
          </div>
        </div>
        
        {hasAccess ? (
          <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 200px)' }}>
            {/* Main Video Area */}
            <div style={{ flex: '1', minWidth: '0' }}>
              <div style={{
                width: '100%',
                height: '480px',
                background: currentView === 'live' ? 'linear-gradient(45deg, #ff0000, #000000)' : '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                border: '2px solid #ff0000',
                marginBottom: '1rem'
              }}>
                {currentView === 'live' ? (
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔴</div>
                    <h3>RIOT NETWORK LIVE</h3>
                    <p>Stream is currently offline</p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                      Demo mode - Mux integration ready for production
                    </p>
                  </div>
                ) : selectedVod ? (
                  <video 
                    controls 
                    src={selectedVod.video_url} 
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      borderRadius: '8px'
                    }} 
                    autoPlay
                  />
                ) : null}
              </div>
              
              {currentView === 'live' && (
                <div style={{ 
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 0, 0, 0.2)'
                }}>
                  <h3 style={{ marginBottom: '0.5rem', color: '#ff0000' }}>Stream Quality</h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                    <button style={{ 
                      padding: '0.25rem 0.75rem', 
                      background: 'rgba(255, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 0, 0, 0.3)',
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
              )}
            </div>
            
            {/* Chat and VOD Sidebar */}
            <div style={{ 
              width: '350px', 
              display: 'flex', 
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* VOD Queue */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1rem',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ 
                  marginBottom: '1rem',
                  color: '#ff0000',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  VOD Queue
                </h3>
                <div style={{ 
                  maxHeight: '200px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {vods.map(vod => (
                    <div 
                      key={vod.id} 
                      onClick={() => handleVodSelect(vod)}
                      style={{ 
                        padding: '0.75rem',
                        background: selectedVod?.id === vod.id ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ 
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#ff0000',
                        marginBottom: '0.25rem'
                      }}>
                        {vod.title}
                      </div>
                      <div style={{ 
                        fontSize: '0.7rem',
                        color: 'rgba(255, 255, 255, 0.6)'
                      }}>
                        {new Date(vod.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Live Chat */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1rem',
                backdropFilter: 'blur(10px)',
                flex: '1',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ 
                    color: '#ff0000',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    margin: 0
                  }}>
                    Live Chat
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        background: isConnected ? '#4ade80' : '#ef4444'
                      }}></div>
                      <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#ff0000'
                    }}>
                      💬 {messages.length}
                    </div>
                  </div>
                </div>
                
                <div
                  style={{
                    border: '1px solid rgba(255, 0, 0, 0.3)',
                    padding: '0.75rem',
                    height: '300px',
                    overflowY: 'scroll',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    scrollBehavior: 'smooth',
                    flex: '1'
                  }}
                >
                  {messages.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginTop: '2rem'
                    }}>
                      <p>No messages yet. Be the first to say something!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} style={{ 
                        marginBottom: '0.5rem', 
                        padding: '0.5rem', 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        borderRadius: '4px',
                        wordWrap: 'break-word'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <strong style={{ color: '#ff0000' }}>{msg.user_email.split('@')[0]}: </strong>
                            <span style={{ marginLeft: '0.5rem' }}>{msg.message}</span>
                          </div>
                          <span style={{ 
                            fontSize: '0.6rem', 
                            color: 'rgba(255, 255, 255, 0.5)',
                            marginLeft: '1rem',
                            flexShrink: 0
                          }}>
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={rateLimited ? "Rate limited - wait 1 minute" : "Type your message..."}
                    style={{ 
                      flex: 1,
                      opacity: rateLimited ? 0.5 : 1,
                      fontSize: '0.9rem',
                      padding: '0.5rem'
                    }}
                    maxLength={500}
                    disabled={rateLimited || !isConnected}
                  />
                  <button 
                    type="submit" 
                    disabled={rateLimited || !isConnected || !newMessage.trim()}
                    style={{
                      opacity: (rateLimited || !isConnected || !newMessage.trim()) ? 0.5 : 1,
                      padding: '0.5rem 1rem',
                      fontSize: '0.8rem'
                    }}
                  >
                    Send
                  </button>
                </form>
                
                {rateLimited && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.5rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    color: '#ef4444'
                  }}>
                    ⚠️ Rate limited: 5 messages per minute
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>You do not have access to this stream.</p>
            <button 
              onClick={() => router.push('/checkout')}
              style={{ 
                padding: '1rem 2rem',
                fontSize: '1.1rem'
              }}
            >
              Purchase Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
