import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { Product, CartItem } from '../types';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import { Smartphone, Laptop, Tablet, Watch, Headphones, ChevronRight, Filter, ArrowUpDown, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { api } from '../services/api';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setActiveCategory(category);
    } else {
      setActiveCategory('All');
    }
  }, [searchParams]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        let data = await api.getProducts();
        if (data.length === 0) {
          console.log("Seeding initial products to local database...");
          await api.seedProducts(PRODUCTS);
          data = await api.getProducts();
        }
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleCategoryChange = (category: string) => {
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const categories = [
    { name: 'All', icon: <Smartphone className="w-4 h-4" /> },
    { name: 'iPhone', icon: <Smartphone className="w-4 h-4" /> },
    { name: 'iPad', icon: <Tablet className="w-4 h-4" /> },
    { name: 'MacBook', icon: <Laptop className="w-4 h-4" /> },
    { name: 'Watch', icon: <Watch className="w-4 h-4" /> },
    { name: 'Audio', icon: <Headphones className="w-4 h-4" /> },
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      <Navbar 
        cartCount={cartCount} 
        onCartClick={() => setIsCartOpen(true)} 
        onSearch={setSearchQuery}
      />
      
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                RAMADAN SALE: UP TO 40% OFF
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6"
              >
                Premium Gadgets. <br />
                <span className="text-emerald-600">Unbeatable Prices.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-500 mb-10 max-w-xl"
              >
                Experience the best of Apple with our certified pre-owned collection. 
                Quality guaranteed, 12-month warranty included.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 justify-center md:justify-start"
              >
                <button 
                  onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
                >
                  Shop Now <ChevronRight className="w-4 h-4" />
                </button>
                <Link to="/sell" className="px-8 py-4 bg-white text-black border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                  Sell Your Device
                </Link>
              </motion.div>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 relative"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
                <img 
                  src="https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&q=80&w=1200" 
                  alt="Hero Gadgets" 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryChange(cat.name)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                  activeCategory === cat.name 
                    ? "bg-black text-white shadow-lg shadow-black/10" 
                    : "bg-white text-gray-600 border border-gray-100 hover:border-gray-300"
                )}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:border-gray-300 transition-all">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="button flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:border-gray-300 transition-all">
              <ArrowUpDown className="w-4 h-4" />
              Sort By
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 p-4 animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-2xl mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart} 
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or category filters.</p>
            <button 
              onClick={() => { setSearchQuery(''); handleCategoryChange('All'); }}
              className="mt-6 text-emerald-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* Floating AI Assistant Button */}
      <Link 
        to="/assistant"
        className="fixed bottom-8 right-8 z-50 group"
      >
        <div className="absolute -inset-2 bg-emerald-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <button className="relative flex items-center gap-3 px-6 py-4 bg-black text-white rounded-2xl font-bold shadow-2xl hover:bg-emerald-600 transition-all">
          <Sparkles className="w-5 h-5 text-emerald-400 group-hover:text-white" />
          <span>Ask Assistant</span>
        </button>
      </Link>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="bg-black p-1.5 rounded-lg">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-900">
                  Shoubai<span className="text-emerald-600">GadjetKu</span>
                </span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your trusted destination for premium certified pre-owned Apple devices in Malaysia. 
                Quality you can trust, prices you'll love.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Shop</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link to="/?category=iPhone" className="hover:text-emerald-600 transition-colors">iPhone</Link></li>
                <li><Link to="/?category=iPad" className="hover:text-emerald-600 transition-colors">iPad</Link></li>
                <li><Link to="/?category=MacBook" className="hover:text-emerald-600 transition-colors">MacBook</Link></li>
                <li><Link to="/?category=Watch" className="hover:text-emerald-600 transition-colors">Watch</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link to="/" className="hover:text-emerald-600 transition-colors">Warranty Policy</Link></li>
                <li><Link to="/" className="hover:text-emerald-600 transition-colors">Shipping Info</Link></li>
                <li><Link to="/" className="hover:text-emerald-600 transition-colors">Returns & Refunds</Link></li>
                <li><Link to="/" className="hover:text-emerald-600 transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Newsletter</h4>
              <p className="text-sm text-gray-500 mb-4">Subscribe to get special offers and first look at new arrivals.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                />
                <button className="px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">© 2026 ShoubaiGadjetKu.co. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-xs text-gray-400 hover:text-emerald-600 font-bold">Admin Portal</Link>
              <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">Privacy Policy</Link>
              <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
