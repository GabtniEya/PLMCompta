import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import MD5 from 'npm:crypto-js@4.2.0/md5';

Deno.serve(async (request) => {
  try {
    const payload = await request.json();
    const apiKey = Deno.env.get('PAYMEE_API_KEY');
    const expectedChecksum = MD5(`${payload.token}${payload.payment_status ? 1 : 0}${apiKey}`).toString();
    if (!apiKey || payload.check_sum !== expectedChecksum) return new Response('Invalid signature', { status: 401 });
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { error } = await supabase.from('orders').update({ status: payload.payment_status ? 'paid' : 'cancelled' }).eq('id', payload.order_id);
    if (error) throw error;
    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Webhook error' }, { status: 400 });
  }
});
