
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Truck, Shield, RefreshCw, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Mock product data
  const product = {
    id: id || '1',
    name: 'Wireless Bluetooth Headphones Premium',
    price: 129.99,
    originalPrice: 179.99,
    rating: 4.8,
    reviews: 2847,
    inStock: true,
    sku: 'WBH-001',
    brand: 'AudioTech',
    description: 'Experience premium sound quality with our advanced wireless Bluetooth headphones. Featuring active noise cancellation, 30-hour battery life, and comfortable over-ear design.',
    features: [
      'Active Noise Cancellation',
      '30-hour battery life',
      'Quick charge: 5 min = 2 hours playback',
      'Premium comfort ear cushions',
      'High-resolution audio support',
      'Built-in voice assistant'
    ],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&h=600&fit=crop'
    ],
    sizes: ['One Size'],
    colors: ['Black', 'White', 'Silver', 'Rose Gold'],
    specifications: {
      'Driver Size': '40mm',
      'Frequency Response': '20Hz - 20kHz',
      'Impedance': '32 Ohm',
      'Battery Life': '30 hours',
      'Charging Time': '2 hours',
      'Bluetooth Version': '5.0',
      'Weight': '250g'
    }
  };

  const reviews = [
    {
      id: 1,
      user: 'Sarah M.',
      rating: 5,
      date: '2024-01-15',
      title: 'Excellent sound quality!',
      comment: 'These headphones exceeded my expectations. The noise cancellation is fantastic and the battery life is as advertised.'
    },
    {
      id: 2,
      user: 'Mike R.',
      rating: 4,
      date: '2024-01-10',
      title: 'Great value for money',
      comment: 'Very comfortable to wear for long periods. Sound quality is great, though I wish the bass was a bit stronger.'
    },
    {
      id: 3,
      user: 'Lisa K.',
      rating: 5,
      date: '2024-01-05',
      title: 'Perfect for travel',
      comment: 'The noise cancellation makes flights so much better. Highly recommend for frequent travelers.'
    }
  ];

  const relatedProducts = [
    {
      id: '2',
      name: 'Wireless Earbuds Pro',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop',
      rating: 4.6
    },
    {
      id: '3',
      name: 'Bluetooth Speaker',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop',
      rating: 4.5
    },
    {
      id: '4',
      name: 'Audio Cable Premium',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop',
      rating: 4.3
    },
    {
      id: '5',
      name: 'Headphone Stand',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop',
      rating: 4.7
    }
  ];

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      quantity
    });
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted 
        ? "Item has been removed from your wishlist."
        : "Item has been added to your wishlist."
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products/electronics" className="hover:text-blue-600">Electronics</Link>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600">by {product.brand} • SKU: {product.sku}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">{product.rating}</span>
              <span className="text-gray-600">({product.reviews} reviews)</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                  <Badge className="bg-red-500 hover:bg-red-600">
                    Save ${(product.originalPrice - product.price).toFixed(2)}
                  </Badge>
                </>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div>
                <Label className="text-base font-semibold mb-3 block">Color</Label>
                <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                  <div className="flex space-x-3">
                    {product.colors.map((color) => (
                      <div key={color} className="flex items-center space-x-2">
                        <RadioGroupItem value={color} id={color} />
                        <Label htmlFor={color} className="cursor-pointer">{color}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes.length > 1 && (
              <div>
                <Label className="text-base font-semibold mb-3 block">Size</Label>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                  <div className="flex space-x-3">
                    {product.sizes.map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <RadioGroupItem value={size} id={size} />
                        <Label htmlFor={size} className="cursor-pointer">{size}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Quantity */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Quantity</Label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleWishlist}
                  className={isWishlisted ? 'text-red-600 border-red-600' : ''}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>
              <Button variant="outline" size="lg" className="w-full">
                Buy Now
              </Button>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-green-600" />
                <span className="text-sm">Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm">2-year warranty included</span>
              </div>
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-purple-600" />
                <span className="text-sm">30-day return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="features" className="mb-12">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Product Features</h3>
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                      <span className="font-medium">{key}:</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Customer Reviews</h3>
                  <Button variant="outline">Write a Review</Button>
                </div>
                
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{review.user}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-600">{review.date}</span>
                      </div>
                      <h4 className="font-medium mb-2">{review.title}</h4>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Shipping & Returns</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Shipping Options</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Standard Shipping (5-7 business days): FREE on orders over $50</li>
                      <li>• Express Shipping (2-3 business days): $14.99</li>
                      <li>• Overnight Shipping (1 business day): $29.99</li>
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Return Policy</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• 30-day return window from delivery date</li>
                      <li>• Items must be in original condition with all packaging</li>
                      <li>• Free return shipping for defective items</li>
                      <li>• Refunds processed within 5-7 business days</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                      <Link to={`/product/${relatedProduct.id}`}>{relatedProduct.name}</Link>
                    </h3>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(relatedProduct.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        ${relatedProduct.price}
                      </span>
                      <Button size="sm">Add to Cart</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
