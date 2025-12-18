import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function AuthButton() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    navigate("/login", { state: { from: location } });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <button
      onClick={user ? handleLogout : handleLogin}
      style={{
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        border: "none",
        backgroundColor: user ? "#dc3545" : "#007bff",
        color: "white",
        cursor: "pointer",
      }}
    >
      {user ? "Logout" : "Login"}
    </button>
  );
}
