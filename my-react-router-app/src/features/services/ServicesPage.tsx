import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import propertyImage from "../../assets/images/familyvacation.webp";
import Header from '../../components/Header';

import "./ServicesPage.css";

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState([
    {
      title: "Property Listings",
      description: "Browse and book unique properties around the world.",
      icon: "🏠",
    },
    {
      title: "Secure Payments",
      description: "Fast and secure payment processing with buyer protection.",
      icon: "💳",
    },
    {
      title: "Host Your Space",
      description: "Earn money by listing your space on our platform.",
      icon: "🛏️",
    },
    {
      title: "24/7 Support",
      description: "Our support team is here to help you anytime, anywhere.",
      icon: "📞",
    },
    {
      title: "Travel Insurance",
      description: "Protect your trip with our comprehensive insurance plans.",
      icon: "🛡️",
    },
    {
        title: "Local Experiences",
        description: "Discover unique experiences hosted by locals.",
        icon: "🌍"
        },
  ]);

  return (
    <>
      <div
        className="services-hero"
        style={{
          backgroundImage: `url(${propertyImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          padding: "5rem 1rem",
        }}
      >
        {/* service desc */}
        <div className="services-container">
        <Link to="/" className="subtle-home-link">← Home</Link>
          <h2 className="services-title">What We Offer</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div className="service-card" key={index}>
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicesPage;
