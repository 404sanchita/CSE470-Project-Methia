import React from "react";
import BookingList from "./component/bookinglist";

function App() {
  return (
    <div className="App" style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>Hotel Booking Management Dashboard</h1>
      <BookingList />
    </div>
  );
}

export default App;

