import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/login');
      } else {
        setUser(data.user);
      }
    }
    getUser();

    async function fetchMessages() {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error) {
        setMessages(data);
      }
    }
    fetchMessages();

    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages((current) => [...current, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!user) return;
    await supabase.from('chat_messages').insert({
      user_email: user.email,
      message: newMessage,
    });
    setNewMessage('');
  };

  return (
    <div className="container">
      <h1>Live Chat</h1>
      <div className="card">
        <div
          style={{
            border: '1px solid rgba(255, 107, 107, 0.3)',
            padding: '1rem',
            height: '400px',
            overflowY: 'scroll',
            marginBottom: '1rem',
            borderRadius: '8px',
            background: 'rgba(0, 0, 0, 0.3)'
          }}
        >
          {messages.map((msg) => (
            <div key={msg.id} style={{ 
              marginBottom: '0.5rem', 
              padding: '0.5rem', 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: '4px' 
            }}>
              <strong style={{ color: '#ff6b6b' }}>{msg.user_email}: </strong>
              <span style={{ marginLeft: '0.5rem' }}>{msg.message}</span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message"
            style={{ flex: 1 }}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}
