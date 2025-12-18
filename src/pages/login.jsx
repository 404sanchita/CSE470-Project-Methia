import { useState, useContext } from "react";
import api from "../../App/api";
import { useNavigate,Link } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const { data } = await api.post("/user/login", { email, password });

    // Ensure we save the token so the interceptor can find it
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));

    // Pass data to your context
    login({
      token: data.token,
      user: data // data already contains _id, name, email, etc.
    });

    navigate("/");
  } catch (err) {
    console.error(err);
    alert("Login failed: Invalid email or password");
  }
};

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
       {/* Signup button/link */}
      <p>
        Don't have an account?{" "}
        <Link to="/signup">
          <button type="button">Signup</button>
        </Link>
      </p>
    </form>
  );
}
