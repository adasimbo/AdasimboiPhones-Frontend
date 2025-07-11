// adasimbo-iphones-frontend/src/pages/CheckoutPage/CheckoutPage.jsx
import React, { useState } from 'react';
import { useCart, CART_ACTIONS } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import MessageBox from '../../components/MessageBox/MessageBox';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'; // Import PayPal components

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
  // New state for online payment sub-selection (M-Pesa or PayPal)
  const [selectedOnlinePaymentMethod, setSelectedOnlinePaymentMethod] = useState('mpesa'); // 'mpesa' or 'paypal'

  // State for M-Pesa specific phone number (can be pre-filled from customerPhoneNumber)
  const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState('');


  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // PayPal Client ID (for frontend SDK) - IMPORTANT: Replace with your actual PayPal Client ID
  // For development, use a sandbox client ID directly. For production, fetch from backend securely.
  const PAYPAL_CLIENT_ID_FRONTEND = "YOUR_PAYPAL_CLIENT_ID_HERE"; // <<< REPLACE THIS WITH YOUR REAL PAYPAL CLIENT ID

  // Function to handle placing the order for "Pay on Delivery"
  const placeOrderHandler = async (e) => {
    // Only prevent default if it's a direct form submission for these methods
    if (e) e.preventDefault();

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
      paymentMethod, // Will be 'payOnDelivery' here
      itemsPrice: totalPrice,
      totalPrice: totalPrice,
      isPaid: false,
      paidAt: undefined,
      paymentStatus: 'pending',
      balanceDue: 0,
    };

    try {
      const response = await fetch('https://adasimboiphones-backend.onrender.com/api/orders', {
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

  // --- M-Pesa STK Push Handler ---
  const handleMpesaPayment = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    if (cartItems.length === 0) {
      setError('Your cart is empty. Please add items before checking out.');
      setLoading(false);
      return;
    }
    if (!mpesaPhoneNumber || mpesaPhoneNumber.length < 10) {
      setError('Please enter a valid M-Pesa phone number.');
      setLoading(false);
      return;
    }
    if (totalPrice <= 0) {
      setError('Total amount must be greater than zero for M-Pesa payment.');
      setLoading(false);
      return;
    }

    // Determine the amount to send to M-Pesa based on payment method
    // For Lipa Polepole, send 80% upfront
    const amountToPay = paymentMethod === 'lipaPolepole' ? totalPrice * 0.8 : totalPrice;

    // M-Pesa requires a minimum amount (e.g., 1 KES in sandbox).
    // Ensure the amount is at least 1.
    if (amountToPay < 1) { // Assuming minimum M-Pesa transaction is 1 KES
        setError('Amount to pay must be at least KSh 1.00.');
        setLoading(false);
        return;
    }

    // Format the phone number to start with 254 (remove leading 0 or +)
    let formattedPhoneNumber = mpesaPhoneNumber;
    if (formattedPhoneNumber.startsWith('0') && formattedPhoneNumber.length === 10) {
      formattedPhoneNumber = '254' + formattedPhoneNumber.substring(1);
    } else if (formattedPhoneNumber.startsWith('+254') && formattedPhoneNumber.length === 13) {
      formattedPhoneNumber = formattedPhoneNumber.substring(1); // Remove '+'
    } else if (!formattedPhoneNumber.startsWith('254') && formattedPhoneNumber.length === 9) { // Handles 7XXXXXXXX format
      formattedPhoneNumber = '254' + formattedPhoneNumber;
    }
    // Basic validation for the formatted number (e.g., regex for 2547XXXXXXXX) could be added here
    if (!/^(2547|2541)\d{8}$/.test(formattedPhoneNumber)) {
        setError('Invalid phone number format. Please use 07XXXXXXXX or 2547XXXXXXXX.');
        setLoading(false);
        return;
    }


    // Create a temporary order ID for linking the STK push to your system
    const tempOrderId = `TEMP_ORDER_${Date.now()}`;

    try {
      const response = await fetch('https://adasimboiphones-backend.onrender.com/api/payments/mpesa/stkpush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountToPay, // Send the calculated amount (full or upfront)
          phoneNumber: formattedPhoneNumber, // Use the formatted number here
          orderId: tempOrderId, // Pass a reference to your order
          isLipaPolepole: paymentMethod === 'lipaPolepole' // Indicate if it's Lipa Polepole
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate M-Pesa STK Push.');
      }

      const data = await response.json();
      setMessage(data.CustomerMessage || 'M-Pesa STK Push initiated. Please check your phone to complete the payment.');

      // Place the order in your database after STK push is initiated
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item._id, name: item.name, qty: item.qty, imageUrl: item.imageUrl, price: item.price,
        })),
        customerInfo: { name: customerName, email: customerEmail, phoneNumber: customerPhoneNumber },
        deliveryInfo: { option: deliveryOption, address: deliveryOption === 'delivery' ? deliveryAddress : undefined },
        paymentMethod: paymentMethod, // Use the actual paymentMethod selected ('payNow' or 'lipaPolepole')
        itemsPrice: totalPrice,
        totalPrice: totalPrice,
        // Set payment status based on whether it's a full payment or a partial upfront
        isPaid: paymentMethod === 'lipaPolepole' ? true : false, // Upfront is paid for Lipa Polepole, full payment for Pay Now (will be confirmed by callback)
        paidAt: new Date().toISOString(),
        paymentStatus: paymentMethod === 'lipaPolepole' ? 'partially_paid' : 'pending', // Awaiting M-Pesa callback for full payment
        balanceDue: paymentMethod === 'lipaPolepole' ? totalPrice * 0.2 : 0, // Remaining for Lipa Polepole
        paymentResult: {
          id: data.CheckoutRequestID, // Store Daraja's CheckoutRequestID
          status: 'PENDING',
          update_time: new Date().toISOString(),
          payerInfo: formattedPhoneNumber, // Store the formatted number
          paymentGateway: 'Mpesa',
        },
      };

      const orderResponse = await fetch('https://adasimboiphones-backend.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const orderErrorData = await orderResponse.json();
        throw new Error(orderErrorData.message || 'Failed to record order after M-Pesa STK push initiation.');
      }

      const finalOrderData = await orderResponse.json();
      setMessage('M-Pesa payment initiated. Please complete on your phone. Redirecting to confirmation...');
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      navigate(`/order-confirmation/${finalOrderData._id}`);

    } catch (err) {
      console.error('Error during M-Pesa STK Push:', err);
      setError(err.message || 'An error occurred during M-Pesa payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  // --- PayPal Button Handlers ---
  const createPayPalOrder = (data, actions) => {
    // Set up the transaction on the PayPal side
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: totalPrice.toFixed(2), // Ensure amount is a string with 2 decimal places
            currency_code: "USD", // IMPORTANT: Ensure this matches your PayPal account's primary currency or supported currency
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
      const response = await fetch('https://adasimboiphones-backend.onrender.com/api/payments/paypal/verify', {
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

      const orderResponse = await fetch('https://adasimboiphones-backend.onrender.com/api/orders', {
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

      {/* Using a div instead of form for the entire page to allow separate payment buttons */}
      <div>
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
                onChange={() => { setPaymentMethod('payOnDelivery'); setError(null); }}
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
                onChange={() => { setPaymentMethod('payNow'); setError(null); }}
                style={{ marginRight: '0.5rem' }}
              />
              Pay Now <span style={{ fontSize: '0.875rem', color: '#6B7280', marginLeft: '0.5rem' }}>(Complete your payment securely online.)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="lipaPolepole"
                checked={paymentMethod === 'lipaPolepole'}
                onChange={() => { setPaymentMethod('lipaPolepole'); setError(null); }}
                style={{ marginRight: '0.5rem' }}
              />
              Lipa Polepole <span style={{ fontSize: '0.875rem', color: '#6B7280', marginLeft: '0.5rem' }}>(Pay for your device in flexible installments.)</span>
            </label>
          </div>

          {/* Conditional rendering for Lipa Polepole upfront/remaining calculation */}
          {paymentMethod === 'lipaPolepole' && (
            <div style={{
              backgroundColor: '#E0F2F7', // Light blue background
              border: '1px solid #81D4FA', // Blue border
              borderRadius: '0.375rem',
              padding: '1rem',
              marginTop: '1rem',
              color: '#01579B', // Dark blue text
              fontSize: '0.9rem',
            }}>
              <p>
                For Lipa Polepole, an upfront payment of{' '}
                <strong>KSh {(totalPrice * 0.8).toLocaleString()}</strong> is required.
              </p>
              <p>
                The remaining balance of{' '}
                <strong>KSh {(totalPrice * 0.2).toLocaleString()}</strong> will be paid in installments over 2 weeks.
              </p>
            </div>
          )}

          {/* Conditional rendering for Pay Now and Lipa Polepole online payment sub-options */}
          {(paymentMethod === 'payNow' || paymentMethod === 'lipaPolepole') && (
            <div style={{ borderTop: '1px dashed #D1D5DB', paddingTop: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1F2937' }}>Choose Online Payment Method:</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="onlinePaymentMethod"
                    value="mpesa"
                    checked={selectedOnlinePaymentMethod === 'mpesa'}
                    onChange={() => setSelectedOnlinePaymentMethod('mpesa')}
                    style={{ marginRight: '0.5rem' }}
                  />
                  M-Pesa STK Push
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="onlinePaymentMethod"
                    value="paypal"
                    checked={selectedOnlinePaymentMethod === 'paypal'}
                    onChange={() => setSelectedOnlinePaymentMethod('paypal')}
                    style={{ marginRight: '0.5rem' }}
                  />
                  PayPal
                </label>
              </div>

              {/* M-Pesa STK Push Section */}
              {selectedOnlinePaymentMethod === 'mpesa' && (
                <div style={{ marginTop: '1.5rem' }}>
                  <label htmlFor="mpesaPhoneNumber" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>M-Pesa Phone Number:</label>
                  <input
                    type="tel"
                    id="mpesaPhoneNumber"
                    value={mpesaPhoneNumber}
                    onChange={(e) => setMpesaPhoneNumber(e.target.value)}
                    required
                    placeholder="e.g., 2547XXXXXXXX"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB', backgroundColor: '#fff' }}
                  />
                  <button
                    type="button" // Use type="button" to prevent form submission
                    onClick={handleMpesaPayment}
                    className="button-primary"
                    disabled={cartItems.length === 0 || loading || !mpesaPhoneNumber}
                    style={{ width: '100%', marginTop: '1rem' }}
                  >
                    {loading ? 'Initiating M-Pesa...' : 'Pay with M-Pesa'}
                  </button>
                </div>
              )}

              {/* PayPal Buttons Section */}
              {selectedOnlinePaymentMethod === 'paypal' && (
                <div style={{ marginTop: '1.5rem' }}>
                  <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID_FRONTEND, currency: "USD" }}> {/* IMPORTANT: Set correct currency */}
                    <PayPalButtons
                      style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }} // Changed layout to vertical for better spacing
                      createOrder={createPayPalOrder}
                      onApprove={onApprovePayPalOrder}
                      onCancel={onCancelPayPal}
                      onError={onErrorPayPal}
                      forceReRender={[totalPrice, customerName, customerEmail, customerPhoneNumber, deliveryOption, deliveryAddress]} // Re-render if these change
                    />
                  </PayPalScriptProvider>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Summary and Place Order Button (for non-online payments) */}
        <div style={{ borderTop: '2px solid #D1D5DB', paddingTop: '1.5rem', marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', textAlign: 'right', marginBottom: '1rem', color: '#1F2937' }}>
            Total: KSh {totalPrice.toLocaleString()}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            {/* Only show 'Place Order' button for 'Pay on Delivery' */}
            {paymentMethod === 'payOnDelivery' && (
              <button
                type="button"
                onClick={placeOrderHandler}
                className="button-primary"
                disabled={cartItems.length === 0 || loading}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            )}
          </div>
        </div>
      </div> {/* End of main content div, replacing form tag */}
    </div>
  );
}

export default CheckoutPage;
