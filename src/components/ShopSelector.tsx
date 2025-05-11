
import React, { useState, useEffect } from 'react';
import { Map, Store, Navigation, MapPin, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import GoogleMapPicker from './GoogleMapPicker';

type Shop = {
  id: string;
  name: string;
  address: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Location = {
  lat: number;
  lng: number;
};

const ShopSelector = ({ onShopSelected }: { onShopSelected: (shop: Shop) => void }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [locationMapOpen, setLocationMapOpen] = useState(false);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('shops')
        .select('id, name, address, description, latitude, longitude');
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setShops([]);
        return;
      }
      
      setShops(data);
    } catch (error: any) {
      console.error('Error fetching shops:', error);
      setError(error.message || 'Failed to load print shops');
      toast.error(error.message || 'Failed to load print shops');
    } finally {
      setLoading(false);
    }
  };

  // Add retry functionality
  const handleRetry = () => {
    fetchShops();
  };

  const handleSelectShop = (shop: Shop) => {
    setSelectedShop(shop);
    onShopSelected(shop);
  };

  const handleLocationSelect = (location: Location, address?: string) => {
    setUserLocation(location);
    if (address) {
      setLocationAddress(address);
    }
  };

  const handleLocationConfirm = () => {
    if (userLocation) {
      setLocationMapOpen(false);
    } else {
      toast.error('Please select a location first');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    // Haversine formula to calculate distance between two points on Earth
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  // Sort shops by distance if user location is available
  const sortedShops = userLocation 
    ? [...shops].filter(shop => shop.latitude && shop.longitude)
        .sort((a, b) => {
          const distA = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            a.latitude!, 
            a.longitude!
          );
          const distB = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            b.latitude!, 
            b.longitude!
          );
          return distA - distB;
        })
    : shops;

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

  if (error) {
    return (
      <Card className="bg-card shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-red-100 rounded-full">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <h3 className="text-xl font-medium text-center">Failed to load shops</h3>
            <p className="text-sm text-muted-foreground text-center">{error}</p>
            <Button onClick={handleRetry} variant="outline">
              Try Again
            </Button>
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
        <div className="mb-6">
          <Sheet open={locationMapOpen} onOpenChange={setLocationMapOpen}>
            <SheetTrigger asChild>
              <Button className="w-full" variant={userLocation ? "outline" : "default"}>
                <MapPin size={16} className="mr-2" />
                {userLocation ? 'Change Your Location' : 'Set Your Location'}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] sm:h-[90vh] overflow-y-auto">
              <SheetHeader className="mb-4 sticky top-0 z-10">
                <SheetTitle>Select Your Location</SheetTitle>
                <SheetDescription>
                  We'll use this to find the closest print shops to you
                </SheetDescription>
              </SheetHeader>
              <GoogleMapPicker 
                initialLocation={userLocation || undefined} 
                onSelectLocation={handleLocationSelect} 
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handleLocationConfirm}>
                  Confirm Location
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {userLocation && (
            <div className="mt-2 p-2 bg-muted rounded-md text-sm text-muted-foreground">
              <p className="flex items-center">
                <MapPin size={14} className="mr-1 text-primary" />
                <span className="font-medium mr-1">Your location:</span> 
                {locationAddress || `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`}
              </p>
            </div>
          )}
        </div>

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
          <>
            {!userLocation && (
              <div className="mb-4 p-3 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50 rounded-md">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Select your location first to see nearest shops
                </p>
              </div>
            )}
            <div className="space-y-4">
              {sortedShops.map((shop) => (
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
                      {userLocation && shop.latitude && shop.longitude && (
                        <p className="text-xs text-primary font-medium mt-1">
                          {formatDistance(calculateDistance(
                            userLocation.lat, 
                            userLocation.lng, 
                            shop.latitude, 
                            shop.longitude
                          ))} away
                        </p>
                      )}
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ShopSelector;
