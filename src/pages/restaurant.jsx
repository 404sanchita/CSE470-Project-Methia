import React, { useState, useEffect } from "react";
import axios from "axios";
import "./restaurant.css";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [bookingData, setBookingData] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    date: "",
    time: "",
    numberOfGuests: 1,
    specialRequests: ""
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [bookingEmail, setBookingEmail] = useState("");

  // Filter options - users must select at least one
  const [selectedFilters, setSelectedFilters] = useState({
    name: { enabled: false, value: "" },
    place: { enabled: false, value: "" },
    priceRange: { enabled: false, value: "" },
    cuisine: { enabled: false, value: "" }
  });

  // Price range options
  const priceRanges = [
    { value: "$", label: "$ - Budget Friendly" },
    { value: "$$", label: "$$ - Moderate" },
    { value: "$$$", label: "$$$ - Expensive" },
    { value: "$$$$", label: "$$$$ - Very Expensive" }
  ];

  // Fetch all restaurants initially to get cuisine list
  useEffect(() => {
    fetchAllRestaurants();
  }, []);

  const fetchAllRestaurants = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/restaurants");
      setRestaurants(response.data);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
    }
  };

  // Get unique cuisines from restaurants
  const getUniqueCuisines = () => {
    const cuisines = new Set();
    restaurants.forEach((restaurant) => {
      if (restaurant.cuisine && Array.isArray(restaurant.cuisine)) {
        restaurant.cuisine.forEach((c) => cuisines.add(c));
      }
    });
    return Array.from(cuisines).sort();
  };

  // Check if at least one filter is enabled
  const hasActiveFilters = () => {
    return Object.values(selectedFilters).some(filter => filter.enabled);
  };

  // Handle filter toggle
  const toggleFilter = (filterKey) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: {
        ...prev[filterKey],
        enabled: !prev[filterKey].enabled,
        value: !prev[filterKey].enabled ? prev[filterKey].value : ""
      }
    }));
  };

  // Handle filter value change
  const updateFilterValue = (filterKey, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: {
        ...prev[filterKey],
        value: value
      }
    }));
  };

  // Perform search with selected filters
  const performSearch = async () => {
    if (!hasActiveFilters()) {
      setError("Please select at least one filter option to search.");
      return;
    }

    // Check if at least one enabled filter has a value
    const hasValidFilter = Object.values(selectedFilters).some(
      filter => filter.enabled && filter.value && filter.value.trim() !== ""
    );

    if (!hasValidFilter) {
      setError("Please fill in at least one filter value before searching.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const params = new URLSearchParams();
      
      if (selectedFilters.name.enabled && selectedFilters.name.value && selectedFilters.name.value.trim()) {
        params.append("search", selectedFilters.name.value.trim());
      }
      if (selectedFilters.place.enabled && selectedFilters.place.value && selectedFilters.place.value.trim()) {
        params.append("place", selectedFilters.place.value.trim());
      }
      if (selectedFilters.priceRange.enabled && selectedFilters.priceRange.value) {
        params.append("priceRange", selectedFilters.priceRange.value);
      }
      if (selectedFilters.cuisine.enabled && selectedFilters.cuisine.value) {
        params.append("cuisine", selectedFilters.cuisine.value);
      }

      // If no params, return all restaurants
      const url = params.toString() 
        ? `http://localhost:5001/api/restaurants?${params.toString()}`
        : `http://localhost:5001/api/restaurants`;

      const response = await axios.get(url);
      
      setFilteredRestaurants(response.data);
      
      if (response.data.length === 0) {
        setError("No restaurants found matching your criteria.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Unknown error";
      setError(`Failed to fetch restaurants: ${errorMessage}. Please check if the backend server is running.`);
      console.error("Error fetching restaurants:", err);
      console.error("Error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({
      name: { enabled: false, value: "" },
      place: { enabled: false, value: "" },
      priceRange: { enabled: false, value: "" },
      cuisine: { enabled: false, value: "" }
    });
    setFilteredRestaurants([]);
    setError("");
  };

  // Handle booking modal
  const openBookingModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowBookingModal(true);
    setBookingData({
      userName: "",
      userEmail: "",
      userPhone: "",
      date: "",
      time: "",
      numberOfGuests: 1,
      specialRequests: ""
    });
    setBookingSuccess(false);
    setError(""); // Clear any previous errors
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedRestaurant(null);
    setBookingSuccess(false);
  };

  // Handle booking form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRestaurant) return;

    setBookingLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `http://localhost:5001/api/restaurants/${selectedRestaurant._id}/book`,
        bookingData
      );

      setBookingSuccess(true);
      
      // Update available seats in the filtered restaurants list
      if (response.data.updatedAvailableSeats !== undefined) {
        setFilteredRestaurants(prev => 
          prev.map(r => 
            r._id === selectedRestaurant._id 
              ? { ...r, availableSeats: response.data.updatedAvailableSeats }
              : r
          )
        );
      }
      
      setTimeout(() => {
        closeBookingModal();
        // Refresh restaurant data to ensure consistency
        if (filteredRestaurants.length > 0) {
          performSearch();
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book table. Please try again.");
      console.error("Error booking table:", err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: name === "numberOfGuests" ? parseInt(value) || 1 : value
    }));
  };

  // Fetch user bookings by email
  const fetchUserBookings = async (email) => {
    if (!email || !email.trim()) {
      setError("Please enter your email to view bookings.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `http://localhost:5001/api/restaurants/bookings/my?email=${encodeURIComponent(email.trim())}`
      );
      setUserBookings(response.data);
      if (response.data.length === 0) {
        setError("No bookings found for this email.");
      }
    } catch (err) {
      setError("Failed to fetch bookings. Please check your email.");
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="restaurants-container">
      <div className="restaurants-header">
        <h1>🍽️ Find Your Perfect Restaurant</h1>
        <p>Select at least one filter option and search to discover amazing dining experiences</p>
        <div className="header-actions">
          <button 
            onClick={() => setShowMyBookings(!showMyBookings)} 
            className="view-bookings-btn"
          >
            {showMyBookings ? "🔍 Search Restaurants" : "📋 View My Bookings"}
          </button>
        </div>
      </div>

      {/* My Bookings Section */}
      {showMyBookings && (
        <div className="my-bookings-section">
          <h2>📋 My Restaurant Bookings</h2>
          <div className="booking-email-input">
            <input
              type="email"
              placeholder="Enter your email to view bookings"
              value={bookingEmail}
              onChange={(e) => setBookingEmail(e.target.value)}
              className="email-input"
            />
            <button 
              onClick={() => fetchUserBookings(bookingEmail)}
              className="fetch-bookings-btn"
            >
              View Bookings
            </button>
          </div>

          {loading && <div className="loading">Loading bookings...</div>}
          
          {error && !loading && (
            <div className="error-message">
              {error}
            </div>
          )}

          {!loading && userBookings.length > 0 && (
            <div className="bookings-list">
              {userBookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <h3>{booking.restaurantName || booking.restaurantId?.name || "Restaurant"}</h3>
                    <span className={`status-badge ${booking.bookingStatus}`}>
                      {booking.bookingStatus}
                    </span>
                  </div>
                  <div className="booking-details">
                    <p><strong>📅 Date:</strong> {booking.date}</p>
                    <p><strong>🕐 Time:</strong> {booking.time}</p>
                    <p><strong>👥 Guests:</strong> {booking.numberOfGuests}</p>
                    <p><strong>👤 Name:</strong> {booking.userName}</p>
                    <p><strong>📧 Email:</strong> {booking.userEmail}</p>
                    {booking.userPhone && <p><strong>📞 Phone:</strong> {booking.userPhone}</p>}
                    {booking.specialRequests && (
                      <p><strong>💬 Special Requests:</strong> {booking.specialRequests}</p>
                    )}
                    <p><strong>📅 Booked On:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && userBookings.length === 0 && bookingEmail && (
            <div className="no-results">
              <p>No bookings found for this email.</p>
            </div>
          )}
        </div>
      )}

      {/* Unified Filter Selection Section */}
      {!showMyBookings && (
      <>
      <div className="search-filter-section">
        <div className="filter-selection-header">
          <h3>Select Filter Options (Choose at least one)</h3>
          <p className="filter-hint">You can select multiple filters to refine your search</p>
        </div>

        <div className="filter-options-grid">
          {/* Restaurant Name Filter */}
          <div className={`filter-option-card ${selectedFilters.name.enabled ? 'active' : ''}`}>
            <div className="filter-header">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedFilters.name.enabled}
                  onChange={() => toggleFilter('name')}
                />
                <span className="filter-label">Restaurant Name</span>
              </label>
            </div>
            {selectedFilters.name.enabled && (
              <input
                type="text"
                placeholder="e.g., Pizza Palace, Sushi House..."
                value={selectedFilters.name.value}
                onChange={(e) => updateFilterValue('name', e.target.value)}
                className="filter-input"
              />
            )}
          </div>

          {/* Place/Destination Filter */}
          <div className={`filter-option-card ${selectedFilters.place.enabled ? 'active' : ''}`}>
            <div className="filter-header">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedFilters.place.enabled}
                  onChange={() => toggleFilter('place')}
                />
                <span className="filter-label">Place/Destination</span>
              </label>
            </div>
            {selectedFilters.place.enabled && (
              <input
                type="text"
                placeholder="e.g., Paris, Tokyo, New York..."
                value={selectedFilters.place.value}
                onChange={(e) => updateFilterValue('place', e.target.value)}
                className="filter-input"
              />
            )}
          </div>

          {/* Price Range Filter */}
          <div className={`filter-option-card ${selectedFilters.priceRange.enabled ? 'active' : ''}`}>
            <div className="filter-header">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedFilters.priceRange.enabled}
                  onChange={() => toggleFilter('priceRange')}
                />
                <span className="filter-label">Price Range</span>
              </label>
            </div>
            {selectedFilters.priceRange.enabled && (
              <select
                value={selectedFilters.priceRange.value}
                onChange={(e) => updateFilterValue('priceRange', e.target.value)}
                className="filter-select"
              >
                <option value="">Select Price Range</option>
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Cuisine Filter */}
          <div className={`filter-option-card ${selectedFilters.cuisine.enabled ? 'active' : ''}`}>
            <div className="filter-header">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedFilters.cuisine.enabled}
                  onChange={() => toggleFilter('cuisine')}
                />
                <span className="filter-label">Cuisine Type</span>
              </label>
            </div>
            {selectedFilters.cuisine.enabled && (
              <select
                value={selectedFilters.cuisine.value}
                onChange={(e) => updateFilterValue('cuisine', e.target.value)}
                className="filter-select"
              >
                <option value="">Select Cuisine</option>
                {getUniqueCuisines().map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={performSearch} 
            className={`search-btn ${!hasActiveFilters() ? 'disabled' : ''}`}
            disabled={!hasActiveFilters()}
          >
            🔍 Search Restaurants
          </button>
          <button onClick={clearFilters} className="clear-btn">
            Clear All Filters
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
      
      {/* Results Section */}
      <div className="results-section">
        {loading && <div className="loading">Searching restaurants...</div>}

        {!loading && filteredRestaurants.length > 0 && (
          <>
            <div className="results-header">
              <h2>
                {filteredRestaurants.length} Restaurant{filteredRestaurants.length !== 1 ? "s" : ""} Found
              </h2>
            </div>

            <div className="restaurants-grid">
              {filteredRestaurants.map((restaurant) => (
                <div key={restaurant._id} className="restaurant-card">
                  {restaurant.image && (
                    <div className="restaurant-image">
                      <img src={restaurant.image} alt={restaurant.name} />
                    </div>
                  )}
                  
                  <div className="restaurant-content">
                    <div className="restaurant-header">
                      <h3>{restaurant.name}</h3>
                      <div className="restaurant-rating">
                        <span className="rating-stars">
                          {"⭐".repeat(Math.floor(restaurant.rating || 0))}
                        </span>
                        <span className="rating-number">
                          {restaurant.rating ? restaurant.rating.toFixed(1) : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="restaurant-info">
                      <div className="info-item">
                        <strong>📍 Location:</strong>
                        <span>
                          {restaurant.destination
                            ? `${restaurant.destination.name}, ${restaurant.destination.country || ""}`
                            : restaurant.address || "N/A"}
                        </span>
                      </div>

                      <div className="info-item">
                        <strong>💰 Price Range:</strong>
                        <span className="price-badge">{restaurant.priceRange || "N/A"}</span>
                      </div>

                      <div className="info-item">
                        <strong>🪑 Available Seats:</strong>
                        <span className={`seats-badge ${restaurant.availableSeats > 0 ? 'available' : 'unavailable'}`}>
                          {restaurant.availableSeats !== undefined ? restaurant.availableSeats : "N/A"}
                        </span>
                      </div>

                      <div className="info-item contact-highlight">
                        <strong>📞 Contact Number:</strong>
                        {restaurant.contactInfo && restaurant.contactInfo.phone ? (
                          <a href={`tel:${restaurant.contactInfo.phone}`} className="contact-phone">
                            {restaurant.contactInfo.phone}
                          </a>
                        ) : (
                          <span className="contact-na">N/A</span>
                        )}
                      </div>

                      {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                        <div className="info-item">
                          <strong>🍴 Cuisine:</strong>
                          <div className="cuisine-tags">
                            {restaurant.cuisine.map((cuisine, idx) => (
                              <span key={idx} className="cuisine-tag">
                                {cuisine}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {restaurant.bestDishes && restaurant.bestDishes.length > 0 && (
                        <div className="info-item">
                          <strong>⭐ Best Dishes:</strong>
                          <ul className="dishes-list">
                            {restaurant.bestDishes.slice(0, 3).map((dish, idx) => (
                              <li key={idx}>{dish}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {restaurant.contactInfo && restaurant.contactInfo.website && (
                        <div className="restaurant-contact">
                          <a
                            href={restaurant.contactInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="website-link"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}

                      <div className="booking-action">
                        <button
                          onClick={() => openBookingModal(restaurant)}
                          className={`book-table-btn ${restaurant.availableSeats > 0 ? '' : 'disabled'}`}
                          disabled={!restaurant.availableSeats || restaurant.availableSeats === 0}
                        >
                          {restaurant.availableSeats > 0 ? "📅 Pre-Book Table" : "No Seats Available"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedRestaurant && (
          <div className="modal-overlay" onClick={closeBookingModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Pre-Book Table at {selectedRestaurant.name}</h2>
                <button className="modal-close" onClick={closeBookingModal}>×</button>
              </div>

              {bookingSuccess ? (
                <div className="booking-success">
                  <div className="success-icon">✓</div>
                  <h3>Booking Request Submitted!</h3>
                  <p>Your table booking request has been sent. The restaurant will confirm shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="booking-form">
                  <div className="form-group">
                    <label htmlFor="userName">Full Name *</label>
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      value={bookingData.userName}
                      onChange={handleBookingInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="userEmail">Email *</label>
                    <input
                      type="email"
                      id="userEmail"
                      name="userEmail"
                      value={bookingData.userEmail}
                      onChange={handleBookingInputChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="userPhone">Phone Number</label>
                    <input
                      type="tel"
                      id="userPhone"
                      name="userPhone"
                      value={bookingData.userPhone}
                      onChange={handleBookingInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="date">Date *</label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleBookingInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="time">Time *</label>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        value={bookingData.time}
                        onChange={handleBookingInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="numberOfGuests">Number of Guests *</label>
                    <input
                      type="number"
                      id="numberOfGuests"
                      name="numberOfGuests"
                      value={bookingData.numberOfGuests}
                      onChange={handleBookingInputChange}
                      required
                      min="1"
                      max={selectedRestaurant.availableSeats || 10}
                      placeholder="Number of guests"
                    />
                    <small>Available seats: {selectedRestaurant.availableSeats || 0}</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="specialRequests">Special Requests</label>
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      value={bookingData.specialRequests}
                      onChange={handleBookingInputChange}
                      rows="3"
                      placeholder="Any special requests or dietary requirements..."
                    />
                  </div>

                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="button" onClick={closeBookingModal} className="cancel-btn">
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn" disabled={bookingLoading}>
                      {bookingLoading ? "Submitting..." : "Submit Booking"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {!loading && filteredRestaurants.length === 0 && !error && (
          <div className="no-results">
            <p>Select filter options and click "Search Restaurants" to find restaurants.</p>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
};

export default Restaurants;