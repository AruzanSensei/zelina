
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => 
        item.id === action.payload.id && 
        item.size === action.payload.size && 
        item.color === action.payload.color
      );
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === existingItem.id && item.size === existingItem.size && item.color === existingItem.color
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        );
        return calculateTotals(updatedItems);
      } else {
        const newItem = { ...action.payload, quantity: action.payload.quantity || 1 };
        return calculateTotals([...state.items, newItem]);
      }
    }
    case 'REMOVE_ITEM':
      return calculateTotals(state.items.filter(item => item.id !== action.payload));
    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      return calculateTotals(updatedItems);
    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 };
    case 'LOAD_CART':
      return action.payload;
    default:
      return state;
  }
};

const calculateTotals = (items: CartItem[]): CartState => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { items, total, itemCount };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, itemCount: 0 });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ state, dispatch, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
