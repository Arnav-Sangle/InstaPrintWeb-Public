
import React, { useState } from 'react';
import { FileUp, File, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

type UploadedFile = {
  name: string;
  size: number;
  type: string;
  path: string;
};

const DocumentUpload = ({ onFileUploaded }: { onFileUploaded: (file: UploadedFile) => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check file type (only PDF for now)
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Only PDF files are accepted');
        return;
      }
      
      // Check file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const uploadFile = async () => {
    if (!file || !user) return;
    
    setIsUploading(true);
    
    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('print_documents')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL for the file
      const { data } = supabase.storage
        .from('print_documents')
        .getPublicUrl(filePath);
        
      toast.success('Document uploaded successfully');
      
      // Pass the file data to parent component
      onFileUploaded({
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
      });
      
      // Reset file state
      setFile(null);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Error uploading document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-card shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <FileUp size={24} className="text-primary" />
          </div>
          
          <h3 className="text-xl font-medium">Upload Document</h3>
          
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Upload a PDF document to print. Maximum file size is 10MB.
          </p>
          
          <div className="w-full mt-2">
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf"
                disabled={isUploading}
              />
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 h-24 border-dashed"
                disabled={isUploading}
              >
                <File size={20} />
                <span>{file ? file.name : 'Choose a file or drag & drop'}</span>
              </Button>
            </div>
            
            {file && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Check size={16} className="text-green-500" />
                <span>{file.name}</span>
                <span className="text-muted-foreground ml-auto">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}
          </div>
          
          <Button 
            onClick={uploadFile} 
            className="w-full mt-2" 
            disabled={!file || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <AlertCircle size={14} />
            <span>Only PDF files are supported for now</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
