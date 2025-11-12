import React, { useEffect, useState } from 'react';

function Profile() {
  const [user, setUser] = useState({ name: '', email: '' });

  // Load user data
  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        if (data) setUser({ name: data.name || '', email: data.email || '' });
      });
  }, []);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
      .then(res => res.json())
      .then(updated => setUser(updated));
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>User Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          value={user.name}
          onChange={e => setUser({ ...user, name: e.target.value })}
        /><br/><br/>

        <label>Email:</label>
        <input
          type="email"
          value={user.email}
          onChange={e => setUser({ ...user, email: e.target.value })}
        /><br/><br/>

        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default Profile;
