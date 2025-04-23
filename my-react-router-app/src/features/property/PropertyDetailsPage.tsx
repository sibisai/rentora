import React, { useState } from "react";
import "./PropertyDetailsPage.css";
import Header from "../../components/Header";
import propertyImg from "../../assets/images/property.jpg";

const images = [propertyImg, propertyImg, propertyImg, propertyImg, propertyImg];

export default function PropertyDetailsPage() {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSingleOpen, setIsSingleOpen] = useState(false);
  const [modalImg, setModalImg] = useState("");

  const openSingle = (img: string) => {
    setModalImg(img);
    setIsSingleOpen(true);
  };

  const openGallery = () => setIsGalleryOpen(true);
  const closeAll = () => {
    setIsSingleOpen(false);
    setIsGalleryOpen(false);
  };

  return (
    <>
      <section className="property-section">
        <div className="property-header-row">
          <h2 className="property-title">Abalone Cove – Oceanfront Getaway with Hot Tub</h2>
        </div>

        <div className="property-gallery-wrapper">
          <div className="main-photo" onClick={() => openSingle(images[0])}>
            <img src={images[0]} alt="Main" />
          </div>

          <div className="grid-photo-group">
            {images.slice(1, 4).map((img, i) => (
              <img key={i} src={img} alt={`Photo ${i + 1}`} onClick={() => openSingle(img)} />
            ))}
            <div className="photo-with-button">
              <img src={images[4]} alt="Photo 5" onClick={() => openSingle(images[4])} />
              <button className="show-all-btn" onClick={openGallery}>
                Show all photos
              </button>
            </div>
          </div>
        </div>

        {/* Single Image Modal */}
        {isSingleOpen && (
          <div className="modal-overlay" onClick={closeAll}>
            <img src={modalImg} alt="Full View" className="modal-img" />
          </div>
        )}

        {/* Full Gallery Modal */}
        {isGalleryOpen && (
          <div className="gallery-overlay">
            <div className="gallery-header">
              <button className="close-gallery" onClick={closeAll}>
                ×
              </button>
            </div>
            <div className="gallery-grid">
              {images.map((img, index) => (
                <img key={index} src={img} alt={`Gallery ${index}`} />
              ))}
            </div>
          </div>
        )}

        <div className="property-info">
          <h3>Entire home in Gualala, California</h3>
          <p>8 guests · 3 bedrooms · 4 beds · 2 baths</p>

          <strong>What this place offers:</strong>
          <ul>
            <li>🌊 Ocean view, Beach access, Waterfront</li>
            <li>📶 Wifi, HDTV with streaming services</li>
            <li>🛁 Private hot tub</li>
            <li>🔌 EV charger (level 2), Free parking</li>
            <li>✅ Self check-in, Superhost rating</li>
          </ul>

          <div className="price-box">
            $4,103 for 5 nights
            <br />
            <span className="price-dates">May 26, 2025 – May 31, 2025</span>
          </div>

          <button className="nav-button mt-4">Reserve</button>
        </div>
      </section>
    </>
  );
}
