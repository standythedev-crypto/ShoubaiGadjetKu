import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  ShoppingBag,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'shipping') {
      setStep('payment');
    } else if (step === 'payment') {
      handlePayment();
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setStep('success');
    clearCart();
  };

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen bg-[#FBFBFD] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-xs">
          Add some premium gadgets to your cart before checking out.
        </p>
        <Link 
          to="/" 
          className="px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-black/10"
        >
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <button 
            onClick={() => step === 'success' ? navigate('/') : navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 'success' ? 'Back to Store' : 'Back'}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="bg-black p-1.5 rounded-lg">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Checkout
            </span>
          </div>

          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {step === 'success' ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center py-12"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
              <p className="text-gray-500 mb-10">
                Thank you for your purchase. Your order has been placed successfully and will be delivered within 3-5 working days.
              </p>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 mb-10 text-left">
                <h3 className="font-bold text-gray-900 mb-4">Order Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Order ID</span>
                    <span className="font-bold text-gray-900">#SGK-{Math.floor(Math.random() * 100000)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery to</span>
                    <span className="font-bold text-gray-900">{formData.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Estimated Delivery</span>
                    <span className="font-bold text-emerald-600">3-5 Days</span>
                  </div>
                </div>
              </div>
              <Link 
                to="/" 
                className="block w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-black/10"
              >
                Continue Shopping
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column: Form */}
              <div className="lg:col-span-7">
                {/* Progress Bar */}
                <div className="flex items-center gap-4 mb-10">
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                    step === 'shipping' ? "bg-black text-white" : "bg-emerald-100 text-emerald-700"
                  )}>
                    <Truck className="w-4 h-4" />
                    Shipping
                  </div>
                  <div className="h-px w-8 bg-gray-200" />
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                    step === 'payment' ? "bg-black text-white" : "bg-gray-100 text-gray-400"
                  )}>
                    <CreditCard className="w-4 h-4" />
                    Payment
                  </div>
                </div>

                <form onSubmit={handleNextStep} className="space-y-8">
                  {step === 'shipping' ? (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <User className="w-3 h-3" /> Full Name
                          </label>
                          <input 
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-emerald-600 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Mail className="w-3 h-3" /> Email Address
                          </label>
                          <input 
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-emerald-600 transition-all"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Phone className="w-3 h-3" /> Phone Number
                          </label>
                          <input 
                            required
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+60 12-345 6789"
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-emerald-600 transition-all"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Shipping Address
                          </label>
                          <input 
                            required
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Street address, apartment, etc."
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-emerald-600 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">City</label>
                          <input 
                            required
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Kuala Lumpur"
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-emerald-600 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">State</label>
                          <input 
                            required
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="Selangor"
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-emerald-600 transition-all"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4 mb-6">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-emerald-900">Secure Payment</p>
                          <p className="text-xs text-emerald-700">Your payment information is encrypted and secure. This is a demonstration of the checkout process.</p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Card Number</label>
                          <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                              required
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              placeholder="0000 0000 0000 0000"
                              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-emerald-600 transition-all"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Expiry Date</label>
                            <input 
                              required
                              name="expiry"
                              value={formData.expiry}
                              onChange={handleInputChange}
                              placeholder="MM/YY"
                              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-emerald-600 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">CVV</label>
                            <input 
                              required
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleInputChange}
                              placeholder="123"
                              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-emerald-600 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {step === 'shipping' ? 'Continue to Payment' : `Pay RM ${cartTotal.toLocaleString()}`}
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sticky top-32">
                  <h3 className="text-xl font-bold text-gray-900 mb-8">Order Summary</h3>
                  
                  <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-gray-500 mb-1">Qty: {item.quantity}</p>
                          <p className="text-sm font-bold text-gray-900">RM {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-50">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-bold text-gray-900">RM {cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="font-bold text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax (SST 6%)</span>
                      <span className="font-bold text-gray-900">RM 0.00</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-gray-50">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">RM {cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">12-Month Warranty</p>
                      <p className="text-[10px] text-gray-500">Included with all devices</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
