
import React, { useState, useEffect } from 'react';
import { Upload, File, X, Check, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

export type UploadedFile = {
  name: string;
  size: number;
  type: string;
  path: string;
};

const DocumentUpload = ({ 
  onFileUploaded 
}: { 
  onFileUploaded: (file: UploadedFile) => void;
}) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  // When a file is uploaded successfully, notify parent component
  useEffect(() => {
    if (uploadedFile) {
      onFileUploaded(uploadedFile);
    }
  }, [uploadedFile, onFileUploaded]);

  // Reset the file preview when a file is selected
  useEffect(() => {
    if (selectedFile && !isUploading) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else if (!selectedFile) {
      setPreviewUrl(null);
    }
  }, [selectedFile, isUploading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Reset upload state if a new file is selected
      setUploadedFile(null);
      
      // Check file size (e.g., max 10MB)
      if (files[0].size > 10 * 1024 * 1024) {
        toast.error('File is too large. Maximum size is 10MB.');
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(files[0].type)) {
        toast.error('Only PDF, JPEG, or PNG files are allowed.');
        return;
      }
      
      setSelectedFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Reset upload state if a new file is selected
      setUploadedFile(null);
      
      // Check file size (e.g., max 10MB)
      if (files[0].size > 10 * 1024 * 1024) {
        toast.error('File is too large. Maximum size is 10MB.');
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(files[0].type)) {
        toast.error('Only PDF, JPEG, or PNG files are allowed.');
        return;
      }
      
      setSelectedFile(files[0]);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !user) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a filename that includes the user's ID to avoid conflicts
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `print_documents/${fileName}`;
      
      // Set up a progress tracking function
      const handleProgress = (progress: { loaded: number; total: number }) => {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        setUploadProgress(percent);
      };
      
      // Create an AbortController for the fetch request
      const abortController = new AbortController();
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('print_documents')
        .upload(filePath, selectedFile, {
          upsert: true,
          signal: abortController.signal,
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('print_documents')
        .getPublicUrl(filePath);
      
      // Set the uploaded file data for the parent component
      const uploadedFileData: UploadedFile = {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        path: filePath
      };
      
      setUploadedFile(uploadedFileData);
      
      toast.success('File uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedFile(null);
  };

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>Select a file to print</CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-medium">Choose a file or drag & drop</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Supported formats: PDF, JPEG, PNG (Max 10MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <File size={24} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!uploadedFile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={cancelUpload}
                >
                  <X size={16} />
                </Button>
              )}
              {uploadedFile && (
                <div className="p-2 bg-green-100 rounded-full">
                  <Check size={16} className="text-green-600" />
                </div>
              )}
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
            
            {!uploadedFile && !isUploading && (
              <Button 
                className="w-full flex items-center gap-2"
                onClick={uploadFile}
              >
                <Upload size={16} />
                Upload Document
              </Button>
            )}
            
            {uploadedFile && (
              <div className="flex items-center gap-2 p-3 bg-green-100/50 rounded-md text-sm text-green-800">
                <Check size={16} />
                <span>Document uploaded successfully and ready for printing</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
