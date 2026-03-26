import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Camera, DollarSign, ChevronRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { cn } from '../lib/utils';
import { useAuth } from '../AuthContext';
import { api } from '../services/api';
import { SellRequest } from '../types';

export default function Sell() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState<{
    deviceName: string;
    category: string;
    condition: 'Excellent' | 'Good' | 'Fair';
    description: string;
    image: string | null;
  }>({
    deviceName: '',
    category: 'iPhone',
    condition: 'Excellent',
    description: '',
    image: null
  });
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const newRequest: SellRequest = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.uid,
        userName: user.name,
        deviceName: formData.deviceName,
        category: formData.category,
        condition: formData.condition,
        estimatedPrice: 1850, // Mock price
        status: 'Pending',
        createdAt: new Date().toISOString(),
        image: formData.image || undefined,
      };

      await api.createSellRequest(newRequest);
      setStep(3); // Success step
    } catch (error) {
      console.error("Error submitting sell request:", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      <Navbar cartCount={0} onCartClick={() => {}} onSearch={() => {}} />

      <main className="max-w-3xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sell Your Device</h1>
          <p className="text-gray-500">Get an instant quote and get paid within 24 hours.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden">
          {/* Progress Bar */}
          <div className="flex border-b border-gray-100">
            {[1, 2].map((i) => (
              <div 
                key={i}
                className={cn(
                  "flex-1 py-4 text-center text-xs font-bold uppercase tracking-widest transition-all",
                  step >= i ? "text-emerald-600 bg-emerald-50/50" : "text-gray-300"
                )}
              >
                Step {i}: {i === 1 ? 'Device Info' : 'Condition'}
              </div>
            ))}
          </div>

          <div className="p-8 md:p-12">
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">What device are you selling?</label>
                  <input 
                    type="text" 
                    placeholder="e.g. iPhone 13 Pro"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                    value={formData.deviceName}
                    onChange={(e) => setFormData({...formData, deviceName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select 
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option>iPhone</option>
                    <option>iPad</option>
                    <option>MacBook</option>
                    <option>Watch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Upload Device Image</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="device-image"
                    />
                    <label 
                      htmlFor="device-image"
                      className={cn(
                        "w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden",
                        formData.image ? "border-emerald-600 bg-emerald-50" : "border-gray-200 hover:border-emerald-400 bg-gray-50"
                      )}
                    >
                      {formData.image ? (
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-gray-400 mb-2 group-hover:text-emerald-600 transition-colors" />
                          <p className="text-xs font-medium text-gray-500">Click to upload or drag and drop</p>
                          <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  disabled={!formData.deviceName || !formData.image}
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-6">What is the condition?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['Excellent', 'Good', 'Fair'].map((cond) => (
                      <button
                        key={cond}
                        onClick={() => setFormData({...formData, condition: cond as any})}
                        className={cn(
                          "p-6 rounded-2xl border-2 transition-all text-left",
                          formData.condition === cond 
                            ? "border-emerald-600 bg-emerald-50" 
                            : "border-gray-100 hover:border-gray-300"
                        )}
                      >
                        <p className="font-bold text-gray-900 mb-1">{cond}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                          {cond === 'Excellent' ? 'Like New' : cond === 'Good' ? 'Minor Scratches' : 'Heavy Wear'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">Estimated Value</p>
                    <h3 className="text-3xl font-bold text-emerald-900">RM 1,850 - 2,200</h3>
                  </div>
                  <DollarSign className="w-10 h-10 text-emerald-600 opacity-20" />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-white text-black border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit}
                    className="flex-[2] py-4 bg-black text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-black/10"
                  >
                    Submit Request
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
                <p className="text-gray-500 mb-10 max-w-md mx-auto">
                  Our team will review your request and get back to you within 24 hours. 
                  You can track your request status in your dashboard.
                </p>
                <button 
                  onClick={() => navigate('/')}
                  className="px-10 py-4 bg-black text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-black/10"
                >
                  Back to Home
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
