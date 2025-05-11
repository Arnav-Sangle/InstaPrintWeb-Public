
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Check, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface DocumentUploadProps {
  onFileUploaded: (filePath: string) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onFileUploaded }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setUploadError('Invalid file type. Please upload a PDF, DOCX, JPEG, or PNG file.');
        setFile(null);
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadError('File is too large. Maximum size is 5MB.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setUploadError(null);
    }
  };
  
  const handleUpload = async () => {
    if (!file || !user) return;
    
    setUploading(true);
    setProgress(0);
    
    try {
      // Create a unique file path for the uploaded document
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          // We can't use signal here as it's not in the FileOptions type
          // So we'll remove it
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = progress.percent ? Math.round(progress.percent) : 0;
            setProgress(percent);
          }
        });
      
      if (error) {
        throw error;
      }
      
      // Get the public URL
      const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
      
      setUploading(false);
      toast.success('Document uploaded successfully!');
      
      // Call the callback with the file path
      onFileUploaded(filePath);
      
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadError(error.message || 'Failed to upload document');
      setUploading(false);
      toast.error('Failed to upload document');
    }
  };
  
  const resetFileInput = () => {
    setFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Card className="bg-card shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors hover:border-primary/50 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.docx,.jpeg,.jpg,.png"
              disabled={uploading}
            />
            
            {!file ? (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Click to upload or drag and drop<br />
                  PDF, DOCX, JPEG or PNG (max. 5MB)
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center justify-between w-full">
                  <Label className="font-medium truncate max-w-[200px]">{file.name}</Label>
                  {!uploading && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={(e) => {
                        e.stopPropagation();
                        resetFileInput();
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  )}
                </div>
                
                {uploading && (
                  <div className="w-full mt-2">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      Uploading... {progress}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {uploadError && (
            <div className="flex items-center gap-2 text-destructive text-sm py-2 px-3 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              {uploadError}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button 
              type="button" 
              disabled={!file || uploading} 
              onClick={handleUpload}
              className="w-full sm:w-auto"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
