
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShopFormProps {
  shopId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ShopForm: React.FC<ShopFormProps> = ({ shopId, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load shop data if editing an existing shop
  React.useEffect(() => {
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
          setName(data.name);
          setAddress(data.address);
          setPhone(data.phone || '');
          setDescription(data.description || '');
        }
      } catch (error) {
        console.error('Error in fetchShop:', error);
        toast.error('Something went wrong while loading shop data');
      }
    };
    
    fetchShop();
  }, [shopId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      if (shopId) {
        // Update existing shop
        const { error } = await supabase
          .from('shops')
          .update({
            name,
            address,
            phone,
            description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', shopId);
          
        if (error) throw error;
        
        toast.success('Shop updated successfully');
      } else {
        // Create new shop
        const { error } = await supabase
          .from('shops')
          .insert({
            owner_id: user.id,
            name,
            address,
            phone,
            description,
          });
          
        if (error) throw error;
        
        toast.success('Shop created successfully');
      }
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error saving shop:', error);
      toast.error(error.message || 'Failed to save shop');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{shopId ? 'Edit Shop' : 'Register New Shop'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Shop Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter shop name"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter shop address"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter contact phone number"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your shop and services"
              rows={4}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        
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
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {shopId ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              shopId ? 'Update Shop' : 'Create Shop'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ShopForm;
