// adasimbo-iphones-frontend/src/pages/ModelDetail/ModelDetail.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import MessageBox from '../../components/MessageBox/MessageBox';

function ModelDetail() {
  const { baseModelName } = useParams();
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVariations = async () => {
      try {
        setLoading(true);
        const encodedModelName = encodeURIComponent(baseModelName);
        const response = await fetch(`http://localhost:5000/api/products/variations/${encodedModelName}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`No devices found for ${baseModelName}.`);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setVariations(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch model variations:", err);
        setError(err.message || "Failed to load device variations. Please try again later.");
        setLoading(false);
      }
    };

    fetchVariations();
  }, [baseModelName]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div style={{
        position: 'relative',
        zIndex: 0,
        paddingTop: '2rem',
        paddingBottom: '2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
        margin: '2rem auto',
        maxWidth: '960px',
        textAlign: 'center',
        color: '#374151',
      }}>
        <MessageBox variant="danger">{error}</MessageBox>
        <Link to="/products" className="button-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Back to All Models
        </Link>
      </div>
    );
  }

  if (variations.length === 0) {
    return (
      <div style={{
        position: 'relative',
        zIndex: 0,
        paddingTop: '2rem',
        paddingBottom: '2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
        margin: '2rem auto',
        maxWidth: '960px',
        textAlign: 'center',
        color: '#374151',
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          No variations found for {decodeURIComponent(baseModelName)}.
        </h2>
        <Link to="/products" className="button-secondary">
          Back to All Models
        </Link>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', zIndex: 0, paddingTop: '2rem', paddingBottom: '2rem', maxWidth: '1280px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: '800', textAlign: 'center', marginBottom: '2rem', paddingTop: '1rem', color: '#374151', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
        {decodeURIComponent(baseModelName)} Series
      </h1>

      <div className="grid-container"> {/* Apply grid-container class here */}
        {variations.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/products" className="button-secondary">
          Back to All Models
        </Link>
      </div>
    </div>
  );
}

export default ModelDetail;
