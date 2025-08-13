import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';
import MuxPlayer from '@mux/mux-player-react';
import Nav from '../../components/Nav';
import ChatBox from '../../components/ChatBox';
import PaywallGuard from '../../components/PaywallGuard';

export default function Stream() {
  const [streamStatus, setStreamStatus] = useState('DISCONNECTED');

  useEffect(() => {
    const fetchStreamStatus = async () => {
      const { data } = await supabase
        .from('stream_logs')
        .select('status')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) {
        setStreamStatus(data.status);
      }
    };

    fetchStreamStatus();

    const subscription = supabase
      .channel('stream_logs')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'stream_logs' },
        (payload) => {
          setStreamStatus(payload.new.status);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-riot-black">
      <Nav />
      
      <PaywallGuard requireAccess={true}>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-riot-red mb-4">Live Stream</h1>
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
              streamStatus === 'LIVE' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}>
              {streamStatus === 'LIVE' ? '🔴 LIVE' : '⚫ OFFLINE'}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-riot-gray rounded-lg overflow-hidden">
                {process.env.NEXT_PUBLIC_MUX_PLAYBACK_ID ? (
                  <MuxPlayer
                    playbackId={process.env.NEXT_PUBLIC_MUX_PLAYBACK_ID}
                    streamType="live"
                    autoPlay="muted"
                    style={{
                      width: '100%',
                      aspectRatio: '16/9'
                    }}
                  />
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-riot-black">
                    <p className="text-white text-xl">Stream not configured</p>
                  </div>
                )}
              </div>
              
              {streamStatus !== 'LIVE' && (
                <div className="mt-4 p-4 bg-yellow-900 border border-yellow-600 rounded-lg">
                  <p className="text-yellow-200">
                    The stream is currently offline. Please check back later or follow our social media for updates.
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-white mb-4">Live Chat</h2>
              <ChatBox />
            </div>
          </div>
        </main>
      </PaywallGuard>
    </div>
  );
}
