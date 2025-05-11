import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Printer, FileText, Settings, Copy, CheckCircle2 } from 'lucide-react';
import { PrintSpecs } from './PrintSpecifications';

interface PrintJobViewerProps {
  documentUrl: string;
  printSpecs: PrintSpecs;
  onClose: () => void;
  onAccept?: () => void;
  showActions?: boolean;
}

const PrintJobViewer: React.FC<PrintJobViewerProps> = ({
  documentUrl,
  printSpecs,
  onClose,
  onAccept,
  showActions = true
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const SpecificationOverlay = () => (
    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg shadow-lg border border-border w-64">
      <h3 className="font-medium mb-2 flex items-center gap-2">
        <Settings size={16} />
        Print Specifications
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Paper Size:</span>
          <Badge variant="outline">{printSpecs.paperSize}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Color Mode:</span>
          <Badge variant="outline">
            {printSpecs.colorMode === 'bw' ? 'Black & White' : 'Color'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Copies:</span>
          <Badge variant="outline">{printSpecs.copies}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pages:</span>
          <Badge variant="outline">{printSpecs.pageCount}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Double-sided:</span>
          <Badge variant="outline">{printSpecs.doubleSided ? 'Yes' : 'No'}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Stapling:</span>
          <Badge variant="outline">{printSpecs.stapling ? 'Yes' : 'No'}</Badge>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <FileText size={20} />
            Document Preview
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 relative overflow-hidden">
          <iframe
            src={documentUrl}
            className="w-full h-full border-0"
            title="Document Preview"
          />
          <SpecificationOverlay />
        </div>

        {showActions && (
          <div className="p-4 border-t bg-card flex items-center justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onAccept && (
              <Button onClick={onAccept} className="flex items-center gap-2">
                <Printer size={16} />
                Accept and Print
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PrintJobViewer; 