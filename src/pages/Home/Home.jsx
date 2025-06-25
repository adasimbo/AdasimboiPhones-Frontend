// adasimbo-iphones-frontend/src/pages/Home/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 8rem)', // Adjust for header/footer to make content scrollable below
      textAlign: 'center',
      color: '#fff',
      padding: '2rem', /* p-8 */
      width: '100%',
    }}>
      {/* Content for the hero section on top of the video background */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '2rem',
        borderRadius: '0.5rem',
      }}>
        <h1 style={{
          fontSize: '3rem', /* text-5xl */
          fontWeight: '800', /* font-extrabold */
          marginBottom: '1rem',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        }}>
          Adasimbo iPhones
        </h1>
        <p style={{
          fontSize: '1.25rem', /* text-xl */
          marginBottom: '2rem',
          color: 'white',
          textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
        }}>
          Your Premium Destination for iPhones & Flagship Samsung Devices in Kenya
        </p>
        <Link
          to="/products"
          className="button-primary" // Using a class from index.css
        >
          Explore Our Devices
        </Link>
      </div>

      {/* Additional content that will make the page scrollable */}
      <div style={{
        marginTop: '5rem', // pt-20
        padding: '2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // bg-white bg-opacity-90
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)', /* shadow-xl */
        color: '#374151', /* gray-800 */
        maxWidth: '48rem', /* max-w-3xl */
        margin: '5rem auto 0 auto', // Adjust margin to ensure it sits below hero
        position: 'relative',
        zIndex: 1,
      }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '1rem' }}>Why Choose Adasimbo iPhones?</h2>
        <p style={{ marginBottom: '1rem' }}>
          Since 2023, we've proudly served over **55 satisfied customers** across Kenya,
          offering a curated selection of the latest iPhones and top-tier Samsung Flagship devices.
          We combine quality products with unparalleled customer service.
        </p>
        <p style={{ marginBottom: '1rem' }}>
          Experience seamless performance, stunning cameras, and the reliability you expect from
          premium mobile technology. Discover your next device with Adasimbo iPhones.
        </p>
        <Link to="/products" style={{ color: '#2563EB', textDecoration: 'underline' }}>
          View All Products
        </Link>
      </div>
    </div>
  );
}

export default Home;
