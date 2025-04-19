import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import propertyImage from '../../assets/images/property.jpg';

import './ContactPage.css';

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message sent!');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <>
      <header>
        <div className="top-banner">
          <h1 className="title">[placeholder]</h1>
          <nav>
            <ul>
              <li><Link to="/history" className="nav-link">History</Link></li>
              <li><Link to="/contact" className="nav-link">Contact</Link></li>
              <li><Link to="/services" className="nav-link">Services</Link></li>
              <li><Link to="/#browse" className="nav-link">Browse</Link></li>
              <li><Link to="/login" className="login-button">Login</Link></li>
            </ul>
          </nav>
        </div>
      </header>
      <div
        className="contact-hero"
        style={{
          backgroundImage: `url(${propertyImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '4rem 1rem',
        }}
      >
        <div className="contact-container">
          <Link to="/" className="subtle-home-link">← Home</Link>
          <h1 className="contact-title">Contact Us</h1>
          <div className="contact-content">
            <form className="contact-form" onSubmit={handleSubmit}>
              <label htmlFor="name">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required />

              <label htmlFor="email">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />

              <label htmlFor="message">Message</label>
              <textarea name="message" rows={5} value={form.message} onChange={handleChange} required />

              <button type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
