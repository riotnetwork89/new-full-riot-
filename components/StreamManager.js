import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabase';

export default function StreamManager() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchStreams = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/mux/streams', {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setStreams(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch streams');
    } finally {
      setLoading(false);
    }
  };

  const createStream = async () => {
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/mux/streams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      const newStream = await response.json();
      toast.success('Stream created successfully');
      fetchStreams();
    } catch (error) {
      toast.error('Failed to create stream');
    } finally {
      setCreating(false);
    }
  };

  const deleteStream = async (streamId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/mux/streams', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ streamId })
      });
      toast.success('Stream deleted');
      fetchStreams();
    } catch (error) {
      toast.error('Failed to delete stream');
    }
  };

  const checkStreamStatus = async (streamId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`/api/mux/stream-status?streamId=${streamId}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
          'Content-Type': 'application/json'
        }
      });
      const status = await response.json();
      toast.success(`Stream status: ${status.status}`);
    } catch (error) {
      toast.error('Failed to check stream status');
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-white uppercase tracking-wide">Stream Management</h3>
        <button
          onClick={createStream}
          disabled={creating}
          className="bg-riot-red text-white px-6 py-3 font-bold uppercase tracking-wide hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Stream'}
        </button>
      </div>

      {loading ? (
        <div className="text-white">Loading streams...</div>
      ) : (
        <div className="space-y-4">
          {streams.length === 0 ? (
            <div className="text-gray-400">No streams found</div>
          ) : (
            streams.map((stream) => (
              <div key={stream.id} className="bg-black border border-gray-800 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Stream ID</p>
                    <p className="text-white font-mono text-sm">{stream.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Status</p>
                    <p className={`text-sm font-bold uppercase ${
                      stream.status === 'active' ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {stream.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Stream Key</p>
                    <p className="text-white font-mono text-sm break-all">{stream.stream_key}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Playback ID</p>
                    <p className="text-white font-mono text-sm break-all">
                      {stream.playback_ids?.[0]?.id || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={() => checkStreamStatus(stream.id)}
                    className="bg-blue-600 text-white px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-blue-700 transition-colors"
                  >
                    Check Status
                  </button>
                  <button
                    onClick={() => deleteStream(stream.id)}
                    className="bg-red-600 text-white px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
