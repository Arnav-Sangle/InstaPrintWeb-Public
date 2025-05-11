import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type PricingItem = {
  id?: string;
  paper_size: string;
  color_mode: string;
  price_per_page: number;
  isNew?: boolean;
};

type PricingManagerProps = {
  shopId: string;
};

const paperSizes = ['A4', 'A3', 'Letter', 'Legal'];
// Changed to match the database constraint - 'bw' and 'color'
const colorModes = ['bw', 'color'];

const PricingManager: React.FC<PricingManagerProps> = ({ shopId }) => {
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (shopId) {
      fetchPricing();
    }
  }, [shopId]);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shop_pricing')
        .select('*')
        .eq('shop_id', shopId);

      if (error) throw error;
      
      setPricingItems(data || []);
    } catch (error: any) {
      console.error('Error fetching pricing:', error);
      toast.error('Failed to load pricing information');
    } finally {
      setLoading(false);
    }
  };

  const addNewPricingItem = () => {
    setPricingItems([
      ...pricingItems,
      {
        paper_size: 'A4',
        color_mode: 'bw', // Changed default to 'bw' instead of 'blackAndWhite'
        price_per_page: 0,
        isNew: true
      }
    ]);
  };

  const handlePricingChange = (index: number, field: keyof PricingItem, value: any) => {
    const updatedItems = [...pricingItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'price_per_page' ? parseFloat(value) || 0 : value
    };
    setPricingItems(updatedItems);
  };

  const removePricingItem = async (index: number) => {
    const item = pricingItems[index];
    
    // If it's an existing item (has an ID), delete from database
    if (item.id) {
      try {
        const { error } = await supabase
          .from('shop_pricing')
          .delete()
          .eq('id', item.id);
          
        if (error) throw error;
        
        toast.success('Pricing option removed');
      } catch (error: any) {
        console.error('Error removing pricing option:', error);
        toast.error('Failed to remove pricing option');
        return;
      }
    }
    
    // Remove from state
    const updatedItems = [...pricingItems];
    updatedItems.splice(index, 1);
    setPricingItems(updatedItems);
  };

  const savePricing = async () => {
    if (!shopId) return;
    
    try {
      setSaving(true);
      
      // Validate all items have prices greater than 0
      const invalidItems = pricingItems.filter(item => !item.price_per_page || item.price_per_page <= 0);
      if (invalidItems.length > 0) {
        toast.error('All prices must be greater than 0');
        return;
      }
      
      // Check for duplicate configurations
      const configurations = new Set();
      for (const item of pricingItems) {
        const config = `${item.paper_size}-${item.color_mode}`;
        if (configurations.has(config)) {
          toast.error(`Duplicate configuration found: ${item.paper_size}, ${item.color_mode === 'bw' ? 'Black & White' : 'Color'}`);
          return;
        }
        configurations.add(config);
      }
      
      // Process new and updated items
      for (const item of pricingItems) {
        if (item.isNew || !item.id) {
          // Insert new item
          const { error } = await supabase
            .from('shop_pricing')
            .insert({
              shop_id: shopId,
              paper_size: item.paper_size,
              color_mode: item.color_mode, // Now using 'bw' or 'color'
              price_per_page: item.price_per_page
            });
            
          if (error) {
            // Check if it's a duplicate key error
            if (error.code === '23505') {
              throw new Error(`Pricing for ${item.paper_size}, ${item.color_mode === 'bw' ? 'Black & White' : 'Color'} already exists`);
            }
            throw error;
          }
        } else {
          // Update existing item
          const { error } = await supabase
            .from('shop_pricing')
            .update({
              price_per_page: item.price_per_page,
              paper_size: item.paper_size,
              color_mode: item.color_mode
            })
            .eq('id', item.id);
            
          if (error) throw error;
        }
      }
      
      toast.success('Pricing saved successfully');
      await fetchPricing(); // Refresh data
    } catch (error: any) {
      console.error('Error saving pricing:', error);
      toast.error(error.message || 'Failed to save pricing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-8">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <div className="h-6 w-6 border-2 border-t-primary border-r-transparent border-l-transparent border-b-transparent animate-spin"></div>
            </div>
            <p className="text-sm text-muted-foreground">Loading price settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-0.5 p-2 sm:p-4">
        <CardTitle className="text-sm sm:text-lg">Print Pricing</CardTitle>
        <CardDescription className="text-[0.625rem] sm:text-sm">
          Set pricing for different types of print jobs
        </CardDescription>
      </CardHeader>
      <CardContent className="p-1 sm:p-4">
        {pricingItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-2 sm:py-4">
            <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2 sm:mb-3" />
            <p className="text-[0.625rem] sm:text-sm text-muted-foreground">No pricing options set</p>
          </div>
        ) : (
          <div className="pricing-table -mx-1 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[0.625rem] sm:text-sm p-1 sm:p-4">Size</TableHead>
                  <TableHead className="text-[0.625rem] sm:text-sm p-1 sm:p-4">Mode</TableHead>
                  <TableHead className="text-[0.625rem] sm:text-sm p-1 sm:p-4">Price</TableHead>
                  <TableHead className="text-[0.625rem] sm:text-sm p-1 sm:p-4 w-[40px] sm:w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingItems.map((item, index) => (
                  <TableRow key={item.id || index}>
                    <TableCell className="p-1 sm:p-4">
                      <Select
                        value={item.paper_size}
                        onValueChange={(value) => handlePricingChange(index, 'paper_size', value)}
                      >
                        <SelectTrigger className="h-6 sm:h-8 text-[0.625rem] sm:text-sm min-w-[60px] sm:min-w-[90px]">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {paperSizes.map((size) => (
                            <SelectItem key={size} value={size} className="text-[0.625rem] sm:text-sm">
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1 sm:p-4">
                      <Select
                        value={item.color_mode}
                        onValueChange={(value) => handlePricingChange(index, 'color_mode', value)}
                      >
                        <SelectTrigger className="h-6 sm:h-8 text-[0.625rem] sm:text-sm min-w-[60px] sm:min-w-[90px]">
                          <SelectValue placeholder="Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorModes.map((mode) => (
                            <SelectItem key={mode} value={mode} className="text-[0.625rem] sm:text-sm">
                              {mode === 'bw' ? 'B&W' : 'Color'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1 sm:p-4">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price_per_page}
                        onChange={(e) => handlePricingChange(index, 'price_per_page', e.target.value)}
                        className="h-6 sm:h-8 text-[0.625rem] sm:text-sm min-w-[50px] sm:min-w-[70px]"
                      />
                    </TableCell>
                    <TableCell className="p-1 sm:p-4">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removePricingItem(index)}
                        className="h-6 w-6 sm:h-7 sm:w-7"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="pricing-actions p-2 sm:p-4 gap-1 sm:gap-2">
        <Button 
          onClick={addNewPricingItem} 
          className="h-6 sm:h-8 text-[0.625rem] sm:text-sm px-2 sm:px-3"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Add
        </Button>
        <Button 
          onClick={savePricing} 
          disabled={saving} 
          className="h-6 sm:h-8 text-[0.625rem] sm:text-sm px-2 sm:px-3"
        >
          <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingManager;
