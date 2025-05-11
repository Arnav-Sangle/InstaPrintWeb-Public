
import React, { useState, useEffect } from 'react';
import { Settings, Printer, Copy, Edit3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PaperSize = 'A4' | 'A3' | 'Letter' | 'Legal';
export type ColorMode = 'color' | 'blackAndWhite';

export type PrintSpecs = {
  paperSize: PaperSize;
  colorMode: ColorMode;
  copies: number;
  doubleSided: boolean;
  stapling: boolean;
  pricePerPage: number | null;
};

const PrintSpecifications = ({ 
  shopId, 
  onSpecsChange 
}: { 
  shopId: string | null;
  onSpecsChange: (specs: PrintSpecs) => void;
}) => {
  const [specs, setSpecs] = useState<PrintSpecs>({
    paperSize: 'A4',
    colorMode: 'blackAndWhite',
    copies: 1,
    doubleSided: false,
    stapling: false,
    pricePerPage: null
  });
  
  const [pricingOptions, setPricingOptions] = useState<{
    paperSize: string;
    colorMode: string;
    price_per_page: number;
  }[]>([]);
  
  const [loading, setLoading] = useState(false);

  // Fetch pricing options when shop changes
  useEffect(() => {
    if (shopId) {
      fetchPricingOptions();
    }
  }, [shopId]);

  // Update parent component when specs change
  useEffect(() => {
    onSpecsChange(specs);
  }, [specs, onSpecsChange]);

  const fetchPricingOptions = async () => {
    if (!shopId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shop_pricing')
        .select('paper_size, color_mode, price_per_page')
        .eq('shop_id', shopId);
        
      if (error) throw error;
      
      setPricingOptions(data || []);
      
      // Set default pricing if available
      if (data && data.length > 0) {
        const matchingPricing = data.find(
          p => p.paper_size === specs.paperSize && p.color_mode === specs.colorMode
        );
        
        if (matchingPricing) {
          setSpecs(prev => ({
            ...prev,
            pricePerPage: matchingPricing.price_per_page
          }));
        }
      }
    } catch (error: any) {
      console.error('Error fetching pricing options:', error);
      toast.error(error.message || 'Failed to load pricing options');
    } finally {
      setLoading(false);
    }
  };

  const updatePricePerPage = () => {
    const matchingPricing = pricingOptions.find(
      p => p.paper_size === specs.paperSize && p.color_mode === specs.colorMode
    );
    
    setSpecs(prev => ({
      ...prev,
      pricePerPage: matchingPricing ? matchingPricing.price_per_page : null
    }));
  };

  const handlePaperSizeChange = (value: string) => {
    setSpecs(prev => ({
      ...prev,
      paperSize: value as PaperSize
    }));
    updatePricePerPage();
  };

  const handleColorModeChange = (value: string) => {
    setSpecs(prev => ({
      ...prev,
      colorMode: value as ColorMode
    }));
    updatePricePerPage();
  };

  const handleCopiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) return;
    
    setSpecs(prev => ({
      ...prev,
      copies: value
    }));
  };

  const handleDoubleSidedChange = (checked: boolean) => {
    setSpecs(prev => ({
      ...prev,
      doubleSided: checked
    }));
  };

  const handleStaplingChange = (checked: boolean) => {
    setSpecs(prev => ({
      ...prev,
      stapling: checked
    }));
  };

  const disabledState = !shopId || loading;

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Print Specifications</CardTitle>
        <CardDescription>Configure how your document will be printed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paper-size">Paper Size</Label>
              <Select 
                disabled={disabledState} 
                value={specs.paperSize}
                onValueChange={handlePaperSizeChange}
              >
                <SelectTrigger id="paper-size">
                  <SelectValue placeholder="Select paper size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="A3">A3</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color-mode">Color Mode</Label>
              <Select 
                disabled={disabledState} 
                value={specs.colorMode}
                onValueChange={handleColorModeChange}
              >
                <SelectTrigger id="color-mode">
                  <SelectValue placeholder="Select color mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blackAndWhite">Black & White</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="copies">Number of Copies</Label>
            <Input
              id="copies"
              type="number"
              min="1"
              value={specs.copies}
              onChange={handleCopiesChange}
              disabled={disabledState}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Copy size={18} />
              <Label htmlFor="double-sided">Double-sided printing</Label>
            </div>
            <Switch
              id="double-sided"
              checked={specs.doubleSided}
              onCheckedChange={handleDoubleSidedChange}
              disabled={disabledState}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 size={18} />
              <Label htmlFor="stapling">Stapling</Label>
            </div>
            <Switch
              id="stapling"
              checked={specs.stapling}
              onCheckedChange={handleStaplingChange}
              disabled={disabledState}
            />
          </div>
        </div>
        
        {!shopId && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
            <Printer size={16} />
            <span>Please select a print shop first to see pricing and options</span>
          </div>
        )}
        
        {shopId && specs.pricePerPage === null && (
          <div className="flex items-center gap-2 p-3 bg-amber-100/50 rounded-md text-sm text-amber-800">
            <Settings size={16} />
            <span>The selected shop doesn't have pricing for this configuration</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrintSpecifications;
