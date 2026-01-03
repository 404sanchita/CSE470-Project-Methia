import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../App/api";
import { AuthContext } from "../../context/AuthContext";

export default function Profile() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // 1. Load data from MongoDB on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/user/profile");
        setName(data.name);
        setEmail(data.email);
     } catch (err) {
        console.error("Fetch error:", err);
     //   alert("Session expired or failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 2. Update function to send data to MongoDB
  const updateProfile = async (fields) => {
    try {
      const { data } = await api.put("/user/profile", fields);
      
      // Update local state with response from DB
      setName(data.name);
      setEmail(data.email);
      
      // Sync localStorage so the UI header updates immediately
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...storedUser, ...data }));

      alert("Profile updated successfully in database!");
      setPassword(""); // Clear password field for security
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.message || "Update failed");
    }
  };

  // Delete account function
  const deleteAccount = async () => {
    const confirmDelete = window.confirm(
      "⚠️ WARNING: This will permanently delete your account and all associated data.\n\nThis action cannot be undone. Are you sure you want to delete your account?"
    );

    if (!confirmDelete) {
      return;
    }

    const doubleConfirm = window.confirm(
      "This is your final warning. Are you absolutely sure you want to delete your account?"
    );

    if (!doubleConfirm) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete("/user/profile");
      alert("Your account has been deleted successfully.");
      
      // Clear localStorage and logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      logout();
      
      // Navigate to home page
      navigate("/");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  if (loading) return <p>Loading profile from database...</p>;

  return (
    <div style={{ maxWidth: "420px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>👤 My Profile</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>Name:</label>
        <input
          style={{ display: "block", width: "100%", padding: "8px", margin: "5px 0" }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={() => updateProfile({ name })}>Update Name</button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Email:</label>
        <input
          style={{ display: "block", width: "100%", padding: "8px", margin: "5px 0" }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={() => updateProfile({ email })}>Update Email</button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>New Password:</label>
        <input
          type="password"
          style={{ display: "block", width: "100%", padding: "8px", margin: "5px 0" }}
          placeholder="Leave blank to keep current"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={() => updateProfile({ password })}>Update Password</button>
      </div>

      <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "2px solid #e5e7eb" }}>
        <h3 style={{ color: "#dc2626", marginBottom: "1rem" }}>⚠️ Danger Zone</h3>
        <p style={{ color: "#666", marginBottom: "1rem", fontSize: "0.9rem" }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={deleteAccount}
          disabled={deleting}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: deleting ? "not-allowed" : "pointer",
            opacity: deleting ? 0.6 : 1,
            fontWeight: "600"
          }}
        >
          {deleting ? "Deleting..." : "🗑️ Delete My Account"}
        </button>
      </div>
    </div>
  );
}