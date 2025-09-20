
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

const Wishlist = () => {
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      price: 129.99,
      originalPrice: 179.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 2847,
      inStock: true
    },
    {
      id: '3',
      name: 'Professional Laptop Backpack',
      price: 89.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      rating: 4.7,
      reviews: 856,
      inStock: true
    },
    {
      id: '5',
      name: 'Classic Denim Jacket',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop',
      rating: 4.4,
      reviews: 632,
      inStock: false
    }
  ]);

  const removeFromWishlist = (id: string) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist."
    });
  };

  const moveToCart = (item: any) => {
    if (item.inStock) {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image
      });
      removeFromWishlist(item.id);
      toast({
        title: "Moved to cart",
        description: `${item.name} has been moved to your cart.`
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <span>Wishlist</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">
              Save items you love by clicking the heart icon on any product.
            </p>
            <Button asChild size="lg">
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-shadow relative">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {!item.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                          <span className="text-white font-semibold">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        <Link to={`/product/${item.id}`}>{item.name}</Link>
                      </h3>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(item.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-1">
                          ({item.reviews})
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-gray-900">
                            ${item.price}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ${item.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          onClick={() => moveToCart(item)}
                          disabled={!item.inStock}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {item.inStock ? 'Move to Cart' : 'Out of Stock'}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => removeFromWishlist(item.id)}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => {
                  const inStockItems = wishlistItems.filter(item => item.inStock);
                  inStockItems.forEach(item => moveToCart(item));
                }}
                disabled={wishlistItems.filter(item => item.inStock).length === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Move All to Cart
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/products">Continue Shopping</Link>
              </Button>
            </div>

            {/* Recently Viewed */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    id: 'rec1',
                    name: 'Smartphone Camera Lens',
                    price: 49.99,
                    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop',
                    rating: 4.5
                  },
                  {
                    id: 'rec2',
                    name: 'Wireless Charging Pad',
                    price: 39.99,
                    image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400&h=400&fit=crop',
                    rating: 4.3
                  },
                  {
                    id: 'rec3',
                    name: 'Bluetooth Earbuds',
                    price: 89.99,
                    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop',
                    rating: 4.6
                  },
                  {
                    id: 'rec4',
                    name: 'Phone Stand',
                    price: 24.99,
                    image: 'https://images.unsplash.com/photo-1530319067432-f2a729c03db5?w=400&h=400&fit=crop',
                    rating: 4.4
                  }
                ].map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-t-lg group-hover:scale-105 transition-transform"
                      />
                      <div className="p-3">
                        <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(product.rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">${product.price}</span>
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm" className="flex-1 text-xs">
                            Add to Cart
                          </Button>
                          <Button variant="outline" size="sm">
                            <Heart className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Wishlist;
