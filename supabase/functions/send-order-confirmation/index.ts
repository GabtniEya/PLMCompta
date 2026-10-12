import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderNumber, customerName, customerEmail, total } = await request.json();
    if (!orderNumber || !customerName || !customerEmail || total == null) {
      return Response.json({ error: 'Informations manquantes' }, { status: 400, headers: corsHeaders });
    }
    const apiKey = Deno.env.get('RESEND_API_KEY');
    const from = Deno.env.get('ORDER_EMAIL_FROM');
    if (!apiKey || !from) return Response.json({ configured: false, headers: corsHeaders });
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [customerEmail],
      subject: `Confirmation de commande ${orderNumber} - PLM Ressource`,
      html: `<h1>Merci ${customerName}</h1><p>Votre commande <strong>${orderNumber}</strong> a été enregistrée.</p><p>Montant total : <strong>${Number(total).toFixed(3)} TND</strong></p><p>Statut : en attente de paiement. Notre équipe vous contactera sous 48 heures.</p>`,
    });
    if (error) throw error;
    return Response.json({ sent: true, headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Erreur e-mail' }, { status: 500, headers: corsHeaders });
  }
});
