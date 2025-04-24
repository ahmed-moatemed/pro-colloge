import { useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';
import '../styles/LectureForm.css';

function LectureForm({ userid }) {
  const [subject, setSubject] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');

  // قائمة أيام الأسبوع
  const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const lecture = { subject, day, time, location, userid };

    try {
      // إضافة المحاضرة إلى Supabase
      const { error } = await supabase.from('lectures').insert([lecture]);
      if (error) throw new Error(`Failed to add lecture: ${error.message}`);

      // إعادة تعيين الحقول
      setSubject('');
      setDay('');
      setTime('');
      setLocation('');

      // إشعار النجاح
      toast.success('تم إضافة المحاضرة بنجاح!');
    } catch (error) {
      console.error('Error adding lecture:', error.message);
      toast.error('فشل إضافة المحاضرة. حاول مرة أخرى.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="lecture-form">
      <h2>إضافة محاضرة</h2>
      <input
        type="text"
        placeholder="اسم المادة"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />
      <select
        value={day}
        onChange={(e) => setDay(e.target.value)}
        required
      >
        <option value="" disabled>اختر اليوم</option>
        {daysOfWeek.map((dayOption) => (
          <option key={dayOption} value={dayOption}>
            {dayOption}
          </option>
        ))}
      </select>
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="المكان (اختياري)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button type="submit">إضافة</button>
    </form>
  );
}

export default LectureForm;