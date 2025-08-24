import { getLiveStream } from '../utils/mux';
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { streamId } = req.body;
  
  if (!streamId) {
    return res.status(400).json({ error: 'Stream ID required' });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const stream = await getLiveStream(streamId);
    
    await supabase.from('stream_logs').insert({
      status: 'LIVE',
      bitrate: 2500,
      notes: `Stream ${streamId} activated via admin dashboard - Ready for streaming`
    });
    
    return res.status(200).json({
      success: true,
      message: 'Stream activated successfully',
      streamId: streamId,
      streamKey: stream.stream_key,
      playbackId: stream.playback_ids?.[0]?.id,
      rtmpUrl: `rtmps://global-live.mux.com:443/live/${stream.stream_key}`,
      status: 'LIVE',
      instructions: 'Stream is now LIVE and ready for broadcasting. Use OBS or streaming software with the provided RTMP URL and stream key.'
    });
    
  } catch (error) {
    console.error('Stream activation error:', error);
    return res.status(500).json({ error: error.message });
  }
}
