
import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/contexts/UserContext';

const OrderTracking = () => {
  const { user } = useUser();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <Clock className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const trackingSteps = [
    { id: 1, title: 'Order Placed', description: 'Order confirmed', completed: true },
    { id: 2, title: 'Processing', description: 'Preparing your items', completed: true },
    { id: 3, title: 'Shipped', description: 'Package on the way', completed: true },
    { id: 4, title: 'Delivered', description: 'Package delivered', completed: false }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-8">
              Please sign in to view your order history and track your orders.
            </p>
            <Button asChild size="lg">
              <Link to="/account">Sign In</Link>
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
          <Link to="/account" className="hover:text-blue-600">Account</Link>
          <span className="mx-2">/</span>
          <span>Order History</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {user.orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">When you place your first order, it will appear here.</p>
            <Button asChild size="lg">
              <Link to="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {user.orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span>Order #{order.id}</span>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <span className="font-semibold text-lg">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Items in this order</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.items.length > 0 ? order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Sample Product</p>
                            <p className="text-xs text-gray-600">Qty: 1</p>
                          </div>
                        </div>
                      )) : (
                        <div className="col-span-full text-center py-4 text-gray-500">
                          Order items will be shown here
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tracking Information */}
                  {order.trackingNumber && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Tracking Information</h3>
                        <div className="text-sm text-gray-600">
                          Tracking #: <span className="font-mono">{order.trackingNumber}</span>
                        </div>
                      </div>

                      {/* Tracking Steps */}
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        <div className="space-y-6">
                          {trackingSteps.map((step, index) => (
                            <div key={step.id} className="relative flex items-start">
                              <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                                step.completed 
                                  ? 'bg-blue-600 border-blue-600 text-white' 
                                  : index === trackingSteps.findIndex(s => !s.completed)
                                    ? 'bg-white border-blue-600 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-300'
                              }`}>
                                {step.completed ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <span className="text-xs font-semibold">{step.id}</span>
                                )}
                              </div>
                              <div className="ml-4">
                                <h4 className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {step.title}
                                </h4>
                                <p className={`text-sm ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.estimatedDelivery && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2 text-blue-700">
                            <MapPin className="h-4 w-4" />
                            <span className="font-medium">Estimated Delivery</span>
                          </div>
                          <p className="text-blue-600 text-sm mt-1">
                            {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Separator className="my-6" />

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                    {order.status === 'delivered' && (
                      <Button variant="outline" className="flex-1">
                        Write Review
                      </Button>
                    )}
                    {order.status === 'delivered' && (
                      <Button variant="outline" className="flex-1">
                        Reorder Items
                      </Button>
                    )}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <Button variant="outline" className="flex-1">
                        Track Package
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <Button variant="outline" disabled>Previous</Button>
                <Button variant="outline" className="bg-blue-600 text-white">1</Button>
                <Button variant="outline" disabled>Next</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default OrderTracking;
