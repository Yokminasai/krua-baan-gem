import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  
  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { status, payment_status, slip_url } = body;
    
    const updates: any = {};
    if (status) updates.status = status;
    if (payment_status) updates.payment_status = payment_status;
    if (slip_url) updates.slip_url = slip_url;
    
    const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select();
    
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
