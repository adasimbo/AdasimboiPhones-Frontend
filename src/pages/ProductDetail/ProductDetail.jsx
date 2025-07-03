// adasimbo-iphones-frontend/src/pages/ProductDetail/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import MessageBox from '../../components/MessageBox/MessageBox'; // Corrected path
import { useCart, CART_ACTIONS } from '../../contexts/CartContext'; // New: Import cart context

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate(); // Initialize navigate hook
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1); // State for quantity selector

  const { dispatch } = useCart(); // Get dispatch from cart context

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://adasimboiphones-backend.onrender.com/api/products/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch product details:", err);
        setError(err.message || "Failed to load product details. Please try again.");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle "Add to Cart" button click
  const addToCartHandler = () => {
    if (product) {
      dispatch({
        type: CART_ACTIONS.ADD_ITEM,
        payload: {
          _id: product._id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          countInStock: product.countInStock,
          brand: product.brand, // Add brand
          model: product.model, // Add model
          qty,
        },
      });
      navigate('/cart'); // Redirect to cart page after adding
    }
  };


  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div style={{
        position: 'relative',
        zIndex: 0,
        paddingTop: '6rem', // Adjust for fixed header
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

  if (!product) {
    return <MessageBox variant="info">Product not found.</MessageBox>;
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem', paddingTop: '6rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', padding: '1.5rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        {/* Product Image */}
        <div style={{ width: '100%', maxWidth: '400px', flexShrink: 0 }}>
          <img
            src={product.imageUrl || `https://placehold.co/600x450/e0e0e0/ffffff?text=${product.name.replace(/\s/g, '+')}`}
            alt={product.name}
            style={{ width: '100%', height: 'auto', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', objectFit: 'cover' }}
            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x450/e0e0e0/ffffff?text=Image+Not+Found`; }}
          />
        </div>

        {/* Product Details */}
        <div style={{ width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1F2937', marginBottom: '0.75rem' }}>{product.name}</h1>
          <h2 style={{ fontSize: '1.5rem', color: '#4B5563', marginBottom: '1rem' }}>{product.brand} {product.model}</h2>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: '#10B981', marginBottom: '1.5rem' }}>KSh {product.price.toLocaleString()}</p>

          <p style={{ color: '#4B5563', marginBottom: '1rem', lineHeight: '1.6' }}>{product.description}</p>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Category: <span style={{ fontWeight: '600' }}>{product.category}</span></p>

          {product.countInStock > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <label htmlFor="quantity" style={{ fontWeight: '600' }}>Quantity:</label>
              <select
                id="quantity"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB' }}
              >
                {[...Array(product.countInStock).keys()].map((x) => (
                  <option key={x + 1} value={x + 1}>
                    {x + 1}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <MessageBox variant="warning" style={{ marginBottom: '1.5rem' }}>Out of Stock</MessageBox>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button
              onClick={addToCartHandler}
              className="button-primary"
              disabled={product.countInStock === 0}
            >
              Add to Cart
            </button>
            <Link
              to="/products"
              className="button-secondary"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
