import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import Nav from '../../components/Nav';
import toast, { Toaster } from 'react-hot-toast';

export default function VOD() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedVideos();
    
    const subscription = supabase
      .channel('vod_updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'vod_edits',
        filter: 'approved=eq.true'
      }, (payload) => {
        if (payload.new.notification_sent === false) {
          toast.success('New VOD content available!');
          fetchApprovedVideos();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchApprovedVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('vod_edits')
        .select('*')
        .eq('approved', true)
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black font-riot">
      <Nav />
      <Toaster position="top-center" />
      
      <main className="max-w-7xl mx-auto px-8 py-32">
        <div className="riot-underline inline-block mb-16">
          <h1 className="text-5xl font-black text-white uppercase tracking-tight">VOD Library</h1>
        </div>
        
        {loading ? (
          <div className="text-white text-xl">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="text-gray-400 text-xl">No approved videos available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div key={video.id} className="bg-gray-900 border border-gray-800 overflow-hidden">
                <video 
                  src={video.video_url} 
                  controls 
                  className="w-full h-48 object-cover"
                  poster={video.thumbnail_url}
                />
                <div className="p-6">
                  <h3 className="text-white font-bold text-lg mb-2">{video.caption}</h3>
                  <p className="text-gray-400 text-sm">
                    {video.published_at ? new Date(video.published_at).toLocaleDateString() : 'Recently added'}
                  </p>
                  {video.is_live_edit && (
                    <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 mt-2 uppercase tracking-wide">
                      Live Edit
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
