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
  Printer,
  History,
  Star,
  FileSpreadsheet,
  Activity,
  Layers,
  Zap
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
  const [customerHistory, setCustomerHistory] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({ revenue: 0, profit: 0, orderCount: 0, pointsIssued: 0 });
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
  }, []);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (orderError) throw orderError;

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (productError) throw productError;

      if (orderData) {
        setOrders(orderData);
        calculateStats(orderData);
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
      profit: revenue * 0.42, // Optimized Margin
      orderCount: todayOrders.length,
      pointsIssued: Math.floor(revenue / 10)
    });
  };

  const fetchCustomerHistory = async (phone: string) => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("phone", phone)
      .order("created_at", { ascending: false });
    if (data) setCustomerHistory(data);
  };

  useEffect(() => {
    if (selectedOrder) {
      fetchCustomerHistory(selectedOrder.phone);
    }
  }, [selectedOrder]);

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

  const downloadSalesReport = () => {
    const headers = ["Order ID", "Date", "Customer", "Phone", "Amount", "Status"];
    const csvData = orders.map(o => [o.id, new Date(o.created_at).toLocaleDateString(), o.name, `'${o.phone}`, o.total_amount, o.status]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + csvData.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KruaBaanGem_v4_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-mala-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              className="bg-slate-900/40 backdrop-blur-3xl p-10 md:p-16 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-lg border border-slate-800/50 relative z-10"
            >
                <div className="text-center mb-12">
                    <motion.div 
                      animate={{ rotate: [0, 5, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-24 h-24 bg-gradient-to-br from-mala-500 to-mala-700 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-[0_20px_50px_rgba(220,38,38,0.3)]"
                    >
                        <ChefHat className="w-12 h-12 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-black text-white mb-3 tracking-tighter italic">MERCHANT OS</h1>
                    <p className="text-slate-500 uppercase tracking-[0.4em] text-[10px] font-black">Authentication Required</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if (username === "admin" && password === "1234") setIsAuthenticated(true); else alert("Access Denied"); }} className="space-y-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-mala-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <input 
                        type="text" 
                        placeholder="ACCESS KEY" 
                        className="relative w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-6 px-10 text-white font-bold tracking-widest focus:ring-2 focus:ring-mala-500 outline-none transition-all placeholder:text-slate-700" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                      />
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <input 
                        type="password" 
                        placeholder="SECURITY PIN" 
                        className="relative w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-6 px-10 text-white text-4xl font-black tracking-[0.5em] focus:ring-2 focus:ring-mala-500 outline-none transition-all placeholder:text-slate-700" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                      />
                    </div>
                    <button className="w-full bg-mala-600 hover:bg-mala-500 text-white py-6 rounded-2xl font-black text-xl shadow-[0_20px_40px_rgba(220,38,38,0.2)] active:scale-95 transition-all uppercase tracking-widest">
                        Authorize
                    </button>
                </form>
            </motion.div>
        </div>
    );
  }

  const filteredOrders = orders.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.phone.includes(searchQuery));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex font-sans overflow-hidden">
      {/* HUD - Futuristic Sidebar */}
      <motion.aside 
        animate={{ width: isSidebarOpen ? 280 : 100 }}
        className="bg-[#020617] border-r border-slate-800/50 relative z-50 flex flex-col items-center py-12 px-6 overflow-hidden"
      >
        <div className="w-full flex justify-center mb-16 relative">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 bg-gradient-to-tr from-mala-600 to-mala-400 rounded-[1.5rem] flex items-center justify-center shadow-[0_10px_30px_rgba(220,38,38,0.4)] cursor-pointer"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
              <ChefHat className="w-9 h-9 text-white" />
          </motion.div>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-8 text-[10px] font-black text-mala-500 tracking-[0.3em] uppercase">
              Gem's OS v4
            </motion.div>
          )}
        </div>

        <nav className="flex flex-col gap-4 w-full">
            {[
                { id: "orders", icon: ShoppingBag, label: "Live Feed" },
                { id: "analytics", icon: Activity, label: "Telemetry" },
                { id: "menu", icon: Layers, label: "Inventory" }
            ].map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id as any)} 
                  className={`w-full h-16 rounded-2xl flex items-center gap-6 px-6 transition-all relative group ${activeTab === tab.id ? "bg-mala-600/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                    <tab.icon className={`w-6 h-6 shrink-0 ${activeTab === tab.id ? "text-mala-500" : ""}`} />
                    {isSidebarOpen && <span className="font-bold text-sm uppercase tracking-widest">{tab.label}</span>}
                    {activeTab === tab.id && (
                      <motion.div layoutId="sidebarActive" className="absolute left-0 w-1 h-8 bg-mala-600 rounded-r-full shadow-[0_0_10px_#dc2626]" />
                    )}
                </button>
            ))}
        </nav>

        <div className="mt-auto w-full">
          <button 
            onClick={() => setIsAuthenticated(false)} 
            className="w-full h-16 rounded-2xl flex items-center gap-6 px-6 text-slate-600 hover:text-red-500 hover:bg-red-500/5 transition-all group"
          >
              <LogOut className="w-6 h-6 shrink-0" />
              {isSidebarOpen && <span className="font-bold text-sm uppercase tracking-widest">Terminate</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Command Center */}
      <main className="flex-1 flex flex-col relative bg-slate-950/20">
        {/* Top Header Panel */}
        <header className="h-28 px-12 bg-[#020617]/80 backdrop-blur-3xl border-b border-slate-800/50 flex items-center justify-between z-40">
            <div className="flex items-center gap-12">
                <div className="flex flex-col">
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{activeTab}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Terminal Active • encrypted</p>
                    </div>
                </div>

                <div className="hidden xl:flex items-center gap-8 pl-12 border-l border-slate-800/50">
                    <div className="text-center">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Revenue</p>
                        <p className="text-2xl font-black text-white tracking-tight">฿{stats.revenue.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-1">Live Profit</p>
                        <p className="text-2xl font-black text-green-500 tracking-tight">฿{stats.profit.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-black text-mala-500 uppercase tracking-widest mb-1">Loyalty Points</p>
                        <p className="text-2xl font-black text-white tracking-tight flex items-center gap-2 justify-center">
                          <Star className="w-4 h-4 fill-mala-500 text-mala-500" /> {stats.pointsIssued.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="relative group hidden md:block">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-mala-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="SEARCH RECORDS..." 
                      className="bg-slate-900/50 border border-slate-800 rounded-3xl py-4 pl-14 pr-8 text-[11px] font-bold text-white focus:ring-2 focus:ring-mala-500/50 outline-none w-80 transition-all placeholder:text-slate-700" 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                    />
                </div>
                <button 
                  onClick={downloadSalesReport} 
                  className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-green-500 hover:border-green-500/30 transition-all shadow-xl"
                  title="Export Intelligence"
                >
                    <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={fetchData} 
                  className={`p-4 bg-mala-600/10 border border-mala-600/20 rounded-2xl text-mala-500 hover:bg-mala-600 hover:text-white transition-all shadow-2xl shadow-mala-600/10 ${isRefreshing ? 'animate-spin' : ''}`}
                >
                    <Zap className="w-5 h-5" />
                </button>
            </div>
        </header>

        {/* Tactical Content View */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
            {activeTab === "orders" && (
                <div className="flex flex-col xl:flex-row gap-12 h-full">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8 h-fit">
                        <AnimatePresence mode="popLayout">
                          {filteredOrders.map((order) => (
                              <motion.div 
                                layout 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={order.id} 
                                onClick={() => setSelectedOrder(order)} 
                                className={`group p-10 rounded-[3.5rem] border-2 cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between min-h-[300px] ${selectedOrder?.id === order.id ? "bg-slate-900 border-mala-600 shadow-[0_30px_70px_rgba(220,38,38,0.15)]" : "bg-[#0f172a]/40 border-slate-800/50 hover:border-slate-700"}`}
                              >
                                  {/* Glass Highlight */}
                                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                                  
                                  <div className="relative z-10">
                                      <div className="flex justify-between items-start mb-8">
                                          <div>
                                              <p className="text-[9px] font-black text-mala-500 uppercase tracking-[0.3em] mb-2">Sequence #{order.id.slice(-6).toUpperCase()}</p>
                                              <h4 className="text-3xl font-black text-white leading-none tracking-tighter">{order.name}</h4>
                                              <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-widest">{new Date(order.created_at).toLocaleTimeString()}</p>
                                          </div>
                                          <div className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border ${
                                              order.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                              order.status === 'preparing' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                              order.status === 'ready' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                              order.status === 'delivering' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                              order.status === 'delivered' ? 'bg-green-500/10 text-green-700 border-green-500/20' :
                                              'bg-red-500/10 text-red-500 border-red-500/20'
                                          }`}>
                                              {order.status}
                                          </div>
                                      </div>

                                      <div className="space-y-2 mb-8">
                                          {order.order_items.slice(0, 2).map((item, i) => (
                                            <div key={i} className="text-xs font-bold text-slate-400 flex justify-between">
                                              <span>{item.name} x{item.quantity}</span>
                                              <span className="text-slate-600">฿{item.price * item.quantity}</span>
                                            </div>
                                          ))}
                                          {order.order_items.length > 2 && <p className="text-[10px] text-mala-500 font-black">+ {order.order_items.length - 2} MORE ITEMS</p>}
                                      </div>
                                  </div>
                                  
                                  <div className="relative z-10 flex items-center justify-between pt-8 border-t border-slate-800/50">
                                      <div className="flex flex-col">
                                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Gross Total</p>
                                          <p className="text-2xl font-black text-white">฿{order.total_amount.toLocaleString()}</p>
                                      </div>
                                      <div className="flex gap-2">
                                        <div className={`w-3 h-3 rounded-full ${order.payment_status === 'verified' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'}`} title={order.payment_status} />
                                        <ChevronRight className={`w-6 h-6 transition-transform group-hover:translate-x-1 ${selectedOrder?.id === order.id ? "text-mala-500" : "text-slate-700"}`} />
                                      </div>
                                  </div>
                              </motion.div>
                          ))}
                        </AnimatePresence>
                    </div>

                    {/* Information Nexus - Order & Customer Intelligence */}
                    <AnimatePresence>
                        {selectedOrder ? (
                            <motion.div 
                              initial={{ opacity: 0, x: 100 }} 
                              animate={{ opacity: 1, x: 0 }} 
                              exit={{ opacity: 0, x: 100 }}
                              className="w-full xl:w-[500px] bg-slate-900/60 backdrop-blur-3xl rounded-[4rem] border border-slate-800 shadow-[0_50px_100px_rgba(0,0,0,0.5)] p-12 flex flex-col gap-10 sticky top-0"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                      <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Mission File</h3>
                                      <p className="text-[10px] font-black text-slate-500 tracking-[0.3em]">Customer Data Integrity: 100%</p>
                                    </div>
                                    <button onClick={() => setSelectedOrder(null)} className="p-4 hover:bg-slate-800 rounded-3xl transition-all">
                                        <X className="w-8 h-8" />
                                    </button>
                                </div>

                                {/* Customer Intelligence HUD */}
                                <div className="bg-slate-950/50 p-10 rounded-[3rem] border border-slate-800/50 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                                      <Star className="w-20 h-20 fill-mala-500 text-mala-500 -mr-6 -mt-6" />
                                    </div>
                                    <div className="relative z-10 flex flex-col items-center text-center mb-10">
                                        <div className="w-24 h-24 bg-gradient-to-br from-mala-600 to-mala-800 rounded-full flex items-center justify-center text-white shadow-2xl mb-6 border-4 border-slate-900">
                                            <span className="text-3xl font-black">{selectedOrder.name[0]}</span>
                                        </div>
                                        <p className="text-3xl font-black text-white tracking-tighter">{selectedOrder.name}</p>
                                        <p className="text-sm font-bold text-slate-500 flex items-center gap-2 mt-1">
                                          <Phone className="w-4 h-4 text-mala-500" /> {selectedOrder.phone}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 relative z-10">
                                        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Loyalty Pool</p>
                                            <p className="text-2xl font-black text-mala-500">{Math.floor(selectedOrder.total_amount / 10)} <span className="text-xs uppercase">PTS</span></p>
                                        </div>
                                        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Deploy History</p>
                                            <p className="text-2xl font-black text-white">{customerHistory.length} <span className="text-xs uppercase">Orders</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                      <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Inventory List</h5>
                                      <span className="text-[11px] font-black text-mala-500">{selectedOrder.order_items?.length} items</span>
                                    </div>
                                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedOrder.order_items?.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center p-6 bg-slate-950/40 rounded-3xl border border-slate-800/30">
                                                <div className="flex-1">
                                                    <p className="text-base font-black text-white">{item.name} <span className="text-mala-500 ml-2 text-sm">x{item.quantity}</span></p>
                                                    {item.options && <p className="text-[11px] text-slate-500 mt-2 italic font-medium">{item.options}</p>}
                                                </div>
                                                <p className="text-base font-black text-slate-300 ml-4">฿{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Status Control Matrix */}
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    {[
                                      { id: 'preparing', icon: ChefHat, label: 'Cook', color: 'orange' },
                                      { id: 'ready', icon: Package, label: 'Ready', color: 'blue' },
                                      { id: 'delivering', icon: Truck, label: 'Deploy', color: 'purple' },
                                      { id: 'delivered', icon: CheckCircle, label: 'Archive', color: 'green' }
                                    ].map(btn => (
                                      <button 
                                        key={btn.id}
                                        onClick={() => updateOrderStatus(selectedOrder.id, btn.id as any)}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border transition-all active:scale-95 ${
                                          selectedOrder.status === btn.id 
                                            ? `bg-${btn.color}-600 border-${btn.color}-500 text-white shadow-lg` 
                                            : `bg-slate-950 border-slate-800 text-slate-500 hover:border-${btn.color}-500 hover:text-white`
                                        }`}
                                      >
                                          <btn.icon className="w-6 h-6" />
                                          <span className="text-[11px] font-black uppercase tracking-widest">{btn.label}</span>
                                      </button>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                  <button 
                                    onClick={() => setIsReceiptModalOpen(true)}
                                    className="flex-1 bg-white hover:bg-slate-100 text-black py-6 rounded-3xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl"
                                  >
                                      <Printer className="w-5 h-5" /> GENERATE INVOICE
                                  </button>
                                  <button 
                                    onClick={() => window.open(selectedOrder.slip_url, '_blank')}
                                    disabled={!selectedOrder.slip_url}
                                    className="p-6 bg-slate-800 text-white rounded-3xl border border-slate-700 disabled:opacity-20 active:scale-95 transition-all"
                                  >
                                      <Eye className="w-6 h-6" />
                                  </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="hidden xl:flex w-[500px] flex-col items-center justify-center bg-slate-900/10 rounded-[4rem] border-4 border-dashed border-slate-900">
                                <motion.div 
                                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                                  transition={{ duration: 4, repeat: Infinity }}
                                  className="text-center"
                                >
                                    <Activity className="w-32 h-32 text-slate-800 mx-auto mb-8" />
                                    <p className="text-slate-700 font-black uppercase tracking-[0.5em] text-sm">Waiting for selection...</p>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {activeTab === "analytics" && (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {[
                          { label: "Gross Revenue", value: `฿${stats.revenue.toLocaleString()}`, color: "text-white", icon: DollarSign, trend: "+12.5%" },
                          { label: "Deployment Count", value: stats.orderCount, color: "text-mala-500", icon: Layers, trend: "+3.2%" },
                          { label: "Net Intelligence", value: `฿${stats.profit.toLocaleString()}`, color: "text-green-500", icon: Activity, trend: "+8.1%" },
                          { label: "Points Pool", value: stats.pointsIssued, color: "text-blue-500", icon: Star, trend: "+15.0%" }
                        ].map((s, i) => (
                          <div key={i} className="bg-slate-900/60 p-10 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                              <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity ${s.color}`}>
                                <s.icon className="w-24 h-24 -mr-4 -mt-4" />
                              </div>
                              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">{s.label}</p>
                              <p className={`text-4xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
                              <div className="flex items-center gap-2 mt-4">
                                <ArrowUpRight className="w-3 h-3 text-green-500" />
                                <span className="text-[10px] font-bold text-green-500">{s.trend} <span className="text-slate-600 ml-1 uppercase">vs baseline</span></span>
                              </div>
                          </div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="bg-[#0f172a] p-12 rounded-[4rem] border border-slate-800 h-[500px] flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-10">
                              <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Revenue Velocity</h3>
                              <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full bg-mala-500" />
                                <span className="w-3 h-3 rounded-full bg-slate-800" />
                              </div>
                            </div>
                            <div className="flex-1 flex items-end gap-3 px-4">
                              {[40, 70, 45, 90, 65, 80, 55, 100, 75, 85].map((h, i) => (
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h}%` }}
                                  transition={{ delay: i * 0.1, duration: 1 }}
                                  key={i} 
                                  className="flex-1 bg-gradient-to-t from-mala-600 to-mala-400 rounded-t-xl shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                                />
                              ))}
                            </div>
                            <div className="flex justify-between mt-6 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                <span>08:00</span>
                                <span>12:00</span>
                                <span>16:00</span>
                                <span>20:00</span>
                                <span>24:00</span>
                            </div>
                        </div>

                        <div className="bg-[#0f172a] p-12 rounded-[4rem] border border-slate-800 h-[500px] flex flex-col">
                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic mb-10">Top Inventory Performance</h3>
                            <div className="space-y-6">
                              {products.slice(0, 5).map((p, i) => (
                                <div key={i} className="space-y-2">
                                  <div className="flex justify-between text-xs font-bold text-slate-400">
                                    <span>{p.name}</span>
                                    <span className="text-white">{100 - i * 15}% Utilization</span>
                                  </div>
                                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${100 - i * 15}%` }}
                                      transition={{ duration: 2 }}
                                      className="h-full bg-blue-500 shadow-[0_0_15px_#3b82f6]" 
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "menu" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10">
                    <button className="aspect-square bg-slate-900/20 border-4 border-dashed border-slate-800 rounded-[4rem] flex flex-col items-center justify-center gap-6 text-slate-700 hover:border-mala-500 hover:text-mala-500 transition-all group active:scale-95 shadow-inner">
                        <Plus className="w-16 h-16 group-hover:scale-110 transition-transform" />
                        <span className="font-black uppercase tracking-[0.4em] text-xs">New Inventory</span>
                    </button>
                    {products.map((product) => (
                        <motion.div 
                          layout
                          key={product.id} 
                          className={`group bg-slate-900/60 p-10 rounded-[4rem] border-2 transition-all relative overflow-hidden flex flex-col ${product.is_available ? 'border-slate-800' : 'border-red-900/30'}`}
                        >
                            <div className="relative aspect-square rounded-[3rem] overflow-hidden mb-8 border-4 border-slate-800/50 shadow-2xl">
                                <Image src={product.image} alt={product.name} fill className="object-cover transition-transform group-hover:scale-110 duration-700" unoptimized />
                                {!product.is_available && (
                                    <div className="absolute inset-0 bg-red-950/80 backdrop-blur-md flex flex-col items-center justify-center">
                                        <EyeOff className="w-12 h-12 text-white mb-2" />
                                        <span className="text-white text-[11px] font-black uppercase tracking-widest">Offline</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex flex-col">
                                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{product.category}</p>
                                  <h4 className="text-2xl font-black text-white tracking-tighter leading-none">{product.name}</h4>
                                </div>
                                <span className="text-2xl font-black text-mala-500 tracking-tighter">฿{product.price}</span>
                            </div>
                            <div className="flex gap-4 mt-auto">
                                <button 
                                  onClick={() => toggleProductAvailability(product)}
                                  className={`flex-1 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${product.is_available ? 'bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-green-600 text-white hover:bg-green-500 shadow-green-600/20'}`}
                                >
                                    {product.is_available ? 'Go Offline' : 'Go Live'}
                                </button>
                                <button className="p-5 bg-slate-800 rounded-2xl text-slate-400 hover:text-white border border-slate-700 transition-all active:scale-95">
                                    <Edit3 className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
      </main>

      {/* Futuristic Receipt Modal */}
      <AnimatePresence>
        {isReceiptModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotateY: 20 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white text-black p-14 rounded-[4.5rem] w-full max-w-lg shadow-[0_0_100px_rgba(255,255,255,0.1)] overflow-hidden relative border-[12px] border-slate-100"
            >
              <button 
                onClick={() => setIsReceiptModalOpen(false)}
                className="absolute top-10 right-10 p-3 bg-slate-50 rounded-full hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-black rounded-3xl mx-auto mb-6 flex items-center justify-center text-white shadow-2xl">
                  <ChefHat className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-serif font-bold italic mb-1">Krua Baan Gem</h2>
                <p className="text-[11px] text-slate-400 uppercase tracking-[0.5em] font-black">Authorized Record</p>
              </div>

              <div className="border-y-4 border-black py-8 mb-10 space-y-4">
                <div className="flex justify-between text-sm font-black">
                  <span className="text-slate-400 uppercase tracking-widest">RECORD ID:</span>
                  <span className="uppercase">#{selectedOrder.id.slice(-12).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm font-black">
                  <span className="text-slate-400 uppercase tracking-widest">TIMESTAMP:</span>
                  <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black">
                  <span className="text-slate-400 uppercase tracking-widest">OPERATOR:</span>
                  <span>ADMINISTRATOR</span>
                </div>
              </div>

              <div className="space-y-6 mb-12 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedOrder.order_items?.map((item, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-black leading-tight">{item.name} <span className="text-slate-300 ml-2">x{item.quantity}</span></p>
                      {item.options && <p className="text-[11px] text-slate-400 mt-1 uppercase font-bold">{item.options}</p>}
                    </div>
                    <p className="text-lg font-black">฿{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-end mb-12 pt-8 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Loyalty Points Added</p>
                  <p className="text-2xl font-black text-mala-600">+{Math.floor(selectedOrder.total_amount / 10)} PTS</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Aggregate Total</p>
                  <p className="text-5xl font-black tracking-tighter">฿{selectedOrder.total_amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-4 print:hidden">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-6 bg-black text-white rounded-[2rem] font-black text-sm hover:opacity-90 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
                >
                  <Printer className="w-5 h-5" /> COMMIT PRINT
                </button>
              </div>

              <p className="text-center text-[10px] text-slate-300 uppercase tracking-[0.5em] font-black mt-10">
                End of Transmission
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Playfair+Display:ital,wght@1,700;1,900&display=swap');
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        
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
      `}</style>
    </div>
  );
}
