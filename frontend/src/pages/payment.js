import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [card, setCard] = useState("");

  const handlePay = async () => {
    await axios.put(
      `http://localhost:5000/api/bookings/${bookingId}`,
      { status: "Confirmed" }
    );
    navigate("/confirmed");
  };

  return (
    <div>
      <h2>Payment</h2>
      <input
        placeholder="Visa Card Number"
        onChange={(e) => setCard(e.target.value)}
      />
      <button onClick={handlePay}>Pay</button>
    </div>
  );
};

export default Payment;
