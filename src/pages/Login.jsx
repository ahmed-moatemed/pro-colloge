import LoginForm from '../components/LoginForm';
import '../styles/Login.css';

function Login({ setUser }) {
  return (
    <div className="login-page">
      <LoginForm setUser={setUser} />
    </div>
  );
}

export default Login;