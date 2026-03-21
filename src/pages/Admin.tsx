import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  CheckCircle, 
  XCircle, 
  LogOut, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Smartphone,
  Search,
  Plus,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Home as HomeIcon,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { PRODUCTS, MOCK_SELL_REQUESTS, MOCK_SALES_DATA } from '../constants';
import { Product, SellRequest, SaleData, User } from '../types';
import { cn } from '../lib/utils';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'sell-requests'>('overview');
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>(MOCK_SELL_REQUESTS);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      navigate('/');
      return;
    }
    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleApproveSell = (id: string) => {
    setSellRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'Approved' } : req
    ));
  };

  const handleRejectSell = (id: string) => {
    setSellRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'Rejected' } : req
    ));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-100">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-black p-1.5 rounded-lg">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">
              Admin<span className="text-emerald-600">Panel</span>
            </span>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-black transition-all mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </button>
          
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">Menu</div>
          <button 
            onClick={() => setActiveTab('overview')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'overview' ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-50 hover:text-black"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'products' ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-50 hover:text-black"
            )}
          >
            <Package className="w-4 h-4" />
            Products
          </button>
          <button 
            onClick={() => setActiveTab('sell-requests')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'sell-requests' ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-50 hover:text-black"
            )}
          >
            <CheckCircle className="w-4 h-4" />
            Sell Requests
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 capitalize">{activeTab.replace('-', ' ')}</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back, {user.name}. Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all w-64"
              />
            </div>
            <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-black transition-all">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Revenue" 
                  value="RM 192,450" 
                  change="+12.5%" 
                  isPositive={true} 
                  icon={<DollarSign className="w-5 h-5" />} 
                />
                <StatCard 
                  title="Total Sales" 
                  value="142" 
                  change="+8.2%" 
                  isPositive={true} 
                  icon={<TrendingUp className="w-5 h-5" />} 
                />
                <StatCard 
                  title="Active Users" 
                  value="2,845" 
                  change="-2.4%" 
                  isPositive={false} 
                  icon={<Users className="w-5 h-5" />} 
                />
                <StatCard 
                  title="Sell Requests" 
                  value="12 Pending" 
                  change="+4 new" 
                  isPositive={true} 
                  icon={<CheckCircle className="w-5 h-5" />} 
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-gray-900">Revenue Analysis</h3>
                    <select className="text-xs font-bold bg-gray-50 border-none rounded-lg px-3 py-1.5 focus:ring-0">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                    </select>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_SALES_DATA}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} dx={-10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-gray-900">Sales Volume</h3>
                    <select className="text-xs font-bold bg-gray-50 border-none rounded-lg px-3 py-1.5 focus:ring-0">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                    </select>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={MOCK_SALES_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} dx={-10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Line type="monotone" dataKey="sales" stroke="#000" strokeWidth={3} dot={{ r: 4, fill: '#000', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Recent Sell Requests</h3>
                  <button onClick={() => setActiveTab('sell-requests')} className="text-xs font-bold text-emerald-600 hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                        <th className="px-8 py-4">User</th>
                        <th className="px-8 py-4">Device</th>
                        <th className="px-8 py-4">Condition</th>
                        <th className="px-8 py-4">Price</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sellRequests.slice(0, 3).map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                                {req.userName.charAt(0)}
                              </div>
                              <span className="text-sm font-bold text-gray-900">{req.userName}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-sm text-gray-600 font-medium">{req.deviceName}</td>
                          <td className="px-8 py-4">
                            <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded-full uppercase tracking-wider">{req.condition}</span>
                          </td>
                          <td className="px-8 py-4 text-sm font-bold text-gray-900">RM {req.estimatedPrice}</td>
                          <td className="px-8 py-4">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleApproveSell(req.id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleRejectSell(req.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div 
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Product Inventory</h3>
                <button className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      <th className="px-8 py-4">Product</th>
                      <th className="px-8 py-4">Category</th>
                      <th className="px-8 py-4">Price</th>
                      <th className="px-8 py-4">Stock</th>
                      <th className="px-8 py-4">Condition</th>
                      <th className="px-8 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <span className="text-sm font-bold text-gray-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-sm text-gray-600 font-medium">{product.category}</td>
                        <td className="px-8 py-4 text-sm font-bold text-gray-900">RM {product.price.toLocaleString()}</td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              product.stock > 5 ? "bg-emerald-500" : "bg-red-500"
                            )} />
                            <span className="text-sm font-medium text-gray-600">{product.stock} units</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded-full uppercase tracking-wider">{product.condition}</span>
                        </td>
                        <td className="px-8 py-4">
                          <button className="p-2 text-gray-400 hover:text-black transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'sell-requests' && (
            <motion.div 
              key="sell-requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">User Sell Requests</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      <th className="px-8 py-4">User</th>
                      <th className="px-8 py-4">Device</th>
                      <th className="px-8 py-4">Date</th>
                      <th className="px-8 py-4">Condition</th>
                      <th className="px-8 py-4">Est. Price</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sellRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                              {req.userName.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-gray-900">{req.userName}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={req.image} alt={req.deviceName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">{req.deviceName}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-xs text-gray-500 font-medium">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(req.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded-full uppercase tracking-wider">{req.condition}</span>
                        </td>
                        <td className="px-8 py-4 text-sm font-bold text-gray-900">RM {req.estimatedPrice}</td>
                        <td className="px-8 py-4">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2">
                            {req.status === 'Pending' ? (
                              <>
                                <button 
                                  onClick={() => handleApproveSell(req.id)}
                                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleRejectSell(req.id)}
                                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium italic">Handled</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatCard({ title, value, change, isPositive, icon }: { title: string, value: string, change: string, isPositive: boolean, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-gray-50 rounded-xl text-gray-900">
          {icon}
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold",
          isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        )}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
    </div>
  );
}

function StatusBadge({ status }: { status: SellRequest['status'] }) {
  const styles = {
    Pending: "bg-yellow-50 text-yellow-600",
    Approved: "bg-emerald-50 text-emerald-600",
    Rejected: "bg-red-50 text-red-600"
  };

  return (
    <span className={cn(
      "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
      styles[status]
    )}>
      {status}
    </span>
  );
}
