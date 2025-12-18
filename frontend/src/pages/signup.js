import { useState } from "react";
import axios from "axios";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async () => {
    await axios.post("http://localhost:5000/api/auth/signup", form);
    alert("Signup successful! Please login.");
  };

  return (
    <div>
      <h2>Signup</h2>
      <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})}/>
      <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})}/>
      <input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})}/>
      <button onClick={submit}>Signup</button>
    </div>
  );
}
