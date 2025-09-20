
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowRight, Truck, Shield, CreditCard, Headphones } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

const Index = () => {
  const { addToCart } = useCart();

  const featuredProducts = [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      price: 129.99,
      originalPrice: 179.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 2847,
      badge: 'Best Seller'
    },
    {
      id: '2',
      name: 'Smart Fitness Watch',
      price: 299.99,
      originalPrice: 399.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      rating: 4.6,
      reviews: 1923,
      badge: 'Featured'
    },
    {
      id: '3',
      name: 'Professional Laptop Backpack',
      price: 89.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      rating: 4.7,
      reviews: 856,
      badge: 'Sale'
    },
    {
      id: '4',
      name: 'Portable Bluetooth Speaker',
      price: 79.99,
      originalPrice: 99.99,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
      rating: 4.5,
      reviews: 1247,
      badge: 'New'
    }
  ];

  const categories = [
    {
      name: 'Electronics',
      image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300&h=200&fit=crop',
      path: '/products/electronics'
    },
    {
      name: 'Fashion',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop',
      path: '/products/clothing'
    },
    {
      name: 'Home & Garden',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
      path: '/products/home-garden'
    },
    {
      name: 'Sports',
      image: 'https://images.unsplash.com/photo-1571019613914-85e30c978df2?w=300&h=200&fit=crop',
      path: '/products/sports'
    }
  ];

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50'
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% secure payment processing'
    },
    {
      icon: CreditCard,
      title: 'Easy Returns',
      description: '30-day return policy'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer service'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Discover Amazing
                <span className="block text-yellow-300">Products</span>
              </h1>
              <p className="text-xl text-blue-100">
                Shop the latest trends with unbeatable prices and fast, free shipping.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
                  <Link to="/products" className="flex items-center">
                    Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop"
                alt="Shopping"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600">Explore our wide range of product categories</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <Link to={category.path}>
                  <CardContent className="p-0">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-center group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Discover our most popular items</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform"
                    />
                    <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                      {product.badge}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      <Link to={`/product/${product.id}`}>{product.name}</Link>
                    </h3>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-1">
                        ({product.reviews})
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900">
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image
                      })}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link to="/products">
                View All Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
          <p className="text-xl mb-8 text-blue-100">
            Subscribe to our newsletter for exclusive deals and new product updates
          </p>
          <div className="max-w-md mx-auto flex space-x-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
