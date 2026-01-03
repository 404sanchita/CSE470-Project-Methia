import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import LikeDislike from "../../components/LikeDislike";
import CommentSection from "../../components/CommentSection";

import "./Destination.css";

export default function Destination() {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [restaurantObjects, setRestaurantObjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/destinations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setDestination(data);
        // Fetch restaurants for this destination
        if (data.restaurants && data.restaurants.length > 0) {
          return fetch(`http://localhost:5000/api/restaurants/${id}`)
            .then((res) => res.json())
            .then((restaurants) => setRestaurantObjects(restaurants || []))
            .catch((err) => {
              console.error("Failed to load restaurants:", err);
              setRestaurantObjects([]);
            });
        }
      })
      .catch((err) => console.error("Failed to load destination:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="page-loading">Loading destination...</p>;
  if (!destination) return <p className="page-error">Destination not found</p>;

  return (
    <>
      
      {/* ---------- PAGE CONTENT ---------- */}
      <div className="page-content">
        <Link to="/" className="back-link">← Back</Link>

        <h1 className="title">{destination.name}</h1>

        <p><strong>Country:</strong> {destination.country}</p>
        <p><strong>Best Season:</strong> {destination.bestSeason}</p>
        <p><strong>Budget:</strong> {destination.estimatedBudget}</p>

        <p className="description">{destination.description}</p>

        {/* ---------- LIKE / DISLIKE ---------- */}
        <LikeDislike
          resourceType="destination"
          resourceId={id}
          initialLikes={destination.likesCount}
          initialDislikes={destination.dislikesCount}
          initialReaction={destination.userReaction}
        />

        {/* ---------- TOP ATTRACTIONS WITH IMAGES ---------- */}
        {destination.topAttractions?.length > 0 && (
          <div className="section">
            <h2>🏛️ Top Attractions</h2>
            {destination.image?.length > 0 && (
              <div className="gallery" style={{ marginBottom: "1rem" }}>
                {destination.image.map((img, idx) => (
                  <img key={idx} src={img} alt={`Gallery ${idx}`} />
                ))}
              </div>
            )}
            <ul className="list">
              {destination.topAttractions.map((att, i) => (
                <li key={i}>{att}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ---------- IMAGE GALLERY (if no top attractions) ---------- */}
        {(!destination.topAttractions || destination.topAttractions.length === 0) && destination.image?.length > 0 && (
          <div className="section">
            <h2>📸 Gallery</h2>
            <div className="gallery">
              {destination.image.map((img, idx) => (
                <img key={idx} src={img} alt={`Gallery ${idx}`} />
              ))}
            </div>
          </div>
        )}

        {/* ---------- RESTAURANTS ---------- */}
        {destination.restaurants?.length > 0 && (
          <div className="section">
            <h2>🍽️ Popular Restaurants</h2>
            <ul className="list">
              {destination.restaurants.map((restName, i) => {
                // Try to find matching restaurant object
                const restaurant = restaurantObjects.find(
                  (r) => r.name && r.name.toLowerCase() === restName.toLowerCase()
                );
                
                // Link style for all restaurants
                const linkStyle = {
                  color: "#007bff",
                  textDecoration: "none",
                  fontWeight: "500",
                  cursor: "pointer"
                };
                
                // If restaurant has a website, link to it
                if (restaurant?.contactInfo?.website) {
                  // Ensure URL has protocol
                  let websiteUrl = restaurant.contactInfo.website.trim();
                  if (websiteUrl && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
                    websiteUrl = 'https://' + websiteUrl;
                  }
                  
                  return (
                    <li key={i}>
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={linkStyle}
                        onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                        onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                      >
                        {restName}
                      </a>
                    </li>
                  );
                }
                
                // Otherwise, link to restaurant search page
                return (
                  <li key={i}>
                    <Link
                      to="/restaurant"
                      style={linkStyle}
                      onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                    >
                      {restName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ---------- TRANSPORT ---------- */}
        {destination.transportOptions?.length > 0 && (
          <div className="section">
            <h2>🚗 Transport Options</h2>
            <ul className="list">
              {destination.transportOptions.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ---------- ETIQUETTE ---------- */}
        {destination.etiquetteTips?.length > 0 && (
          <div className="section">
            <h2>🤝 Etiquette Tips</h2>
            <ul className="list">
              {destination.etiquetteTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ---------- PACKING CHECKLIST ---------- */}
        {destination.packingChecklist?.length > 0 && (
          <div className="section">
            <h2>🎒 Packing Checklist</h2>
            <ul className="list">
              {destination.packingChecklist.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ---------- COMMENTS ---------- */}
        <CommentSection resourceType="destination" resourceId={id} />
      </div>
    </>
  );
}
