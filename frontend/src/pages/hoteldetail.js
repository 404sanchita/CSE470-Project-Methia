import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const HotelDetail = () => {
  const { id } = useParams(); // hotelId
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/hotels/${id}`);
        setHotel(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHotel();
  }, [id]);

  if (!hotel) return <p>Loading hotel...</p>;

  return (
    <div>
      <h2>{hotel.name}</h2>
      <p>{hotel.location}</p>
      <p>Price: ${hotel.price}/night</p>
      <p>Rating: ⭐ {hotel.rating}</p>
      <p>{hotel.description}</p>

      <button onClick={() => navigate(`/book/${hotel._id}`)}>
        Book Hotel
      </button>
    </div>
  );
};

export default HotelDetail;
