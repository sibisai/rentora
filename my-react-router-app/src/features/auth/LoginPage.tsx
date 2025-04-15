// src/pages/Login.tsx
import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import loginBg from '../../assets/images/loginbg.jpg';
import './components/login.css';
import { login, signup } from '../../services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      // Choose the appropriate endpoint based on the mode
      const authData = isLogin
        ? await login(email, password)
        : await signup(email, password);
      
      // Store token in local storage
      localStorage.setItem('authToken', authData.token);
      // Optionally, you can also store user info in context or state management
      // Navigate to home or the protected route after successful login
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    }
  };

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
        <h2>{isLogin ? 'Login' : 'Sign up'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={isLogin ? 'Password' : 'Enter a Password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Optionally add a reconfirm password field in signup mode */}
          {!isLogin && (
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Reconfirm Your Password"
                required
              />
            </div>
          )}

          <div style={{ alignSelf: 'flex-start', marginTop: '8px', marginBottom: '12px' }}>
            <label style={{ fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                style={{ marginRight: '6px' }}
              />
              Show password
            </label>
          </div>

          {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

          <button type="submit" className="login-btn">
            {isLogin ? 'Log in' : 'Sign up'}
          </button>

          <p className="signup-link" onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer' }}>
            {isLogin ? 'Sign up' : 'Already have an account? Log in'}
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;