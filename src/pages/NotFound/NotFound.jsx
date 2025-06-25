// adasimbo-iphones-frontend/src/pages/NotFound/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: 'rgba(249, 250, 251, 0.9)', /* gray-50 with opacity */
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      margin: '0 auto',
      maxWidth: '40rem', /* max-w-xl */
    }}>
      <h1 style={{ fontSize: '6rem', fontWeight: '800', color: '#1F2937', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '1.875rem', fontWeight: '600', color: '#374151', marginBottom: '1.5rem' }}>Page Not Found</h2>
      <p style={{ fontSize: '1.125rem', color: '#4B5563', marginBottom: '2rem' }}>
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="button-primary"
      >
        Go to Home
      </Link>
    </div>
  );
}

export default NotFound;
