
-- Create a storage bucket for print documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'Documents', true);

-- Allow authenticated users to upload files (less than 50MB)
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  owner = auth.uid() AND
  octet_length(content) < 50000000
);

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND owner = auth.uid())
WITH CHECK (bucket_id = 'documents' AND owner = auth.uid());

-- Allow users to select their own files
CREATE POLICY "Users can select own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND owner = auth.uid());

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND owner = auth.uid());

-- Allow public read access to files (for file sharing)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Create shop pricing table
CREATE TABLE IF NOT EXISTS public.shop_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  paper_size TEXT NOT NULL,
  color_mode TEXT NOT NULL,
  price_per_page NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  -- Add a unique constraint to ensure one price configuration per paper size and color mode
  UNIQUE(shop_id, paper_size, color_mode)
);

-- Add RLS policies for shop_pricing
ALTER TABLE public.shop_pricing ENABLE ROW LEVEL SECURITY;

-- Shop owners can read their own pricing
CREATE POLICY "Shop owners can view their pricing" 
ON public.shop_pricing 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT owner_id FROM public.shops WHERE id = shop_id
  )
);

-- Shop owners can insert pricing for their shops
CREATE POLICY "Shop owners can insert pricing" 
ON public.shop_pricing 
FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT owner_id FROM public.shops WHERE id = shop_id
  )
);

-- Shop owners can update pricing for their shops
CREATE POLICY "Shop owners can update pricing" 
ON public.shop_pricing 
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT owner_id FROM public.shops WHERE id = shop_id
  )
);

-- Shop owners can delete pricing for their shops
CREATE POLICY "Shop owners can delete pricing" 
ON public.shop_pricing 
FOR DELETE 
USING (
  auth.uid() IN (
    SELECT owner_id FROM public.shops WHERE id = shop_id
  )
);

-- Customers can view pricing for all shops
CREATE POLICY "Customers can view shop pricing" 
ON public.shop_pricing 
FOR SELECT 
USING (true);
