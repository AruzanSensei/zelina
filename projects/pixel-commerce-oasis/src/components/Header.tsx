
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { state: cartState } = useCart();
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports',
    'Books',
    'Beauty'
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 text-sm text-gray-600 border-b border-gray-100">
          <div className="hidden md:block">
            Free shipping on orders over $50
          </div>
          <div className="flex items-center space-x-4">
            <span>Customer Service: (555) 123-4567</span>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            ShopHub
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 bg-blue-600 hover:bg-blue-700 rounded-r-lg"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/account">My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders">Order History</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/account')}>
                      Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/account')}>
                      Create Account
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild>
              <Link to="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartState.itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600">
                    {cartState.itemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 py-3 border-t border-gray-100">
          <Link to="/products" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            All Products
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              to={`/products/${category.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {category}
            </Link>
          ))}
        </nav>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden py-3 border-t border-gray-100">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-3">
              <Link
                to="/products"
                className="text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/products/${category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
