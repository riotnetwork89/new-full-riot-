import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../utils/supabase';
import Nav from '../../components/Nav';
import { useRouter } from 'next/router';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setLoading(false);
    };
    getUser();

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
  }, [router]);

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
    return (
      <div className="min-h-screen bg-riot-black">
        <Nav />
        <div className="flex justify-center items-center h-96">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-riot-black">
      <Nav />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-riot-red mb-8 text-center">Live Chat</h1>
        
        <div className="bg-riot-gray rounded-lg p-6">
          <div className="h-96 overflow-y-auto mb-6 space-y-3 border border-riot-red rounded p-4 bg-riot-black">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-riot-red font-semibold text-sm">
                    {msg.profiles?.display_name || msg.display_name || 'Anonymous'}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-white ml-2">{msg.message}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-riot-black text-white border border-riot-red rounded-lg focus:outline-none focus:border-riot-red"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-6 py-3 bg-riot-red text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
          
          <p className="text-gray-400 text-sm mt-2 text-center">
            Be respectful and follow community guidelines
          </p>
        </div>
      </main>
    </div>
  );
}
