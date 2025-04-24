import { useState } from 'react';
import { supabase } from '../supabase';
import '../styles/LoginForm.css';

function LoginForm({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('تم إرسال رابط تأكيد إلى بريدك الإلكتروني!');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUser(data.user);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-form">
      <h2>{isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">{isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}</button>
      </form>
      <button onClick={() => setIsSignUp(!isSignUp)} className="toggle-link">
        {isSignUp ? 'لديك حساب؟ تسجيل الدخول' : 'لا تملك حساب؟ إنشاء حساب'}
      </button>
    </div>
  );
}

export default LoginForm;