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
    <div className="min-h-screen bg-black font-riot">
      <Nav />
      
      <PaywallGuard requireAccess={true}>
        <main className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center mb-16">
            <div className="riot-underline inline-block">
              <h1 className="text-5xl font-black text-white uppercase tracking-tight">Live Stream</h1>
            </div>
            <div className={`inline-block px-8 py-4 mt-8 text-sm font-bold uppercase tracking-[0.2em] ${
              streamStatus === 'LIVE' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-300'
            }`}>
              {streamStatus === 'LIVE' ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-12">
            <div className="lg:col-span-3">
              <div className="bg-black border border-gray-800">
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
                  <div className="aspect-video flex items-center justify-center bg-black">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-riot-red mx-auto flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1"></div>
                      </div>
                      <p className="text-white text-xl font-bold uppercase tracking-wide">Stream not configured</p>
                    </div>
                  </div>
                )}
              </div>
              
              {streamStatus !== 'LIVE' && (
                <div className="mt-8 p-8 bg-black border border-gray-800">
                  <p className="text-gray-400 text-sm uppercase tracking-widest">
                    The stream is currently offline. Please check back later or follow our social media for updates.
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-8">Live Chat</h2>
              <ChatBox />
            </div>
          </div>
        </main>
      </PaywallGuard>
    </div>
  );
}
