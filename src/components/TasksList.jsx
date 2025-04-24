import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';
import { FaCheck } from 'react-icons/fa';
import '../styles/TasksList.css';

function TasksList({ userid }) {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // جلب المهام
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('userid', userid)
          .order('duedate', { ascending: true });
        if (error) throw new Error(`Failed to fetch tasks: ${error.message}`);
        console.log('Fetched tasks:', data); // للتصحيح
        const sortedTasks = data.sort((a, b) => a.completed - b.completed);
        setTasks(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err.message);
        setError('فشل تحميل المهام. تحقق من الاتصال بالإنترنت.');
      }
    };

    fetchTasks();

    // اشتراك Realtime لتحديث المهام
    const subscription = supabase
      .channel('tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `userid=eq.${userid}` },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchTasks();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [userid]);

  // تحديث حالة الإكمال
  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !currentStatus })
        .eq('id', taskId)
        .eq('userid', userid);
      if (error) throw new Error(`Failed to update task: ${error.message}`);
      toast.success(`تم تحديث المهمة بنجاح!`);
    } catch (err) {
      console.error('Error updating task:', err.message);
      toast.error('فشل تحديث المهمة. حاول مرة أخرى.');
    }
  };

  return (
    <div className="tasks-list">
      <h2>قائمة المهام</h2>
      {error && <p className="error">{error}</p>}
      {tasks.length === 0 && !error && <p>لا توجد مهام مضافة.</p>}
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            <div className="task-details">
              <span>{task.title}</span>
              <span>{task.subject}</span>
              <span>الموعد: {task.duedate}</span>
              <span>الأولوية: {task.priority}</span>
            </div>
            <div className="task-actions">
              {task.completed && <FaCheck className="check-icon" />}
              <button
                onClick={() => toggleTaskCompletion(task.id, task.completed)}
                className="complete-button"
                disabled={task.completed} 
              >
               {task.completed ? 'تمت' : 'إكمال'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TasksList;