import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import FilePreview from './FilePreview';
import '../styles/MaterialsList.css';

function MaterialsList({ userid }) {
  const [materials, setMaterials] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('userid', userid);
      if (error) {
        console.error('Supabase error:', error);
        return;
      }
      setMaterials(data || []);
    };
    fetchMaterials();
  }, [userid]);

  return (
    <div className="materials-list">
      <h2>المواد الدراسية</h2>
      <ul>
        {materials.map((material) => (
          <li key={material.id} className="material-item">
            <span>{material.subject}</span>
            <button
              onClick={() => setSelectedFile(material.fileurl)}
              className="preview-button"
            >
              معاينة
            </button>
          </li>
        ))}
      </ul>
      {selectedFile && <FilePreview fileurl={selectedFile} onClose={() => setSelectedFile(null)} />}
    </div>
  );
}

export default MaterialsList;