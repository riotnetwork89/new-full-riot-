import { createClient } from "@supabase/supabase-js";
import { createLiveStream, getLiveStream, listLiveStreams, deleteLiveStream } from '../utils/mux';

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: req.headers.authorization || "" } } }
  );

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.email !== 'kevinparxmusic@gmail.com') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', user.email)
      .single();
    
    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
  }

  try {
    switch (req.method) {
      case 'GET':
        const streams = await listLiveStreams();
        return res.status(200).json(streams);

      case 'POST':
        const newStream = await createLiveStream(req.body);
        
        await supabase.from('stream_logs').insert({
          status: 'DISCONNECTED',
          notes: `Created stream: ${newStream.id}`
        });
        
        return res.status(201).json(newStream);

      case 'DELETE':
        const { streamId } = req.body;
        await deleteLiveStream(streamId);
        
        await supabase.from('stream_logs').insert({
          status: 'DISCONNECTED',
          notes: `Deleted stream: ${streamId}`
        });
        
        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Mux API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
