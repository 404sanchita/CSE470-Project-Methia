import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotels = async () => {
      const res = await axios.get("http://localhost:5000/api/hotels");
      setHotels(res.data);
    };
    fetchHotels();
  }, []);

  return (
    <div>
      <h2>Available Hotels</h2>
      <ul>
        {hotels.map((hotel) => (
          <li key={hotel._id} style={{ margin: "10px 0" }}>
            <strong>{hotel.name}</strong> - {hotel.location} - ${hotel.pricePerNight}/night
            <button
              style={{ marginLeft: "10px" }}
              onClick={() => navigate(`/hotels/${hotel._id}`)}>
              View Details
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HotelList;
