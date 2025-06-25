// adasimbo-iphones-frontend/src/contexts/CartContext.jsx
import React, { createContext, useReducer, useEffect, useContext } from 'react';

// Define the initial state for the cart
// It tries to load cart items from localStorage, otherwise starts empty.
const initialState = {
  cartItems: JSON.parse(localStorage.getItem('cartItems')) || [],
};

// Define action types for the reducer
export const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
};

// The reducer function to manage cart state changes
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM:
      {
        const newItem = action.payload;
        const existItem = state.cartItems.find(item => item._id === newItem._id);

        if (existItem) {
          // If item already exists, update its quantity
          return {
            ...state,
            cartItems: state.cartItems.map(item =>
              item._id === existItem._id ? { ...item, qty: item.qty + newItem.qty } : item
            ),
          };
        } else {
          // If it's a new item, add it to the cart
          return {
            ...state,
            cartItems: [...state.cartItems, newItem],
          };
        }
      }
    case CART_ACTIONS.REMOVE_ITEM:
      {
        // Remove an item by its ID
        return {
          ...state,
          cartItems: state.cartItems.filter(item => item._id !== action.payload),
        };
      }
    case CART_ACTIONS.UPDATE_QUANTITY:
      {
        const { id, qty } = action.payload;
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item._id === id ? { ...item, qty: parseInt(qty) } : item
          ),
        };
      }
    case CART_ACTIONS.CLEAR_CART:
      {
        // Clear all items from the cart
        return {
          ...state,
          cartItems: [],
        };
      }
    default:
      return state;
  }
}

// Create the Cart Context
export const CartContext = createContext();

// Create the Cart Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Effect to save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  // Calculate total items and total price
  const totalItems = state.cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = state.cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => {
    return {
      cartItems: state.cartItems,
      totalItems,
      totalPrice,
      dispatch, // Expose dispatch so components can send actions
    };
  }, [state.cartItems, totalItems, totalPrice]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the Cart Context easily
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
