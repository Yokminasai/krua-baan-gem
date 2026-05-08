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
  FileSpreadsheet
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
      profit: revenue * 0.35,
      orderCount: todayOrders.length,
      pointsIssued: Math.floor(revenue / 10) // 10 THB = 1 Point
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

  const downloadSalesReport = () => {
    const headers = ["Order ID", "Date", "Customer", "Phone", "Amount", "Status"];
    const csvData = orders.map(o => [
      o.id,
      new Date(o.created_at).toLocaleDateString(),
      o.name,
      `'${o.phone}`, // Force string in Excel
      o.total_amount,
      o.status
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + csvData.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KruaBaanGem_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0f172a] p-12 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-800">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-mala-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl rotate-3">
                        <ChefHat className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Merchant Command</h1>
                    <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Krua Baan Gem OS v3.1</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if (username === "admin" && password === "1234") setIsAuthenticated(true); else alert("Login Failed"); }} className="space-y-6">
                    <input type="text" placeholder="Access Key" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-5 px-8 text-white focus:ring-2 focus:ring-mala-500 outline-none" value={username} onChange={e => setUsername(e.target.value)} />
                    <input type="password" placeholder="Security PIN" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-5 px-8 text-white text-3xl tracking-widest focus:ring-2 focus:ring-mala-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
                    <button className="w-full bg-mala-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-mala-700 shadow-xl shadow-mala-600/20 transition-all">Sign In</button>
                </form>
            </motion.div>
        </div>
    );
  }

  const filteredOrders = orders.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.phone.includes(searchQuery));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-28 bg-[#0f172a] border-r border-slate-800 flex flex-col items-center py-12 gap-8">
        <div className="w-16 h-16 bg-mala-600 rounded-2xl flex items-center justify-center shadow-lg rotate-3 mb-4">
            <ChefHat className="w-10 h-10 text-white" />
        </div>
        <nav className="flex flex-col gap-4 flex-1">
            {[
                { id: "orders", icon: ShoppingBag, label: "Orders" },
                { id: "analytics", icon: BarChart3, label: "Analytics" },
                { id: "menu", icon: Package, label: "Menu" }
            ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all ${activeTab === tab.id ? "bg-mala-600 text-white shadow-xl shadow-mala-600/20 scale-110" : "text-slate-500 hover:bg-slate-800"}`}>
                    <tab.icon className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
                </button>
            ))}
        </nav>
        <button onClick={() => setIsAuthenticated(false)} className="w-16 h-16 rounded-3xl flex items-center justify-center text-slate-500 hover:text-red-500 transition-all">
            <LogOut className="w-6 h-6" />
        </button>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-24 px-10 bg-[#020617]/50 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between z-20">
            <div className="flex items-center gap-10">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{activeTab}</h2>
                    <p className="text-[10px] font-black text-mala-500 uppercase tracking-widest mt-1">Merchant Intelligence v3.1</p>
                </div>
                <div className="hidden lg:flex gap-6">
                    <div className="bg-slate-900 px-6 py-2 rounded-2xl border border-slate-800">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Sales</p>
                        <p className="text-xl font-black text-white">฿{stats.revenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900 px-6 py-2 rounded-2xl border border-slate-800">
                        <p className="text-[9px] font-black text-mala-500 uppercase tracking-widest mb-1">Points Issued</p>
                        <p className="text-xl font-black text-mala-500 flex items-center gap-2">
                          <Star className="w-4 h-4 fill-mala-500" /> {stats.pointsIssued.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Search customer..." className="bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:ring-2 focus:ring-mala-500 outline-none w-64" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <button onClick={downloadSalesReport} className="p-4 bg-green-600/10 text-green-500 border border-green-600/20 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-xl shadow-green-600/5">
                    <FileSpreadsheet className="w-5 h-5" />
                </button>
            </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            {activeTab === "orders" && (
                <div className="flex flex-col xl:flex-row gap-10">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
                        {filteredOrders.map((order) => (
                            <motion.div layout key={order.id} onClick={() => setSelectedOrder(order)} className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all ${selectedOrder?.id === order.id ? "bg-slate-800 border-mala-600 shadow-2xl" : "bg-[#0f172a] border-slate-800 hover:border-slate-700"}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-[9px] font-black text-mala-500 uppercase tracking-widest mb-1">Order #{order.id.slice(-6).toUpperCase()}</p>
                                        <h4 className="text-2xl font-black text-white">{order.name}</h4>
                                        <p className="text-xs text-slate-500 font-bold mt-1">{new Date(order.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                        {order.status}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-mala-500">
                                            <Receipt className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 tracking-widest">Total</p>
                                            <p className="text-lg font-black text-white">฿{order.total_amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <button className="p-3 bg-slate-900 rounded-xl text-slate-500">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order & Customer Detail Pane */}
                    <AnimatePresence>
                        {selectedOrder && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full xl:w-[450px] bg-[#0f172a] rounded-[3rem] border border-slate-800 p-10 flex flex-col gap-8 h-fit">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black text-white uppercase italic">Details</h3>
                                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-800 rounded-xl">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Customer Intelligence Card */}
                                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-[2rem] border border-slate-800 shadow-inner">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 bg-mala-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-mala-600/20">
                                            <Star className="w-7 h-7 fill-white" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-black text-white">{selectedOrder.name}</p>
                                            <p className="text-sm text-slate-500">{selectedOrder.phone}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Points Earned</p>
                                            <p className="text-xl font-black text-mala-500">{Math.floor(selectedOrder.total_amount / 10)} PTS</p>
                                        </div>
                                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Visit History</p>
                                            <p className="text-xl font-black text-white">{customerHistory.length} Times</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Preferences / Past Orders */}
                                <div>
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <History className="w-3 h-3" /> Past Preferences
                                    </h5>
                                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                        {customerHistory.slice(1, 4).map((prev, i) => (
                                          <div key={i} className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800/30 flex justify-between items-center opacity-60">
                                              <p className="text-xs font-bold text-slate-400">{new Date(prev.created_at).toLocaleDateString()}</p>
                                              <p className="text-xs font-black text-white">฿{prev.total_amount}</p>
                                          </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-800/50">
                                    <button onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${selectedOrder.status === 'preparing' ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-orange-500'}`}>Start Cooking</button>
                                    <button onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${selectedOrder.status === 'delivered' ? 'bg-green-600 text-white shadow-xl shadow-green-600/20' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-green-500'}`}>Complete Order</button>
                                    <div className="flex gap-4">
                                      <button onClick={() => setIsReceiptModalOpen(true)} className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">Print Receipt</button>
                                      <button onClick={() => window.open(selectedOrder.slip_url, '_blank')} className="p-4 bg-slate-800 rounded-2xl border border-slate-700 text-slate-400 hover:text-white transition-all"><Eye className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {activeTab === "analytics" && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                          { label: "Today's Revenue", value: `฿${stats.revenue.toLocaleString()}`, color: "text-white", icon: DollarSign },
                          { label: "Orders Count", value: stats.orderCount, color: "text-mala-500", icon: ShoppingBag },
                          { label: "Est. Net Profit", value: `฿${stats.profit.toLocaleString()}`, color: "text-green-500", icon: TrendingUp },
                          { label: "New Points", value: stats.pointsIssued, color: "text-amber-500", icon: Star }
                        ].map((s, i) => (
                          <div key={i} className="bg-[#0f172a] p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
                              <s.icon className={`w-8 h-8 ${s.color} mb-6`} />
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                          </div>
                        ))}
                    </div>
                    
                    <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-slate-800 h-[400px] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-mala-500 via-transparent to-transparent"></div>
                        </div>
                        <div className="text-center z-10">
                            <BarChart3 className="w-20 h-20 text-slate-800 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-slate-500 uppercase tracking-[0.3em]">Visual Analytics (Coming Soon)</h3>
                            <p className="text-sm text-slate-600 mt-2">Charts and graphs will be populated as your data grows.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "menu" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <div key={product.id} className={`bg-[#0f172a] p-8 rounded-[2.5rem] border-2 transition-all ${product.is_available ? 'border-slate-800' : 'border-red-900/30 opacity-60'}`}>
                            <div className="relative aspect-square rounded-[1.5rem] overflow-hidden mb-6">
                                <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
                            </div>
                            <h4 className="text-xl font-black text-white mb-4">{product.name}</h4>
                            <div className="flex gap-3">
                                <button className="flex-1 py-3 bg-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all">Edit Item</button>
                                <button className={`p-3 rounded-xl transition-all ${product.is_available ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500'}`}>
                                    {product.is_available ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    ))}
                    <button className="aspect-square bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-700 hover:border-mala-500 hover:text-mala-500 transition-all">
                        <Plus className="w-12 h-12" />
                        <span className="font-black uppercase tracking-widest text-[10px]">Add Menu</span>
                    </button>
                </div>
            )}
        </div>
      </main>

      {/* Modal / Overlay for Receipt (Simple Version) */}
      <AnimatePresence>
        {isReceiptModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white text-black p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsReceiptModalOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-serif font-bold italic">Krua Baan Gem</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Digital Receipt</p>
              </div>
              <div className="border-y border-dashed border-slate-300 py-6 mb-6 space-y-2">
                <div className="flex justify-between text-xs"><span>Order ID:</span><span className="font-bold">#{selectedOrder.id.slice(-8).toUpperCase()}</span></div>
                <div className="flex justify-between text-xs"><span>Customer:</span><span className="font-bold">{selectedOrder.name}</span></div>
                <div className="flex justify-between text-xs"><span>Points Earned:</span><span className="font-bold text-mala-600">+{Math.floor(selectedOrder.total_amount / 10)}</span></div>
              </div>
              <div className="space-y-4 mb-8">
                {selectedOrder.order_items?.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <p className="text-sm font-bold">{item.name} x{item.quantity}</p>
                    <p className="text-sm font-bold">฿{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-black pt-6 flex justify-between items-center mb-10">
                <p className="text-lg font-black uppercase tracking-tighter">Total</p>
                <p className="text-3xl font-black">฿{selectedOrder.total_amount}</p>
              </div>
              <button onClick={() => window.print()} className="w-full py-4 bg-black text-white rounded-2xl font-black text-sm hover:opacity-90 active:scale-95 transition-all">Print Now</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
}
