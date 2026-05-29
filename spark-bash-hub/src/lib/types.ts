export type TicketTier = {
  name: string;
  price: number;
  description: string;
};

export type EventRow = {
  id: string;
  title: string;
  description: string;
  venue: string;
  event_date: string;
  tag: string;
  is_published: boolean;
  created_at: string;
  poster_url: string | null;
  tiers: TicketTier[];
};

export type BookingStatus = "pending" | "paid" | "failed" | "cancelled";

export type BookingRow = {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_venue: string;
  full_name: string;
  email: string;
  phone: string;
  ticket_type: string;
  ticket_price: number;
  quantity: number;
  amount: number;
  status: BookingStatus;
  mpesa_receipt: string | null;
  mpesa_checkout_id: string | null;
  created_at: string;
  paid_at: string | null;
};
