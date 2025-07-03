// adasimbo-iphones-frontend/src/pages/OrderConfirmation/OrderConfirmation.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import MessageBox from '../../components/MessageBox/MessageBox';

function OrderConfirmation() {
  const { id } = useParams(); // Get order ID from URL params
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        setError('No order ID provided.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch order details from your backend
        const response = await fetch(`https://adasimboiphones-backend.onrender.com/api/orders/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Order not found.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setOrder(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        setError(err.message || "Failed to load order details. Please try again.");
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', paddingTop: '6rem' }}>
        <MessageBox variant="danger">{error}</MessageBox>
        <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }} className="button-primary">
          Go to Home
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', paddingTop: '6rem' }}>
        <MessageBox variant="info">Order details could not be loaded.</MessageBox>
        <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }} className="button-primary">
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      paddingTop: '6rem',
      minHeight: 'calc(100vh - 8rem)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
      color: '#374151',
    }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: '800', textAlign: 'center', marginBottom: '2rem', color: '#1F2937' }}>
        Order Confirmation
      </h1>

      <MessageBox variant="success" style={{ marginBottom: '1.5rem' }}>
        Thank you for your order! Your payment has been received successfully, and your order is being processed.
      </MessageBox>

      <div style={{ border: '1px solid #D1D5DB', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: '#F9FAFB', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1F2937' }}>Order Details (ID: {order._id})</h2>
        <p><strong>Customer:</strong> {order.customerInfo.name} ({order.customerInfo.email})</p>
        <p><strong>Delivery Option:</strong> {order.deliveryInfo.option === 'pickup' ? 'Pickup from T-Mall Nairobi' : `Direct Delivery to ${order.deliveryInfo.address}`}</p>
        <p><strong>Payment Method:</strong> {order.paymentMethod === 'payNow' ? 'Paid Online' : order.paymentMethod === 'payOnDelivery' ? 'Pay on Delivery' : 'Lipa Polepole'}</p>
        <p><strong>Payment Status:</strong> {order.paymentStatus.replace('_', ' ').toUpperCase()}</p>
        {order.balanceDue > 0 && (
          <p style={{ color: '#EF4444', fontWeight: 'bold' }}><strong>Balance Due:</strong> KSh {order.balanceDue.toLocaleString()}</p>
        )}
        <p><strong>Total Paid:</strong> KSh {order.totalPrice.toLocaleString()}</p>
        <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
      </div>

      <div style={{ border: '1px solid #D1D5DB', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: '#F9FAFB', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1F2937' }}>Items Purchased:</h3>
        {order.orderItems.map((item) => (
          <div key={item.product} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px dashed #E5E7EB', paddingBottom: '0.75rem' }}>
            <img src={item.imageUrl} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.375rem', marginRight: '1rem' }} />
            <div>
              <p style={{ fontWeight: '600' }}>{item.name}</p>
              <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Qty: {item.qty} x KSh {item.price.toLocaleString()}</p>
              <p style={{ fontWeight: 'bold' }}>Subtotal: KSh {(item.qty * item.price).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
        <Link to="/products" className="button-secondary">
          Continue Shopping
        </Link>
        <Link to="/" className="button-primary">
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export default OrderConfirmation;
