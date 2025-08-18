import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';
import Nav from '../../components/Nav';
import AdminTable from '../../components/AdminTable';
import EventForm from '../../components/EventForm';
import MerchForm from '../../components/MerchForm';
import toast, { Toaster } from 'react-hot-toast';

export default function Admin() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [merchandise, setMerchandise] = useState([]);
  const [logs, setLogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showMerchForm, setShowMerchForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingMerch, setEditingMerch] = useState(null);
  const [streamStatus, setStreamStatus] = useState('DISCONNECTED');

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && router.isReady) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin' && router.isReady) {
        router.push('/');
        return;
      }

      fetchData();
    };
    checkAdminAccess();
  }, [router]);

  const fetchData = async () => {
    const [ordersResult, eventsResult, merchResult, logsResult, chatResult] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('*').order('date', { ascending: false }),
      supabase.from('merchandise').select('*').order('created_at', { ascending: false }),
      supabase.from('stream_logs').select('*').order('created_at', { ascending: false }),
      supabase.from('chat_messages').select('*').order('created_at', { ascending: false })
    ]);

    setOrders(ordersResult.data || []);
    setEvents(eventsResult.data || []);
    setMerchandise(merchResult.data || []);
    setLogs(logsResult.data || []);
    setMessages(chatResult.data || []);

    if (logsResult.data && logsResult.data.length > 0) {
      setStreamStatus(logsResult.data[0].status);
    }
  };

  const handleSaveEvent = async (eventData) => {
    try {
      const processedData = {
        ...eventData,
        date: eventData.date ? new Date(eventData.date).toISOString() : null
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(processedData)
          .eq('id', editingEvent.id);
        
        if (error) throw error;
        toast.success('Event updated successfully');
      } else {
        const { error } = await supabase
          .from('events')
          .insert(processedData);
        
        if (error) throw error;
        toast.success('Event created successfully');
      }
      
      setShowEventForm(false);
      setEditingEvent(null);
      fetchData();
    } catch (error) {
      toast.error('Error saving event');
      console.error(error);
    }
  };

  const handleDeleteEvent = async (event) => {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', event.id);
        
        if (error) throw error;
        toast.success('Event deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Error deleting event');
        console.error(error);
      }
    }
  };

  const handleSaveMerch = async (merchData) => {
    try {
      if (editingMerch) {
        const { error } = await supabase
          .from('merchandise')
          .update(merchData)
          .eq('id', editingMerch.id);
        
        if (error) throw error;
        toast.success('Merchandise updated successfully');
      } else {
        const { error } = await supabase
          .from('merchandise')
          .insert(merchData);
        
        if (error) throw error;
        toast.success('Merchandise created successfully');
      }
      
      setShowMerchForm(false);
      setEditingMerch(null);
      fetchData();
    } catch (error) {
      toast.error('Error saving merchandise');
      console.error(error);
    }
  };

  const handleDeleteMerch = async (item) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        const { error } = await supabase
          .from('merchandise')
          .delete()
          .eq('id', item.id);
        
        if (error) throw error;
        toast.success('Merchandise deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Error deleting merchandise');
        console.error(error);
      }
    }
  };

  const handleDeleteMessage = async (message) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        const { error } = await supabase
          .from('chat_messages')
          .delete()
          .eq('id', message.id);
        
        if (error) throw error;
        toast.success('Message deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Error deleting message');
        console.error(error);
      }
    }
  };

  const updateStreamStatus = async (status) => {
    try {
      const { error } = await supabase
        .from('stream_logs')
        .insert({ status });
      
      if (error) throw error;
      setStreamStatus(status);
      toast.success(`Stream status updated to ${status}`);
    } catch (error) {
      toast.error('Error updating stream status');
      console.error(error);
    }
  };

  const orderColumns = [
    { key: 'email', label: 'Email' },
    { key: 'amount', label: 'Amount', render: (value) => `$${value}` },
    { key: 'status', label: 'Status' },
    { key: 'provider', label: 'Provider' },
    { key: 'created_at', label: 'Date', render: (value) => new Date(value).toLocaleDateString() }
  ];

  const eventColumns = [
    { key: 'title', label: 'Title' },
    { key: 'date', label: 'Date', render: (value) => value ? new Date(value).toLocaleDateString() : 'No Date' },
    { key: 'ppv_price', label: 'PPV Price', render: (value) => `$${value}` },
    { key: 'ticket_price', label: 'Ticket Price', render: (value) => `$${value}` },
    { key: 'is_active', label: 'Active', render: (value) => value ? 'Yes' : 'No' }
  ];

  const eventActions = [
    {
      label: 'Edit',
      onClick: (event) => {
        setEditingEvent(event);
        setShowEventForm(true);
      },
      className: 'bg-blue-600 text-white hover:bg-blue-700'
    },
    {
      label: 'Delete',
      onClick: handleDeleteEvent,
      className: 'bg-red-600 text-white hover:bg-red-700'
    }
  ];

  const merchColumns = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price', render: (value) => `$${value}` },
    { key: 'stock_quantity', label: 'Stock', render: (value) => value !== null ? value : 'Unlimited' },
    { key: 'is_active', label: 'Active', render: (value) => value ? 'Yes' : 'No' },
    { key: 'created_at', label: 'Created', render: (value) => new Date(value).toLocaleDateString() }
  ];

  const merchActions = [
    {
      label: 'Edit',
      onClick: (item) => {
        setEditingMerch(item);
        setShowMerchForm(true);
      },
      className: 'bg-blue-600 text-white hover:bg-blue-700'
    },
    {
      label: 'Delete',
      onClick: handleDeleteMerch,
      className: 'bg-red-600 text-white hover:bg-red-700'
    }
  ];

  const messageColumns = [
    { key: 'display_name', label: 'User', render: (value) => value || 'Anonymous' },
    { key: 'message', label: 'Message' },
    { key: 'created_at', label: 'Date', render: (value) => new Date(value).toLocaleString() }
  ];

  const messageActions = [
    {
      label: 'Delete',
      onClick: handleDeleteMessage,
      className: 'bg-red-600 text-white hover:bg-red-700'
    }
  ];

  const logColumns = [
    { key: 'status', label: 'Status' },
    { key: 'bitrate', label: 'Bitrate' },
    { key: 'notes', label: 'Notes' },
    { key: 'created_at', label: 'Date', render: (value) => new Date(value).toLocaleString() }
  ];

  return (
    <div className="min-h-screen bg-black font-riot">
      <Nav />
      <Toaster position="top-center" />
      
      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex justify-between items-center mb-16">
          <div className="riot-underline">
            <h1 className="text-5xl font-black text-white uppercase tracking-tight">Admin</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className={`px-6 py-3 text-sm font-bold uppercase tracking-widest ${
              streamStatus === 'LIVE' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-300'
            }`}>
              Stream: {streamStatus}
            </div>
            
            <button
              onClick={() => updateStreamStatus(streamStatus === 'LIVE' ? 'DISCONNECTED' : 'LIVE')}
              className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
                streamStatus === 'LIVE'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {streamStatus === 'LIVE' ? 'Stop Stream' : 'Start Stream'}
            </button>
          </div>
        </div>

        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-white uppercase tracking-wide">Events</h2>
            <button
              onClick={() => setShowEventForm(true)}
              className="bg-riot-red text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Create Event
            </button>
          </div>
          <AdminTable
            title=""
            columns={eventColumns}
            data={events}
            actions={eventActions}
          />
        </div>

        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-white uppercase tracking-wide">Merchandise</h2>
            <button
              onClick={() => setShowMerchForm(true)}
              className="bg-riot-red text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Add Item
            </button>
          </div>
          <AdminTable
            title=""
            columns={merchColumns}
            data={merchandise}
            actions={merchActions}
          />
        </div>

        <div className="space-y-16">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-wide mb-8">Orders</h2>
            <AdminTable
              title=""
              columns={orderColumns}
              data={orders}
            />
          </div>

          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-wide mb-8">Questions</h2>
            <AdminTable
              title=""
              columns={messageColumns}
              data={messages}
              actions={messageActions}
            />
          </div>

          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-wide mb-8">Analytics</h2>
            <AdminTable
              title=""
              columns={logColumns}
              data={logs}
            />
          </div>
        </div>

        {showEventForm && (
          <EventForm
            event={editingEvent}
            onSave={handleSaveEvent}
            onCancel={() => {
              setShowEventForm(false);
              setEditingEvent(null);
            }}
          />
        )}

        {showMerchForm && (
          <MerchForm
            item={editingMerch}
            onSave={handleSaveMerch}
            onCancel={() => {
              setShowMerchForm(false);
              setEditingMerch(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
