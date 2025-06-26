// adasimbo-iphones-frontend/src/pages/CheckoutPage/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useCart, CART_ACTIONS } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom'; // Keep navigate for cart redirection
import MessageBox from '../../components/MessageBox/MessageBox';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

// IMPORTANT: Replace 'YOUR_PAYPAL_CLIENT_ID' with your actual PayPal Sandbox or Live Client ID
// For local development, you'll typically use a Sandbox Client ID.
const PAYPAL_SDK_URL = `https://www.paypal.com/sdk/js?client-id=AYvHCeRav2mifCBKgXSNZqjevixhYEOK_UakbwTKpcEHkfCAcoRgmVumes4Tv27POZbxNh_z5gEN8XhT&currency=KSH`;

function CheckoutPage() {
  const { cartItems, totalPrice, dispatch } = useCart();
  const navigate = useNavigate();

  // Customer Information States
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [deliveryOption, setDeliveryOption] = useState('pickup'); // 'pickup' or 'delivery'
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('payNow'); // 'payNow', 'payOnDelivery', 'lipaPolepole'
  const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState(''); // State for M-Pesa phone number input
  const [loading, setLoading] = useState(false); // General loading state for the page
  const [message, setMessage] = useState(null); // For success/error messages
  const [sdkReady, setSdkReady] = useState(false); // State to track PayPal SDK loading

  // Calculate Lipa Polepole amounts based on total cart price
  const lipaPolepoleUpfront = (totalPrice * 0.8).toFixed(2);
  const lipaPolepoleBalance = (totalPrice * 0.2).toFixed(2);

  // Redirect to cart if it's empty when navigating to checkout
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Effect to dynamically load the PayPal SDK script
  useEffect(() => {
    const addPayPalScript = () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = PAYPAL_SDK_URL;
      script.async = true;
      script.onload = () => {
        setSdkReady(true); // Mark SDK as ready when loaded
      };
      script.onerror = () => {
        setMessage({ type: 'danger', text: 'Failed to load PayPal SDK. Please check your internet connection or client ID.' });
        setLoading(false); // Ensure loading is off if SDK fails
      };
      document.body.appendChild(script);
    };

    // Load PayPal SDK only if 'Pay Now' is selected and SDK is not already loaded
    if (paymentMethod === 'payNow' && !window.paypal) {
      addPayPalScript();
    } else if (window.paypal) {
      setSdkReady(true); // If already loaded, just set ready state
    }

    return () => {
      // Cleanup for PayPal script if needed on component unmount
      // In a real app, you might want to remove the script to prevent issues
      // with hot reloading or multiple components trying to load it.
      // However, for simple use cases, leaving it is often fine.
    };
  }, [paymentMethod]);

  // Function to render PayPal buttons using the loaded SDK
  const renderPayPalButtons = () => {
    if (!sdkReady || !window.paypal || totalPrice <= 0) {
      return <LoadingSpinner />;
    }

    const buttonContainer = document.getElementById('paypal-button-container');
    if (buttonContainer) {
      buttonContainer.innerHTML = ''; // Clear any existing buttons to prevent duplicates on re-render
    }

    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              currency_code: 'KSH',
              value: totalPrice.toFixed(2),
            },
          }],
        });
      },
      onApprove: async (data, actions) => {
        setLoading(true);
        setMessage(null);
        try {
          const orderCapture = await actions.order.capture();
          console.log('PayPal Order Captured:', orderCapture);

          await placeOrderHandler(null, 'PayPal', orderCapture.id); 
          // After placeOrderHandler, the cart is cleared and a success message is set.
          // No navigation to order confirmation page in this version.

        } catch (error) {
          console.error("PayPal capture error or order placement failed:", error);
          setMessage({ type: 'danger', text: 'PayPal payment failed or order could not be placed in our system.' });
        } finally {
          setLoading(false);
        }
      },
      onError: (err) => {
        console.error("PayPal Error:", err);
        setMessage({ type: 'danger', text: 'An error occurred with PayPal payment. Please try again.' });
        setLoading(false);
      },
      onCancel: (data) => {
        setMessage({ type: 'info', text: 'PayPal payment cancelled by user.' });
      }
    }).render('#paypal-button-container'); // Render the button into the specific container div
  };

  // Re-render PayPal buttons when SDK is ready, payment method is 'payNow', or total price changes
  useEffect(() => {
    if (sdkReady && paymentMethod === 'payNow' && totalPrice > 0) {
      renderPayPalButtons();
    }
  }, [sdkReady, paymentMethod, totalPrice]); // Depend on relevant states

  // Function to initiate M-Pesa STK Push
  const initiateMpesaPayment = async (amount, isLipaPolepole = false) => {
    setLoading(true);
    setMessage(null);

    // Validate M-Pesa phone number format
    if (!mpesaPhoneNumber.trim() || !/^(?:254|\+254|0)?(7\d{8}|1\d{8})$/.test(mpesaPhoneNumber)) {
      setMessage({ type: 'danger', text: 'Please enter a valid M-Pesa phone number (e.g., 0712345678 or 254712345678).' });
      setLoading(false);
      return;
    }
    // Validate customer contact info
    if (!customerName.trim() || !customerEmail.trim()) {
        setMessage({type: 'danger', text: 'Please fill in your Name and Email for contact information.'});
        setLoading(false);
        return;
    }

    // Normalize phone number to 254 format for Daraja API
    let formattedPhoneNumber = mpesaPhoneNumber.trim();
    if (formattedPhoneNumber.startsWith('0')) {
      formattedPhoneNumber = '254' + formattedPhoneNumber.substring(1);
    } else if (formattedPhoneNumber.startsWith('+')) {
      formattedPhoneNumber = formattedPhoneNumber.substring(1);
    }

    try {
      // Make an API call to your backend for Daraja STK Push initiation
      console.log(`Initiating M-Pesa STK Push for KSh ${amount} to ${formattedPhoneNumber}`);
      console.log(`Lipa Polepole option: ${isLipaPolepole}`);

      const response = await fetch('http://localhost:5000/api/payments/mpesa/stkpush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount), // Ensure amount is a number
          phoneNumber: formattedPhoneNumber,
          orderId: 'frontend_temp_order_id_' + Date.now(), // Temporary ID for tracking
          isLipaPolepole: isLipaPolepole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'M-Pesa payment initiation failed.');
      }

      const data = await response.json();
      setMessage({ type: 'info', text: data.message || 'M-Pesa STK Push initiated. Please enter your M-Pesa PIN on your phone to complete the transaction.' });

      // After simulated M-Pesa success (STK Push initiated), proceed to place the order.
      // In a robust production system, the order would only be finalized after a successful M-Pesa callback (webhook) from Daraja.
      await placeOrderHandler(null, 'Mpesa', data.CheckoutRequestID || 'MPESA_TXN_ID_PENDING'); // Pass Daraja CheckoutRequestID

    } catch (error) {
      console.error('M-Pesa payment error:', error);
      setMessage({ type: 'danger', text: error.message || 'Failed to initiate M-Pesa payment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Main handler for placing the order in your database
  const placeOrderHandler = async (e, paymentGatewayType = null, paymentGatewayTxnId = null) => {
    if (e) e.preventDefault(); // Prevent default form submission if called by a button with type="submit"
    setLoading(true);
    setMessage(null);

    // Validate customer contact information
    if (!customerName.trim() || !customerEmail.trim()) {
        setMessage({type: 'danger', text: 'Please fill in your Name and Email for contact information.'});
        setLoading(false);
        return;
    }

    // Validate delivery address if 'delivery' option is selected
    if (deliveryOption === 'delivery' && !deliveryAddress.trim()) {
      setMessage({ type: 'danger', text: 'Please enter your delivery address.' });
      setLoading(false);
      return;
    }
    
    // Ensure payment method specific validations are handled (e.g., payment completed for 'payNow')
    if (paymentMethod !== 'payOnDelivery' && !paymentGatewayTxnId) {
        setMessage({ type: 'danger', text: 'Please complete the payment using the selected payment method first.' });
        setLoading(false);
        return;
    }

    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item._id, // Send product ID
          name: item.name,
          imageUrl: item.imageUrl,
          price: item.price,
          qty: item.qty,
        })),
        customerInfo: { // Add customer information to the order payload
            name: customerName.trim(),
            email: customerEmail.trim(),
        },
        deliveryInfo: {
          option: deliveryOption,
          address: deliveryOption === 'delivery' ? deliveryAddress.trim() : 'T-Mall Nairobi Pickup',
        },
        paymentMethod,
        itemsPrice: totalPrice,
        totalPrice: totalPrice,
        isPaid: paymentMethod !== 'payOnDelivery', // Mark as paid if not Cash on Delivery
        paidAt: paymentMethod !== 'payOnDelivery' ? new Date().toISOString() : null, // Set paid date if not COD
        paymentResult: paymentGatewayTxnId ? { // Store payment gateway transaction details
          id: paymentGatewayTxnId,
          status: 'COMPLETED', // Or 'PENDING' for Daraja STK until webhook is received
          update_time: new Date().toISOString(),
          payerInfo: paymentGatewayType === 'PayPal' ? customerEmail.trim() : mpesaPhoneNumber.trim(), // Use customer's email or mpesa phone
          paymentGateway: paymentGatewayType
        } : null,
        // Set initial payment status and balance for Lipa Polepole
        paymentStatus: paymentMethod === 'lipaPolepole' ? 'partially_paid' : (paymentMethod === 'payOnDelivery' ? 'pending' : 'paid'),
        balanceDue: paymentMethod === 'lipaPolepole' ? Number(lipaPolepoleBalance) : 0,
      };

      // Send order data to your backend API
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend order creation error details:", errorData); // Log error details from backend
        throw new Error(errorData.message || 'Failed to place order.');
      }

      const data = await response.json(); // Get the created order data from the backend
      console.log("Order placed successfully. Backend response data:", data); // Log the full response data
      
      // Removed: navigate(`/order-confirmation/${data._id}`); // No redirection to confirmation page in this version
      setMessage({ type: 'success', text: `Order placed successfully! Order ID: ${data._id}. Your cart has been cleared.` });
      dispatch({ type: CART_ACTIONS.CLEAR_CART }); // Clear cart after successful order


    } catch (error) {
      console.error('Order placement error:', error);
      setMessage({ type: 'danger', text: error.message || 'An error occurred during order placement. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Helper boolean for button disabled state to improve readability and potentially parsing
  const isPlaceOrderButtonDisabled = 
    loading ||
    cartItems.length === 0 ||
    !customerName.trim() || !customerEmail.trim() || 
    (deliveryOption === 'delivery' && !deliveryAddress.trim()) ||
    (paymentMethod === 'payNow' && !sdkReady && totalPrice > 0) ||
    (paymentMethod === 'payNow' && totalPrice > 0 && !message?.text?.includes('PayPal payment successful') && !message?.text?.includes('M-Pesa STK Push initiated')) ||
    (paymentMethod === 'lipaPolepole' && !message?.text?.includes('M-Pesa STK Push initiated'));


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

      {message && <MessageBox variant={message.type}>{message.text}</MessageBox>}
      {loading && <LoadingSpinner />}

      <form onSubmit={paymentMethod === 'payOnDelivery' ? placeOrderHandler : (e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Order Summary Section */}
        <div style={{ border: '1px solid #D1D5DB', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: '#F9FAFB' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1F2937' }}>Order Summary</h2>
          <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Items ({cartItems.length}):</span>
            <span style={{ fontWeight: '600' }}>KSh {totalPrice.toLocaleString()}</span>
          </p>
          <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.25rem', borderTop: '1px dashed #D1D5DB', paddingTop: '1rem', marginTop: '1rem' }}>
            <span>Total:</span>
            <span>KSh {totalPrice.toLocaleString()}</span>
          </p>
        </div>

        {/* Customer Information Section */}
        <div style={{ border: '1px solid #D1D5DB', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: '#F9FAFB' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1F2937' }}>Your Contact Information</h2>
            <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="customerName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Full Name:
                </label>
                <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Full Name"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB' }}
                    required
                />
            </div>
            <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="customerEmail" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Email Address:
                </label>
                <input
                    type="email"
                    id="customerEmail"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB' }}
                    required
                />
            </div>
            {/* Password field is omitted for security. For user accounts, this would be handled in a separate registration/login flow. */}
        </div>


        {/* Delivery Options Section */}
        <div style={{ border: '1px solid #D1D5DB', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: '#F9FAFB' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1F2937' }}>Delivery Options</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              <input
                type="radio"
                name="delivery"
                value="pickup"
                checked={deliveryOption === 'pickup'}
                onChange={(e) => setDeliveryOption(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              Pickup from T-Mall Nairobi
            </label>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginLeft: '1.5rem' }}>
              Collect your order directly from our shop at T-Mall, Nairobi. This option is free.
            </p>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              <input
                type="radio"
                name="delivery"
                value="delivery"
                checked={deliveryOption === 'delivery'}
                onChange={(e) => setDeliveryOption(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              Direct Delivery to your Address
            </label>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginLeft: '1.5rem' }}>
              Get your order delivered directly to your specified address. Delivery charges may apply.
            </p>
            {deliveryOption === 'delivery' && (
              <div style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                <label htmlFor="deliveryAddress" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Your Delivery Address:
                </label>
                <textarea
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g., House No., Street, Estate, City, Landmarks..."
                  rows="3"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB', resize: 'vertical' }}
                  required={deliveryOption === 'delivery'}
                ></textarea>
              </div>
            )}
          </div>
        </div>

        {/* Payment Options Section */}
        <div style={{ border: '1px solid #D1D5DB', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: '#F9FAFB' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1F2937' }}>Payment Method</h2>

          {/* Pay Now Option (PayPal / M-Pesa Daraja) */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              <input
                type="radio"
                name="payment"
                value="payNow"
                checked={paymentMethod === 'payNow'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              Pay Now (PayPal / M-Pesa Daraja)
            </label>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginLeft: '1.5rem' }}>
              Make a full payment immediately using secure PayPal or Safaricom M-Pesa (Daraja API).
            </p>
            {paymentMethod === 'payNow' && (
              <div style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                {/* PayPal Button Container */}
                <div id="paypal-button-container" style={{ marginBottom: '1rem' }}>
                  {!sdkReady ? <LoadingSpinner /> : null}
                </div>

                {/* M-Pesa Daraja Form (Pay Now) */}
                <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '1rem', marginTop: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>Pay with M-Pesa (Daraja)</h3>
                  <label htmlFor="mpesaPhonePayNow" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    M-Pesa Phone Number:
                  </label>
                  <input
                    type="text"
                    id="mpesaPhonePayNow"
                    value={mpesaPhoneNumber}
                    onChange={(e) => setMpesaPhoneNumber(e.target.value)}
                    placeholder="e.g., 0712345678 or 254712345678"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB', marginBottom: '1rem' }}
                  />
                  <button
                    type="button" // Important: Use type="button" to prevent form submission
                    onClick={() => initiateMpesaPayment(totalPrice, false)} // False for not Lipa Polepole
                    className="button-primary"
                    disabled={loading || !mpesaPhoneNumber.trim() || totalPrice <= 0 || !customerName.trim() || !customerEmail.trim()}
                    style={{ width: '100%' }}
                  >
                    Pay KSh {totalPrice.toLocaleString()} with M-Pesa
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pay on Delivery Option */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              <input
                type="radio"
                name="payment"
                value="payOnDelivery"
                checked={paymentMethod === 'payOnDelivery'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              Pay on Delivery
            </label>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginLeft: '1.5rem' }}>
              Pay for your order in cash or mobile money (M-Pesa) when you receive it.
            </p>
          </div>

          {/* Lipa Polepole Option */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              <input
                type="radio"
                name="payment"
                value="lipaPolepole"
                checked={paymentMethod === 'lipaPolepole'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              Lipa Polepole (Pay Later - M-Pesa Daraja)
            </label>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginLeft: '1.5rem' }}>
              Pay 80% (KSh {lipaPolepoleUpfront.toLocaleString()}) upfront via M-Pesa Daraja, and clear the remaining balance (KSh {lipaPolepoleBalance.toLocaleString()}) within 2 weeks.
            </p>
            {paymentMethod === 'lipaPolepole' && (
              <div style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>M-Pesa for Upfront Payment</h3>
                <label htmlFor="mpesaPhoneLipaPolepole" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  M-Pesa Phone Number:
                </label>
                <input
                  type="text"
                  id="mpesaPhoneLipaPolepole"
                  value={mpesaPhoneNumber}
                  onChange={(e) => setMpesaPhoneNumber(e.target.value)}
                  placeholder="e.g., 0712345678 or 254712345678"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB', marginBottom: '1rem' }}
                />
                <button
                  type="button" // Important: Use type="button" to prevent form submission
                  onClick={() => initiateMpesaPayment(lipaPolepoleUpfront, true)} // True for Lipa Polepole
                  className="button-primary"
                  disabled={loading || !mpesaPhoneNumber.trim() || Number(lipaPolepoleUpfront) <= 0 || !customerName.trim() || !customerEmail.trim()}
                  style={{ width: '100%' }}
                >
                  Pay KSh {lipaPolepoleUpfront.toLocaleString()} Upfront with M-Pesa
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Final Place Order Button */}
        <button
          type={paymentMethod === 'payOnDelivery' ? 'submit' : 'button'}
          onClick={paymentMethod === 'payOnDelivery' ? placeOrderHandler : null}
          className="button-primary"
          disabled={
            loading ||
            cartItems.length === 0 ||
            !customerName.trim() || !customerEmail.trim() || // Require customer info
            (deliveryOption === 'delivery' && !deliveryAddress.trim()) ||
            (paymentMethod === 'payNow' && !sdkReady && totalPrice > 0) ||
            (paymentMethod !== 'payOnDelivery' && !message?.text?.includes('M-Pesa STK Push initiated') && !message?.text?.includes('Payment successful'))
          }
        >
          {loading ? 'Processing...' :
           paymentMethod === 'payOnDelivery' ? 'Place Order (Pay on Delivery)' :
           (paymentMethod === 'payNow' || paymentMethod === 'lipaPolepole') && (message?.text?.includes('M-Pesa STK Push initiated') || message?.text?.includes('Payment successful')) ? 'Finalize Order' :
           'Place Order'}
        </button>
      </form>
    </div>
  );
}

export default CheckoutPage;
