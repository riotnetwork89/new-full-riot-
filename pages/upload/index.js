import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';

export default function Upload() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      if (router.isReady) {
        router.push('/login');
      }
      return;
    }
    if (!file) {
      setMessage('Please choose a file');
      return;
    }
    const filePath = `${Date.now()}_${file.name}`;
    // Upload to Storage bucket named 'clips' (create bucket via Supabase UI if not exists)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('clips')
      .upload(filePath, file);
    if (uploadError) {
      setMessage(uploadError.message);
      return;
    }
    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage.from('clips').getPublicUrl(filePath);
    const video_url = publicUrlData?.publicUrl || '';
    // Insert into vod_edits table
    const { error } = await supabase.from('vod_edits').insert({
      file_id: filePath,
      submitted_by: user.id,
      approved: false,
      video_url,
      caption,
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Upload successful! Awaiting approval.');
      setFile(null);
      setCaption('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
      <h1>Upload Clip</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '400px' }}>
        <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} />
        <input type="text" placeholder="Caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <button type="submit">Upload</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}
