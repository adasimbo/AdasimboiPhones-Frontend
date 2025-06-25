// adasimbo-iphones-frontend/src/App.jsx

import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from 'react-router-dom';

import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

// Import your page components
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import ModelDetail from './pages/ModelDetail/ModelDetail';
import CartPage from './pages/CartPage/CartPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation'; // New: Import OrderConfirmation page
import ContactPage from './pages/ContactPage/ContactPage';       // New: Import ContactPage
import NotFound from './pages/NotFound/NotFound';

import { CartProvider } from './contexts/CartContext';

import './App.css'; // Your specific App-level CSS

// Define the root layout component that includes the ErrorBoundary and Layout
const Root = () => {
  return (
    <ErrorBoundary>
      <Layout>
        {/* Outlet renders the matched child route element */}
        <Outlet />
      </Layout>
    </ErrorBoundary>
  );
};

// Define your routes using createBrowserRouter
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "products/models/:baseModelName",
        element: <ModelDetail />,
      },
      {
        path: "products/:id",
        element: <ProductDetail />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "order-confirmation/:id", // New: Route for Order Confirmation page with ID param
        element: <OrderConfirmation />,
      },
      {
        path: "contact", // New: Route for Contact page
        element: <ContactPage />,
      },
      {
        path: "*",
        element: <NotFound />,
      }
    ],
  },
]);


function App() {
  return (
    // Wrap the entire application with CartProvider to make cart state available globally
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}

export default App;
