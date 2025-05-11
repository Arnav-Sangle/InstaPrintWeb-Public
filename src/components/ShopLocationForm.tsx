
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import GoogleMapPicker from './GoogleMapPicker';
import ShopForm from './ShopForm';

interface ShopLocationFormProps {
  shopId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Location {
  lat: number;
  lng: number;
}

const ShopLocationForm: React.FC<ShopLocationFormProps> = ({ shopId, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [location, setLocation] = useState<Location | null>(null);
  const [address, setAddress] = useState<string>('');
  const [shopData, setShopData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMode, setFormMode] = useState<'map' | 'details'>('map');
  
  useEffect(() => {
    const fetchShop = async () => {
      if (!shopId) return;
      
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('id', shopId)
          .single();
          
        if (error) {
          console.error('Error fetching shop:', error);
          toast.error('Failed to load shop data');
          return;
        }
        
        if (data) {
          setShopData(data);
          if (data.latitude && data.longitude) {
            setLocation({ lat: data.latitude, lng: data.longitude });
          }
          if (data.address) {
            setAddress(data.address);
          }
        }
      } catch (error) {
        console.error('Error in fetchShop:', error);
        toast.error('Something went wrong while loading shop data');
      }
    };
    
    fetchShop();
  }, [shopId]);
  
  const handleLocationSelect = (newLocation: Location, newAddress?: string) => {
    setLocation(newLocation);
    if (newAddress) {
      setAddress(newAddress);
    }
  };
  
  const handleSubmitLocation = async () => {
    if (!user || !location) return;
    
    setIsSubmitting(true);
    
    try {
      if (shopId) {
        // For existing shops, always go to details form after location update
        // to allow updating other shop information
        setShopData({
          ...shopData,
          latitude: location.lat,
          longitude: location.lng,
          address: address || shopData?.address
        });
        
        setFormMode('details');
        setIsSubmitting(false);
      } else {
        // First time setting up a shop, go to details form
        setFormMode('details');
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error('Error saving shop location:', error);
      toast.error(error.message || 'Failed to save shop location');
      setIsSubmitting(false);
    }
  };
  
  const handleShopFormSuccess = () => {
    toast.success(shopId ? 'Shop updated successfully!' : 'Shop created successfully with location!');
    if (onSuccess) onSuccess();
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {shopId ? 'Update Shop Location' : 'Register New Shop'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {formMode === 'map' ? (
          <GoogleMapPicker 
            initialLocation={location || undefined}
            onSelectLocation={handleLocationSelect}
          />
        ) : (
          <ShopForm 
            shopId={shopId}
            initialData={{
              ...shopData,
              address: address || shopData?.address
            }}
            initialLocation={location}
            onSuccess={handleShopFormSuccess}
            onCancel={() => setFormMode('map')}
          />
        )}
      </CardContent>
      
      {formMode === 'map' && (
        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          <Button 
            onClick={handleSubmitLocation} 
            disabled={!location || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                {shopId ? 'Continue to Edit Shop Details' : 'Continue to Shop Details'}
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ShopLocationForm;
