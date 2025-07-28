import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../utils/supabase';

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
        .order('timestamp', { ascending: true });
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
      user_id: user.id,
      user_email: user.email,
      message: newMessage,
    });
    setNewMessage('');
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Live Chat</h1>
      <div
        style={{
          border: '1px solid #555',
          padding: '1rem',
          height: '300px',
          overflowY: 'scroll',
          marginBottom: '1rem',
        }}
      >
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '0.5rem' }}>
            <strong>{msg.user_email}: </strong>
            {msg.message}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
          style={{ width: '80%', padding: '0.5rem' }}
        />
        <button
          type="submit"
          style={{ padding: '0.5rem', marginLeft: '0.5rem' }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
