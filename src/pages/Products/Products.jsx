// adasimbo-iphones-frontend/src/pages/Products/Products.jsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import MessageBox from '../../components/MessageBox/MessageBox';

function Products() {
  // baseModels will now be an array of objects: [{ modelName, imageUrl, description, rating, numReviews }, ...]
  const [baseModels, setBaseModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null); // State to manage the clicked model for the spotlight modal
  const navigate = useNavigate(); // Initialize navigate hook

  useEffect(() => {
    const fetchBaseModels = async () => {
      try {
        setLoading(true);
        // Fetch data that includes imageUrl, description, rating, and numReviews for each base model
        const response = await fetch('http://localhost:5000/api/products/base-models');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBaseModels(data); // Data now contains an array of objects
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch base models:", err);
        setError("Failed to load device models. Please try again later.");
        setLoading(false);
      }
    };

    fetchBaseModels();
  }, []);

  // Handler for clicking a model card to open the spotlight modal
  const handleModelClick = (model) => {
    setSelectedModel(model);
  };

  // Handler to close the spotlight modal
  const closeSpotlight = () => {
    setSelectedModel(null);
  };

  // Handler for "View All Variations" button inside the spotlight modal
  const handleViewVariations = (modelName) => {
    closeSpotlight(); // Close the modal
    navigate(`/products/models/${encodeURIComponent(modelName)}`); // Navigate to the variations page
  };

  // Helper function to render star icons
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<i key={i} className="fas fa-star full-star"></i>);
      } else if (rating >= i - 0.5) {
        stars.push(<i key={i} className="fas fa-star-half-alt half-star"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star empty-star"></i>);
      }
    }
    return stars;
  };

  return (
    <div style={{ position: 'relative', zIndex: 0, paddingTop: '2rem', paddingBottom: '2rem', maxWidth: '1280px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: '800', textAlign: 'center', marginBottom: '2rem', paddingTop: '1rem', color: '#ffffff', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
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
          {baseModels.map((model) => ( // Iterate over model objects
            <div
              key={model.modelName}
              className="model-card"
              onClick={() => handleModelClick(model)} // Click handler to open spotlight
              style={{ cursor: 'pointer' }} // Indicate it's clickable
            >
              <div className="model-card-image-container">
                <img
                  src={model.imageUrl} // Use actual image URL from fetched data
                  alt={model.modelName}
                  className="model-card-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/150x120/F0F0F0/333333?text=${encodeURIComponent(model.modelName.replace(' ', '+'))}`; }}
                />
              </div>
              <h3 className="model-card-title">{model.modelName}</h3>
              {/* Display Stars and Reviews */}
              <div className="model-card-rating">
                <div className="stars-container">
                  {renderStars(model.rating)}
                </div>
                <span className="review-count">({model.numReviews} reviews)</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Model Spotlight Modal */}
      {selectedModel && (
        <div className={`model-spotlight-overlay ${selectedModel ? 'visible' : ''}`}>
          <div className="model-spotlight-content">
            <img
              src={selectedModel.imageUrl}
              alt={selectedModel.modelName}
              className="model-spotlight-image"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/F0F0F0/333333?text=Image+Not+Found`; }}
            />
            <h3 className="model-spotlight-title">{selectedModel.modelName}</h3>
            {/* Display Stars and Reviews in Modal */}
            <div className="model-spotlight-rating">
              <div className="stars-container">
                {renderStars(selectedModel.rating)}
              </div>
              <span className="review-count">({selectedModel.numReviews} reviews)</span>
            </div>
            <p className="model-spotlight-description">{selectedModel.description}</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => handleViewVariations(selectedModel.modelName)} className="button-primary">
                    View All {selectedModel.modelName} Models
                </button>
                <button onClick={closeSpotlight} className="button-secondary">
                    Close
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
