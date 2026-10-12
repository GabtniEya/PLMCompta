/*
# PLM Ressource — Services E-Commerce Schema

## Overview
Creates the database schema for the PLM Ressource e-commerce platform where
clients can browse professional services, add them to a cart, and place orders
paid in Tunisian Dinars (TND).

## 1. New Tables

### `services`
Catalog of professional services offered by PLM Ressource.
- `id` (uuid, primary key)
- `name` (text, not null) — service title
- `slug` (text, unique, not null) — URL-friendly identifier
- `description` (text, not null) — detailed service description
- `short_description` (text) — one-line summary for cards
- `price_tnd` (numeric(10,3), not null) — price in Tunisian Dinars
- `category` (text, not null) — service category for filtering
- `image_url` (text) — cover image URL
- `icon_name` (text) — lucide-react icon name for the service
- `features` (jsonb, default '[]') — list of included features
- `is_active` (boolean, default true) — soft-disable a service
- `display_order` (integer, default 0) — sort order on the catalog page
- `created_at` (timestamptz, default now())

### `orders`
Customer orders containing one or more services.
- `id` (uuid, primary key)
- `order_number` (text, unique, not null) — human-readable order reference
- `customer_name` (text, not null)
- `customer_email` (text, not null)
- `customer_phone` (text)
- `customer_address` (text)
- `total_tnd` (numeric(10,3), not null) — total order amount in TND
- `status` (text, not null default 'pending') — pending, paid, cancelled
- `payment_method` (text, default 'card')
- `notes` (text)
- `created_at` (timestamptz, default now())

### `order_items`
Line items linking orders to services (snapshot of price at order time).
- `id` (uuid, primary key)
- `order_id` (uuid, not null, references orders(id) ON DELETE CASCADE)
- `service_id` (uuid, references services(id) ON DELETE SET NULL)
- `service_name` (text, not null) — snapshot of service name
- `price_tnd` (numeric(10,3), not null) — snapshot of price at order time
- `quantity` (integer, not null default 1)
- `created_at` (timestamptz, default now())

## 2. Security
- RLS enabled on all three tables.
- `services`: public read (anon + authenticated), no public writes — the catalog
  is managed by the company, not by visitors.
- `orders` and `order_items`: public insert (anon + authenticated) so checkout
  works without a login; public read is intentionally enabled so customers can
  look up their order by ID. This is a single-tenant no-auth app.

## 3. Indexes
- `services` on `category` and `is_active` for catalog filtering
- `order_items` on `order_id` for join performance

## 4. Seed Data
Eight professional services across categories, priced in TND, with features
and Pexels cover images.
*/

-- ============================================================
-- SERVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  short_description text,
  price_tnd numeric(10,3) NOT NULL,
  category text NOT NULL,
  image_url text,
  icon_name text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  customer_address text,
  total_tnd numeric(10,3) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_method text DEFAULT 'card',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_orders" ON orders;
CREATE POLICY "public_read_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- ORDER_ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  price_tnd numeric(10,3) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_order_items" ON order_items;
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_order_items" ON order_items;
CREATE POLICY "public_read_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO services (name, slug, description, short_description, price_tnd, category, image_url, icon_name, features, is_active, display_order)
VALUES
  (
    'Conseil Stratégique',
    'conseil-strategique',
    'Accompagnement complet dans la définition de votre stratégie d''entreprise. Nos experts analysent votre marché, identifient les opportunités de croissance et élaborent un plan d''action sur mesure pour assurer votre compétitivité.',
    'Analyse et plan stratégique sur mesure',
    2500.000,
    'Conseil',
    'https://images.pexels.com/photos/20752572/pexels-photo-20752572.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'Lightbulb',
    '["Analyse de marché approfondie","Plan stratégique sur 3 ans","Identification des opportunités","Tableau de bord KPI","Accompagnement mensuel"]',
    true,
    1
  ),
  (
    'Développement Logiciel',
    'developpement-logiciel',
    'Conception et développement d''applications web, mobiles et logicielles sur mesure. Notre équipe utilise les technologies les plus récentes pour livrer des solutions performantes, évolutives et sécurisées.',
    'Applications web et mobiles sur mesure',
    8000.000,
    'Technologie',
    'https://images.pexels.com/photos/1102797/pexels-photo-1102797.png?auto=compress&cs=tinysrgb&h=650&w=940',
    'Code2',
    '["Application web responsive","Application mobile iOS/Android","Architecture scalable","Tests automatisés","Maintenance 6 mois incluse"]',
    true,
    2
  ),
  (
    'Marketing Digital',
    'marketing-digital',
    'Stratégie marketing digitale complète pour augmenter votre visibilité en ligne. SEO, campagnes publicitaires, gestion des réseaux sociaux et analyse de performance pour maximiser votre ROI.',
    'SEO, publicité et réseaux sociaux',
    3500.000,
    'Marketing',
    'https://images.pexels.com/photos/97080/pexels-photo-97080.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'TrendingUp',
    '["Audit SEO complet","Campagnes Google Ads","Gestion réseaux sociaux","Rapports mensuels","Stratégie de contenu"]',
    true,
    3
  ),
  (
    'Design Graphique',
    'design-graphique',
    'Création d''identités visuelles uniques et mémorables. Logos, chartes graphiques, supports de communication et design d''interfaces pour une marque qui se démarque.',
    'Identité visuelle et supports de communication',
    1800.000,
    'Création',
    'https://images.pexels.com/photos/16313664/pexels-photo-16313664.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'Palette',
    '["Logo professionnel","Charte graphique complète","Cartes de visite","Déclinaisons réseaux sociaux","Fichiers sources inclus"]',
    true,
    4
  ),
  (
    'Comptabilité & Finance',
    'comptabilite-finance',
    'Services comptables complets : tenue de comptes, déclarations fiscales, bilans annuels et conseil financier. Conformité garantie avec la législation tunisienne.',
    'Tenue de comptes et conseil fiscal',
    1200.000,
    'Finance',
    'https://images.pexels.com/photos/33175651/pexels-photo-33175651.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'Calculator',
    '["Tenue de comptes mensuelle","Déclarations TVA","Bilan annuel","Conseil fiscal","Liasse fiscale"]',
    true,
    5
  ),
  (
    'Ressources Humaines',
    'ressources-humaines',
    'Gestion complète des ressources humaines : recrutement, formation, gestion de la paie et conseil en droit du travail tunisien. Optimisez votre capital humain.',
    'Recrutement, paie et conseil RH',
    2000.000,
    'Conseil',
    'https://images.pexels.com/photos/38824378/pexels-photo-38824378.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'Users',
    '["Processus de recrutement","Gestion de la paie","Contrats de travail","Conseil droit du travail","Formation du personnel"]',
    true,
    6
  ),
  (
    'Conseil Juridique',
    'conseil-juridique',
    'Accompagnement juridique pour entreprises : création de sociétés, rédaction de contrats, conseil en droit commercial et fiscal. Sécurisez vos opérations avec nos juristes expérimentés.',
    'Création d''entreprises et contrats',
    1500.000,
    'Conseil',
    'https://images.pexels.com/photos/7841836/pexels-photo-7841836.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'Scale',
    '["Création de société","Rédaction de contrats","Conseil droit commercial","Audit juridique","Représentation légale"]',
    true,
    7
  ),
  (
    'Ingénierie & BTP',
    'ingenierie-btp',
    'Services d''ingénierie et de conseil pour projets de construction : études techniques, plans architecturaux, supervision de chantier et gestion de projet de A à Z.',
    'Études techniques et supervision de chantier',
    6000.000,
    'Technologie',
    'https://images.pexels.com/photos/4458205/pexels-photo-4458205.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'Building2',
    '["Étude technique complète","Plans architecturaux","Supervision de chantier","Gestion de projet","Rapport d''expertise"]',
    true,
    8
  )
ON CONFLICT (slug) DO NOTHING;
