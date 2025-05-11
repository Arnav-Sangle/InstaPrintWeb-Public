
-- Create a storage bucket for print documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('print_documents', 'Print Documents', true);

-- Allow authenticated users to upload files (less than 50MB)
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'print_documents' AND
  owner = auth.uid() AND
  octet_length(content) < 50000000
);

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'print_documents' AND owner = auth.uid())
WITH CHECK (bucket_id = 'print_documents' AND owner = auth.uid());

-- Allow users to select their own files
CREATE POLICY "Users can select own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'print_documents' AND owner = auth.uid());

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'print_documents' AND owner = auth.uid());

-- Allow public read access to files
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'print_documents');
