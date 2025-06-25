// adasimbo-iphones-frontend/src/pages/Products/Products.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import MessageBox from '../../components/MessageBox/MessageBox';

function Products() {
  // baseModels will now be an array of strings again: ["iPhone 16", "iPhone 15", ...]
  const [baseModels, setBaseModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBaseModels = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/products/base-models');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBaseModels(data); // Data now contains an array of strings
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch base models:", err);
        setError("Failed to load device models. Please try again later.");
        setLoading(false);
      }
    };

    fetchBaseModels();
  }, []);

  // Function to get a placeholder image for models (re-added)
  const getModelPlaceholderImage = (modelName) => {
    if (modelName.toLowerCase().includes('iphone')) {
      return `https://placehold.co/150x120/E1F5FE/2196F3?text=${encodeURIComponent(modelName.replace(' ', '+'))}`; // Light blue for iPhones
    } else if (modelName.toLowerCase().includes('samsung')) {
      return `https://placehold.co/150x120/FFF3E0/FF9800?text=${encodeURIComponent(modelName.replace(' ', '+'))}`; // Light orange for Samsung
    }
    return `https://placehold.co/150x120/F0F0F0/333333?text=${encodeURIComponent(modelName.replace(' ', '+'))}`; // Generic
  };


  return (
    <div style={{ position: 'relative', zIndex: 0, paddingTop: '2rem', paddingBottom: '2rem', maxWidth: '1280px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: '800', textAlign: 'center', marginBottom: '2rem', paddingTop: '1rem', color: '#374151', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
        Choose Your Model Series
      </h1>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : baseModels.length === 0 ? (
        <MessageBox variant="info">No device models found. Please seed your database!</MessageBox>
      ) : (
        <div className="grid-container">
          {baseModels.map((modelName) => ( // Iterate over modelName strings
            <Link
              to={`/products/models/${encodeURIComponent(modelName)}`}
              key={modelName}
              className="model-card"
            >
              <div className="model-card-image-container">
                <img
                  src={getModelPlaceholderImage(modelName)} // Use placeholder image
                  alt={modelName}
                  className="model-card-image"
                />
              </div>
              <h3 className="model-card-title">{modelName}</h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
