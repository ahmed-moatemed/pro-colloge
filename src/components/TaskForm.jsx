import { useState } from 'react';
import { supabase } from '../supabase';
import '../styles/TaskForm.css';

function TaskForm({ userid }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [duedate, setDuedate] = useState('');
  const [priority, setPriority] = useState('منخفضة');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const task = { title, subject, duedate, priority, userid };

    const { error: supabaseError } = await supabase.from('tasks').insert([task]);
    if (supabaseError) console.error('Supabase error:', supabaseError);

    if (Notification.permission === 'granted') {
      new Notification(`تذكير: ${title} مستحق في ${duedate}`);
    } else {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') new Notification(`تذكير: ${title} مستحق في ${duedate}`);
      });
    }

    setTitle('');
    setSubject('');
    setDuedate('');
    setPriority('منخفضة');
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h2>إضافة مهمة</h2>
      <input
        type="text"
        placeholder="اسم المهمة"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="المادة"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />
      <input
        type="date"
        value={duedate}
        onChange={(e) => setDuedate(e.target.value)}
        required
      />
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="منخفضة">منخفضة</option>
        <option value="متوسطة">متوسطة</option>
        <option value="عالية">عالية</option>
      </select>
      <button type="submit">إضافة</button>
    </form>
  );
}

export default TaskForm;