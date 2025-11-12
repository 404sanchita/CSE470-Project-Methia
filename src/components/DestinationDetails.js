import React from 'react';
import { useParams, Link } from 'react-router-dom';

function DestinationDetails() {
  const { name } = useParams();

  const descriptions = {
    paris: 'Paris is the capital of France, famous for the Eiffel Tower.',
    tokyo: 'Tokyo is Japan’s capital, known for its culture and technology.',
    'new york': 'New York City is known as “The City That Never Sleeps.”',
    bali: 'Bali is a tropical island in Indonesia, popular for beaches.',
    sydney: 'Sydney is an Australian city with the Opera House and beaches.',
  };

  const desc = descriptions[name.toLowerCase()] || 'Destination not found.';

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: '#007bff' }}>{name.toUpperCase()}</h2>
      <p style={{ maxWidth: '600px', margin: '1rem auto' }}>{desc}</p>
      <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>← Back to Home</Link>
    </div>
  );
}

export default DestinationDetails;
