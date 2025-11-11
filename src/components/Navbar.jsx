import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <h2>Methia</h2>
      <div>
        <Link to="/">Home</Link>
        <Link to="/destination">Destinations</Link>
        <Link to="/restaurant">Restaurants</Link>
        <Link to="/hotel">Hotels</Link>
        <Link to="/guide">Guides</Link>
        <Link to="/booking">Booking</Link>
        <Link to="/quiz">Quiz</Link>
        {user ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}
