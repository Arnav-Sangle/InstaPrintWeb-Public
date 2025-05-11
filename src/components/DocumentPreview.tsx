
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type DocumentPreviewProps = {
  url: string;
  name: string;
  onPageCountChange?: (pageCount: number) => void;
};

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ url, name, onPageCountChange }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPageNumber(1);
    setNumPages(null);
  }, [url]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    if (onPageCountChange) {
      onPageCountChange(numPages);
    }
  };

  const onDocumentLoadError = (err: Error) => {
    console.error('Error loading document:', err);
    setError('Failed to load document. Please make sure it is a valid PDF file.');
    setLoading(false);
  };

  const goToPreviousPage = () => {
    setPageNumber(prevPage => Math.max(prevPage - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prevPage => Math.min(prevPage + 1, numPages || 1));
  };

  // Handle file types other than PDF
  const isImage = /\.(jpe?g|png|gif|bmp)$/i.test(url);
  const isPDF = /\.pdf$/i.test(url);
  const isWord = /\.(docx?)$/i.test(url);

  if (error) {
    return (
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Document Preview</CardTitle>
          <CardDescription>{name}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-center text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Document Preview</CardTitle>
        <CardDescription>{name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {loading && (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="rounded-md h-8 w-8 border-4 border-t-primary border-r-transparent border-l-transparent border-b-transparent animate-spin"></div>
            </div>
          )}

          {isPDF ? (
            <>
              <div className="w-full border rounded-md overflow-hidden bg-muted/30">
                <Document
                  file={url}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="flex justify-center items-center min-h-[300px]">
                      <div className="rounded-md h-8 w-8 border-4 border-t-primary border-r-transparent border-l-transparent border-b-transparent animate-spin"></div>
                    </div>
                  }
                >
                  <Page 
                    pageNumber={pageNumber} 
                    width={Math.min(600, window.innerWidth - 80)}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              </div>

              {numPages && (
                <div className="flex items-center justify-between w-full mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={pageNumber <= 1}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>

                  <p className="text-sm text-muted-foreground">
                    Page {pageNumber} of {numPages}
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={pageNumber >= (numPages || 1)}
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </>
          ) : isImage ? (
            <div className="w-full flex justify-center py-4">
              <img 
                src={url} 
                alt={name} 
                className="max-w-full max-h-[500px] object-contain rounded-md" 
                onLoad={() => {
                  setLoading(false);
                  if (onPageCountChange) {
                    onPageCountChange(1); // Images are single page
                  }
                }}
                style={{ display: loading ? 'none' : 'block' }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">
                {isWord 
                  ? 'Preview not available for Word documents' 
                  : 'Preview not available for this file type'}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.open(url, '_blank')}
              >
                Download to View
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentPreview;
