// adasimbo-iphones-frontend/src/components/ProductCard/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  // Generate a placeholder image URL based on product name
  const getPlaceholderImage = (text, width = 600, height = 400) => {
    const bgColor = 'cccccc'; // Light gray background
    const textColor = '333333'; // Dark text
    const encodedText = encodeURIComponent(text);
    return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${encodedText}`;
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-card-image-container">
        <img
          src={product.imageUrl || getPlaceholderImage(product.name)}
          alt={product.name}
          className="product-card-image"
          onError={(e) => { e.target.onerror = null; e.target.src = getPlaceholderImage("Image Not Found"); }}
        />
      </div>
      <div className="product-card-content">
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-description">{product.brand} {product.model}</p>
        <p className="product-card-price">KSh {product.price.toLocaleString()}</p>
      </div>
      <div style={{ padding: '1rem', paddingTop: 0 }}>
        <button className="button-primary" style={{ width: '100%' }}>
          View Details
        </button>
      </div>
    </Link>
  );
}

export default ProductCard;
