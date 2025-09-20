import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { state: cartState, clearCart } = useCart();
  const { user, addOrder } = useUser();
  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [useShippingForBilling, setUseShippingForBilling] = useState(true);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.addresses?.[0]?.firstName || '',
    lastName: user?.addresses?.[0]?.lastName || '',
    email: user?.email || '',
    phone: '',
    street: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || '',
    zipCode: user?.addresses?.[0]?.zipCode || '',
    country: user?.addresses?.[0]?.country || 'US'
  });

  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });

  const shippingOptions = [
    { id: 'standard', name: 'Standard Shipping', time: '5-7 business days', price: 0 },
    { id: 'express', name: 'Express Shipping', time: '2-3 business days', price: 14.99 },
    { id: 'overnight', name: 'Overnight Shipping', time: '1 business day', price: 29.99 }
  ];

  const selectedShipping = shippingOptions.find(option => option.id === shippingMethod);
  const subtotal = cartState.total;
  const shippingCost = selectedShipping?.price || 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handlePlaceOrder = () => {
    // Validate required fields
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || !shippingInfo.street) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required shipping information.",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === 'card' && (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv)) {
      toast({
        title: "Missing Payment Information",
        description: "Please fill in all payment details.",
        variant: "destructive"
      });
      return;
    }

    // Create order
    const newOrder = {
      status: 'processing' as const,
      total,
      items: cartState.items,
      trackingNumber: `TRK${Date.now()}`,
      estimatedDelivery: new Date(Date.now() + (selectedShipping?.time.includes('1') ? 1 : selectedShipping?.time.includes('2-3') ? 3 : 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    addOrder(newOrder);
    clearCart();
    
    toast({
      title: "Order Placed Successfully!",
      description: `Your order #${newOrder.trackingNumber} has been placed.`
    });

    navigate('/orders');
  };

  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-lg text-gray-600 mb-4">Your cart is empty</p>
          <Button asChild>
            <Link to="/products">Continue Shopping</Link>
          </Button>
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
          <Link to="/cart" className="hover:text-blue-600">Cart</Link>
          <span className="mx-2">/</span>
          <span>Checkout</span>
        </nav>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { num: 1, title: 'Shipping' },
              { num: 2, title: 'Payment' },
              { num: 3, title: 'Review' }
            ].map((stepItem) => (
              <div key={stepItem.num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepItem.num ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {stepItem.num}
                </div>
                <span className={`ml-2 text-sm ${step >= stepItem.num ? 'text-blue-600' : 'text-gray-600'}`}>
                  {stepItem.title}
                </span>
                {stepItem.num < 3 && <div className="w-12 h-px bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      value={shippingInfo.street}
                      onChange={(e) => setShippingInfo({...shippingInfo, street: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div>
                    <Label className="text-base font-semibold">Shipping Method</Label>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="mt-3">
                      {shippingOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <div className="flex-1">
                            <Label htmlFor={option.id} className="font-medium cursor-pointer">
                              {option.name}
                            </Label>
                            <p className="text-sm text-gray-600">{option.time}</p>
                          </div>
                          <span className="font-semibold">
                            {option.price === 0 ? 'FREE' : `$${option.price.toFixed(2)}`}
                          </span>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Button onClick={() => setStep(2)} className="w-full">
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="card">Credit Card</TabsTrigger>
                      <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="card" className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={paymentInfo.expiryDate}
                            onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={paymentInfo.cvv}
                            onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="nameOnCard">Name on Card *</Label>
                        <Input
                          id="nameOnCard"
                          value={paymentInfo.nameOnCard}
                          onChange={(e) => setPaymentInfo({...paymentInfo, nameOnCard: e.target.value})}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="paypal">
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">You will be redirected to PayPal to complete your payment.</p>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-700">
                            Click "Continue to Review" to proceed with PayPal payment.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Billing Address - THIS IS THE PART THAT NEEDS TO BE FIXED */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="useShippingForBilling"
                        checked={useShippingForBilling}
                        onCheckedChange={(checked) => setUseShippingForBilling(checked === true)}
                      />
                      <Label htmlFor="useShippingForBilling">
                        Use shipping address for billing
                      </Label>
                    </div>

                    {!useShippingForBilling && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold">Billing Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingFirstName">First Name</Label>
                            <Input
                              id="billingFirstName"
                              value={billingInfo.firstName}
                              onChange={(e) => setBillingInfo({...billingInfo, firstName: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingLastName">Last Name</Label>
                            <Input
                              id="billingLastName"
                              value={billingInfo.lastName}
                              onChange={(e) => setBillingInfo({...billingInfo, lastName: e.target.value})}
                            />
                          </div>
                        </div>
                        {/* Add more billing fields as needed */}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Shipping
                    </Button>
                    <Button onClick={() => setStep(3)} className="flex-1">
                      Continue to Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Review Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {cartState.items.map((item) => (
                        <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div>
                    <h3 className="font-semibold mb-3">Shipping Address</h3>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                      <p>{shippingInfo.street}</p>
                      <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                      <p>{shippingInfo.email}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div>
                    <h3 className="font-semibold mb-3">Payment Method</h3>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {paymentMethod === 'card' ? (
                        <p>Credit Card ending in {paymentInfo.cardNumber.slice(-4)}</p>
                      ) : (
                        <p>PayPal</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Payment
                    </Button>
                    <Button onClick={handlePlaceOrder} className="flex-1 bg-green-600 hover:bg-green-700">
                      Place Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartState.items.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping ({selectedShipping?.name})</span>
                  <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Lock className="h-3 w-3 mr-1" />
                    <span>Secure SSL encryption</span>
                  </div>
                  <div>30-day return policy</div>
                  <div>Free shipping on orders over $50</div>
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

export default Checkout;
