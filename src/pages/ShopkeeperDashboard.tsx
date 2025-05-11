
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserRedirect from '@/components/UserRedirect';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Printer, Settings, FileText, MapPin, Store, Clock, BarChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ShopkeeperDashboard = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch shops owned by the current user
  useEffect(() => {
    const fetchShops = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching shops:', error);
          toast.error('Failed to load your shops');
          return;
        }
        
        setShops(data || []);
      } catch (error) {
        console.error('Error in fetchShops:', error);
        toast.error('Something went wrong while loading your shops');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShops();
  }, [user]);
  
  return (
    <UserRedirect requiredRole="shopkeeper">
      <div className="min-h-screen dashboard-gradient">
        <Navbar />
        
        <div className="container px-4 md:px-6 pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="animate-on-load">
                <h1 className="text-3xl font-bold tracking-tight">Print Shop Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Welcome back, {user?.name || 'Shop Owner'}
                </p>
              </div>
              
              <Button className="flex items-center gap-2 shadow-sm animate-on-load">
                <Plus size={16} />
                Register New Shop
              </Button>
            </div>
            
            {/* Dashboard stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-on-load">
              <Card className="bg-card shadow-sm card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Your Shops</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-primary/10 rounded-full">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{shops.length}</div>
                      <p className="text-xs text-muted-foreground">Registered print shops</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card shadow-sm card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-primary/10 rounded-full">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">Awaiting processing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card shadow-sm card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-primary/10 rounded-full">
                      <BarChart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">$0.00</div>
                      <p className="text-xs text-muted-foreground">Lifetime revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="shops" className="w-full animate-on-load">
              <TabsList className="grid grid-cols-3 max-w-md mb-8">
                <TabsTrigger value="shops">My Shops</TabsTrigger>
                <TabsTrigger value="orders">Print Orders</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="shops" className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="rounded-md h-8 w-8 border-4 border-t-primary border-r-transparent border-l-transparent border-b-transparent animate-spin"></div>
                  </div>
                ) : shops.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {shops.map((shop) => (
                      <Card key={shop.id} className="bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow card-hover">
                        <CardHeader className="pb-3">
                          <CardTitle>{shop.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin size={14} />
                            {shop.address}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {shop.description || 'No description provided.'}
                          </p>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4 bg-muted/50 flex justify-between">
                          <Button variant="outline" size="sm">Manage</Button>
                          <Button variant="outline" size="sm">View Orders</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle>No shops registered</CardTitle>
                      <CardDescription>
                        Register your first print shop to start accepting orders
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-8">
                      <div className="p-5 bg-muted rounded-full mb-5">
                        <Printer size={48} className="text-muted-foreground" />
                      </div>
                      <Button className="flex items-center gap-2">
                        <Plus size={16} />
                        Register New Shop
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="orders">
                <Card className="bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle>Print Orders</CardTitle>
                    <CardDescription>
                      View and manage all incoming print job requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="p-5 bg-muted rounded-full mb-5">
                        <FileText size={48} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No orders yet</h3>
                      <p className="text-sm text-muted-foreground max-w-md mt-2">
                        Orders will appear here once customers place them for your shop
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card className="bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences and profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="p-5 bg-muted rounded-full mb-5">
                        <Settings size={48} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">Account settings</h3>
                      <p className="text-sm text-muted-foreground max-w-md mt-2">
                        Account settings will be available here soon
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </UserRedirect>
  );
};

export default ShopkeeperDashboard;
