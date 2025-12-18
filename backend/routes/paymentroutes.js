import express from "express";
const router = express.Router();

router.post("/pay", (req, res) => {
  const { amount, cardNumber } = req.body;

  // Simulate Visa validation
  if (cardNumber && cardNumber.startsWith("4")) {
    return res.json({
      success: true,
      message: "Payment successful",
      transactionId: Date.now()
    });
  }

  res.status(400).json({ success: false, message: "Payment failed" });
});

export default router;
