import React, { useState } from 'react';
import './components/login.css';
import loginBg from '../../assets/images/loginbg.jpg';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

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
        <form>
          <div className="input-group">
            <input type="email" placeholder="Email" />
          </div>

          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={isLogin ? 'Password' : 'Enter a Password'}
            />
          </div>

          {!isLogin && (
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Reconfirm Your Password"
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
}
