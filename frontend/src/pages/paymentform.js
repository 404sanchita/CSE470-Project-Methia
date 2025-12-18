import React, { useState } from "react";
import axios from "axios";

const PaymentForm = ({ bookingId, onSuccess }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [status, setStatus] = useState("");

  const handlePay = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/payment/pay", {
        amount: 5000,
        cardNumber
      });

      setStatus("Payment Successful ✅");
      onSuccess(); // confirm booking
    } catch (err) {
      setStatus("Payment Failed ❌");
    }
  };

  return (
    <div>
      <h3>Visa Payment</h3>
      <input
        placeholder="Visa Card Number"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
      />
      <button onClick={handlePay}>Pay Now</button>
      <p>{status}</p>
    </div>
  );
};

export default PaymentForm;
