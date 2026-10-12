import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { orderId, orderNumber, amount, customerName, customerEmail, customerPhone } = await request.json();
    if (!orderId || !orderNumber || !amount || !customerName || !customerEmail || !customerPhone) throw new Error('Informations de paiement incomplètes.');
    const apiKey = Deno.env.get('PAYMEE_API_KEY');
    const siteUrl = Deno.env.get('PUBLIC_SITE_URL');
    if (!apiKey || !siteUrl) throw new Error('Le paiement Paymee n’est pas encore configuré.');
    const [firstName, ...lastNameParts] = String(customerName).trim().split(/\s+/);
    const response = await fetch(Deno.env.get('PAYMEE_API_URL') || 'https://sandbox.paymee.tn/api/v2/payments/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Token ${apiKey}` },
      body: JSON.stringify({ amount: Number(amount), note: `Commande ${orderNumber}`, first_name: firstName, last_name: lastNameParts.join(' ') || firstName, email: customerEmail, phone: customerPhone, order_id: orderId, return_url: `${siteUrl}/?payment=processing&order=${encodeURIComponent(orderNumber)}`, cancel_url: `${siteUrl}/?payment=cancelled&order=${encodeURIComponent(orderNumber)}`, webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/paymee-webhook` }),
    });
    const payment = await response.json();
    if (!response.ok || !payment.data?.payment_url) throw new Error(payment.message || 'Paymee a refusé la création du paiement.');
    return Response.json({ payment_url: payment.data.payment_url }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Erreur de paiement' }, { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
