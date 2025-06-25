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
import CartPage from './pages/CartPage/CartPage';       // New: Import CartPage
import CheckoutPage from './pages/CheckoutPage/CheckoutPage'; // New: Import CheckoutPage
import NotFound from './pages/NotFound/NotFound';

import { CartProvider } from './contexts/CartContext'; // New: Import CartProvider

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
        path: "cart", // Route for the Cart Page
        element: <CartPage />,
      },
      {
        path: "checkout", // New: Route for the Checkout Page
        element: <CheckoutPage />,
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
