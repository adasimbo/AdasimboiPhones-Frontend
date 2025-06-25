// adasimbo-iphones-frontend/src/pages/ContactPage/ContactPage.jsx
import React from 'react';

function ContactPage() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      paddingTop: '6rem', // Adjust for fixed header
      minHeight: 'calc(100vh - 8rem)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
      color: '#374151',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '1.5rem', color: '#1F2937' }}>
        Contact Adasimbo iPhones
      </h1>

      <p style={{ fontSize: '1.125rem', marginBottom: '2rem', lineHeight: '1.6' }}>
        Have questions about our products, an existing order, or anything else? We're here to help!
        Reach out to us through the following channels, and we'll get back to you as quickly as possible.
        Your satisfaction is our priority, and we pride ourselves on being highly reliable in answering your messages.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Email */}
        <div style={{ border: '1px solid #D1D5DB', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: '#F9FAFB' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1F2937' }}>Email Us</h2>
          <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2563EB' }}>
            <a href="mailto:adasimboroyalty@gmail.com" style={{ textDecoration: 'none' }}>adasimboroyalty@gmail.com</a>
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>
            We typically respond to emails within 24 business hours.
          </p>
        </div>

        {/* Phone Numbers */}
        <div style={{ border: '1px solid #D1D5DB', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: '#F9FAFB' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1F2937' }}>Call Us</h2>
          <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2563EB' }}>
            <a href="tel:+254746796417" style={{ textDecoration: 'none' }}>+254 746 796 417</a>
          </p>
          <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2563EB' }}>
            <a href="tel:+254113278469" style={{ textDecoration: 'none' }}>+254 113 278 469</a>
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>
            Available during business hours (Mon-Sat, 9 AM - 5 PM EAT).
          </p>
        </div>

        {/* Location */}
        <div style={{ border: '1px solid #D1D5DB', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: '#F9FAFB' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1F2937' }}>Our Location</h2>
          <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            T-Mall Nairobi
          </p>
          <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#4B5563' }}>
            Postal Code: 61877
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>
            Feel free to visit us during our business hours.
          </p>
        </div>
      </div>

      <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
        We are dedicated to providing excellent customer support. Your inquiries are important to us!
      </p>
    </div>
  );
}

export default ContactPage;
