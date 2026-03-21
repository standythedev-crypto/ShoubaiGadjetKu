import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo credentials
    if (email === 'admin@shoubai.com' && password === 'admin123') {
      localStorage.setItem('user', JSON.stringify({
        id: 'admin-1',
        email: 'admin@shoubai.com',
        role: 'admin',
        name: 'Admin User'
      }));
      navigate('/admin');
    } else {
      setError('Invalid credentials. Use admin@shoubai.com / admin123 for demo.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-black/5 border border-gray-100 p-8 md:p-12 relative"
      >
        <button 
          onClick={() => navigate('/')}
          className="absolute left-8 top-8 md:left-12 md:top-12 flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-black transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="text-center mb-10 mt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6 shadow-xl shadow-black/10">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-500">Sign in to manage ShoubaiGadjetKu</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shoubai.com"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium ml-1">{error}</p>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 group"
          >
            Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest font-bold">Demo Credentials</p>
          <div className="bg-gray-50 rounded-2xl p-4 text-left">
            <p className="text-xs text-gray-600 mb-1"><span className="font-bold">Email:</span> admin@shoubai.com</p>
            <p className="text-xs text-gray-600"><span className="font-bold">Password:</span> admin123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
