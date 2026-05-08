import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const coordinates = JSON.parse(formData.get('coordinates') as string);
    const items = JSON.parse(formData.get('items') as string);
    const slipFile = formData.get('slip') as File | null;

    // Generate Google Maps link if coordinates exist
    const locationUrl = coordinates ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}` : null;

    // Insert order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        name,
        phone,
        address,
        location_url: locationUrl,
        total_amount: items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0),
        status: 'pending',
        payment_status: 'pending',
      })
      .select('id')
      .single();

    if (orderError) throw orderError;
    const orderId = order.id;

    // Upload slip if provided
    let slipUrl = null;
    if (slipFile) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('order_slips')
        .upload(`${orderId}/${slipFile.name}`, slipFile, { upsert: true });
      if (uploadError) throw uploadError;
      slipUrl = supabase.storage.from('order_slips').getPublicUrl(`${orderId}/${slipFile.name}`).data.publicUrl;
      // Update order with slip URL
      await supabase.from('orders').update({ slip_url: slipUrl }).eq('id', orderId);
    }

    // Insert order items
    const orderItems = items.map((i: any) => ({
      order_id: orderId,
      menu_id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    return NextResponse.json({ orderId }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
