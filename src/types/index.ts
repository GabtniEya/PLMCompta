export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  price_tnd: number;
  category: string;
  image_url: string | null;
  icon_name: string | null;
  features: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface CartItem {
  service: Service;
  quantity: number;
}

export interface OrderInput {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total_tnd: number;
  notes: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_address: string | null;
  total_tnd: number;
  status: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
}
