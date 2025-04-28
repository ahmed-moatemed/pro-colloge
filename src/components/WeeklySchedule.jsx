import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash } from 'react-icons/fa';
import '../styles/WeeklySchedule.css';

function WeeklySchedule({ userid }) {
  const [lectures, setLectures] = useState([]);
  const [error, setError] = useState(null);
  const [editingLecture, setEditingLecture] = useState(null); // لتتبع المحاضرة المعدلة
  const [editForm, setEditForm] = useState({
    subject: '',
    day: '',
    time: '',
    location: '',
  });

  const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  useEffect(() => {
    // تحقق من وجود معرف المستخدم
    if (!userid) {
      setError('معرف المستخدم غير موجود. تحقق من تسجيل الدخول.');
      return;
    }

    // جلب المحاضرات
    const fetchLectures = async () => {
      try {
        const { data, error } = await supabase
          .from('lectures')
          .select('*')
          .eq('userid', userid);
        if (error) throw new Error(`Failed to fetch lectures: ${error.message}`);
        console.log('Fetched lectures:', data);
        setLectures(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching lectures:', err.message);
        setError('فشل تحميل المحاضرات. تحقق من الاتصال بالإنترنت.');
      }
    };

    fetchLectures();

    // الاشتراك في التغييرات (Realtime)
    const subscription = supabase
      .channel('lectures')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lectures', filter: `userid=eq.${userid}` },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchLectures();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [userid]);

  // بدء تعديل المحاضرة
  const startEditing = (lecture) => {
    setEditingLecture(lecture.id);
    setEditForm({
      subject: lecture.subject,
      day: lecture.day,
      time: lecture.time,
      location: lecture.location || '',
    });
  };

  // إرسال التعديل
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('lectures')
        .update({
          subject: editForm.subject,
          day: editForm.day,
          time: editForm.time,
          location: editForm.location,
        })
        .eq('id', editingLecture)
        .eq('userid', userid);
      if (error) throw new Error(`Failed to update lecture: ${error.message}`);
      toast.success('تم تعديل المحاضرة بنجاح!');
      setEditingLecture(null); // إغلاق النموذج
    } catch (err) {
      console.error('Error updating lecture:', err.message);
      toast.error('فشل تعديل المحاضرة. حاول مرة أخرى.');
    }
  };

  // حذف المحاضرة
  const deleteLecture = async (lectureId) => {
    try {
      const { error } = await supabase
        .from('lectures')
        .delete()
        .eq('id', lectureId)
        .eq('userid', userid);
      if (error) throw new Error(`Failed to delete lecture: ${error.message}`);
      toast.success('تم حذف المحاضرة بنجاح!');
    } catch (err) {
      console.error('Error deleting lecture:', err.message);
      toast.error('فشل حذف المحاضرة. حاول مرة أخرى.');
    }
  };

  return (
    <div className="weekly-schedule">
      <h2>الجدول الأسبوعي</h2>
      {error && <p className="error">{error}</p>}
      {lectures.length === 0 && !error && <p>لا توجد محاضرات مضافة.</p>}
      <div className="schedule-grid">
        {daysOfWeek.map((day) => (
          <div key={day} className="day">
            <h3>{day}</h3>
            {lectures
              .filter((lecture) => lecture.day === day)
              .map((lecture) => (
                <div key={lecture.id} className="lecture">
                  {editingLecture === lecture.id ? (
                    // نموذج التعديل
                    <form onSubmit={handleEditSubmit} className="edit-form">
                      <input
                        type="text"
                        placeholder="اسم المادة"
                        value={editForm.subject}
                        onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                        required
                      />
                      <select
                        value={editForm.day}
                        onChange={(e) => setEditForm({ ...editForm, day: e.target.value })}
                        required
                      >
                        <option value="" disabled>
                          اختر اليوم
                        </option>
                        {daysOfWeek.map((dayOption) => (
                          <option key={dayOption} value={dayOption}>
                            {dayOption}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={editForm.time}
                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder="المكان (اختياري)"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      />
                      <button type="submit">حفظ</button>
                      <button type="button" onClick={() => setEditingLecture(null)}>
                        إلغاء
                      </button>
                    </form>
                  ) : (
                    // عرض المحاضرة
                    <>
                      <p>{lecture.subject}</p>
                      <p>{lecture.time}</p>
                      <p>{lecture.location || 'غير محدد'}</p>
                      <div className="lecture-actions">
                        <button
                          onClick={() => startEditing(lecture)}
                          className="edit-button"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteLecture(lecture.id)}
                          className="delete-button"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeeklySchedule;