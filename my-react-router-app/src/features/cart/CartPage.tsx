import React from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { Property } from '../property/types'
import './CartPage.css'

export default function CartPage() {
  //navigate to programmatically navigate
  const navigate = useNavigate()
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
          <Link to="/search">Browse properties</Link>
        </p>
      </section>
    )
  }
  const [paymentMethod, setPaymentMethod] = useState<'now' | 'split' | 'monthly'>('now')
  const property = stored
  const nights = 5
  const [insurance, setInsurance] = useState(false)
  const insuranceCost = 256.41
  const subtotal = property.price * nights
  const taxes = subtotal * 0.12
  const total = property.price * nights + (insurance ? insuranceCost : 0)

  const payNow =
    paymentMethod === 'now'
      ? total
      : paymentMethod === 'split'
        ? total * 0.5
        : total * 0.25

  const payLater =
    paymentMethod === 'split' ? total * 0.5 : paymentMethod === 'monthly' ? total * 0.75 : 0

  const handleConfirm = () => {
    localStorage.removeItem('cart')
    navigate('/confirm')
  }
  return (
    <section className="cart-section">
      <h2 className="cart-title">Confirm and Pay</h2>
      <div className="cart-content">
        {/* LEFT: Payment options */}
        <div className="cart-left">
          <div className="cart-box">
            <h3>Choose when to pay</h3>
            <label>
              <input
                type="radio"
                name="payment"
                value="now"
                checked={paymentMethod === 'now'}
                onChange={() => setPaymentMethod('now')}
              />Pay now</label>
            <label>
              <input
                type="radio"
                name="payment"
                value="split"
                checked={paymentMethod === 'split'}
                onChange={() => setPaymentMethod('split')}
              />Pay part now, part later</label>
            <label>
              <input
                type="radio"
                name="payment"
                value="monthly"
                checked={paymentMethod === 'monthly'}
                onChange={() => setPaymentMethod('monthly')}
              />Pay monthly with Klarna</label>
          </div>

          <div className="cart-box">
            <h3>Payment method</h3>
            <p>💳 Visa ending in 5283</p>
          </div>

          <div className="cart-box">
            <h3>Add travel insurance?</h3>
            <input
              type="checkbox"
              checked={insurance}
              onChange={() => setInsurance(!insurance)}
            />  Yes, add for $256.41
            <ul>
              <li>✓ Illness or injury</li>
              <li>✓ Weather disruptions</li>
              <li>✓ Trip delays</li>
            </ul>
          </div>

          <button className="nav-button mt-4" onClick={handleConfirm}>
            Confirm and Pay
          </button>
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
              {/* <p>${property.price.toLocaleString()} × {nights} nights</p> */}
              {insurance && <p>Travel Insurance: ${insuranceCost.toFixed(2)}</p>}
              <p className="summary-total">
                Total: ${total.toLocaleString()}
              </p>
              <p>
                <strong>Pay now:</strong> ${payNow.toFixed(2)}
              </p>
              {payLater > 0 && (
                <p>
                  <strong>Remaining later:</strong> ${payLater.toFixed(2)}
                </p>
              )}
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