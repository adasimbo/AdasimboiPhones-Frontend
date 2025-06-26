// adasimbo-iphones-frontend/src/pages/CheckoutPage/CheckoutPage.jsx
import React, { useState } from 'react';
import { useCart, CART_ACTIONS } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import MessageBox from '../../components/MessageBox/MessageBox';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'; // New: Import PayPal components

function CheckoutPage() {
  const { cartItems, totalPrice, dispatch } = useCart();
  const navigate = useNavigate();

  // State for customer information
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState('');

  // State for delivery information
  const [deliveryOption, setDeliveryOption] = useState('pickup'); // 'pickup' or 'delivery'
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // State for payment method
  const [paymentMethod, setPaymentMethod] = useState('payOnDelivery'); // 'payNow', 'payOnDelivery', 'lipaPolepole'

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // PayPal Client ID (for frontend SDK) - This should ideally come from an environment variable
  // or be fetched from your backend for security and flexibility.
  // For development, you can use a sandbox client ID directly.
  const PAYPAL_CLIENT_ID_FRONTEND = "YOUR_PAYPAL_CLIENT_ID_HERE"; // Replace with your actual PayPal Client ID (e.g., from sandbox)

  // Function to handle placing the order
  const placeOrderHandler = async (e) => {
    e.preventDefault(); // Prevent default form submission

    setLoading(true);
    setError(null);
    setMessage(null);

    if (cartItems.length === 0) {
      setError('Your cart is empty. Please add items before checking out.');
      setLoading(false);
      return;
    }

    // Prepare order items for the backend (only necessary fields)
    const orderItems = cartItems.map(item => ({
      product: item._id, // Send product ID as reference
      name: item.name,
      qty: item.qty,
      imageUrl: item.imageUrl,
      price: item.price,
    }));

    // Construct the order data payload
    const orderData = {
      orderItems,
      customerInfo: {
        name: customerName,
        email: customerEmail,
        phoneNumber: customerPhoneNumber,
      },
      deliveryInfo: {
        option: deliveryOption,
        address: deliveryOption === 'delivery' ? deliveryAddress : undefined, // Only send address if delivery
      },
      paymentMethod,
      itemsPrice: totalPrice, // Total price of items
      totalPrice: totalPrice, // For simplicity, total price is same as items price for now
      isPaid: paymentMethod === 'payNow', // Assume 'payNow' means paid immediately
      paidAt: paymentMethod === 'payNow' ? new Date().toISOString() : undefined,
      paymentStatus: paymentMethod === 'payNow' ? 'paid' : 'pending',
      balanceDue: paymentMethod === 'lipaPolepole' ? totalPrice * 0.2 : 0, // Example: 20% upfront for Lipa Polepole
      // paymentResult will be populated by the backend if using M-Pesa/PayPal
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order.');
      }

      const data = await response.json();
      setMessage('Order placed successfully! Redirecting to confirmation...');
      dispatch({ type: CART_ACTIONS.CLEAR_CART }); // Clear cart after successful order
      navigate(`/order-confirmation/${data._id}`); // Redirect to order confirmation page

    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // PayPal Button Handlers
  const createPayPalOrder = (data, actions) => {
    // Set up the transaction on the PayPal side
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: totalPrice.toFixed(2), // Ensure amount is a string with 2 decimal places
            currency_code: "USD", // Or your local currency code (e.g., "KES")
          },
          // Add other details like description, custom_id if needed
        },
      ],
    });
  };

  const onApprovePayPalOrder = async (data, actions) => {
    // Capture the order on the PayPal side
    const details = await actions.order.capture();
    console.log('PayPal capture details:', details);

    // After successful capture on PayPal, verify with your backend
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/payments/paypal/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: details.id }), // Send PayPal's order ID to backend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'PayPal verification failed on backend.');
      }

      const verificationData = await response.json();
      console.log('Backend PayPal verification response:', verificationData);

      // If backend verification is successful, then place your order in your DB
      // This is crucial to ensure your database reflects the payment.
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item._id, name: item.name, qty: item.qty, imageUrl: item.imageUrl, price: item.price,
        })),
        customerInfo: { name: customerName, email: customerEmail, phoneNumber: customerPhoneNumber },
        deliveryInfo: { option: deliveryOption, address: deliveryOption === 'delivery' ? deliveryAddress : undefined },
        paymentMethod: 'payNow', // Explicitly set to payNow as PayPal is used
        itemsPrice: totalPrice,
        totalPrice: totalPrice,
        isPaid: true,
        paidAt: new Date().toISOString(),
        paymentStatus: 'paid',
        balanceDue: 0,
        paymentResult: {
          id: details.id,
          status: details.status,
          update_time: details.update_time,
          payerInfo: details.payer.email_address,
          paymentGateway: 'PayPal',
        },
      };

      const orderResponse = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const orderErrorData = await orderResponse.json();
        throw new Error(orderErrorData.message || 'Failed to record order after PayPal payment.');
      }

      const finalOrderData = await orderResponse.json();
      setMessage('Payment and order placed successfully! Redirecting to confirmation...');
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      navigate(`/order-confirmation/${finalOrderData._id}`);

    } catch (err) {
      console.error('Error during PayPal verification or order placement:', err);
      setError(err.message || 'An error occurred during PayPal payment processing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onCancelPayPal = (data) => {
    console.log('PayPal payment cancelled:', data);
    setMessage('PayPal payment was cancelled.');
    setLoading(false);
  };

  const onErrorPayPal = (err) => {
    console.error('PayPal error:', err);
    setError('An error occurred with PayPal. Please try again.');
    setLoading(false);
  };


  return (
    <div style={{
      maxWidth: '800px',
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
        Checkout
      </h1>

      {error && <MessageBox variant="danger" style={{ marginBottom: '1rem' }}>{error}</MessageBox>}
      {message && <MessageBox variant="info" style={{ marginBottom: '1rem' }}>{message}</MessageBox>}
      {loading && <LoadingSpinner />}

      <form onSubmit={placeOrderHandler}>
        {/* Customer Information Section */}
        <div style={{ border: '1px solid #D1D5DB', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: '#F9FAFB', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1F2937' }}>Customer Information</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="customerName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Full Name:</label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB', backgroundColor: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="customerEmail" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email:</label>
            <input
              type="email"
              id="customerEmail"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB', backgroundColor: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="customerPhoneNumber" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Phone Number:</label>
            <input
              type="tel" // Use type="tel" for phone numbers
              id="customerPhoneNumber"
              value={customerPhoneNumber}
              onChange={(e) => setCustomerPhoneNumber(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB', backgroundColor: '#fff' }}
            />
          </div>
        </div>

        {/* Delivery Information Section */}
        <div style={{ border: '1px solid #D1D5DB', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: '#F9FAFB', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1F2937' }}>Delivery Information</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Delivery Option:</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="deliveryOption"
                  value="pickup"
                  checked={deliveryOption === 'pickup'}
                  onChange={() => setDeliveryOption('pickup')}
                  style={{ marginRight: '0.5rem' }}
                />
                Pickup <span style={{ fontSize: '0.875rem', color: '#6B7280', marginLeft: '0.5rem' }}>(Collect your order from T-Mall Nairobi.)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="deliveryOption"
                  value="delivery"
                  checked={deliveryOption === 'delivery'}
                  onChange={() => setDeliveryOption('delivery')}
                  style={{ marginRight: '0.5rem' }}
                />
                Direct Delivery <span style={{ fontSize: '0.875rem', color: '#6B7280', marginLeft: '0.5rem' }}>(Get your order delivered directly to your address.)</span>
              </label>
            </div>
          </div>
          {deliveryOption === 'delivery' && (
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="deliveryAddress" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Delivery Address:</label>
              <input
                type="text"
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required={deliveryOption === 'delivery'}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB', backgroundColor: '#fff' }}
              />
            </div>
          )}
        </div>

        {/* Payment Method Section */}
        <div style={{ border: '1px solid #D1D5DB', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: '#F9FAFB', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1F2937' }}>Payment Method</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="payOnDelivery"
                checked={paymentMethod === 'payOnDelivery'}
                onChange={() => setPaymentMethod('payOnDelivery')}
                style={{ marginRight: '0.5rem' }}
              />
              Pay on Delivery <span style={{ fontSize: '0.875rem', color: '#6B7280', marginLeft: '0.5rem' }}>(Pay cash or M-Pesa upon receiving your order.)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="payNow"
                checked={paymentMethod === 'payNow'}
                onChange={() => setPaymentMethod('payNow')}
                style={{ marginRight: '0.5rem' }}
              />
              Pay Now <span style={{ fontSize: '0.875rem', color: '#6B7280', marginLeft: '0.5rem' }}>(Complete your payment securely online via M-Pesa or PayPal.)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="lipaPolepole"
                checked={paymentMethod === 'lipaPolepole'}
                onChange={() => setPaymentMethod('lipaPolepole')}
                style={{ marginRight: '0.5rem' }}
              />
              Lipa Polepole <span style={{ fontSize: '0.875rem', color: '#6B7280', marginLeft: '0.5rem' }}>(Pay for your device in flexible installments.)</span>
            </label>
          </div>
        </div>

        {/* Order Summary and Place Order Button */}
        <div style={{ borderTop: '2px solid #D1D5DB', paddingTop: '1.5rem', marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', textAlign: 'right', marginBottom: '1rem', color: '#1F2937' }}>
            Total: KSh {totalPrice.toLocaleString()}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            {paymentMethod === 'payNow' ? (
              // New: PayPal Buttons for "Pay Now" option
              <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID_FRONTEND, currency: "USD" }}> {/* Adjust currency as needed */}
                <PayPalButtons
                  style={{ layout: "horizontal", color: "blue", shape: "pill", label: "pay" }}
                  createOrder={createPayPalOrder}
                  onApprove={onApprovePayPalOrder}
                  onCancel={onCancelPayPal}
                  onError={onErrorPayPal}
                  forceReRender={[totalPrice, customerName, customerEmail, customerPhoneNumber, deliveryOption, deliveryAddress]} // Re-render if these change
                />
              </PayPalScriptProvider>
            ) : (
              // Default "Place Order" button for other payment methods
              <button
                type="submit"
                className="button-primary"
                disabled={cartItems.length === 0 || loading}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default CheckoutPage;
