import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';
import Nav from '../../components/Nav';
import AdminTable from '../../components/AdminTable';
import EventForm from '../../components/EventForm';
import MerchForm from '../../components/MerchForm';
import StreamManager from '../../components/StreamManager';
import toast, { Toaster } from 'react-hot-toast';

export default function Admin() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [merchandise, setMerchandise] = useState([]);
  const [logs, setLogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [vodEdits, setVodEdits] = useState([]);
  const [liveEditCaption, setLiveEditCaption] = useState('');
  const [isPopulatingMerch, setIsPopulatingMerch] = useState(false);
  const [showLiveEditForm, setShowLiveEditForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showMerchForm, setShowMerchForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingMerch, setEditingMerch] = useState(null);
  const [streamStatus, setStreamStatus] = useState('DISCONNECTED');

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (router.isReady) {
          router.push('/login');
        }
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        if (router.isReady) {
          router.push('/');
        }
        return;
      }

      fetchData();
    };
    checkAdminAccess();
  }, [router]);

  const fetchData = async () => {
    const [ordersResult, eventsResult, merchResult, logsResult, chatResult, vodResult] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('*').order('date', { ascending: false }),
      supabase.from('merchandise').select('*').order('created_at', { ascending: false }),
      supabase.from('stream_logs').select('*').order('created_at', { ascending: false }),
      supabase.from('chat_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('vod_edits').select('*').order('created_at', { ascending: false })
    ]);

    setOrders(ordersResult.data || []);
    setEvents(eventsResult.data || []);
    setMerchandise(merchResult.data || []);
    setLogs(logsResult.data || []);
    setMessages(chatResult.data || []);
    setVodEdits(vodResult.data || []);

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Authentication required');
        return;
      }

      const processedData = {
        name: merchData.name,
        price: parseFloat(merchData.price),
        stock: merchData.stock_quantity ? parseInt(merchData.stock_quantity) : 0,
        is_active: merchData.is_active || false,
        image_url: merchData.image_url || null,
        description: merchData.description || null
      };

      if (editingMerch) {
        const { error } = await supabase
          .from('merchandise')
          .update(processedData)
          .eq('id', editingMerch.id);
        
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        toast.success('Merchandise updated successfully');
      } else {
        const { data, error } = await supabase
          .from('merchandise')
          .insert(processedData)
          .select();
        
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        toast.success('Merchandise created successfully');
      }
      
      setShowMerchForm(false);
      setEditingMerch(null);
      fetchData();
    } catch (error) {
      console.error('Error saving merchandise:', error);
      toast.error(`Failed to save merchandise: ${error.message}`);
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

  const handleApproveVod = async (vodEdit) => {
    try {
      const { error } = await supabase
        .from('vod_edits')
        .update({ 
          approved: true, 
          published_at: new Date().toISOString(),
          notification_sent: false 
        })
        .eq('id', vodEdit.id);
      
      if (error) throw error;
      toast.success('VOD approved and published');
      fetchData();
    } catch (error) {
      toast.error('Error approving VOD');
      console.error(error);
    }
  };

  const handleRejectVod = async (vodEdit) => {
    if (confirm('Are you sure you want to reject this VOD?')) {
      try {
        const { error } = await supabase
          .from('vod_edits')
          .delete()
          .eq('id', vodEdit.id);
        
        if (error) throw error;
        toast.success('VOD rejected and deleted');
        fetchData();
      } catch (error) {
        toast.error('Error rejecting VOD');
        console.error(error);
      }
    }
  };

  const handleLiveEdit = async (streamTimestamp, caption) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('vod_edits')
        .insert({
          stream_timestamp: streamTimestamp,
          caption: caption,
          is_live_edit: true,
          approved: true,
          published_at: new Date().toISOString(),
          notification_sent: false,
          submitted_by: user.id
        });
      
      if (error) throw error;
      toast.success('Live edit published to VOD');
      fetchData();
    } catch (error) {
      toast.error('Error publishing live edit');
      console.error(error);
    }
  };

  const handleCreateLiveEdit = async () => {
    if (!liveEditCaption.trim()) {
      toast.error('Please enter a caption for the live edit');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Authentication required');
        return;
      }

      const { error } = await supabase
        .from('vod_edits')
        .insert({
          stream_timestamp: new Date().toISOString(),
          caption: liveEditCaption,
          is_live_edit: true,
          approved: true,
          published_at: new Date().toISOString(),
          notification_sent: false,
          submitted_by: user.id,
          video_url: `https://stream.mux.com/${process.env.NEXT_PUBLIC_MUX_PLAYBOOK_ID || 'oMaw4Lzf01o9sPf7aTgjv1so00VC5ePBYr5km8CEqvgOY'}.m3u8`
        });
      
      if (error) throw error;
      toast.success('Live edit published to VOD queue');
      setLiveEditCaption('');
      setShowLiveEditForm(false);
      fetchData();
    } catch (error) {
      toast.error('Error publishing live edit');
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

        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-white uppercase tracking-wide">VOD Management</h2>
            {streamStatus === 'LIVE' && (
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowLiveEditForm(!showLiveEditForm)}
                  className="bg-green-600 text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-green-700 transition-colors"
                >
                  {showLiveEditForm ? 'Cancel' : 'Create Live Edit'}
                </button>
              </div>
            )}
          </div>

          {showLiveEditForm && (
            <div className="bg-gray-900 border border-gray-800 p-8 mb-8">
              <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wide">Create Live Stream Edit</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-widest">
                    Caption
                  </label>
                  <input
                    type="text"
                    value={liveEditCaption}
                    onChange={(e) => setLiveEditCaption(e.target.value)}
                    placeholder="Enter caption for this live edit..."
                    className="w-full px-4 py-3 bg-black border border-gray-800 text-white focus:border-riot-red focus:outline-none"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleCreateLiveEdit}
                    className="bg-riot-red text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
                  >
                    Publish to VOD Queue
                  </button>
                  <button
                    onClick={() => {
                      setShowLiveEditForm(false);
                      setLiveEditCaption('');
                    }}
                    className="bg-gray-600 text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <AdminTable
            title=""
            columns={[
              { key: 'caption', label: 'Caption' },
              { key: 'approved', label: 'Status', render: (value) => (
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                  value ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                }`}>
                  {value ? 'Approved' : 'Pending'}
                </span>
              )},
              { key: 'is_live_edit', label: 'Type', render: (value) => (
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                  value ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {value ? 'Live Edit' : 'Upload'}
                </span>
              )},
              { key: 'created_at', label: 'Created', render: (value) => new Date(value).toLocaleDateString() },
              { key: 'published_at', label: 'Published', render: (value) => value ? new Date(value).toLocaleDateString() : 'Not published' }
            ]}
            data={vodEdits}
            actions={[
              {
                label: 'Approve',
                onClick: handleApproveVod,
                className: 'bg-green-600 text-white hover:bg-green-700',
                condition: (item) => !item.approved
              },
              {
                label: 'Reject',
                onClick: handleRejectVod,
                className: 'bg-red-600 text-white hover:bg-red-700'
              }
            ]}
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

        <div className="mt-16">
          <StreamManager />
        </div>
      </main>
    </div>
  );
}
