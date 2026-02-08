"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";

// Types for database-driven cart
interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  customizations?: any;
  menuItem: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
  };
}

interface Cart {
  id?: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

interface CartState {
  cart: Cart;
  loading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  cart: { items: [], total: 0, itemCount: 0 },
  loading: false,
  error: null,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, error: null };
    case 'ADD_ITEM':
      const existingItemIndex = state.cart.items.findIndex(
        item => item.menuItemId === action.payload.menuItemId
      );
      let newItems;
      if (existingItemIndex >= 0) {
        newItems = [...state.cart.items];
        newItems[existingItemIndex] = action.payload;
      } else {
        newItems = [...state.cart.items, action.payload];
      }
      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          total: newItems.reduce((sum, item) => sum + item.totalPrice, 0),
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        },
        error: null,
      };
    case 'UPDATE_ITEM':
      const updatedItems = state.cart.items.map(item =>
        item.id === action.payload.id ? action.payload : item
      );
      return {
        ...state,
        cart: {
          ...state.cart,
        items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        },
        error: null,
      };
    case 'REMOVE_ITEM':
      const filteredItems = state.cart.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        cart: {
          ...state.cart,
          items: filteredItems,
          total: filteredItems.reduce((sum, item) => sum + item.totalPrice, 0),
          itemCount: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
        },
        error: null,
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cart: { items: [], total: 0, itemCount: 0 },
        error: null,
      };
    default:
      return state;
  }
};

interface CartContextType {
  cart: Cart;
  loading: boolean;
  error: string | null;
  addToCart: (menuItemId: string, quantity: number, specialInstructions?: string, customizations?: any) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number, specialInstructions?: string, customizations?: any) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  updateCart: (cartData: Cart) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Generate or get session ID for guest users
  const getSessionId = (): string => {
    if (typeof window === 'undefined') return '';
    
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  };

  // Save cart to localStorage
  const saveCartToStorage = (cart: Cart) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart_data', JSON.stringify(cart));
    }
  };

  // Load cart from localStorage
  const loadCartFromStorage = (): Cart => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart_data');
      if (savedCart) {
        try {
          return JSON.parse(savedCart);
        } catch (error) {
          console.error('Error parsing saved cart:', error);
        }
      }
    }
    return { items: [], total: 0, itemCount: 0 };
  };

  // Fetch cart from localStorage (temporary solution while DB is down)
  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // For now, use localStorage instead of API
      const cartData = loadCartFromStorage();
      dispatch({ type: 'SET_CART', payload: cartData });
      
      // TODO: Uncomment when database is connected
      // const sessionId = getSessionId();
      // const response = await fetch(`/api/cart?sessionId=${sessionId}`);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch cart');
      // }
      // const cartData = await response.json();
      // dispatch({ type: 'SET_CART', payload: cartData });
    } catch (error) {
      console.error('Error fetching cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Update cart directly (for reorder functionality)
  const updateCart = (cartData: Cart) => {
    dispatch({ type: 'SET_CART', payload: cartData });
    saveCartToStorage(cartData);
  };

  // Add item to cart (local storage version)
  const addToCart = async (
    menuItemId: string,
    quantity: number,
    specialInstructions?: string,
    customizations?: any
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Use static menu data instead of API call for consistency
      const { getAllMenuItems } = await import('@/lib/menu');
      const menuItems = getAllMenuItems();
      const menuItem = menuItems.find(item => item.id === menuItemId);
      
      if (!menuItem) {
        throw new Error('Menu item not found');
      }

      const unitPrice = menuItem.price;
      const totalPrice = unitPrice * quantity;
      const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newItem: CartItem = {
        id: itemId,
        menuItemId,
        quantity,
        unitPrice,
        totalPrice,
        specialInstructions,
        customizations,
        menuItem: {
          id: menuItem.id,
          name: menuItem.name,
          description: menuItem.description,
          price: menuItem.price,
          image: menuItem.image
        }
      };

      // Update cart state
      const currentCart = state.cart;
      const existingItemIndex = currentCart.items.findIndex(
        item => item.menuItemId === menuItemId
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        updatedItems = [...currentCart.items];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + quantity,
          totalPrice: unitPrice * (existingItem.quantity + quantity),
          specialInstructions,
          customizations
        };
      } else {
        updatedItems = [...currentCart.items, newItem];
      }

      const updatedCart = {
        ...currentCart,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      };

      dispatch({ type: 'SET_CART', payload: updatedCart });
      saveCartToStorage(updatedCart);

      // TODO: Uncomment when database is connected
      // const sessionId = getSessionId();
      // const response = await fetch('/api/cart', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     menuItemId,
      //     quantity,
      //     sessionId,
      //     specialInstructions,
      //     customizations,
      //   }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || 'Failed to add item to cart');
      // }

      // const data = await response.json();
      // dispatch({ type: 'SET_CART', payload: data.cart });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add item to cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Update cart item (local storage version)
  const updateCartItem = async (
    itemId: string,
    quantity: number,
    specialInstructions?: string,
    customizations?: any
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const currentCart = state.cart;
      const updatedItems = currentCart.items.map(item =>
        item.id === itemId 
          ? { 
              ...item, 
              quantity, 
              totalPrice: item.unitPrice * quantity,
              specialInstructions,
              customizations
            }
          : item
      );

      const updatedCart = {
        ...currentCart,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      };

      dispatch({ type: 'SET_CART', payload: updatedCart });
      saveCartToStorage(updatedCart);

      // TODO: Uncomment when database is connected
      // const response = await fetch(`/api/cart/${itemId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     quantity,
      //     specialInstructions,
      //     customizations,
      //   }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || 'Failed to update cart item');
      // }

      // const data = await response.json();
      // dispatch({ type: 'SET_CART', payload: data.cart });
    } catch (error) {
      console.error('Error updating cart item:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update cart item' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Remove item from cart (local storage version)
  const removeFromCart = async (itemId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const currentCart = state.cart;
      const filteredItems = currentCart.items.filter(item => item.id !== itemId);

      const updatedCart = {
        ...currentCart,
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + item.totalPrice, 0),
        itemCount: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
      };

      dispatch({ type: 'SET_CART', payload: updatedCart });
      saveCartToStorage(updatedCart);

      // TODO: Uncomment when database is connected
      // const response = await fetch(`/api/cart/${itemId}`, {
      //   method: 'DELETE',
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || 'Failed to remove item from cart');
      // }

      // const data = await response.json();
      // dispatch({ type: 'SET_CART', payload: data.cart });
    } catch (error) {
      console.error('Error removing item from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to remove item from cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Clear cart (local storage version)
  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const emptyCart = { items: [], total: 0, itemCount: 0 };
      dispatch({ type: 'CLEAR_CART' });
      saveCartToStorage(emptyCart);
      
      // TODO: Uncomment when database is connected
      // Just clear the local state; backend already deletes items after order
      // dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fetch cart on mount
  useEffect(() => {
    fetchCart().catch((error) => {
      console.error('Failed to fetch cart on mount:', error);
    });
  }, []);

  const value: CartContextType = {
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    updateCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 