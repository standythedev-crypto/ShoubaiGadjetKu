import { ShoppingCart, Search, Menu, User, Smartphone, X, Sparkles, LogOut, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useAuth } from '../AuthContext';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onSearch: (query: string) => void;
}

export default function Navbar({ cartCount, onCartClick, onSearch }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAdmin, logout } = useAuth();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, onSearch]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-black p-1.5 rounded-lg">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:inline">
              Shoubai<span className="text-emerald-600">GadjetKu</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Home</Link>
            <Link to="/?category=iPhone" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">iPhone</Link>
            <Link to="/?category=iPad" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">iPad</Link>
            <Link to="/?category=MacBook" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">MacBook</Link>
            <Link to="/sell" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Sell Device</Link>
            <Link to="/assistant" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Gadget Assistant
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded-full"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              className="md:hidden p-2 text-gray-500 hover:text-black transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={onCartClick}
              className="p-2 text-gray-500 hover:text-black transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link to="/admin" className="p-2 text-emerald-600 hover:text-emerald-700 transition-colors">
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Welcome</span>
                  <span className="text-xs font-bold text-gray-900 truncate max-w-[80px]">{user.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="p-2 text-gray-500 hover:text-black transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}

            <button 
              className="lg:hidden p-2 text-gray-500 hover:text-black transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden px-4 py-3 bg-white border-b border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-md">Home</Link>
            <Link to="/?category=iPhone" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-md">iPhone</Link>
            <Link to="/?category=iPad" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-md">iPad</Link>
            <Link to="/?category=MacBook" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-md">MacBook</Link>
            <Link to="/sell" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-md">Sell Device</Link>
            <Link to="/assistant" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Gadget Assistant
            </Link>
            <div className="pt-4 mt-4 border-t border-gray-100">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{user.role}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-emerald-600 hover:bg-emerald-50 rounded-md flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-base font-medium text-red-500 hover:bg-red-50 rounded-md flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-400 hover:text-emerald-600 rounded-md flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Admin Portal
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
