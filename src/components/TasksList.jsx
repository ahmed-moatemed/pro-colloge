import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';
import { FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import '../styles/TasksList.css';

function TasksList({ userid }) {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null); // لتتبع المهمة المعدلة
  const [editForm, setEditForm] = useState({
    title: '',
    subject: '',
    duedate: '',
    priority: 'منخفضة',
  });

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
        console.log('Fetched tasks:', data);
        // فرز المهام: غير المكتملة أولاً، ثم المكتملة
        const sortedTasks = data.sort((a, b) => a.completed - b.completed);
        setTasks(sortedTasks || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err.message);
        setError('فشل تحميل المهام. تحقق من الاتصال بالإنترنت.');
      }
    };

    fetchTasks();

    // اشتراك Realtime
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
      const updates = {
        completed: !currentStatus,
        // completed_at: !currentStatus ? new Date().toISOString() : null, // تحديث تاريخ الإكمال
      };
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .eq('userid', userid);
      if (error) throw new Error(`Failed to update task: ${error.message}`);
      toast.success(`تم تحديث المهمة بنجاح!`);
    } catch (err) {
      console.error('Error updating task:', err.message);
      toast.error('فشل تحديث المهمة. حاول مرة أخرى.');
    }
  };

  // حذف المهمة
  const deleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('userid', userid);
      if (error) throw new Error(`Failed to delete task: ${error.message}`);
      toast.success('تم حذف المهمة بنجاح!');
    } catch (err) {
      console.error('Error deleting task:', err.message);
      toast.error('فشل حذف المهمة. حاول مرة أخرى.');
    }
  };

  // بدء تعديل المهمة
  const startEditing = (task) => {
    setEditingTask(task.id);
    setEditForm({
      title: task.title,
      subject: task.subject,
      duedate: task.duedate,
      priority: task.priority,
    });
  };

  // إرسال التعديل
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: editForm.title,
          subject: editForm.subject,
          duedate: editForm.duedate,
          priority: editForm.priority,
        })
        .eq('id', editingTask)
        .eq('userid', userid);
      if (error) throw new Error(`Failed to update task: ${error.message}`);
      toast.success('تم تعديل المهمة بنجاح!');
      setEditingTask(null); // إغلاق النموذج
    } catch (err) {
      console.error('Error updating task:', err.message);
      toast.error('فشل تعديل المهمة. حاول مرة أخرى.');
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
            {editingTask === task.id ? (
              // نموذج التعديل
              <form onSubmit={handleEditSubmit} className="edit-form">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
                <input
                  type="text"
                  value={editForm.subject}
                  onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                  required
                />
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, duedate: e.target.value })}
                  required
                />
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                >
                  <option value="منخفضة">منخفضة</option>
                  <option value="متوسطة">متوسطة</option>
                  <option value="عالية">عالية</option>
                </select>
                <button type="submit">حفظ</button>
                <button type="button" onClick={() => setEditingTask(null)}>
                  إلغاء
                </button>
              </form>
            ) : (
              // عرض المهمة
              <>
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
                  <button
                    onClick={() => startEditing(task)}
                    className="edit-button"
                    disabled={task.completed} // لا يمكن تعديل المهام المكتملة
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="delete-button"
                  >
                    <FaTrash />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TasksList;