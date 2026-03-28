import React from 'react';
import { Product } from '../types';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useWishlist } from '../WishlistContext';
import { useAuth } from '../AuthContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (isWishlisted) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Badge */}
      {discount > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
          Save {discount}%
        </div>
      )}
      
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
          {product.condition}
        </div>
        <button
          onClick={handleWishlistToggle}
          className={cn(
            "p-2 rounded-full shadow-sm transition-all duration-300",
            isWishlisted 
              ? "bg-red-50 text-red-500" 
              : "bg-white text-gray-400 hover:text-red-500"
          )}
        >
          <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
        </button>
      </div>

      {/* Image */}
      <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </Link>

      {/* Content */}
      <div className="p-5">
        <Link to={`/product/${product.id}`} className="block">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                  "w-3 h-3",
                  i < Math.round(product.rating || 0) 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-gray-200"
                )} 
              />
            ))}
            <span className="text-[10px] text-gray-400 ml-1">({product.reviewCount || 0} reviews)</span>
          </div>
          
          <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 min-h-[32px]">
          {product.description}
        </p>

        {/* Specs Grid */}
        {product.specs && (
          <div className="grid grid-cols-2 gap-y-2 gap-x-3 mb-4 border-t border-gray-50 pt-3">
            {product.specs.processor && (
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Processor</span>
                <span className="text-[11px] text-gray-700 font-medium truncate">{product.specs.processor}</span>
              </div>
            )}
            {product.specs.ram && (
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">RAM</span>
                <span className="text-[11px] text-gray-700 font-medium truncate">{product.specs.ram}</span>
              </div>
            )}
            {product.specs.rom && (
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Storage</span>
                <span className="text-[11px] text-gray-700 font-medium truncate">{product.specs.rom}</span>
              </div>
            )}
            {product.specs.battery && (
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Battery</span>
                <span className="text-[11px] text-gray-700 font-medium truncate">{product.specs.battery}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">RM {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">RM {product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Free Shipping</p>
          </div>
          
          <button 
            onClick={() => onAddToCart(product)}
            className="p-2.5 bg-black text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-black/5"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
