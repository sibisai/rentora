import React from "react";
import { Link } from 'react-router-dom';
import '../../styles/index.css';

export default function Host() {
    return (
        <div>
            <main>
                <div className="hero">
                    <div className="hero-overlay">
                        <h2>Your Pefect Stay</h2>
                        <div className="button-links">
                            <Link to="/account" className="nav-button">Account</Link>
                            <Link to="/cart" className="nav-button">Cart</Link>
                            <Link to="/property-details" className="nav-button">Property Details</Link>
                            <Link to="/search" className="nav-button">Search</Link>
                            <Link to="/" className="nav-button">Guest</Link>
                        </div>
                    </div>
                </div>
                <div>
                    <h2>Add Listing</h2>
                    <Link to="/listing-add" className="nav-button">Add Listing</Link>
                </div>
                <div className="host-container">
                    <h2>Host Page</h2>
                </div>
            </main>
        </div>
    );
}