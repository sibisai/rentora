import React from "react";
import "./CartPage.css";
import propertyImg from "../../assets/images/property.jpg";

export default function CartPage() {
  return (
    <section className="cart-section">
      <h2 className="cart-title">Confirm and Pay</h2>

      <div className="cart-content">
        {/* LEFT: Payment options */}
        <div className="cart-left">
          <div className="cart-box">
            <h3>Choose when to pay</h3>
            <label><input type="radio" name="payment" defaultChecked /> Pay $4,102.53 now</label>
            <label><input type="radio" name="payment" /> Pay part now, part later</label>
            <label><input type="radio" name="payment" /> Pay monthly with Klarna</label>
          </div>

          <div className="cart-box">
            <h3>Payment method</h3>
            <p>💳 Visa ending in 5283</p>
          </div>

          <div className="cart-box">
            <h3>Add travel insurance?</h3>
            <label>
              <input type="checkbox" /> Yes, add for $256.41
            </label>
            <ul>
              <li>✓ Illness or injury</li>
              <li>✓ Weather disruptions</li>
              <li>✓ Trip delays</li>
            </ul>
          </div>

          <button className="nav-button mt-4">Confirm and Pay</button>
        </div>

        {/* RIGHT: Property summary */}
        <div className="cart-right">
          <div className="cart-summary">
            <img src={propertyImg} alt="Property" />
            <div>
              <h4>Abalone Cove – Oceanfront Getaway</h4>
              <p>May 26 – 31, 2025 · 1 adult</p>
              <p>$820.51 × 5 nights</p>
              <p className="summary-total">Total: $4,102.53</p>
            </div>
          </div>
          <p className="cart-note">💎 This is a rare find. Usually booked.</p>
        </div>
      </div>
    </section>
  );
}
