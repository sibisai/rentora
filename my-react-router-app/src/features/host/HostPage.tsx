import React, { useEffect, useState } from 'react';
import HostCalendar from './components/HostCalendar';
import "./components/host.css";

const Host: React.FC = () => {
    const [properties, setProperties] = useState([]);
    const [property, setProperty] = useState({
        title: "",
        description: "",
        location: "",
        price: "",
        id: "",
    });

    const handleChange = (event: { target: { name: any; value: any; }; }) => {
        setProperty({ ...property, [event.target.name]: event.target.value});
    };

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        await fetch("/api/properties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(property)
        });
        alert("New Property Added Successfully!");
    };

    useEffect(() => {
        fetch("/api/properties/owned")
            .then(res => res.json())
            .then(data => setProperties(data));
    }, []);

    return (
        <div className="host">
            <h2 className="property-text">Add New Property</h2>
            <form onSubmit={handleSubmit} className="property-form">
                <input name="name" placeholder="Title" onChange={handleChange} className="input" />
                <input name="location" placeholder="Location" onChange={handleChange} className="input" />
                <input name="price" placeholder="Price per day" onChange={handleChange} className="input" />
                <textarea name="description" placeholder="Description" onChange={handleChange} className="input-text" />
                <button className="submission-btn">Add Property</button>
            </form>
            <h2 className="property-text">Your Properties</h2>
            <div key={property.title} className="test">
                <h2 className="property-title">{property.title}</h2>
                <p>{property.location} - ${property.price} per day</p>
                <HostCalendar propertyId={property.id} />
            </div>
        </div>
    );
};

export default Host;