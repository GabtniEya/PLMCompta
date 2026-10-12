# Mise en production sans paiement en ligne

## 1. Base de données sécurisée

Dans le tableau de bord Supabase, ouvrez **SQL Editor** puis exécutez, dans l’ordre, toutes les migrations du dossier `supabase/migrations/`, notamment `20260904090000_secure_admin_accounting.sql`.

## 2. Autoriser le premier administrateur

Créez le compte depuis `/admin`, puis exécutez une seule fois dans le SQL Editor, en remplaçant l’e-mail :

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'votre-email@domaine.tn');
```

Les autres comptes restent des clients et ne peuvent pas accéder aux données de gestion.

Après avoir exécuté la migration et autorisé le premier administrateur, définissez `VITE_REQUIRE_ADMIN_ROLE=true` dans les variables d’environnement de l’hébergeur. Cette option est volontairement désactivée en local afin de faciliter les essais.

## 3. Informations légales

Avant publication, renseignez dans l’administration votre raison sociale, matricule fiscal, adresse, e-mail et téléphone. Vérifiez avec votre comptable que le format de facture correspond à vos obligations fiscales.

## 4. Hébergement HTTPS

Déployez le site sur Vercel, Netlify ou votre hébergeur, connectez votre domaine, puis imposez HTTPS. Dans Supabase Auth, ajoutez l’URL de production aux **Redirect URLs**.

## 5. Paiement

Le projet reste en mode test. Ne définissez pas `VITE_PAYMENT_MODE=paymee` : aucune passerelle de paiement réel n’est activée.

## 6. Confirmation de commande par e-mail

Créez un compte Resend, vérifiez votre domaine d’envoi, puis déployez la fonction :

```powershell
supabase functions deploy send-order-confirmation --no-verify-jwt
supabase secrets set RESEND_API_KEY="votre-cle-resend"
supabase secrets set ORDER_EMAIL_FROM="PLM Ressource <commandes@votre-domaine.tn>"
```

N’ajoutez jamais ces clés dans le fichier `.env` du front-end.
