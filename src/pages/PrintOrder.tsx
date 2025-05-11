
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import UserRedirect from '@/components/UserRedirect';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentUpload, { UploadedFile } from '@/components/DocumentUpload';
import ShopSelector from '@/components/ShopSelector';
import PrintSpecifications, { PrintSpecs } from '@/components/PrintSpecifications';
import PaymentCalculator from '@/components/PaymentCalculator';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

type Shop = {
  id: string;
  name: string;
  address: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
};

const PrintOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isChangingTab, setIsChangingTab] = useState(false);
  const [printSpecs, setPrintSpecs] = useState<PrintSpecs>({
    paperSize: 'A4',
    colorMode: 'bw',
    copies: 1,
    doubleSided: false,
    stapling: false,
    pricePerPage: null,
    pageCount: 1
  });
  const [orderComplete, setOrderComplete] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(false);

  // Watch for auth changes
  useEffect(() => {
    if (!user) {
      // User has logged out, perform cleanup
      handleSessionCleanup();
    }
  }, [user]);

  // Session cleanup handler
  const handleSessionCleanup = async () => {
    try {
      // Clean up any uploaded files
      if (uploadedFile?.path) {
        try {
          await supabase.storage
            .from('documents')
            .remove([uploadedFile.path]);
          console.log('Cleaned up temporary upload on session end');
        } catch (error) {
          console.error('Error cleaning up file on session end:', error);
        }
      }

      // Clear all storage
      localStorage.removeItem('print-order-state');
      sessionStorage.removeItem('print-order-state');

      // Reset all state
      setUploadedFile(null);
      setSelectedShop(null);
      setPrintSpecs({
        paperSize: 'A4',
        colorMode: 'bw',
        copies: 1,
        doubleSided: false,
        stapling: false,
        pricePerPage: null,
        pageCount: 1
      });
      setActiveTab('upload');
      setOrderComplete(false);
      setViewingDocument(false);
      setIsChangingTab(false);
    } catch (error) {
      console.error('Error during session cleanup:', error);
    }
  };

  // Cleanup function
  const cleanup = async () => {
    try {
      if (uploadedFile?.path) {
        await supabase.storage
          .from('documents')
          .remove([uploadedFile.path]);
        console.log('Cleaned up temporary upload');
      }
    } catch (error) {
      console.error('Error cleaning up:', error);
    } finally {
      await handleSessionCleanup();
    }
  };

  // Handle navigation back to dashboard
  const handleBackToDashboard = async () => {
    // If there's an active print job in progress, show confirmation
    if (uploadedFile && !orderComplete) {
      const confirmed = window.confirm('Going back will cancel your current print job. Continue?');
      if (!confirmed) {
        return;
      }
    }

    try {
      setIsChangingTab(true);
      await cleanup();
      navigate('/customer-dashboard');
    } catch (error) {
      console.error('Error navigating back:', error);
    } finally {
      setIsChangingTab(false);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Handle back button/navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (uploadedFile && !orderComplete) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [uploadedFile, orderComplete]);

  const handleFileUploaded = (file: UploadedFile) => {
    // Clean up any existing uploaded file first
    if (uploadedFile?.path && uploadedFile.path !== file.path) {
      cleanup().then(() => {
        setUploadedFile(file);
        setPrintSpecs(prev => ({
          ...prev,
          pageCount: file.pageCount || 1
        }));
        setActiveTab('shop');
      });
    } else {
      setUploadedFile(file);
      setPrintSpecs(prev => ({
        ...prev,
        pageCount: file.pageCount || 1
      }));
      setActiveTab('shop');
    }
  };

  const handleShopSelected = (shop: Shop) => {
    setSelectedShop(shop);
    setActiveTab('specs');
  };

  const handleSpecsChange = (specs: PrintSpecs) => {
    setPrintSpecs(specs);
  };

  const handleOrderPlaced = () => {
    setOrderComplete(true);
    localStorage.removeItem('print-order-state');
  };

  const resetOrder = async () => {
    await cleanup();
    setSelectedShop(null);
    setPrintSpecs({
      paperSize: 'A4',
      colorMode: 'bw',
      copies: 1,
      doubleSided: false,
      stapling: false,
      pricePerPage: null,
      pageCount: 1
    });
    setOrderComplete(false);
    setActiveTab('upload');
  };

  // Handle tab change
  const handleTabChange = async (value: string) => {
    if (isChangingTab) return; // Prevent multiple calls while changing tabs
    
    // If going back to upload when we already have a file, confirm first
    if (value === 'upload' && uploadedFile) {
      setIsChangingTab(true);
      try {
        const confirmed = window.confirm('Going back to upload will remove your current file. Continue?');
        if (confirmed) {
          await cleanup();
          // Double-check tab states after cleanup
          if (printSpecs.pricePerPage !== null) {
            setPrintSpecs(prev => ({ ...prev, pricePerPage: null }));
          }
        }
      } finally {
        setIsChangingTab(false);
      }
      return;
    }
    
    // Validate tab transitions
    if (value === 'shop' && !uploadedFile) return;
    if (value === 'specs' && !selectedShop) return;
    if (value === 'payment' && printSpecs.pricePerPage === null) return;
    
    // For all other tab changes, just update the active tab
    setActiveTab(value);
  };

  // View document handler
  const handleViewDocument = () => {
    if (uploadedFile) {
      setViewingDocument(true);
    }
  };

  return (
    <UserRedirect requiredRole="customer">
      <div className="min-h-screen dashboard-gradient">
        <Navbar />
        
        <div className="container px-4 md:px-6 pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              className="inline-flex items-center mb-8 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleBackToDashboard}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="flex flex-col gap-8 animate-on-load">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">New Print Job</h1>
                <p className="text-muted-foreground mt-1">
                  Upload, customize, and order your print job
                </p>
              </div>
              
              {orderComplete ? (
                <div className="bg-card shadow-sm rounded-lg border p-10 flex flex-col items-center justify-center gap-6 text-center">
                  <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Order Successful!</h2>
                  <p className="text-muted-foreground max-w-md">
                    Your print job has been submitted successfully. You can track its status from your dashboard.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <Button onClick={resetOrder} variant="outline">
                      Place Another Order
                    </Button>
                    <Button asChild>
                      <Link to="/customer-dashboard">Go to Dashboard</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid grid-cols-4 mb-8">
                    <TabsTrigger value="upload" disabled={isChangingTab}>
                      1. Upload
                    </TabsTrigger>
                    <TabsTrigger value="shop" disabled={!uploadedFile || isChangingTab}>
                      2. Choose Shop
                    </TabsTrigger>
                    <TabsTrigger value="specs" disabled={!selectedShop || !uploadedFile || isChangingTab}>
                      3. Specifications
                    </TabsTrigger>
                    <TabsTrigger value="payment" disabled={!selectedShop || !uploadedFile || printSpecs.pricePerPage === null || isChangingTab}>
                      4. Payment
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload">
                    <DocumentUpload onFileUploaded={handleFileUploaded} />
                  </TabsContent>
                  
                  <TabsContent value="shop">
                    {uploadedFile && (
                      <div className="mb-6 flex justify-between items-center">
                        <div>
                          <p className="font-medium">Uploaded document: {uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground">Pages: {uploadedFile.pageCount || '1'}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleViewDocument}>
                          View Document
                        </Button>
                      </div>
                    )}
                    
                    <ShopSelector onShopSelected={handleShopSelected} />
                    
                    <div className="flex justify-between mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('upload')}
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('specs')}
                        disabled={!selectedShop}
                      >
                        Continue
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="specs">
                    {uploadedFile && (
                      <div className="mb-6 flex justify-between items-center">
                        <div>
                          <p className="font-medium">Uploaded document: {uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground">Pages: {uploadedFile.pageCount || '1'}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleViewDocument}>
                          View Document
                        </Button>
                      </div>
                    )}
                    
                    <PrintSpecifications 
                      shopId={selectedShop?.id || null}
                      onSpecsChange={handleSpecsChange}
                      documentPageCount={uploadedFile?.pageCount || 1}
                    />
                    
                    <div className="flex justify-between mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('shop')}
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('payment')}
                        disabled={printSpecs.pricePerPage === null}
                      >
                        Continue
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="payment">
                    {uploadedFile && (
                      <div className="mb-6 flex justify-between items-center">
                        <div>
                          <p className="font-medium">Uploaded document: {uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground">Pages: {uploadedFile.pageCount || '1'}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleViewDocument}>
                          View Document
                        </Button>
                      </div>
                    )}
                    
                    <PaymentCalculator 
                      printSpecs={printSpecs}
                      shopId={selectedShop?.id || null}
                      documentPath={uploadedFile?.path || null}
                      onOrderPlaced={handleOrderPlaced}
                    />
                    
                    <div className="flex justify-start mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('specs')}
                      >
                        Back
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Document preview dialog */}
      <Dialog open={viewingDocument} onOpenChange={setViewingDocument}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {uploadedFile && (
              <iframe 
                src={uploadedFile.url} 
                className="w-full h-full min-h-[70vh]" 
                title="Document Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </UserRedirect>
  );
};

export default PrintOrder;
