import { useState } from "react";
import api from "../../App/api";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await api.post("/user/signup", form);
    
    // BACKEND returns: { _id, name, email, role, avatar, token }
    const data = response.data; 

    // Save exactly what api.js expects
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data)); 

    alert("Signup successful!");
    window.location.href = "/profile"; // Use window.location to force a fresh state load
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert(err.response?.data?.message || "Signup failed");
  }
};

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>

      <input
        placeholder="Name"
        required
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Email"
        type="email"
        required
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        required
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button type="submit">Signup</button>
    </form>
  );
}
