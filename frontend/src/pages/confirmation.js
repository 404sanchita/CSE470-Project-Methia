import React from "react";
import { useNavigate } from "react-router-dom";

const Confirmed = () => {
  const navigate = useNavigate();

  const goBackToHotels = () => {
    navigate("/hotels");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h2>🎉 Booking Confirmed!</h2>
      <p>Your hotel has been successfully booked.</p>

      <button
        onClick={goBackToHotels}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        Back to Hotel List
      </button>
    </div>
  );
};

export default Confirmed;
