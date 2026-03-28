import React, { useState } from 'react';
import { useWishlist } from '../WishlistContext';
import { useCart } from '../CartContext';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Cart from '../components/Cart';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Wishlist() {
  const { wishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (q: string) => {
    if (q.trim()) {
      navigate(`/?search=${q}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      <Navbar 
        onCartClick={() => setIsCartOpen(true)} 
        onSearch={handleSearch} 
      />

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-50 rounded-2xl">
            <Heart className="w-6 h-6 text-red-500 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-500">Items you've saved for later</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={(p) => {
                  addToCart(p);
                  setIsCartOpen(true);
                }} 
              />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              Save items you're interested in and they'll show up here.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
