
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Star, Filter, Grid, List, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

const Products = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('featured');

  // Mock products data
  const allProducts = [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      price: 129.99,
      originalPrice: 179.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 2847,
      brand: 'AudioTech',
      category: 'electronics',
      inStock: true,
      description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.'
    },
    {
      id: '2',
      name: 'Smart Fitness Watch',
      price: 299.99,
      originalPrice: 399.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      rating: 4.6,
      reviews: 1923,
      brand: 'FitTech',
      category: 'electronics',
      inStock: true,
      description: 'Advanced fitness tracking with heart rate monitoring and GPS.'
    },
    {
      id: '3',
      name: 'Professional Laptop Backpack',
      price: 89.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      rating: 4.7,
      reviews: 856,
      brand: 'TravelPro',
      category: 'bags',
      inStock: true,
      description: 'Durable laptop backpack with multiple compartments and TSA-friendly design.'
    },
    {
      id: '4',
      name: 'Portable Bluetooth Speaker',
      price: 79.99,
      originalPrice: 99.99,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
      rating: 4.5,
      reviews: 1247,
      brand: 'SoundWave',
      category: 'electronics',
      inStock: true,
      description: 'Waterproof portable speaker with rich bass and 12-hour battery.'
    },
    {
      id: '5',
      name: 'Classic Denim Jacket',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop',
      rating: 4.4,
      reviews: 632,
      brand: 'StyleCo',
      category: 'clothing',
      inStock: true,
      description: 'Timeless denim jacket made from premium cotton blend.'
    },
    {
      id: '6',
      name: 'Yoga Mat Premium',
      price: 59.99,
      image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=400&fit=crop',
      rating: 4.6,
      reviews: 891,
      brand: 'ZenFit',
      category: 'sports',
      inStock: true,
      description: 'Non-slip yoga mat with superior cushioning and eco-friendly materials.'
    }
  ];

  const brands = ['AudioTech', 'FitTech', 'TravelPro', 'SoundWave', 'StyleCo', 'ZenFit'];

  const [filteredProducts, setFilteredProducts] = useState(allProducts);

  useEffect(() => {
    let filtered = allProducts;

    // Filter by category
    if (category) {
      const categoryMap: { [key: string]: string } = {
        'electronics': 'electronics',
        'clothing': 'clothing',
        'home-garden': 'home',
        'sports': 'sports',
        'books': 'books',
        'beauty': 'beauty'
      };
      filtered = filtered.filter(product => product.category === categoryMap[category]);
    }

    // Filter by search query
    const search = searchParams.get('search');
    if (search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }

    // Filter by rating
    if (selectedRating) {
      filtered = filtered.filter(product => product.rating >= selectedRating);
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Mock newest sort
        break;
      default:
        // Featured products (default order)
        break;
    }

    setFilteredProducts(filtered);
  }, [category, searchParams, priceRange, selectedBrands, selectedRating, sortBy]);

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    }
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={1000}
          step={10}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-semibold mb-3">Brands</h3>
        <div className="space-y-2">
          {brands.map(brand => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={brand}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
              />
              <label htmlFor={brand} className="text-sm cursor-pointer">
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold mb-3">Customer Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={selectedRating === rating}
                onCheckedChange={(checked) => setSelectedRating(checked ? rating : null)}
              />
              <label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-1">& up</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span>Products</span>
          {category && (
            <>
              <span className="mx-2">/</span>
              <span className="capitalize">{category.replace('-', ' ')}</span>
            </>
          )}
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {category ? category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All Products'}
            </h1>
            <p className="text-gray-600">{filteredProducts.length} products found</p>
          </div>

          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Customer Rating</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your product search
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 space-y-6">
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold mb-4">Filters</h2>
                <FilterSidebar />
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid/List */}
          <main className="flex-1">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform"
                        />
                        {product.originalPrice && (
                          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                            Sale
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
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
            ) : (
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                          <p className="text-gray-600 mb-2">{product.description}</p>
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
                              ({product.reviews} reviews)
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
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
                            <Button
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;
