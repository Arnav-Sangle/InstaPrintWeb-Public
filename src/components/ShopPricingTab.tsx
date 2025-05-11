
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import PricingManager from './PricingManager';
import { Store, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

type Shop = {
  id: string;
  name: string;
  address: string;
};

const ShopPricingTab = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchShops = async (force: boolean = false) => {
    if (!user) return;

    // Only fetch if forced or if it's been more than 5 seconds since last fetch
    const now = Date.now();
    if (!force && now - lastFetchTime < 5000) {
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shops')
        .select('id, name, address')
        .eq('owner_id', user.id)
        .order('name');
        
      if (error) throw error;
      
      setShops(data || []);
      
      // Select the first shop by default if available
      if (data && data.length > 0 && !selectedShopId) {
        setSelectedShopId(data[0].id);
      }
      setError(null);
      setLastFetchTime(now);
    } catch (error) {
      console.error('Error fetching shops:', error);
      setError('Failed to load shops');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const loadShops = async (force: boolean = false) => {
      if (!mounted) return;
      
      try {
        await fetchShops(force);
      } catch (error) {
        console.error('Error in loadShops:', error);
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          retryTimeout = setTimeout(() => loadShops(true), 1000 * retryCount);
        }
      }
    };

    // Initial load
    loadShops(true);

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mounted) {
        retryCount = 0;
        loadShops(true); // Force refresh when tab becomes visible
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  if (loading) {
    return (
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Pricing Management</CardTitle>
          <CardDescription>
            Set and manage print pricing for your shops
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <div className="rounded-md h-8 w-8 border-4 border-t-primary border-r-transparent border-l-transparent border-b-transparent animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Pricing Management</CardTitle>
          <CardDescription>
            Set and manage print pricing for your shops
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <div className="p-5 bg-red-100 rounded-full mb-5">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-500">Error Loading Shops</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-2 text-center">
            {error}. Please try refreshing the page.
          </p>
          <Button 
            className="mt-6" 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchShops().finally(() => setLoading(false));
            }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (shops.length === 0) {
    return (
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>No Shops Found</CardTitle>
          <CardDescription>
            Register a shop to manage pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <div className="p-5 bg-muted rounded-full mb-5">
            <Store className="h-16 w-16 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground max-w-md mt-2 text-center">
            You don't have any registered shops. Create a shop first to manage pricing.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Pricing Management</CardTitle>
        <CardDescription>
          Set and manage print pricing for your shops
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default ShopPricingTab;
