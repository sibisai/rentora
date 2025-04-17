import React, { useState, type FormEvent } from 'react';
import { useNavigate }   from 'react-router-dom';
import { useAuth }       from './AuthContext';
import { login, signup } from '../../services/authService';
import loginBg           from '../../assets/images/loginbg.jpg';
import './components/login.css';

/* ---------- component ---------- */

export default function LoginPage() {
  /* KEEP ALL HOOKS AT THE TOP LEVEL */
  const auth     = useAuth();
  const navigate = useNavigate();

  const [isLogin,   setIsLogin]   = useState(true);
  const [showPwd,   setShowPwd]   = useState(false);
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  /* ---------- submit ---------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!isLogin && password !== confirm) {
      setError('Passwords do not match'); return;
    }

    try {
      const { token, userId, email: savedEmail } = isLogin
        ? await login(email, password)
        : await signup(email, password);

      /* Save in context (AND localStorage inside AuthContext) */
      auth.login(token, { id: userId, email: savedEmail });

      setSuccess('Success! Redirecting…');
      navigate('/host/properties', { replace: true });
    } catch (err: any) {
      setError(err.message ?? 'Authentication failed');
    }
  };

  /* ---------- JSX ---------- */
  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="login-container">
        <h2>{isLogin ? 'Login' : 'Sign up'}</h2>

        <form onSubmit={handleSubmit}>
          {/* email */}
          <div className="input-group">
            <input
              type="email" required
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* password */}
          <div className="input-group">
            <input
              type={showPwd ? 'text' : 'password'} required
              placeholder={isLogin ? 'Password' : 'Enter a password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {/* confirm pwd (signup only) */}
          {!isLogin && (
            <div className="input-group">
              <input
                type={showPwd ? 'text' : 'password'} required
                placeholder="Re‑enter password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
            </div>
          )}

          {/* show/hide toggle */}
          <label style={{ fontSize: 14 }}>
            <input
              type="checkbox"
              checked={showPwd}
              onChange={() => setShowPwd(p => !p)}
              style={{ marginRight: 6 }}
            />
            Show password
          </label>

          {/* messages */}
          {error   && <p style={{ color: 'red'   }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}

          <button type="submit" className="login-btn">
            {isLogin ? 'Log in' : 'Sign up'}
          </button>

          <p
            className="signup-link"
            style={{ cursor: 'pointer' }}
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
          >
            {isLogin ? 'Create an account' : 'Already registered? Log in'}
          </p>
        </form>
      </div>
    </div>
  );
}