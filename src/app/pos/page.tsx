"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  LogOut, 
  Bell, 
  MapPin, 
  Phone, 
  Trash2, 
  ChefHat, 
  Truck,
  DollarSign,
  TrendingUp,
  Package,
  X,
  BarChart3,
  Settings,
  Plus,
  ArrowUpRight,
  Search,
  Filter,
  Edit3,
  Eye,
  EyeOff,
  Receipt,
  Download,
  AlertCircle,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type OrderStatus = "pending" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  options?: string;
}

interface Order {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  address: string;
  location_url: string;
  total_amount: number;
  status: OrderStatus;
  payment_status: string;
  slip_url: string;
  order_items: OrderItem[];
  description?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  cost_price: number;
  description: string;
  image: string;
  is_available: boolean;
  category: string;
}

export default function PosDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "analytics" | "menu">("orders");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({ revenue: 0, profit: 0, orderCount: 0 });
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
  }, []);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Fetch Orders with items
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (orderError) throw orderError;

      // Fetch Products
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (productError) throw productError;

      if (orderData) {
        setOrders(orderData);
        calculateStats(orderData);
        
        // Play sound for new pending orders
        const hasNewOrder = orderData.some(o => o.status === 'pending' && 
          (new Date().getTime() - new Date(o.created_at).getTime()) < 10000);
        if (hasNewOrder && audioRef.current) {
          audioRef.current.play().catch(e => console.log("Audio play failed"));
        }
      }
      if (productData) setProducts(productData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      const channel = supabase
        .channel("pos_realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchData())
        .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => fetchData())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [isAuthenticated, fetchData]);

  const calculateStats = (allOrders: Order[]) => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = allOrders.filter(o => o.created_at.startsWith(today) && o.status !== 'cancelled');
    const revenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    setStats({
      revenue,
      profit: revenue * 0.35, // Est 35% margin
      orderCount: todayOrders.length
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (!error) fetchData();
  };

  const toggleProductAvailability = async (product: Product) => {
    const { error } = await supabase
      .from("products")
      .update({ is_available: !product.is_available })
      .eq("id", product.id);
    if (!error) fetchData();
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "1234") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid Credentials. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-[#0f172a]/80 backdrop-blur-2xl p-12 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-800"
            >
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-mala-500 to-mala-700 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-mala-600/30 rotate-3">
                        <ChefHat className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">Command Center</h1>
                    <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Krua Baan Gem • Merchant OS</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Access Key</label>
                        <input 
                          type="text" 
                          placeholder="admin" 
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-5 px-8 text-white focus:ring-2 focus:ring-mala-500 outline-none transition-all" 
                          value={username} 
                          onChange={e => setUsername(e.target.value)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Security PIN</label>
                        <input 
                          type="password" 
                          placeholder="••••" 
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-5 px-8 text-white text-3xl tracking-widest focus:ring-2 focus:ring-mala-500 outline-none transition-all" 
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                        />
                    </div>
                    <button className="w-full bg-mala-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-mala-700 shadow-xl shadow-mala-600/20 transition-all active:scale-95">
                        Authorize Access
                    </button>
                </form>
            </motion.div>
        </div>
    );
  }

  const filteredOrders = orders.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.phone.includes(searchQuery) ||
    o.id.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex font-sans">
      {/* Dynamic Pro Sidebar */}
      <aside className="w-24 md:w-32 bg-[#0f172a] border-r border-slate-800 flex flex-col items-center py-12 gap-10">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-16 h-16 bg-gradient-to-br from-mala-500 to-mala-700 rounded-2xl flex items-center justify-center shadow-lg shadow-mala-600/20"
        >
            <ChefHat className="w-10 h-10 text-white" />
        </motion.div>
        <nav className="flex flex-col gap-6 flex-1">
            {[
                { id: "orders", icon: ShoppingBag, label: "Orders" },
                { id: "analytics", icon: BarChart3, label: "Stats" },
                { id: "menu", icon: Package, label: "Menu" }
            ].map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id as any)} 
                  className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all ${activeTab === tab.id ? "bg-mala-600 text-white shadow-xl shadow-mala-600/20 scale-110" : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"}`}
                >
                    <tab.icon className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
                </button>
            ))}
        </nav>
        <button 
          onClick={() => setIsAuthenticated(false)} 
          className="w-16 h-16 rounded-3xl flex items-center justify-center text-slate-500 hover:bg-red-900/20 hover:text-red-500 transition-all"
        >
            <LogOut className="w-7 h-7" />
        </button>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Pro Header */}
        <header className="h-24 px-10 bg-[#020617]/50 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between z-20">
            <div className="flex items-center gap-8">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{activeTab} Manager</h2>
                    <p className="text-[10px] font-black text-mala-500 uppercase tracking-widest mt-1">Real-time Dashboard v3.0</p>
                </div>
                <div className="hidden lg:flex items-center gap-10 pl-10 border-l border-slate-800">
                    <div className="bg-slate-900/50 px-6 py-2 rounded-2xl border border-slate-800">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Daily Revenue</p>
                        <p className="text-xl font-black text-white">฿{stats.revenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900/50 px-6 py-2 rounded-2xl border border-slate-800">
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1 text-center">Est. Profit</p>
                        <p className="text-xl font-black text-green-500">฿{stats.profit.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900/50 px-6 py-2 rounded-2xl border border-slate-800">
                        <p className="text-[10px] font-black text-mala-500 uppercase tracking-widest mb-1 text-center">Total Orders</p>
                        <p className="text-xl font-black text-white text-center">{stats.orderCount}</p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Find order or customer..." 
                      className="bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:ring-2 focus:ring-mala-500 outline-none w-72 transition-all" 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                    />
                </div>
                <button 
                  onClick={fetchData} 
                  className={`p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 border border-slate-700 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                >
                    <TrendingUp className="w-5 h-5 text-mala-400" />
                </button>
            </div>
        </header>

        {/* Dynamic Body */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            {activeTab === "orders" && (
                <div className="flex flex-col xl:flex-row gap-10 h-full">
                    {/* Order Stream */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
                        <AnimatePresence mode="popLayout">
                          {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                              <motion.div 
                                layout 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={order.id} 
                                onClick={() => setSelectedOrder(order)} 
                                className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all group relative overflow-hidden ${selectedOrder?.id === order.id ? "bg-slate-800/80 border-mala-600 shadow-2xl shadow-mala-600/10 scale-[1.02]" : "bg-[#0f172a] border-slate-800 hover:border-slate-700"}`}
                              >
                                  <div className="flex justify-between items-start mb-6">
                                      <div>
                                          <p className="text-[10px] font-black text-mala-500 uppercase tracking-[0.2em] mb-1">ID: #{order.id.slice(-6).toUpperCase()}</p>
                                          <h4 className="text-2xl font-black text-white leading-tight">{order.name}</h4>
                                          <div className="flex items-center gap-2 mt-2">
                                            <div className="w-2 h-2 rounded-full bg-mala-500 animate-pulse" />
                                            <p className="text-xs text-slate-500 font-bold">{new Date(order.created_at).toLocaleTimeString()}</p>
                                          </div>
                                      </div>
                                      <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg ${
                                          order.status === 'pending' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                                          order.status === 'preparing' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                                          order.status === 'ready' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' :
                                          order.status === 'delivering' ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30' :
                                          order.status === 'delivered' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                                          'bg-red-500/20 text-red-500 border border-red-500/30'
                                      }`}>
                                          {order.status}
                                      </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-mala-500">
                                              <Receipt className="w-5 h-5" />
                                          </div>
                                          <div>
                                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Amount</p>
                                              <p className="text-lg font-black text-white">฿{order.total_amount.toLocaleString()}</p>
                                          </div>
                                      </div>
                                      <button className="p-3 bg-slate-900 rounded-xl text-slate-500 group-hover:text-mala-500 transition-colors">
                                          <ChevronRight className="w-5 h-5" />
                                      </button>
                                  </div>
                              </motion.div>
                          )) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-700 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800">
                                <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                                <p className="font-black uppercase tracking-widest text-sm">No orders found</p>
                            </div>
                          )}
                        </AnimatePresence>
                    </div>

                    {/* Order Details Pane */}
                    <AnimatePresence>
                        {selectedOrder ? (
                            <motion.div 
                              initial={{ opacity: 0, x: 50 }} 
                              animate={{ opacity: 1, x: 0 }} 
                              exit={{ opacity: 0, x: 50 }}
                              className="w-full xl:w-[450px] bg-[#0f172a] rounded-[3rem] border border-slate-800 shadow-2xl p-10 flex flex-col gap-8 h-fit sticky top-0"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Order Details</h3>
                                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-all">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800/50">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-mala-600/10 rounded-2xl flex items-center justify-center text-mala-600">
                                                <Phone className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-white">{selectedOrder.name}</p>
                                                <p className="text-sm text-slate-500">{selectedOrder.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <a 
                                              href={`tel:${selectedOrder.phone}`}
                                              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-sm text-center transition-all"
                                            >
                                                Call Client
                                            </a>
                                            <a 
                                              href={selectedOrder.location_url} 
                                              target="_blank"
                                              className="flex-1 bg-mala-600/10 hover:bg-mala-600/20 text-mala-600 py-3 rounded-xl font-bold text-sm text-center transition-all"
                                            >
                                                Map
                                            </a>
                                        </div>
                                    </div>

                                    <div>
                                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Utensils className="w-3 h-3" /> Items Purchased
                                        </h5>
                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {selectedOrder.order_items?.map((item, i) => (
                                                <div key={i} className="flex justify-between items-center p-4 bg-slate-900/30 rounded-2xl border border-slate-800/30">
                                                    <div>
                                                        <p className="text-sm font-black text-white">{item.name} <span className="text-mala-500 ml-1">x{item.quantity}</span></p>
                                                        {item.options && <p className="text-[10px] text-slate-500 mt-1">{item.options}</p>}
                                                    </div>
                                                    <p className="text-sm font-black text-slate-300">฿{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Grid */}
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/50">
                                        <button 
                                          onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${selectedOrder.status === 'preparing' ? 'bg-orange-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-orange-500'}`}
                                        >
                                            <ChefHat className="w-6 h-6 mb-2" />
                                            <span className="text-[9px] font-black uppercase">Cooking</span>
                                        </button>
                                        <button 
                                          onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${selectedOrder.status === 'ready' ? 'bg-blue-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-blue-500'}`}
                                        >
                                            <Package className="w-6 h-6 mb-2" />
                                            <span className="text-[9px] font-black uppercase">Ready</span>
                                        </button>
                                        <button 
                                          onClick={() => updateOrderStatus(selectedOrder.id, 'delivering')}
                                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${selectedOrder.status === 'delivering' ? 'bg-purple-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-purple-500'}`}
                                        >
                                            <Truck className="w-6 h-6 mb-2" />
                                            <span className="text-[9px] font-black uppercase">On Delivery</span>
                                        </button>
                                        <button 
                                          onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${selectedOrder.status === 'delivered' ? 'bg-green-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-green-500'}`}
                                        >
                                            <CheckCircle className="w-6 h-6 mb-2" />
                                            <span className="text-[9px] font-black uppercase">Done</span>
                                        </button>
                                    </div>

                                    <div className="flex gap-4">
                                      <button 
                                        onClick={() => setIsReceiptModalOpen(true)}
                                        className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
                                      >
                                          <Printer className="w-4 h-4" /> Print Bill
                                      </button>
                                      <button 
                                        onClick={() => window.open(selectedOrder.slip_url, '_blank')}
                                        disabled={!selectedOrder.slip_url}
                                        className="p-4 bg-slate-800 text-white rounded-2xl border border-slate-700 disabled:opacity-30 active:scale-95 transition-all"
                                      >
                                          <Eye className="w-5 h-5" />
                                      </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="hidden xl:flex w-[450px] items-center justify-center bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800">
                                <div className="text-center">
                                    <Receipt className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                                    <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Select an order to view details</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {activeTab === "menu" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <motion.div 
                          layout
                          key={product.id} 
                          className={`bg-[#0f172a] p-8 rounded-[2.5rem] border-2 transition-all overflow-hidden relative ${product.is_available ? 'border-slate-800' : 'border-red-900/50 opacity-60'}`}
                        >
                            <div className="relative aspect-square rounded-[1.5rem] overflow-hidden mb-6">
                                <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
                                {!product.is_available && (
                                    <div className="absolute inset-0 bg-red-900/60 backdrop-blur-sm flex items-center justify-center">
                                        <span className="bg-white text-red-600 px-4 py-1 rounded-full text-[10px] font-black uppercase">Out of Stock</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-xl font-black text-white leading-tight">{product.name}</h4>
                                <span className="text-lg font-black text-mala-500">฿{product.price}</span>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                  onClick={() => toggleProductAvailability(product)}
                                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${product.is_available ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}
                                >
                                    {product.is_available ? 'Disable' : 'Enable'}
                                </button>
                                <button className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    <button className="aspect-square bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-700 hover:border-mala-500 hover:text-mala-500 transition-all group">
                        <Plus className="w-12 h-12 group-hover:scale-110 transition-transform" />
                        <span className="font-black uppercase tracking-widest text-[10px]">Add New Item</span>
                    </button>
                </div>
            )}
        </div>
      </main>

      {/* Digital Receipt Modal */}
      <AnimatePresence>
        {isReceiptModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-black p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden relative"
            >
              <button 
                onClick={() => setIsReceiptModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-black rounded-2xl mx-auto mb-4 flex items-center justify-center text-white">
                  <ChefHat className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif font-bold italic">Krua Baan Gem</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Digital Receipt</p>
              </div>

              <div className="border-y border-dashed border-slate-300 py-6 mb-6 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-bold">#{selectedOrder.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-bold">{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold">{selectedOrder.name}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto">
                {selectedOrder.order_items?.map((item, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold">{item.name} x{item.quantity}</p>
                      {item.options && <p className="text-[10px] text-slate-400">{item.options}</p>}
                    </div>
                    <p className="text-sm font-bold">฿{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-black pt-6 flex justify-between items-center mb-10">
                <p className="text-lg font-black uppercase tracking-tighter">Grand Total</p>
                <p className="text-3xl font-black">฿{selectedOrder.total_amount.toLocaleString()}</p>
              </div>

              <div className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-black space-y-1">
                <p>Thank you for your order!</p>
                <p>Krua Baan Gem • ศาสตร์แห่งข้อมูล ศิลป์แห่งรสชาติ</p>
              </div>

              <button 
                onClick={() => window.print()}
                className="w-full mt-10 py-4 bg-black text-white rounded-2xl font-black text-sm hover:opacity-90 active:scale-95 transition-all print:hidden"
              >
                Print Receipt
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.inset-0.z-\[100\] * {
            visibility: visible;
          }
          .fixed.inset-0.z-\[100\] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
          .print\:hidden {
            display: none !important;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

function Utensils(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}
