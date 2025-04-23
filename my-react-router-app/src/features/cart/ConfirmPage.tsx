import React from 'react';
import { Link } from 'react-router-dom';
import './ConfirmPage.css';

const ConfirmPage: React.FC = () => {
  return (
    <section className="confirm-section">
      <div className="confirm-box">
        <h2 className="confirm-title">🎉 Booking Confirmed!</h2>
        <p className="confirm-message">
          Thank you for your reservation. We've sent a confirmation email with your booking details.
        </p>
        <Link to="/" className="nav-button">Return to Home</Link>
      </div>
    </section>
  )
}

export default ConfirmPage;