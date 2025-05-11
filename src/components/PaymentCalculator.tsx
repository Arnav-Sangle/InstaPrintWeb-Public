
import React, { useState } from 'react';
import { Calculator, DollarSign, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PrintSpecs } from './PrintSpecifications';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type PaymentCalculatorProps = {
  printSpecs: PrintSpecs;
  shopId: string | null;
  documentPath: string | null;
  onOrderPlaced: () => void;
};

const PaymentCalculator: React.FC<PaymentCalculatorProps> = ({
  printSpecs,
  shopId,
  documentPath,
  onOrderPlaced
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate total price
  const calculateTotalPrice = () => {
    if (!printSpecs.pricePerPage) return null;
    
    let numberOfPages = 1; // Placeholder - in a real app, we'd extract page count from the PDF
    let totalPrice = printSpecs.pricePerPage * numberOfPages * printSpecs.copies;
    
    // Apply discount for double-sided (in a real implementation, this would be more sophisticated)
    if (printSpecs.doubleSided) {
      totalPrice = totalPrice * 0.9; // 10% discount for double-sided
    }
    
    // Add fee for stapling
    if (printSpecs.stapling) {
      totalPrice += 0.5; // $0.50 fee for stapling
    }
    
    return totalPrice;
  };
  
  const totalPrice = calculateTotalPrice();
  
  const placeOrder = async () => {
    if (!user || !shopId || !documentPath || !printSpecs.pricePerPage) {
      toast.error('Missing required information to place order');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('print_jobs')
        .insert({
          customer_id: user.id,
          shop_id: shopId,
          file_path: documentPath,
          paper_size: printSpecs.paperSize,
          color_mode: printSpecs.colorMode,
          copies: printSpecs.copies,
          double_sided: printSpecs.doubleSided,
          stapling: printSpecs.stapling,
          price: totalPrice,
        })
        .select();
      
      if (error) throw error;
      
      toast.success('Print order placed successfully!');
      onOrderPlaced();
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(error.message || 'Failed to place the order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormComplete = shopId && documentPath && printSpecs.pricePerPage !== null;

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
            <span>{printSpecs.paperSize}, {printSpecs.colorMode === 'blackAndWhite' ? 'B&W' : 'Color'}</span>
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
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center py-2 font-medium text-lg">
            <span>Total Price</span>
            <span className="flex items-center">
              <DollarSign size={18} className="mr-1" />
              {totalPrice ? totalPrice.toFixed(2) : '---'}
            </span>
          </div>
        </div>
        
        {!isFormComplete && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md text-sm text-muted-foreground mt-4">
            <Calculator size={16} />
            <span>Complete all previous steps to place your order</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full flex items-center gap-2" 
          disabled={!isFormComplete || isSubmitting}
          onClick={placeOrder}
        >
          <CreditCard size={16} />
          {isSubmitting ? 'Processing...' : 'Place Order'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentCalculator;
