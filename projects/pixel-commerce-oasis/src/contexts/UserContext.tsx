
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  addresses: Address[];
  orders: Order[];
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: any[];
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    // Mock login - in real app this would be an API call
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      addresses: [
        {
          id: '1',
          type: 'shipping',
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
          isDefault: true
        }
      ],
      orders: [
        {
          id: 'ORD-001',
          date: '2024-01-15',
          status: 'delivered',
          total: 299.99,
          items: [],
          trackingNumber: 'TRK123456789'
        },
        {
          id: 'ORD-002',
          date: '2024-01-20',
          status: 'shipped',
          total: 159.99,
          items: [],
          trackingNumber: 'TRK987654321',
          estimatedDelivery: '2024-01-25'
        }
      ]
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  const addAddress = (address: Omit<Address, 'id'>) => {
    if (user) {
      const newAddress = { ...address, id: Date.now().toString() };
      setUser({
        ...user,
        addresses: [...user.addresses, newAddress]
      });
    }
  };

  const updateAddress = (id: string, updatedAddress: Partial<Address>) => {
    if (user) {
      setUser({
        ...user,
        addresses: user.addresses.map(addr =>
          addr.id === id ? { ...addr, ...updatedAddress } : addr
        )
      });
    }
  };

  const deleteAddress = (id: string) => {
    if (user) {
      setUser({
        ...user,
        addresses: user.addresses.filter(addr => addr.id !== id)
      });
    }
  };

  const addOrder = (order: Omit<Order, 'id' | 'date'>) => {
    if (user) {
      const newOrder = {
        ...order,
        id: `ORD-${Date.now()}`,
        date: new Date().toISOString().split('T')[0]
      };
      setUser({
        ...user,
        orders: [newOrder, ...user.orders]
      });
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      login,
      logout,
      updateUser,
      addAddress,
      updateAddress,
      deleteAddress,
      addOrder
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
