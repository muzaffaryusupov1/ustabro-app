-- ============================================================
-- Migration 003: Storage Buckets & Policies
-- ============================================================

-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('order-photos', 'order-photos', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-notes', 'voice-notes', false);

-- ============================================================
-- avatars: public read, auth users upload their own
-- ============================================================
CREATE POLICY "Anyone can read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Auth users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Auth users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Auth users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- order-photos: only order participants can read; auth user can upload
-- ============================================================
CREATE POLICY "Order participants can read order photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'order-photos'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id::text = (storage.foldername(name))[1]
        AND (o.customer_id = auth.uid() OR o.master_id = auth.uid())
    )
  );

CREATE POLICY "Auth users can upload order photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'order-photos'
    AND auth.role() = 'authenticated'
  );

-- ============================================================
-- voice-notes: only order participants can read; auth user can upload
-- ============================================================
CREATE POLICY "Order participants can read voice notes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'voice-notes'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id::text = (storage.foldername(name))[1]
        AND (o.customer_id = auth.uid() OR o.master_id = auth.uid())
    )
  );

CREATE POLICY "Auth users can upload voice notes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'voice-notes'
    AND auth.role() = 'authenticated'
  );
