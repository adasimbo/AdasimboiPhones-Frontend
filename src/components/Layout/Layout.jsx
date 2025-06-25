// adasimbo-iphones-frontend/src/components/Layout/Layout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

function Layout({ children }) {
  const { totalItems } = useCart();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header className="main-header">
        <nav className="navbar">
          <a href="/" className="navbar-brand">
            Adasimbo iPhones
          </a>
          <ul className="navbar-nav">
            <li>
              <a href="/" className="nav-link">
                Home
              </a>
            </li>
            <li>
              <a href="/products" className="nav-link">
                Products
              </a>
            </li>
            {/* Cart Link */}
            <li>
              <Link to="/cart" className="nav-link" style={{ position: 'relative' }}>
                Cart
                {totalItems > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#EF4444', // Red-500
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    lineHeight: '1',
                  }}>
                    {totalItems}
                  </span>
                )}
              </Link>
            </li>
            {/* New: Contact Link */}
            <li>
              <Link to="/contact" className="nav-link">
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flexGrow: 1,
          paddingTop: '5rem',
          position: 'relative',
          zIndex: 1,
          minHeight: 'calc(100vh - 4rem)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: 'rgba(17, 24, 39, 0.7)',
          backdropFilter: 'blur(8px)',
          color: '#fff',
          padding: '1.5rem',
          textAlign: 'center',
          marginTop: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <p>&copy; {new Date().getFullYear()} Adasimbo iPhones. All rights reserved.</p>
        <p>Started in 2023 with over 55 iPhones and Flagship Samsungs sold in Kenya.</p>
      </footer>
    </div>
  );
}

export default Layout;
