-- ============================================================
-- Migration 002: Service Categories, Orders, Reviews, Messages, Notifications
-- ============================================================

-- service_categories
CREATE TABLE public.service_categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz    text NOT NULL,
  name_uz_cy text,
  icon_name  text,
  icon_url   text,
  sort_order int DEFAULT 0,
  is_active  boolean DEFAULT true
);

-- Seed 6 default categories
INSERT INTO public.service_categories (name_uz, name_uz_cy, icon_name, sort_order) VALUES
  ('Elektrika',    'Электрика',    'flash-outline',       1),
  ('Santexnika',   'Сантехника',   'water-outline',       2),
  ('Maishiy texnika', 'Маиший техника', 'hardware-chip-outline', 3),
  ('Mebel',        'Мебель',       'bed-outline',         4),
  ('Qurilish',     'Қурилиш',      'construct-outline',   5),
  ('Boshqa',       'Бошқа',        'ellipsis-horizontal-outline', 6);

-- orders
CREATE TABLE public.orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  master_id       uuid REFERENCES public.profiles(id),
  category_id     uuid NOT NULL REFERENCES public.service_categories(id),
  description     text,
  voice_note_url  text,
  photo_urls      text[] DEFAULT '{}',
  address         text,
  location_lat    float8,
  location_lng    float8,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','accepted','on_the_way','arrived','completed','cancelled')),
  price_agreed    numeric(12,2),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- reviews
CREATE TABLE public.reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.profiles(id),
  master_id   uuid NOT NULL REFERENCES public.profiles(id),
  rating      int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  created_at  timestamptz DEFAULT now()
);

-- messages
CREATE TABLE public.messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id   uuid NOT NULL REFERENCES public.profiles(id),
  content     text,
  type        text NOT NULL DEFAULT 'text'
              CHECK (type IN ('text','image','voice')),
  media_url   text,
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- notifications
CREATE TABLE public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       text,
  body        text,
  data        jsonb,
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- Auto-update updated_at on orders
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- service_categories: public read (no auth needed)
CREATE POLICY "Anyone can read categories"
  ON public.service_categories FOR SELECT
  USING (true);

-- orders: customer sees own rows
CREATE POLICY "Customer can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = customer_id);

-- orders: master sees pending orders + orders assigned to them
CREATE POLICY "Master can read pending and own orders"
  ON public.orders FOR SELECT
  USING (status = 'pending' OR auth.uid() = master_id);

-- orders: customer can insert
CREATE POLICY "Customer can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- orders: master can update orders assigned to them (status changes)
CREATE POLICY "Master can update assigned orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = master_id)
  WITH CHECK (auth.uid() = master_id);

-- orders: customer can update own pending orders (cancel)
CREATE POLICY "Customer can update own pending orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = customer_id AND status = 'pending')
  WITH CHECK (auth.uid() = customer_id);

-- messages: only order participants can read
CREATE POLICY "Order participants can read messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (o.customer_id = auth.uid() OR o.master_id = auth.uid())
    )
  );

-- messages: only order participants can insert
CREATE POLICY "Order participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (o.customer_id = auth.uid() OR o.master_id = auth.uid())
    )
  );

-- reviews: customer can insert only if order is completed and they are the customer
CREATE POLICY "Customer can review completed orders"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND o.customer_id = auth.uid()
        AND o.status = 'completed'
    )
  );

-- reviews: anyone authenticated can read
CREATE POLICY "Anyone can read reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- notifications: user can read own notifications
CREATE POLICY "User can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- notifications: user can update own (mark as read)
CREATE POLICY "User can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Trigger: recalculate master rating on new review
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_master_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.master_profiles
  SET
    rating = (SELECT COALESCE(AVG(r.rating), 0) FROM public.reviews r WHERE r.master_id = NEW.master_id),
    review_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.master_id = NEW.master_id)
  WHERE id = NEW.master_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_inserted
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_master_rating();

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_master ON public.orders(master_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_category ON public.orders(category_id);
CREATE INDEX idx_messages_order ON public.messages(order_id);
CREATE INDEX idx_reviews_master ON public.reviews(master_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
