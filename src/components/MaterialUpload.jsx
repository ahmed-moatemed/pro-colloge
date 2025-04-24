import { useState } from 'react';
import { supabase } from '../supabase';
import '../styles/MaterialUpload.css';

function MaterialUpload({ userid }) {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const fileName = `${userid}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(fileName, file);
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return;
    }

    const { publicUrl } = supabase.storage.from('materials').getPublicUrl(fileName).data;

    const material = { fileurl: publicUrl, subject, uploaddate: new Date().toISOString(), userid };

    const { error: supabaseError } = await supabase.from('materials').insert([material]);
    if (supabaseError) console.error('Supabase error:', supabaseError);
    console.log('Material added successfully');
    setFile(null);
    setSubject('');
  };

  return (
    <form onSubmit={handleSubmit} className="material-upload">
      <h2>رفع مادة دراسية</h2>
      <input
        type="text"
        placeholder="المادة"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />
      <input
        type="file"
        accept=".pdf,.jpg,.png,.mp3"
        onChange={(e) => setFile(e.target.files[0])}
        required
      />
      <button type="submit">رفع</button>
    </form>
  );
}

export default MaterialUpload;