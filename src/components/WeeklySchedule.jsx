import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import '../styles/WeeklySchedule.css';

function WeeklySchedule({ userid }) {
  const [lectures, setLectures] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // تحقق من وجود معرف المستخدم
    if (!userid) {
      setError('فشل تحميل المحاضرات. تحقق من الاتصال بالإنترنت.');
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
          fetchLectures();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [userid]);

  return (
    <div className="weekly-schedule">
      <h2>الجدول الأسبوعي</h2>
      {error && <p className="error">{error}</p>}
      <div className="schedule-grid">
        {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day) => (
          <div key={day} className="day">
            <h3>{day}</h3>
            {lectures
              .filter((lecture) => lecture.day === day)
              .map((lecture) => (
                <div key={lecture.id} className="lecture">
                  <p>{lecture.subject}</p>
                  <p>{lecture.time}</p>
                  <p>{lecture.location || 'غير محدد'}</p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeeklySchedule;