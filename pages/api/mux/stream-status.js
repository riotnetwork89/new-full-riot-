import { createClient } from "@supabase/supabase-js";
import { getLiveStream } from '../utils/mux';

export default async function handler(req, res) {
  const { streamId } = req.query;
  
  if (!streamId) {
    return res.status(400).json({ error: 'Stream ID required' });
  }

  try {
    const stream = await getLiveStream(streamId);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const status = stream.status === 'active' ? 'LIVE' : 'DISCONNECTED';
    
    await supabase.from('stream_logs').insert({
      status: status,
      notes: `Stream ${streamId} status: ${stream.status}`
    });
    
    return res.status(200).json({
      id: stream.id,
      status: stream.status,
      playback_ids: stream.playback_ids,
      stream_key: stream.stream_key,
      created_at: stream.created_at
    });
  } catch (error) {
    console.error('Stream status error:', error);
    return res.status(500).json({ error: error.message });
  }
}
