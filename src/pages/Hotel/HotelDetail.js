import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import LikeDislike from "../../components/LikeDislike";
import CommentSection from "../../components/CommentSection";
import "./Hotel.css";

const HotelDetail = () => {
  const { id } = useParams(); // hotelId
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/hotels/${id}`);
        setHotel(res.data);
      } catch (err) {
        console.error("Error fetching hotel:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  if (loading) {
    return (
      <div className="hotel-detail-container">
        <p>Loading hotel details...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="hotel-detail-container">
        <p>Hotel not found.</p>
        <button className="btn-primary" onClick={() => navigate("/hotels")}>
          Back to Hotels
        </button>
      </div>
    );
  }

  return (
    <div className="hotel-detail-container">
      <div className="hotel-detail-card">
        <div className="hotel-detail-header">
          <div>
            <h1 className="hotel-detail-title">{hotel.name}</h1>
            <p className="hotel-detail-location">📍 {hotel.location}</p>
          </div>
        </div>

        <div className="hotel-detail-meta">
          <div className="hotel-detail-meta-item">
            <span className="hotel-detail-meta-label">Price per Night</span>
            <span className="hotel-detail-meta-value">${hotel.price || hotel.pricePerNight}</span>
          </div>
          {hotel.rating && (
            <div className="hotel-detail-meta-item">
              <span className="hotel-detail-meta-label">Rating</span>
              <span className="hotel-detail-meta-value">⭐ {hotel.rating} stars</span>
            </div>
          )}
        </div>

        {hotel.description && (
          <div>
            <h3 className="section-title">About this Hotel</h3>
            <p className="hotel-detail-description">{hotel.description}</p>
          </div>
        )}

        {/* Like/Dislike Section */}
        <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
          <LikeDislike
            resourceType="hotel"
            resourceId={hotel._id}
            initialLikes={hotel.likesCount || 0}
            initialDislikes={hotel.dislikesCount || 0}
            initialReaction={hotel.userReaction || null}
          />
        </div>

        {/* Comments Section */}
        <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
          <h3 className="section-title">Comments</h3>
          <CommentSection resourceType="hotel" resourceId={hotel._id} />
        </div>

        <div className="hotel-detail-action">
          <button className="btn-primary" onClick={() => navigate(`/hotels/${hotel._id}/book`)}>
            Book Hotel
          </button>
          <button className="btn-secondary" onClick={() => navigate("/hotels")}>
            Back to Hotels
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
