// adasimbo-iphones-frontend/src/components/Layout/Layout.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext'; // Import useCart hook

// This is your main layout component.
// It will contain the header, main content area (where children are rendered), and footer.
function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart(); // Get total items from cart context

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header - now sticky */}
      <header className="main-header">
        <div className="navbar">
          {/* Brand Logo and Name */}
          <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
            <i className="fab fa-apple text-accent text-3xl mr-2"></i> {/* Apple icon */}
            Adasimbo<span className="accent-text">Iphones</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/products" className="nav-link">Products</Link>
            {/* Add more desktop nav links here if needed, e.g., Deals, About, Contact */}
            <Link to="/deals" className="nav-link">Deals</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </nav>

          {/* Cart Icon and Mobile Menu Toggle */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative" onClick={closeMobileMenu}>
              <i className="fas fa-shopping-cart text-xl cursor-pointer"></i>
              <span className="cart-badge">{totalItems}</span>
            </Link>
            <button className="md:hidden text-xl" onClick={toggleMobileMenu}>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div id="mobile-menu" className={`mobile-menu-overlay ${isMobileMenuOpen ? 'visible' : ''}`}>
        <div className="mobile-menu-content">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
              <i className="fab fa-apple text-accent text-3xl mr-2"></i>
              Adasimbo<span className="accent-text">Iphones</span>
            </Link>
            <button id="close-menu" className="text-2xl" onClick={closeMobileMenu}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <nav className="flex flex-col space-y-6 text-xl">
            <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
            <Link to="/products" className="nav-link" onClick={closeMobileMenu}>Products</Link>
            {/* Add more mobile nav links here */}
            <Link to="/deals" className="nav-link" onClick={closeMobileMenu}>Deals</Link>
            <Link to="/about" className="nav-link" onClick={closeMobileMenu}>About</Link>
            <Link to="/contact" className="nav-link" onClick={closeMobileMenu}>Contact</Link>
            <Link to="/cart" className="nav-link" onClick={closeMobileMenu}>Cart ({totalItems})</Link>
          </nav>

          {/* Mobile Contact Info (from your HTML) */}
          <div className="mt-12 text-gray-400">
            <h3 className="text-lg font-bold mb-4 text-white">Contact</h3>
            <div className="flex items-center mb-3">
              <i className="fas fa-phone-alt text-accent mr-3"></i>
              <span>+254 746 796 417</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-envelope text-accent mr-3"></i>
              <span>adasimboroyalty@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - children prop renders the routed page components */}
      {/* Increased padding-top to ensure content is always below the sticky header */}
      <main className="flex-grow pt-20 relative z-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <i className="fab fa-apple text-3xl text-accent"></i>
                <h3 className="text-2xl font-bold text-white">Adasimbo<span className="accent-text">Iphones</span></h3>
              </div>
              <p className="text-gray-400 mb-4">The premier destination for Apple products in Kenya.</p>
              <p className="text-gray-400">© {new Date().getFullYear()} AdasimboIphones. All rights reserved.</p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Shop</h4>
              <ul className="space-y-2">
                <li><Link to="/products/models/iPhone" className="text-gray-400 hover:text-accent transition">iPhone</Link></li>
                <li><Link to="/products/models/Samsung Galaxy S24" className="text-gray-400 hover:text-accent transition">Samsung Flagship</Link></li>
                {/* Add more shop links */}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/contact" className="text-gray-400 hover:text-accent transition">Contact Us</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-accent transition">FAQs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-accent transition">Shipping & Returns</a></li>
                <li><a href="#" className="text-gray-400 hover:text-accent transition">Warranty</a></li>
                <li><a href="#" className="text-gray-400 hover:text-accent transition">Repair Services</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-accent transition">About Us</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-accent transition">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-accent transition">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-accent transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-accent transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8">
            <p className="text-gray-400 text-center">
              AdasimboIphones is an authorized reseller of Apple products. Apple, the Apple logo, iPhone, iPad, Mac, Apple Watch, and other Apple products are trademarks of Apple Inc.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
