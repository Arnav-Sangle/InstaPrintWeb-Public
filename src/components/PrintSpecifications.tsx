
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
export type ColorMode = 'color' | 'bw'; // Updated to use 'bw' instead of 'blackAndWhite'

export type PrintSpecs = {
  paperSize: PaperSize;
  colorMode: ColorMode;
  copies: number;
  doubleSided: boolean;
  stapling: boolean;
  pricePerPage: number | null;
  pageCount: number;
};

type PricingOption = {
  id?: string;
  paperSize: string;
  colorMode: string;
  price_per_page: number;
};

const PrintSpecifications = ({ 
  shopId, 
  onSpecsChange,
  documentPageCount
}: { 
  shopId: string | null;
  onSpecsChange: (specs: PrintSpecs) => void;
  documentPageCount?: number;
}) => {
  const [specs, setSpecs] = useState<PrintSpecs>({
    paperSize: 'A4',
    colorMode: 'bw', // Changed default to 'bw'
    copies: 1,
    doubleSided: false,
    stapling: false,
    pricePerPage: null,
    pageCount: documentPageCount || 1
  });
  
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  
  const [loading, setLoading] = useState(false);

  // Update page count when document changes
  useEffect(() => {
    if (documentPageCount) {
      setSpecs(prev => ({
        ...prev,
        pageCount: documentPageCount
      }));
    }
  }, [documentPageCount]);

  // Fetch pricing options when shop changes
  useEffect(() => {
    if (shopId) {
      fetchPricingOptions();
    } else {
      // Reset price if no shop is selected
      setSpecs(prev => ({
        ...prev,
        pricePerPage: null
      }));
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
        .select('id, paper_size, color_mode, price_per_page')
        .eq('shop_id', shopId);
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.error('This shop has no pricing options available');
        setPricingOptions([]);
        setSpecs(prev => ({
          ...prev,
          pricePerPage: null
        }));
        return;
      }
      
      // Transform the data to match our expected format
      const formattedData = data.map(item => ({
        id: item.id,
        paperSize: item.paper_size,
        colorMode: item.color_mode,
        price_per_page: item.price_per_page
      }));
      
      setPricingOptions(formattedData);
      
      // Try to find pricing for current specs
      const matchingPricing = formattedData.find(
        p => p.paperSize === specs.paperSize && p.colorMode === specs.colorMode
      );
      
      if (matchingPricing) {
        console.log(`Found matching pricing: ${matchingPricing.price_per_page} for ${specs.paperSize}, ${specs.colorMode}`);
        setSpecs(prev => ({
          ...prev,
          pricePerPage: matchingPricing.price_per_page
        }));
      } else {
        // If no matching pricing found, reset the price
        console.log(`No matching pricing found for ${specs.paperSize}, ${specs.colorMode}`);
        setSpecs(prev => ({
          ...prev,
          pricePerPage: null
        }));
        
        // Try to set to a valid option
        if (formattedData.length > 0) {
          const firstOption = formattedData[0];
          setSpecs(prev => ({
            ...prev,
            paperSize: firstOption.paperSize as PaperSize,
            colorMode: firstOption.colorMode as ColorMode,
            pricePerPage: firstOption.price_per_page
          }));
        }
      }
    } catch (error: any) {
      console.error('Error fetching pricing options:', error);
      toast.error(error.message || 'Failed to load pricing options');
      setPricingOptions([]);
      setSpecs(prev => ({
        ...prev,
        pricePerPage: null
      }));
    } finally {
      setLoading(false);
    }
  };

  const updatePricePerPage = () => {
    const matchingPricing = pricingOptions.find(
      p => p.paperSize === specs.paperSize && p.colorMode === specs.colorMode
    );
    
    if (matchingPricing) {
      console.log(`Updating price to ${matchingPricing.price_per_page} for ${specs.paperSize}, ${specs.colorMode}`);
      setSpecs(prev => ({
        ...prev,
        pricePerPage: matchingPricing.price_per_page
      }));
    } else {
      console.log(`No pricing found for ${specs.paperSize}, ${specs.colorMode}`);
      setSpecs(prev => ({
        ...prev,
        pricePerPage: null
      }));
    }
  };

  const handlePaperSizeChange = (value: string) => {
    setSpecs(prev => ({
      ...prev,
      paperSize: value as PaperSize
    }));
    setTimeout(() => {
      const matchingPricing = pricingOptions.find(
        p => p.paperSize === value && p.colorMode === specs.colorMode
      );
      
      setSpecs(prev => ({
        ...prev,
        paperSize: value as PaperSize,
        pricePerPage: matchingPricing ? matchingPricing.price_per_page : null
      }));
    }, 0);
  };

  const handleColorModeChange = (value: string) => {
    setSpecs(prev => ({
      ...prev,
      colorMode: value as ColorMode
    }));
    setTimeout(() => {
      const matchingPricing = pricingOptions.find(
        p => p.paperSize === specs.paperSize && p.colorMode === value
      );
      
      setSpecs(prev => ({
        ...prev,
        colorMode: value as ColorMode,
        pricePerPage: matchingPricing ? matchingPricing.price_per_page : null
      }));
    }, 0);
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

  // Generate available paper size options based on what the shop offers
  const availablePaperSizes = pricingOptions.length > 0 
    ? [...new Set(pricingOptions.map(p => p.paperSize))]
    : ['A4', 'A3', 'Letter', 'Legal'];
    
  // Generate available color mode options based on what the shop offers for the selected paper size
  const availableColorModes = pricingOptions.length > 0
    ? [...new Set(pricingOptions
        .filter(p => p.paperSize === specs.paperSize)
        .map(p => p.colorMode))]
    : ['bw', 'color'];

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
                  {availablePaperSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
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
                  {availableColorModes.includes('bw') && (
                    <SelectItem value="bw">Black & White</SelectItem>
                  )}
                  {availableColorModes.includes('color') && (
                    <SelectItem value="color">Color</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="page-count">Number of Pages</Label>
              <Input
                id="page-count"
                type="number"
                value={specs.pageCount}
                readOnly
                className="bg-muted"
              />
            </div>
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
        
        {specs.pricePerPage !== null && (
          <div className="flex items-center gap-2 p-3 bg-green-100/50 rounded-md text-sm text-green-800">
            <Settings size={16} />
            <span>
              Price per page: ₹{specs.pricePerPage.toFixed(2)} × {specs.pageCount} pages × {specs.copies} {specs.copies === 1 ? 'copy' : 'copies'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrintSpecifications;
