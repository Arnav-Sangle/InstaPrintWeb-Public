import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PrintSpecs } from '@/components/PrintSpecifications';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, IndianRupee, Calculator, QrCode, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QRCode from 'qrcode';

interface PaymentCalculatorProps {
  printSpecs: PrintSpecs;
  shopId: string | null;
  documentPath: string | null;
  onOrderPlaced: () => void;
}

const PaymentCalculator = ({ 
  printSpecs, 
  shopId, 
  documentPath,
  onOrderPlaced 
}: PaymentCalculatorProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shopUpiId, setShopUpiId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi'>('upi');
  const [copied, setCopied] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  useEffect(() => {
    // Fetch shop details to get UPI ID
    const fetchShopDetails = async () => {
      if (!shopId) return;
      
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('upi_id')
          .eq('id', shopId)
          .single();
          
        if (error) {
          console.error('Error fetching shop UPI ID:', error);
          return;
        }
        
        if (data && data.upi_id) {
          setShopUpiId(data.upi_id);
        }
      } catch (error) {
        console.error('Error in fetchShopDetails:', error);
      }
    };
    
    fetchShopDetails();
  }, [shopId]);
  
  // Load the Razorpay script when component mounts
  useEffect(() => {
    const loadRazorpayScript = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.async = true;
      script.dataset.payment_button_id = 'pl_Ov1E8xLoYmOneH'; // Replace with your actual Razorpay payment button ID pl_Ov1E8xLoYmOneH pl_MzMLRg8qBmJFbQ
      
      // Get the razorpay-payment container element
      const container = document.getElementById('razorpay-payment-button-container');
      
      // Only append if container exists and it doesn't already have the script
      if (container && !container.querySelector('script')) {
        container.appendChild(script);
      }
    };

    // Only load script if we have a valid order ID
    if (orderId && paymentMethod === 'razorpay') {
      loadRazorpayScript();
    }
  }, [orderId, paymentMethod]);
  
  const calculateTotalPrice = () => {
    if (!printSpecs.pricePerPage) return 0;
    
    const totalPages = printSpecs.pageCount * printSpecs.copies;
    const effectivePages = printSpecs.doubleSided ? Math.ceil(totalPages / 2) : totalPages;
    
    return effectivePages * printSpecs.pricePerPage;
  };

  const handleCreateOrder = async () => {
    if (!user || !shopId || !documentPath) {
      toast.error('Missing required information to place order');
      return;
    }
    
    if (!printSpecs.pricePerPage) {
      toast.error('Cannot place order without pricing information');
      return;
    }
    
    setLoading(true);
    try {
      const totalPrice = calculateTotalPrice();
      
      // Insert the print job into the database
      const { data, error } = await supabase
        .from('print_jobs')
        .insert({
          customer_id: user.id,
          shop_id: shopId,
          file_path: documentPath,
          paper_size: printSpecs.paperSize,
          color_mode: printSpecs.colorMode,
          page_count: printSpecs.pageCount,
          copies: printSpecs.copies,
          double_sided: printSpecs.doubleSided,
          stapling: printSpecs.stapling,
          price: totalPrice,
          status: 'pending',
          payment_status: 'pending',
        })
        .select('id');
        
      if (error) {
        console.error('Error creating order:', error);
        throw new Error(error.message);
      }
      
      if (data && data[0]) {
        setOrderId(data[0].id);
        toast.success('Order created! Please complete payment.');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create order');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyUpiId = () => {
    if (shopUpiId) {
      navigator.clipboard.writeText(shopUpiId);
      setCopied(true);
      toast.success('UPI ID copied to clipboard');
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!orderId) return;
    
    try {
      setPaymentVerifying(true);
      
      // Update payment status in the database
      const { error } = await supabase
        .from('print_jobs')
        .update({ payment_status: 'completed' })
        .eq('id', orderId); 

      if (error) throw error;
      
      const my_payment_status = await supabase
        .from('print_jobs')
        .select('payment_status')
        .eq('id', orderId);
      console.log("payment status", my_payment_status)
      console.log("")

      toast.success('Payment verified! Your order has been placed.');
      setOrderCompleted(true);
      // Wait a bit before notifying parent component
      setTimeout(() => {
        onOrderPlaced();
      }, 1500);
    } catch (error: any) {
      console.error('Error marking as paid:', error);
      toast.error('Failed to verify payment. Please try again.');
    } finally {
      setPaymentVerifying(false);
    }
  };
  
  const handlePlaceOrder = async () => {
    if (orderId) {
      // If we already have an order ID, it means payment is complete
      if (orderCompleted) {
        onOrderPlaced();
      } else {
        await handleMarkAsPaid();
      }
    } else {
      // Create the order first, which will then show the payment button
      await handleCreateOrder();
    }
  };
  
  // Calculate if form is complete and ready for order creation
  const isFormComplete = user && shopId && documentPath && printSpecs.pricePerPage !== null;
  
  // Calculate total price
  const totalPrice = calculateTotalPrice();
  
  const generateQrCode = async () => {
    if (!shopUpiId || !totalPrice) return;
    
    // Construct UPI URL with required parameters
    const upiUrl = `upi://pay?pa=${shopUpiId}&pn=PrintShop&am=${totalPrice.toFixed(2)}&cu=INR&tn=Print_Order_${orderId}`;
    
    try {
      const url = await QRCode.toDataURL(upiUrl);
      setQrCodeUrl(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
      toast.error('Failed to generate QR code');
    }
  };

  useEffect(() => {
    if (shopUpiId && orderId) {
      generateQrCode();
    }
  }, [shopUpiId, orderId, totalPrice]);

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
        <CardDescription>Review your order details and payment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between pb-2 border-b">
            <span className="text-muted-foreground">Specifications</span>
            <span>{printSpecs.paperSize}, {printSpecs.colorMode === 'bw' ? 'B&W' : 'Color'}</span>
          </div>
          
          <div className="flex justify-between pb-2 border-b">
            <span className="text-muted-foreground">Document Pages</span>
            <span>{printSpecs.pageCount || 1}</span>
          </div>
          
          <div className="flex justify-between pb-2 border-b">
            <span className="text-muted-foreground">Copies</span>
            <span>{printSpecs.copies}</span>
          </div>
          
          <div className="flex justify-between pb-2 border-b">
            <span className="text-muted-foreground">Double-sided</span>
            <span>{printSpecs.doubleSided ? 'Yes' : 'No'}</span>
          </div>
          
          <div className="flex justify-between pb-2 border-b">
            <span className="text-muted-foreground">Stapling</span>
            <span>{printSpecs.stapling ? 'Yes' : 'No'}</span>
          </div>
          
          <div className="flex justify-between pb-2 border-b">
            <span className="text-muted-foreground">Price per page</span>
            <span className='flex items-center'><IndianRupee size={14} className="mr-1" />{printSpecs.pricePerPage?.toFixed(2) || '---'}</span>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center py-2 font-medium text-lg">
            <span>Total Price</span>
            <span className="flex items-center">
              <IndianRupee size={18} className="mr-1" />
              {totalPrice.toFixed(2)}
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground mt-1">
            {printSpecs.stapling && <p>* ₹5.00 additional fee for stapling per copy</p>}
          </div>
        </div>
        
        {!isFormComplete && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md text-sm text-muted-foreground mt-4">
            <Calculator size={16} />
            <span>Complete all previous steps to place your order</span>
          </div>
        )}
        
        {orderId && !orderCompleted && (
          <div className="mt-4 space-y-4">
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">Select payment method:</div>
              <div className="flex gap-2">
              {shopUpiId && (
                  <Button 
                    size="sm" 
                    variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    UPI
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant={paymentMethod === 'razorpay' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('razorpay')}
                >
                  Razorpay
                </Button>
              </div>
            </div>
            
            {paymentMethod === 'upi' && shopUpiId && (
              <div className="space-y-4">
                <div className="text-center mb-2 text-sm font-medium">Pay using any UPI app</div>
                
                <div className="bg-muted/30 p-4 rounded-lg flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white rounded-md">
                    {qrCodeUrl ? (
                        <img 
                          src={qrCodeUrl} 
                          alt="Payment QR Code" 
                          className="w-[120px] h-[120px]"
                        />
                      ) : (
                        <QrCode size={120} className="text-primary" />
                      )}
                  </div>
                  
                  <div className="text-center space-y-1">
                    <p className="text-sm text-muted-foreground">Scan QR code or use UPI ID</p>
                    <div className="flex items-center justify-center gap-2">
                      <Input 
                        value={shopUpiId}
                        readOnly
                        className="text-center max-w-[200px]"
                      />
                      <Button size="icon" variant="outline" onClick={handleCopyUpiId}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </Button>
                    </div>
                  </div>
                  
                  {/* <Alert variant="destructive">  */}
                  <Alert variant="default"> 
                    <AlertDescription className="text-sm flex items-center justify-center">
                      Once you've completed the payment, click the "I've Paid" button below.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    variant="default" 
                    className="w-full" 
                    onClick={handleMarkAsPaid}
                    disabled={paymentVerifying}
                  >
                    {paymentVerifying ? 'Verifying...' : 'I\'ve Paid ₹' + totalPrice.toFixed(2)}
                  </Button>
                </div>
              </div>
            )}

            {paymentMethod === 'razorpay' && (
              <div className="space-y-4">
                <div className="text-center mb-2 text-sm text-muted-foreground">Pay securely via Razorpay</div>
                <div id="razorpay-payment-button-container" className="flex justify-center">
                  {/* Razorpay button will be injected here */}
                  <Button 
                    className="w-full"
                    onClick={() => {
                      toast.error('This is a test environment. In production, the Razorpay payment flow would appear here.');
                      setOrderCompleted(true);
                      setTimeout(() => {
                        onOrderPlaced();
                      }, 1500);
                    }}
                  >
                    Pay ₹{totalPrice.toFixed(2)} with Razorpay
                  </Button>
                </div>
              </div>
            )}
            
            
          </div>
        )}
        
        {orderCompleted && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg text-center">
            <Check size={24} className="mx-auto mb-2" />
            <p className="font-medium">Payment received!</p>
            <p className="text-sm">Your order has been placed successfully.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!orderId ? (
          <Button 
            className="w-full flex items-center gap-2" 
            disabled={!isFormComplete || loading}
            onClick={handlePlaceOrder}
          >
            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            {loading ? 'Processing...' : 'Place Order'}
          </Button>
        ) : orderCompleted ? (
          <Button 
            className="w-full" 
            onClick={() => onOrderPlaced()}
          >
            Continue to Dashboard
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
};

export default PaymentCalculator;

