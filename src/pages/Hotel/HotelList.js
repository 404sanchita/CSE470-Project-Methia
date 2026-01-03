import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Hotel.css";

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    rating: "",
    location: "",
    amenities: [],
  });
  const [allAmenities, setAllAmenities] = useState([]);
  const navigate = useNavigate();

  // Fetch all hotels and extract available amenities
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/hotels");
        setHotels(res.data);
        
        // Extract unique amenities from all hotels
        const amenitiesSet = new Set();
        res.data.forEach((hotel) => {
          if (hotel.amenities && Array.isArray(hotel.amenities)) {
            hotel.amenities.forEach((amenity) => amenitiesSet.add(amenity));
          }
        });
        setAllAmenities(Array.from(amenitiesSet).sort());
      } catch (err) {
        console.error("Error fetching hotels:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  // Apply filters
  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.rating) params.append("rating", filters.rating);
      if (filters.location) params.append("location", filters.location);
      if (filters.amenities.length > 0) {
        params.append("amenities", filters.amenities.join(","));
      }

      const res = await axios.get(`http://localhost:5000/api/hotels?${params}`);
      setHotels(res.data);
    } catch (err) {
      console.error("Error applying filters:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = async () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      rating: "",
      location: "",
      amenities: [],
    });
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/hotels");
      setHotels(res.data);
    } catch (err) {
      console.error("Error fetching hotels:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFilters((prev) => ({
        ...prev,
        amenities: checked
          ? [...prev.amenities, value]
          : prev.amenities.filter((a) => a !== value),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (loading && hotels.length === 0) {
    return (
      <div className="hotel-list-container">
        <h1 className="page-title">Available Hotels</h1>
        <p>Loading hotels...</p>
      </div>
    );
  }

  return (
    <div className="hotel-list-container">
      <h1 className="page-title">Available Hotels</h1>
      
      {/* Filters Section */}
      <div className="hotel-filters">
        <h3>Filters</h3>
        
        <div className="filter-group">
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="Search by location..."
            value={filters.location}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="minPrice">Min Price ($):</label>
          <input
            type="number"
            id="minPrice"
            name="minPrice"
            placeholder="0"
            value={filters.minPrice}
            onChange={handleFilterChange}
            min="0"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="maxPrice">Max Price ($):</label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            placeholder="Any"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            min="0"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="rating">Min Rating:</label>
          <select
            id="rating"
            name="rating"
            value={filters.rating}
            onChange={handleFilterChange}
          >
            <option value="">Any</option>
            <option value="1">1+ stars</option>
            <option value="2">2+ stars</option>
            <option value="3">3+ stars</option>
            <option value="4">4+ stars</option>
            <option value="5">5 stars</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Amenities:</label>
          <div className="amenities-list">
            {allAmenities.map((amenity) => (
              <label key={amenity} className="amenity-checkbox">
                <input
                  type="checkbox"
                  value={amenity}
                  checked={filters.amenities.includes(amenity)}
                  onChange={handleFilterChange}
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-buttons">
          <button className="btn-primary" onClick={handleApplyFilters}>
            Apply Filters
          </button>
          <button className="btn-secondary" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Hotels Grid */}
      {hotels.length === 0 ? (
        <p className="no-hotels">No hotels available matching your filters.</p>
      ) : (
        <div className="hotel-grid">
          {hotels.map((hotel) => (
            <div key={hotel._id} className="hotel-card">
              <div className="hotel-card-body">
                <h3 className="hotel-card-title">{hotel.name}</h3>
                <p className="hotel-card-location">📍 {hotel.location}</p>
                <p className="hotel-card-price">${hotel.price || hotel.pricePerNight || 0}/night</p>
                {hotel.rating && (
                  <p className="hotel-card-rating">⭐ {hotel.rating} stars</p>
                )}
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="hotel-amenities">
                    <p className="amenities-label">Amenities:</p>
                    <div className="amenities-tags">
                      {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="amenity-tag">
                          {amenity}
                        </span>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <span className="amenity-tag">+{hotel.amenities.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="hotel-card-footer">
                <button
                  className="btn-primary"
                  onClick={() => navigate(`/hotels/${hotel._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelList;
