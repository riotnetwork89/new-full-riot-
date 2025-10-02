import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';
import { userCache } from '../../utils/cache';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        userCache.set(`user-${user.id}`, user);
      }
    }
    getUser();

    async function fetchMessages() {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!error && data) {
        setMessages(data.reverse()); // Reverse to show oldest first
      }
    }
    fetchMessages();

    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages((current) => {
            const newMessages = [...current, payload.new];
            return newMessages.slice(-100);
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
        message: newMessage.slice(0, 500), // Limit message length
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

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Live Chat</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: isConnected ? '#4ade80' : '#ef4444'
            }}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#ff6b6b'
          }}>
            💬 {messages.length} messages
          </div>
        </div>
      </div>
      
      <div className="card">
        <div
          style={{
            border: '1px solid rgba(255, 107, 107, 0.3)',
            padding: '1rem',
            height: '400px',
            overflowY: 'scroll',
            marginBottom: '1rem',
            borderRadius: '8px',
            background: 'rgba(0, 0, 0, 0.3)',
            scrollBehavior: 'smooth'
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
                    <strong style={{ color: '#ff6b6b' }}>{msg.user_email.split('@')[0]}: </strong>
                    <span style={{ marginLeft: '0.5rem' }}>{msg.message}</span>
                  </div>
                  <span style={{ 
                    fontSize: '0.7rem', 
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
        
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={rateLimited ? "Rate limited - wait 1 minute" : "Type your message (max 500 chars)"}
            style={{ 
              flex: 1,
              opacity: rateLimited ? 0.5 : 1
            }}
            maxLength={500}
            disabled={rateLimited || !isConnected}
          />
          <button 
            type="submit" 
            disabled={rateLimited || !isConnected || !newMessage.trim()}
            style={{
              opacity: (rateLimited || !isConnected || !newMessage.trim()) ? 0.5 : 1
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
            fontSize: '0.9rem',
            color: '#ef4444'
          }}>
            ⚠️ Rate limited: You can send up to 5 messages per minute
          </div>
        )}
      </div>
    </div>
  );
}
