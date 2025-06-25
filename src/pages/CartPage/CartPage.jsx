// adasimbo-iphones-frontend/src/pages/CartPage/CartPage.jsx
import React from 'react';
import { useCart, CART_ACTIONS } from '../../contexts/CartContext';
import { Link } from 'react-router-dom';
import MessageBox from '../../components/MessageBox/MessageBox';

function CartPage() {
  const { cartItems, totalItems, totalPrice, dispatch } = useCart();

  const updateQuantityHandler = (id, qty) => {
    dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id, qty: Number(qty) } });
  };

  const removeItemHandler = (id) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: id });
  };

  const clearCartHandler = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem',
      paddingTop: '6rem', // Adjust for fixed header
      minHeight: 'calc(100vh - 8rem)', // Ensure content pushes footer down
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
      color: '#374151',
    }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: '800', textAlign: 'center', marginBottom: '2rem', color: '#1F2937' }}>
        Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center' }}>
          <MessageBox variant="info">
            Your cart is empty. <Link to="/products" style={{ color: '#2563EB', textDecoration: 'underline' }}>Go shopping!</Link>
          </MessageBox>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {cartItems.map((item) => (
            <div key={item._id} style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid #E5E7EB',
              paddingBottom: '1rem',
              marginBottom: '1rem',
              flexWrap: 'wrap', // Allow wrapping on small screens
              gap: '1rem', // Gap between items in the row
            }}>
              <div style={{ flexShrink: 0, width: '100px', height: '100px', borderRadius: '0.375rem', overflow: 'hidden' }}>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x100/e0e0e0/ffffff?text=No+Image`; }}
                />
              </div>
              <div style={{ flexGrow: 1, minWidth: '150px' }}>
                <Link to={`/products/${item._id}`} style={{ fontWeight: '600', color: '#1F2937', textDecoration: 'none' }}>
                  {item.name}
                </Link>
                <p style={{ color: '#4B5563', fontSize: '0.875rem' }}>{item.brand} {item.model}</p>
              </div>
              <div style={{ width: '80px', flexShrink: 0 }}>
                <select
                  value={item.qty}
                  onChange={(e) => updateQuantityHandler(item._id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#F9FAFB',
                    fontSize: '1rem',
                  }}
                >
                  {[...Array(item.countInStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem', flexShrink: 0, minWidth: '100px', textAlign: 'right' }}>
                KSh {(item.price * item.qty).toLocaleString()}
              </div>
              <div style={{ flexShrink: 0 }}>
                <button
                  onClick={() => removeItemHandler(item._id)}
                  style={{
                    backgroundColor: '#EF4444', // Red-500
                    color: 'white',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease-in-out',
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#DC2626'} // Red-600
                  onMouseOut={(e) => e.target.style.backgroundColor = '#EF4444'} // Red-500
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div style={{ borderTop: '2px solid #D1D5DB', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', textAlign: 'right', marginBottom: '1rem', color: '#1F2937' }}>
              Subtotal ({totalItems}) items: KSh {totalPrice.toLocaleString()}
            </h2>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={clearCartHandler}
                className="button-secondary"
              >
                Clear Cart
              </button>
              <Link to="/checkout" className="button-primary" style={{ textDecoration: 'none' }}>
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
