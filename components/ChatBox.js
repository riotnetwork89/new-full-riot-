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
    <div className="bg-black border border-gray-800 p-8 h-96 flex flex-col">
      <div className="flex-1 overflow-y-auto mb-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="font-bold text-riot-red uppercase tracking-widest text-xs">
              {msg.profiles?.display_name || msg.display_name || 'Anonymous'}:
            </span>
            <span className="text-white ml-3 font-medium">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {user ? (
        <form onSubmit={handleSend} className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-black text-white border border-gray-800 focus:outline-none focus:border-riot-red font-medium"
          />
          <button
            type="submit"
            className="bg-riot-red text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-red-700 transition-colors text-xs"
          >
            Send
          </button>
        </form>
      ) : (
        <div className="text-center text-gray-500 text-xs uppercase tracking-widest">
          Please log in to chat
        </div>
      )}
    </div>
  );
}
