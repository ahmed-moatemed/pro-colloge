import { useState } from 'react';
import Fuse from 'fuse.js';
import { supabase } from '../supabase';
import '../styles/SearchBar.css';

function SearchBar({ setSearchResults, userid }) {
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    const { data: lectures } = await supabase
      .from('lectures')
      .select('*')
      .eq('userid', userid);
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('userid', userid);
    const { data: materials } = await supabase
      .from('materials')
      .select('*')
      .eq('userid', userid);

    const items = [...(lectures || []), ...(tasks || []), ...(materials || [])];
    const fuse = new Fuse(items, {
      keys: ['subject', 'title'],
      threshold: 0.3,
    });

    const results = fuse.search(query).map((result) => result.item);
    setSearchResults(results);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="ابحث في المهام أو المواد..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value) handleSearch();
          else setSearchResults([]);
        }}
      />
    </div>
  );
}

export default SearchBar;