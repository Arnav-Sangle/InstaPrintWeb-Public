
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [printSpecs, setPrintSpecs] = useState<PrintSpecs>({
    paperSize: 'A4',
    colorMode: 'blackAndWhite',
    copies: 1,
    doubleSided: false,
    stapling: false,
    pricePerPage: null
  });
  const [orderComplete, setOrderComplete] = useState(false);

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFile(file);
    setActiveTab('shop');
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
  };

  const resetOrder = () => {
    setUploadedFile(null);
    setSelectedShop(null);
    setPrintSpecs({
      paperSize: 'A4',
      colorMode: 'blackAndWhite',
      copies: 1,
      doubleSided: false,
      stapling: false,
      pricePerPage: null
    });
    setOrderComplete(false);
    setActiveTab('upload');
  };

  return (
    <UserRedirect requiredRole="customer">
      <div className="min-h-screen dashboard-gradient">
        <Navbar />
        
        <div className="container px-4 md:px-6 pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-4xl mx-auto">
            <Link to="/customer-dashboard" className="inline-flex items-center mb-8 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            
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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-4 mb-8">
                    <TabsTrigger value="upload" disabled={activeTab !== 'upload' && !uploadedFile}>
                      1. Upload
                    </TabsTrigger>
                    <TabsTrigger value="shop" disabled={activeTab !== 'shop' && (!uploadedFile || !selectedShop)}>
                      2. Choose Shop
                    </TabsTrigger>
                    <TabsTrigger value="specs" disabled={activeTab !== 'specs' && (!selectedShop || printSpecs.pricePerPage === null)}>
                      3. Specifications
                    </TabsTrigger>
                    <TabsTrigger value="payment" disabled={activeTab !== 'payment' && printSpecs.pricePerPage === null}>
                      4. Payment
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload">
                    <DocumentUpload onFileUploaded={handleFileUploaded} />
                  </TabsContent>
                  
                  <TabsContent value="shop">
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
                    <PrintSpecifications 
                      shopId={selectedShop?.id || null}
                      onSpecsChange={handleSpecsChange}
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
    </UserRedirect>
  );
};

export default PrintOrder;
