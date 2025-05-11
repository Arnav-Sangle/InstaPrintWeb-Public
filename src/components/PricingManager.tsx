
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
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="rounded-md h-8 w-8 border-4 border-t-primary border-r-transparent border-l-transparent border-b-transparent animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Print Pricing</CardTitle>
        <CardDescription>
          Set pricing for different types of print jobs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pricingItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No pricing options configured yet. Add pricing options for your print services.
            </p>
            <Button onClick={addNewPricingItem}>
              <Plus size={16} className="mr-2" />
              Add Pricing Option
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paper Size</TableHead>
                  <TableHead>Color Mode</TableHead>
                  <TableHead>Price Per Page</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingItems.map((item, index) => (
                  <TableRow key={item.id || `new-${index}`}>
                    <TableCell>
                      <Select
                        value={item.paper_size}
                        onValueChange={(value) => handlePricingChange(index, 'paper_size', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Paper size" />
                        </SelectTrigger>
                        <SelectContent>
                          {paperSizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.color_mode}
                        onValueChange={(value) => handlePricingChange(index, 'color_mode', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Color mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bw">Black & White</SelectItem>
                          <SelectItem value="color">Color</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2">$</span>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.price_per_page.toString()}
                          onChange={(e) => handlePricingChange(index, 'price_per_page', e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removePricingItem(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={addNewPricingItem}
              >
                <Plus size={16} className="mr-2" />
                Add Option
              </Button>
              
              <Button 
                onClick={savePricing} 
                disabled={saving}
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Saving...' : 'Save Pricing'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PricingManager;
