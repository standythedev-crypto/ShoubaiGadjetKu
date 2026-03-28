import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Product, Review } from '../types';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import Navbar from '../components/Navbar';
import Cart from '../components/Cart';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  ShoppingCart, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  CheckCircle2,
  MessageSquare,
  User,
  Calendar
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleSearch = (q: string) => {
    if (q.trim()) {
      navigate(`/?search=${q}`);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const [productData, reviewsData] = await Promise.all([
          api.getProduct(id),
          api.getReviews(id)
        ]);
        setProduct(productData);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error loading product details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (product) {
      addToCart(product);
      setIsCartOpen(true);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setIsSubmittingReview(true);
    try {
      const review: Review = {
        id: Math.random().toString(36).substr(2, 9),
        productId: id,
        userId: user.uid,
        userName: user.name,
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: new Date().toISOString()
      };

      await api.createReview(review);
      
      // Refresh reviews and product (to get updated avg rating)
      const [updatedProduct, updatedReviews] = await Promise.all([
        api.getProduct(id),
        api.getReviews(id)
      ]);
      
      setProduct(updatedProduct);
      setReviews(updatedReviews);
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FBFBFD] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <Link to="/" className="text-emerald-600 font-bold hover:underline">Back to Store</Link>
      </div>
    );
  }

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
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Product Image */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-square bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm"
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                {product.condition} Condition
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                {product.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "w-4 h-4",
                      i < Math.round(product.rating || 0) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-gray-200"
                    )} 
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-900">
                {product.rating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-sm text-gray-400">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-4xl font-bold text-gray-900">RM {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through">RM {product.originalPrice.toLocaleString()}</span>
              )}
            </div>

            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              {product.description}
            </p>

            {/* Specs Grid */}
            {product.specs && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10 p-6 bg-white rounded-3xl border border-gray-100">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">{key}</span>
                    <span className="text-sm text-gray-900 font-bold">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={handleAddToCart}
                className="flex-1 py-5 bg-black text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="flex-1 py-5 bg-white text-black border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                Add to Wishlist
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
              <div className="flex flex-col items-center text-center">
                <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-tighter">12-Month Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Truck className="w-6 h-6 text-emerald-600 mb-2" />
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-tighter">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw className="w-6 h-6 text-emerald-600 mb-2" />
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-tighter">7-Day Returns</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <section className="pt-20 border-t border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
              <p className="text-gray-500">What our community thinks about this device.</p>
            </div>
            
            {!showReviewForm && user && (
              <button 
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Write a Review
              </button>
            )}
          </div>

          <AnimatePresence>
            {showReviewForm && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-12 overflow-hidden"
              >
                <form onSubmit={handleSubmitReview} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Share your experience</h3>
                  
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="focus:outline-none"
                        >
                          <Star 
                            className={cn(
                              "w-8 h-8 transition-all",
                              star <= newReview.rating ? "fill-yellow-400 text-yellow-400 scale-110" : "text-gray-200 hover:text-yellow-200"
                            )} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Comment</label>
                    <textarea 
                      required
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="Tell us what you like or dislike about this device..."
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all min-h-[120px]"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-8 py-4 bg-white text-gray-500 border border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <motion.div 
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{review.userName}</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "w-3 h-3",
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                              )} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500 mb-6">Be the first to share your thoughts on this device.</p>
              {user ? (
                <button 
                  onClick={() => setShowReviewForm(true)}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  Write a review
                </button>
              ) : (
                <Link to="/login" className="text-emerald-600 font-bold hover:underline">
                  Sign in to write a review
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
