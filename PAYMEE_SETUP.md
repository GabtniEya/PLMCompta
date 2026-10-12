# Paiement par carte Paymee

L’acheteur est redirigé vers la page sécurisée Paymee : aucune donnée de carte ne passe par PLM Ressource.

1. Créez et validez votre compte marchand Paymee.
2. Déployez les fonctions :

   ```powershell
   supabase functions deploy create-paymee-payment
   supabase functions deploy paymee-webhook --no-verify-jwt
   ```

3. Ajoutez les secrets Supabase, jamais dans `.env` du site :

   ```powershell
   supabase secrets set PAYMEE_API_KEY="votre-cle-api"
   supabase secrets set PAYMEE_API_URL="https://app.paymee.tn/api/v2/payments/create"
   supabase secrets set PUBLIC_SITE_URL="https://votre-domaine.tn"
   ```

Pour tester, utilisez une clé sandbox et `https://sandbox.paymee.tn/api/v2/payments/create`. Passez en production après validation du compte Paymee. Le webhook vérifie la signature avant de marquer une commande comme payée ou annulée.
