import React from 'react';
import { Product } from '../types';
import { ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

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
      
      <div className="absolute top-4 right-4 z-10 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
        {product.condition}
      </div>

      {/* Image */}
      <div className="aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-[10px] text-gray-400 ml-1">(48 reviews)</span>
        </div>
        
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
          {product.name}
        </h3>
        
        <p className="text-xs text-gray-500 mb-4 line-clamp-2 min-h-[32px]">
          {product.description}
        </p>

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
