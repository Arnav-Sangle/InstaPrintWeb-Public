
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import PricingManager from './PricingManager';
import { Store } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Shop = {
  id: string;
  name: string;
  address: string;
};

const ShopPricingTab = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shops')
        .select('id, name, address')
        .order('name');
        
      if (error) throw error;
      
      setShops(data || []);
      
      // Select the first shop by default if available
      if (data && data.length > 0 && !selectedShopId) {
        setSelectedShopId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Pricing Management</CardTitle>
        <CardDescription>
          Set and manage print pricing for your shops
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="rounded-md h-8 w-8 border-4 border-t-primary border-r-transparent border-l-transparent border-b-transparent animate-spin"></div>
          </div>
        ) : shops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Store className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              You don't have any shops registered yet. Please register a shop first to manage pricing.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="shop-select">Select Shop</Label>
              <Select
                value={selectedShopId || ''}
                onValueChange={setSelectedShopId}
              >
                <SelectTrigger id="shop-select">
                  <SelectValue placeholder="Select a shop" />
                </SelectTrigger>
                <SelectContent>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedShopId && (
              <PricingManager shopId={selectedShopId} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShopPricingTab;
