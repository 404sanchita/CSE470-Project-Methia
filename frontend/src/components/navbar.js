import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <div style={{
      padding: "15px",
      borderBottom: "1px solid #ccc",
      display: "flex",
      justifyContent: "space-between"
    }}>
      <h3 style={{ cursor: "pointer" }} onClick={() => navigate("/hotels")}>
        🏨 Hotel Booking
      </h3>

      <div>
        <button onClick={() => navigate("/my-bookings")}>
          My Bookings
        </button>
      </div>
    </div>
  );
}

export default Navbar;
