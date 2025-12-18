import { useEffect, useState } from "react";
import api from "../../App/api";

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Load data from MongoDB on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/user/profile");
        setName(data.name);
        setEmail(data.email);
        setAvatar(data.avatar || "");
     
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
      setAvatar(data.avatar);
      
      // Sync localStorage so the UI header (like name/avatar) updates immediately
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...storedUser, ...data }));

      alert("Profile updated successfully in database!");
      setPassword(""); // Clear password field for security
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <p>Loading profile from database...</p>;

  return (
    <div style={{ maxWidth: "420px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>👤 My Profile</h2>
      
      {avatar && (
        <img
          src={avatar}
          alt="avatar"
          width="100"
          style={{ borderRadius: "50%", marginBottom: "1rem", objectFit: "cover", height: "100px" }}
        />
      )}

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
        <label>Avatar URL:</label>
        <input
          style={{ display: "block", width: "100%", padding: "8px", margin: "5px 0" }}
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
        />
        <button onClick={() => updateProfile({ avatar })}>Update Photo</button>
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
    </div>
  );
}
