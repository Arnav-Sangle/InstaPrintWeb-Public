
import React, { useState, useEffect } from 'react';
import { Map, Store, Navigation } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Shop = {
  id: string;
  name: string;
  address: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
};

const ShopSelector = ({ onShopSelected }: { onShopSelected: (shop: Shop) => void }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shops')
        .select('id, name, address, description, latitude, longitude');
        
      if (error) throw error;
      
      setShops(data || []);
    } catch (error: any) {
      console.error('Error fetching shops:', error);
      toast.error(error.message || 'Failed to load print shops');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectShop = (shop: Shop) => {
    setSelectedShop(shop);
    onShopSelected(shop);
  };

  if (loading) {
    return (
      <Card className="bg-card shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Store size={24} className="text-primary" />
            </div>
            <h3 className="text-xl font-medium">Loading Shops...</h3>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Select a Print Shop</CardTitle>
        <CardDescription>Choose a shop to print your document</CardDescription>
      </CardHeader>
      <CardContent>
        {shops.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="p-4 bg-muted rounded-full">
              <Store size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No shops available</h3>
            <p className="text-sm text-muted-foreground text-center">
              There are no print shops registered in the system yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {shops.map((shop) => (
              <div 
                key={shop.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedShop?.id === shop.id 
                    ? 'bg-primary/10 border-primary' 
                    : 'hover:bg-accent'
                }`}
                onClick={() => handleSelectShop(shop)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Store size={18} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{shop.name}</h4>
                    <p className="text-sm text-muted-foreground">{shop.address}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://maps.google.com/?q=${shop.latitude},${shop.longitude}`,
                        '_blank'
                      );
                    }}
                    disabled={!shop.latitude || !shop.longitude}
                  >
                    <Navigation size={14} className="mr-1" />
                    Map
                  </Button>
                </div>
                {shop.description && (
                  <p className="text-sm text-muted-foreground mt-2">{shop.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShopSelector;
