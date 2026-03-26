import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ArrowLeft, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, isAdmin, navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // AuthContext will handle the user profile creation/loading
    } catch (err: any) {
      console.error("Login error:", err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoggingIn(false);
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

        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full py-4 bg-white text-black border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-3 group disabled:opacity-50"
          >
            {isLoggingIn ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            )}
            Sign in with Google
          </button>

          {error && (
            <p className="text-xs text-red-500 font-medium text-center">{error}</p>
          )}
        </div>

        <div className="mt-10 pt-10 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-4">Security Notice</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Access to the admin portal is restricted to authorized personnel. 
            If you are the owner, use your registered Google account to sign in.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
