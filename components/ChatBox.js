import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles(display_name)
        `)
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        setMessages(data);
      }
    };

    fetchMessages();

    const subscription = supabase
      .channel('chat_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        display_name: user.email.split('@')[0],
        message: newMessage.trim()
      });

    if (!error) {
      setNewMessage('');
    }
  };

  if (loading) {
    return <div className="text-white">Loading chat...</div>;
  }

  return (
    <div className="bg-riot-gray rounded-lg p-4 h-96 flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="text-riot-red font-semibold">
              {msg.profiles?.display_name || msg.display_name || 'Anonymous'}:
            </span>
            <span className="text-white ml-2">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {user ? (
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-riot-black text-white border border-riot-red rounded focus:outline-none focus:border-riot-red"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-riot-red text-white rounded hover:bg-red-700 transition-colors"
          >
            Send
          </button>
        </form>
      ) : (
        <div className="text-center text-gray-400">
          Please log in to chat
        </div>
      )}
    </div>
  );
}
