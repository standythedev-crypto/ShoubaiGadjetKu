import React, { Component, createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, FirebaseUser } from './firebase';
import { User } from './types';
import { api } from './services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  loginAsDemoAdmin: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  loginAsDemoAdmin: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const loginAsDemoAdmin = async () => {
    setLoading(true);
    const demoAdmin: User = {
      uid: 'demo-admin-id',
      name: 'Demo Admin',
      email: 'admin@shoubaigadjetku.co',
      role: 'admin',
    };
    
    // Save/Update in SQLite
    await api.saveUser(demoAdmin);
    
    setUser(demoAdmin);
    setIsAdmin(true);
    setLoading(false);
    localStorage.setItem('demo_admin_session', 'true');
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('demo_admin_session');
  };

  useEffect(() => {
    // Check for demo session first
    const isDemo = localStorage.getItem('demo_admin_session');
    if (isDemo) {
      loginAsDemoAdmin();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user profile from local SQLite via API
          let userData = await api.getUser(firebaseUser.uid);
          
          if (!userData) {
            // Create user profile if it doesn't exist
            userData = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: 'user', // Default role
              photoURL: firebaseUser.photoURL || undefined,
            };
            await api.saveUser(userData);
          }
          
          setUser(userData);
          setIsAdmin(userData.role === 'admin');
        } catch (error) {
          console.error("Auth sync error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, loginAsDemoAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends (Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please try again later.";
      try {
        const parsedError = JSON.parse(this.state.error.message);
        if (parsedError.error) {
          errorMessage = `Firestore Error: ${parsedError.error} (Operation: ${parsedError.operationType})`;
        }
      } catch (e) {
        // Not a JSON error message
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-red-600">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Error</h2>
            <p className="text-gray-600 mb-8">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
