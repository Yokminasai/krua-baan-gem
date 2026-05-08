"use client";

import { useState, useEffect, useRef } from "react";
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
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type OrderStatus = "pending" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled";

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
  order_items: any[];
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
  }, []);

  const fetchData = async () => {
    setIsRefreshing(true);
    
    // Fetch Orders
    const { data: orderData } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    // Fetch Products
    const { data: productData } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });

    if (orderData) {
      setOrders(orderData);
      calculateStats(orderData);
    }
    if (productData) setProducts(productData);
    
    setIsRefreshing(false);
  };

  const calculateStats = (allOrders: Order[]) => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = allOrders.filter(o => o.created_at.startsWith(today));
    const revenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    // Logic for profit would go here based on product costs
    setStats({
      revenue,
      profit: revenue * 0.35, // Placeholder profit margin
      orderCount: todayOrders.length
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      const channel = supabase
        .channel("pos_realtime")
        .on("postgres_changes", { event: "*", table: "orders" }, () => fetchData())
        .on("postgres_changes", { event: "*", table: "products" }, () => fetchData())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [isAuthenticated]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (!error) fetchData();
  };

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const openEditDrawer = (product: Product) => {
    setEditingProduct(product);
    setIsEditDrawerOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const { error } = await supabase
      .from('products')
      .update(editingProduct)
      .eq('id', editingProduct.id);

    if (!error) {
      fetchData();
      setIsEditDrawerOpen(false);
    }
  };

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0f172a] p-12 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-800">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-mala-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl rotate-3">
                        <ChefHat className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Merchant Pro</h1>
                    <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Krua Baan Gem OS</p>
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
    <div className="min-h-screen bg-[#020617] text-slate-300 flex">
      {/* Dynamic Sidebar */}
      <aside className="w-24 md:w-32 bg-[#0f172a] border-r border-slate-800 flex flex-col items-center py-12 gap-10">
        <div className="w-16 h-16 bg-mala-600 rounded-2xl flex items-center justify-center shadow-lg shadow-mala-600/20 rotate-3">
            <ChefHat className="w-10 h-10 text-white" />
        </div>
        <nav className="flex flex-col gap-6 flex-1">
            {[
                { id: "orders", icon: ShoppingBag, label: "Orders" },
                { id: "analytics", icon: BarChart3, label: "Stats" },
                { id: "menu", icon: Package, label: "Menu" }
            ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all ${activeTab === tab.id ? "bg-mala-600 text-white shadow-xl shadow-mala-600/20 scale-110" : "text-slate-500 hover:bg-slate-800"}`}>
                    <tab.icon className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
                </button>
            ))}
        </nav>
        <button onClick={() => setIsAuthenticated(false)} className="w-16 h-16 rounded-3xl flex items-center justify-center text-slate-500 hover:bg-red-900/20 hover:text-red-500 transition-all">
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
                    <p className="text-[10px] font-black text-mala-500 uppercase tracking-widest mt-1">Real-time Dashboard v2.0</p>
                </div>
                <div className="hidden lg:flex items-center gap-6 pl-8 border-l border-slate-800">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Today's Sales</p>
                        <p className="text-2xl font-black text-white">฿{stats.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Est. Profit</p>
                        <p className="text-2xl font-black text-green-500">฿{stats.profit.toLocaleString()}</p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Search orders..." className="bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:ring-2 focus:ring-mala-500 outline-none w-64" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <button onClick={fetchData} className={`p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all ${isRefreshing ? 'animate-spin' : ''}`}>
                    <TrendingUp className="w-5 h-5 text-mala-400" />
                </button>
            </div>
        </header>

        {/* Dynamic Body */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            {activeTab === "orders" && (
                <div className="flex flex-col xl:flex-row gap-10">
                    {/* Order Stream */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
                        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                            <motion.div layout key={order.id} onClick={() => setSelectedOrder(order)} className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all group relative overflow-hidden ${selectedOrder?.id === order.id ? "bg-slate-800 border-mala-600 shadow-2xl shadow-mala-600/10 scale-[1.02]" : "bg-[#0f172a] border-slate-800 hover:border-slate-700"}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-[10px] font-black text-mala-500 uppercase tracking-[0.2em] mb-1">Order #{order.id.slice(-4).toUpperCase()}</p>
                                        <h4 className="text-2xl font-black text-white">{order.name}</h4>
                                        <p className="text-xs text-slate-500 font-bold mt-1">{new Date(order.created_at).toLocaleTimeString()}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                        order.status === 'pending' ? 'bg-amber-500' :
                                        order.status === 'preparing' ? 'bg-orange-500' :
                                        order.status === 'ready' ? 'bg-blue-500' :
                                        'bg-green-500'
                                    } text-white shadow-lg`}>
                                        {order.status}
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-sm font-bold text-slate-400">
                                    <div className="flex items-center gap-2"><Package className="w-4 h-4 text-mala-500" /> {order.order_items?.length} Items</div>
                                    <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500" /> ฿{order.total_amount}</div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-32 text-center bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800">
                                <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest">No matching orders found</p>
                            </div>
                        )}
                    </div>

                    {/* Order Side-panel */}
                    <AnimatePresence>
                        {selectedOrder && (
                            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="w-full xl:w-[480px] bg-[#0f172a] border border-slate-800 rounded-[3rem] p-10 space-y-10 sticky top-0 shadow-3xl">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-8">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Command Detail</h3>
                                    <button onClick={() => setSelectedOrder(null)} className="p-3 bg-slate-800 rounded-full hover:bg-red-500 text-slate-400 hover:text-white transition-all"><X className="w-6 h-6" /></button>
                                </div>

                                {/* Status Workflow */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'preparing', icon: ChefHat, label: 'Cook', color: 'orange' },
                                        { id: 'ready', icon: Package, label: 'Ready', color: 'blue' },
                                        { id: 'delivering', icon: Truck, label: 'Dispatch', color: 'indigo' },
                                        { id: 'delivered', icon: CheckCircle, label: 'Finish', color: 'green' }
                                    ].map(step => (
                                        <button key={step.id} onClick={() => updateOrderStatus(selectedOrder.id, step.id as any)} className={`p-5 rounded-2xl flex flex-col items-center gap-3 border-2 transition-all font-black text-[10px] uppercase tracking-widest ${selectedOrder.status === step.id ? `bg-${step.color}-600 border-${step.color}-500 text-white shadow-lg` : "border-slate-800 text-slate-500 hover:border-slate-700"}`}>
                                            <step.icon className="w-6 h-6" /> {step.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Detailed Info */}
                                <div className="space-y-6">
                                    <div className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800 space-y-4">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Items Breakdown</p>
                                        {selectedOrder.order_items.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-mala-600/10 text-mala-500 flex items-center justify-center rounded-xl font-black">{item.quantity}x</div>
                                                    <div>
                                                        <p className="text-sm font-black text-white">{item.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{item.options || "Standard"}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-black text-white">฿{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="space-y-4 px-4">
                                        <div className="flex items-center gap-4"><div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center"><Phone className="w-5 h-5" /></div><p className="text-sm font-black text-white">{selectedOrder.phone}</p></div>
                                        <div className="flex items-center gap-4"><div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center"><MapPin className="w-5 h-5" /></div><p className="text-sm font-bold text-slate-400 line-clamp-2">{selectedOrder.address || "No address"}</p></div>
                                    </div>
                                </div>

                                {selectedOrder.slip_url && (
                                    <div className="relative aspect-video w-full rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl group">
                                        <img src={selectedOrder.slip_url} alt="Slip" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><a href={selectedOrder.slip_url} target="_blank" className="bg-white text-black px-6 py-3 rounded-full font-black text-[10px] uppercase">Review Payment</a></div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {activeTab === "menu" && (
                <div className="space-y-10 relative">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Inventory Control</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase mt-1">Manage your digital menu items</p>
                        </div>
                        <button className="bg-mala-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-mala-600/20 hover:bg-mala-700 transition-all"><Plus className="w-5 h-5" /> Add Product</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div key={product.id} onClick={() => openEditDrawer(product)} className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] overflow-hidden group hover:border-mala-500/50 transition-all cursor-pointer">
                                <div className="relative aspect-video">
                                    <img src={product.image} alt={product.name} className={`w-full h-full object-cover transition-all ${!product.is_available ? "grayscale brightness-50" : ""}`} />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <div className={`p-2 rounded-lg backdrop-blur-md border ${product.is_available ? "bg-green-500/20 border-green-500/30 text-green-500" : "bg-red-500/20 border-red-500/30 text-red-500"}`}>
                                            {product.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-xl font-black text-white line-clamp-1">{product.name}</h4>
                                        <span className="text-lg font-black text-mala-500">฿{product.price}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                        <p className="text-[10px] font-black text-slate-500 uppercase">{product.category || 'No Category'}</p>
                                        <div className="flex gap-2">
                                            <button className="p-3 bg-slate-800 rounded-xl text-slate-400 group-hover:text-white transition-all"><Edit3 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Grab-style Edit Drawer */}
                    <AnimatePresence>
                        {isEditDrawerOpen && editingProduct && (
                            <>
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    onClick={() => setIsEditDrawerOpen(false)}
                                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                                />
                                <motion.div 
                                    initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                    className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#0f172a] shadow-3xl z-[101] overflow-hidden flex flex-col"
                                >
                                    {/* Drawer Header (Grab Style) */}
                                    <header className="relative h-64 shrink-0 bg-slate-800">
                                        <img src={editingProduct.image} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent" />
                                        <button onClick={() => setIsEditDrawerOpen(false)} className="absolute top-6 left-6 p-4 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all">
                                            <X className="w-6 h-6" />
                                        </button>
                                        <div className="absolute bottom-8 left-10 right-10 flex justify-between items-end">
                                            <div>
                                                <p className="text-mala-500 font-black text-3xl mb-1">฿ {editingProduct.price}</p>
                                                <h3 className="text-2xl font-black text-white leading-tight">{editingProduct.name}</h3>
                                            </div>
                                        </div>
                                    </header>

                                    {/* Drawer Content */}
                                    <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                                        {/* Basic Info Section */}
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Item Name</label>
                                                    <input 
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-mala-500 outline-none transition-all"
                                                        value={editingProduct.name}
                                                        onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Description</label>
                                                    <textarea 
                                                        rows={4}
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-mala-500 outline-none transition-all resize-none"
                                                        value={editingProduct.description}
                                                        onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Category</label>
                                                    <select 
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-mala-500 outline-none transition-all appearance-none"
                                                        value={editingProduct.category}
                                                        onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                                                    >
                                                        <option value="mala">หม่าล่า & มาม่า</option>
                                                        <option value="main">อาหารจานเดียว</option>
                                                        <option value="healthy">สุขภาพ & ของหวาน</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Base Price</label>
                                                    <div className="relative">
                                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-500">฿</span>
                                                        <input 
                                                            type="number"
                                                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white focus:ring-2 focus:ring-mala-500 outline-none transition-all"
                                                            value={editingProduct.price}
                                                            onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Modifiers Preview (Like Grab UI) */}
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                                                <h4 className="text-lg font-black text-white uppercase tracking-tighter">ตัวเลือกเสริม (Modifiers)</h4>
                                                <button className="text-mala-500 text-[10px] font-black uppercase hover:underline">แก้ไข</button>
                                            </div>
                                            <div className="space-y-4">
                                                {[
                                                    { name: "ระดับความเผ็ด", rule: "3 ตัวเลือก | เลือกได้ 1 ถึง 3" },
                                                    { name: "พิเศษไหมครับ", rule: "2 ตัวเลือก | ต้องเลือก 1" },
                                                    { name: "เพิ่มซอส", rule: "5 ตัวเลือก | สูงสุด 1 (ไม่บังคับ)" }
                                                ].map((mod, idx) => (
                                                    <div key={idx} className="flex items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 group hover:border-slate-700 transition-all">
                                                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-mala-500 transition-all">
                                                            <Plus className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-black text-white text-sm">{mod.name}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{mod.rule}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Drawer Footer */}
                                    <footer className="p-10 bg-slate-900 border-t border-slate-800 flex gap-4">
                                        <button className="flex-1 py-5 bg-red-900/20 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-900/40 transition-all">ลบรายการ</button>
                                        <button 
                                            onClick={handleSaveProduct}
                                            className="flex-[2] py-5 bg-mala-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-mala-700 shadow-xl shadow-mala-600/20 transition-all"
                                        >
                                            บันทึกและปรับปรุงเมนู
                                        </button>
                                    </footer>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {activeTab === "analytics" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[3rem] h-[500px] flex flex-col items-center justify-center text-center">
                            <BarChart3 className="w-20 h-20 text-slate-800 mb-6" />
                            <h3 className="text-2xl font-black text-slate-600 uppercase tracking-tighter">Sales Performance Radar</h3>
                            <p className="text-slate-700 max-w-sm mt-2 font-medium italic">Advanced visualization system is aggregating your data points...</p>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="bg-mala-600 p-10 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-mala-600/30">
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Monthly Goal</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-black uppercase"><span className="opacity-70">Progress</span><span>75%</span></div>
                                <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden"><div className="w-3/4 h-full bg-white" /></div>
                            </div>
                            <p className="text-sm font-medium leading-relaxed opacity-90">คุณทำยอดขายได้ 75% ของเป้าหมายเดือนนี้แล้ว อีกเพียง ฿15,000 จะถึงเป้าครับ!</p>
                        </div>
                        <div className="bg-[#0f172a] border border-slate-800 p-10 rounded-[3rem] space-y-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Profit Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500 uppercase">Gross Sales</span><span className="font-black text-white">฿{stats.revenue.toLocaleString()}</span></div>
                                <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500 uppercase">Material Costs</span><span className="font-black text-red-500">- ฿{(stats.revenue * 0.45).toLocaleString()}</span></div>
                                <div className="flex justify-between items-center border-t border-slate-800 pt-4"><span className="text-sm font-black text-white uppercase">Net Income</span><span className="text-xl font-black text-green-500">฿{stats.profit.toLocaleString()}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
