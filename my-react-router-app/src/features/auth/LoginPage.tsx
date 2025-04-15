import React from 'react';
import '../../styles/index.css';
import loginBg from '../../assets/images/loginbg.jpg';

export default function Login() {
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
        <h2>Login</h2>
        <form>
          <div className="input-group">
            <input type="text" placeholder="Email" />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Password" />
          </div>
          <button type="submit" className="login-btn">Log in</button>
          <p className="signup-link">Sign up</p>
        </form>
      </div>
    </div>
  );
}
