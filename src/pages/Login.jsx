import { useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';
import '../styles/Login.css';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // تسجيل الدخول
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(`فشل تسجيل الدخول: ${error.message}`);
      setUser(data.user);
      toast.success('تم تسجيل الدخول بنجاح!');
    } catch (error) {
      console.error('Login error:', error.message);
      toast.error('فشل تسجيل الدخول. تحقق من البريد وكلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  // التسجيل
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // التحقق من تطابق كلمتي المرور
      if (password !== confirmPassword) {
        throw new Error('كلمتا المرور غير متطابقتين.');
      }

      // إنشاء حساب المستخدم
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw new Error(`فشل التسجيل: ${error.message}`);

      // حفظ الاسم في جدول profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, name }]);
      if (profileError) throw new Error(`فشل حفظ بيانات المستخدم: ${profileError.message}`);

      setUser(data.user);
      toast.success('تم إنشاء الحساب بنجاح!');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
    } catch (error) {
      console.error('Sign-up error:', error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // إعادة تعيين كلمة المرور
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw new Error(`فشل إعادة تعيين كلمة المرور: ${error.message}`);
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني!');
      setEmail('');
      setIsResetPassword(false);
    } catch (error) {
      console.error('Reset password error:', error.message);
      toast.error('فشل إعادة تعيين كلمة المرور. تحقق من البريد الإلكتروني.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>{isResetPassword ? 'إعادة تعيين كلمة المرور' : isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}</h2>
      <form onSubmit={isResetPassword ? handleResetPassword : isSignUp ? handleSignUp : handleLogin}>
        {isSignUp && (
          <input
            type="text"
            placeholder="الاسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {!isResetPassword && (
          <>
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {isSignUp && (
              <input
                type="password"
                placeholder="تأكيد كلمة المرور"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}
          </>
        )}
        <button type="submit" disabled={loading}>
          {loading
            ? 'جارٍ التحميل...'
            : isResetPassword
            ? 'إرسال رابط إعادة التعيين'
            : isSignUp
            ? 'إنشاء حساب'
            : 'تسجيل الدخول'}
        </button>
      </form>
      <div className="login-links">
        {!isResetPassword && (
          <p>
            {isSignUp ? 'لديك حساب؟ ' : 'ليس لديك حساب؟ '}
            <span
              className="link"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setName('');
              }}
            >
              {isSignUp ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </span>
          </p>
        )}
        <p>
          <span
            className="link"
            onClick={() => {
              setIsResetPassword(!isResetPassword);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setName('');
            }}
          >
            {isResetPassword ? 'العودة إلى تسجيل الدخول' : 'نسيت كلمة المرور؟'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;