-- 1. Create 'orders' table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    slip_url TEXT,
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'rejected'
    order_status TEXT DEFAULT 'pending', -- 'pending', 'preparing', 'delivering', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create 'order_items' table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    options TEXT
);

-- 3. Setup Row Level Security (RLS)
-- For simplicity in development, we allow insert/read for everyone (anon)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to orders" ON public.orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select on orders" ON public.orders FOR SELECT TO public USING (true);
CREATE POLICY "Allow update for POS" ON public.orders FOR UPDATE TO public USING (true);

CREATE POLICY "Allow public insert to order_items" ON public.order_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select on order_items" ON public.order_items FOR SELECT TO public USING (true);

-- 4. Enable Realtime on 'orders' table (Important for POS and Tracker)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 5. Create Storage Bucket for Slip Uploads
-- Run this block if you want to upload slips directly to Supabase Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('slips', 'slips', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Allow public uploads to slips" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'slips');
CREATE POLICY "Allow public read from slips" ON storage.objects FOR SELECT TO public USING (bucket_id = 'slips');
