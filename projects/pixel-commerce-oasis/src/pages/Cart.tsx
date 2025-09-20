
import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

const Cart = () => {
  const { state, updateQuantity, removeFromCart } = useCart();

  const shippingCost = state.total > 50 ? 0 : 9.99;
  const tax = state.total * 0.08;
  const finalTotal = state.total + shippingCost + tax;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button asChild size="lg">
              <Link to="/products">Start Shopping</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <span>Shopping Cart</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Shopping Cart ({state.itemCount} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          {item.size && <div>Size: {item.size}</div>}
                          {item.color && <div>Color: {item.color}</div>}
                          <div className="font-semibold text-gray-900">${item.price}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 mt-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button variant="outline" asChild>
                    <Link to="/products">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({state.itemCount} items)</span>
                  <span className="font-semibold">${state.total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>

                {state.total <= 50 && (
                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                    Add ${(50 - state.total).toFixed(2)} more for free shipping!
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>

                <Button className="w-full" size="lg" asChild>
                  <Link to="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-2">🔒</span>
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">🚚</span>
                    <span>Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">↩️</span>
                    <span>30-day return policy</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Products */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>You might also like</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      id: 'rec1',
                      name: 'Phone Case Premium',
                      price: 29.99,
                      image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=150&h=150&fit=crop'
                    },
                    {
                      id: 'rec2',
                      name: 'USB-C Cable',
                      price: 19.99,
                      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&h=150&fit=crop'
                    }
                  ].map((product) => (
                    <div key={product.id} className="flex items-center space-x-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-sm text-gray-600">${product.price}</div>
                      </div>
                      <Button size="sm" variant="outline">
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
