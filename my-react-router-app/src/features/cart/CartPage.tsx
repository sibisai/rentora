import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import type { Property } from '../property/types'
import './CartPage.css'

export default function CartPage() {
  const { state } = useLocation()
  // try routing state first
  const passed = (state as any)?.property as Property | undefined
  // then fallback to localStorage
  const stored = passed
    ?? JSON.parse(localStorage.getItem('cart') || 'null') as Property | null

  if (!stored) {
    return (
      <section className="cart-section">
        <h2 className="cart-title">Your Cart Is Empty</h2>
        <p className="empty-note">
          You haven’t reserved anything yet.{' '}
          <Link to="/">Browse properties</Link>
        </p>
      </section>
    )
  }

  const property = stored
  const nights = 5
  const total   = property.price * nights

  return (
    <section className="cart-section">
      <h2 className="cart-title">Confirm and Pay</h2>

      <div className="cart-content">
        {/* LEFT: Payment options */}
        <div className="cart-left">
        <div className="cart-box">
          <h3>Choose when to pay</h3>
          <label><input type="radio" name="payment" defaultChecked /> Pay ${(property.price * 5).toLocaleString()} now</label>
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
            <img
              src={property.images?.[0] || '/fallback.jpg'}
              alt={property.title}
            />
            <div>
              <h4>{property.title}</h4>
              <p>
                {property.location.city}, {property.location.state}
              </p>
              <p>${property.price.toLocaleString()} × {nights} nights</p>
              <p className="summary-total">
                Total: ${total.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="cart-note">
            💎 This is a rare find. Usually booked.
          </p>
        </div>
      </div>
    </section>
  )
}