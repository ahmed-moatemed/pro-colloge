import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import Login from './pages/Login';
import LectureForm from './components/LectureForm';
import TaskForm from './components/TaskForm';
import MaterialUpload from './components/MaterialUpload';
import SearchBar from './components/SearchBar';
import WeeklySchedule from './components/WeeklySchedule';
import MaterialsList from './components/MaterialsList';
import './App.css';
import TasksList from './components/TasksList';

function App() {
  const [user, setUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_IN') {
        toast.success('تم تسجيل الدخول بنجاح!');
      } else if (event === 'PASSWORD_RECOVERY') {
        toast.info('يرجى إدخال كلمة مرور جديدة.');
      }
    });

    const handleAuthRedirect = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error handling auth redirect:', error.message);
        return;
      }
      if (data.session) {
        setUser(data.session.user);
        if (window.location.hash.includes('type=recovery')) {
          toast.info('يرجى إدخال كلمة مرور جديدة.');
        }
      }
    };
    handleAuthRedirect();

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('تم تسجيل الخروج بنجاح!');
  };

  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">منظّم دراسي ذكي</h1>
        <button onClick={handleLogout} className="logout-button">
          تسجيل الخروج
        </button>
      </div>

      <SearchBar setSearchResults={setSearchResults} userid={user.id} />

      <div className="grid-container">
        <LectureForm userid={user.id} />
        <TaskForm userid={user.id} />
        <MaterialUpload userid={user.id} />
      </div>

      <WeeklySchedule userid={user.id} />
      <TasksList userid={user.id} />

      <MaterialsList userid={user.id} />

      {searchResults.length > 0 && (
        <div className="search-results">
          <h2>نتائج البحث</h2>
          <ul>
            {searchResults.map((item) => (
              <li key={item.id}>{item.title || item.subject}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;