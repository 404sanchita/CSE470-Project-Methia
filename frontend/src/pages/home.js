import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h1>Welcome to Metheia</h1>

      <button onClick={() => navigate("/hotels")}>
        Explore Hotels
      </button>

      <br /><br />

      <button onClick={() => navigate("/my-bookings")}>
        My Bookings
      </button>
    </div>
  );
};

export default Home;
