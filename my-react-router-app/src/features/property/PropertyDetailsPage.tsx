import React from "react";
import "./PropertyDetailsPage.css";
import propertyImg from "../../assets/images/property.jpg";

export default function PropertyDetailsPage() {
  return (
    <section className="property-section">
      <h2>Abalone Cove – Oceanfront Getaway with Hot Tub</h2>

      <div className="property-grid property-gallery">
        <img src={propertyImg} alt="Exterior" />
        <img src={propertyImg} alt="Ocean View" />
        <img src={propertyImg} alt="Deck" />
        <img src={propertyImg} alt="Hot Tub" />
        <img src={propertyImg} alt="Cliff" />
      </div>

      <div className="property-info">
        <h3>Entire home in Gualala, California</h3>
        <p>8 guests · 3 bedrooms · 4 beds · 2 baths</p>

        <p><strong>What this place offers:</strong></p>
        <ul>
          <li>🌊 Ocean view, Beach access, Waterfront</li>
          <li>📶 Wifi, HDTV with streaming services</li>
          <li>🛁 Private hot tub</li>
          <li>🔌 EV charger (level 2), Free parking</li>
          <li>🛏 Self check-in, Superhost rating</li>
        </ul>

        <div className="price-box">
          $4,103 for 5 nights
          <br />
          <span className="price-dates">May 26, 2025 → May 31, 2025</span>
        </div>

        <button className="nav-button mt-4">Reserve</button>
      </div>
    </section>
  );
}
