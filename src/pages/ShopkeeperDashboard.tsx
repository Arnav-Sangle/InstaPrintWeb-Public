import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserRedirect from '@/components/UserRedirect';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Printer, Settings, FileText, MapPin, Store, Clock, BarChart, Tag, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ShopLocationForm from '@/components/ShopLocationForm';
import ShopPricingTab from '@/components/ShopPricingTab';
import ShopOrdersTab from '@/components/ShopOrdersTab';

const ShopkeeperDashboard = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewShopForm, setShowNewShopForm] = useState(false);
  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  
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

        // If we have shops, fetch stats
        if (data && data.length > 0) {
          fetchStats(data.map(shop => shop.id));
        }
      } catch (error) {
        console.error('Error in fetchShops:', error);
        toast.error('Something went wrong while loading your shops');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShops();
  }, [user]);

  // Fetch dashboard statistics
  const fetchStats = async (shopIds: string[]) => {
    try {
      // Fetch pending orders count
      const { data: pendingOrders, error: pendingError } = await supabase
        .from('print_jobs')
        .select('id', { count: 'exact' })
        .in('shop_id', shopIds)
        .eq('status', 'pending');
        
      if (!pendingError) {
        setPendingOrdersCount(pendingOrders?.length || 0);
      }

      // Fetch completed orders count
      const { data: completedOrders, error: completedError } = await supabase
        .from('print_jobs')
        .select('id', { count: 'exact' })
        .in('shop_id', shopIds)
        .eq('status', 'completed');
        
      if (!completedError) {
        setCompletedOrdersCount(completedOrders?.length || 0);
      }
      
      // Fetch total sales
      const { data: salesData, error: salesError } = await supabase
        .from('print_jobs')
        .select('price')
        .in('shop_id', shopIds)
        .in('status', ['ready', 'processing']);
        
      if (!salesError && salesData) {
        const total = salesData.reduce((sum, order) => sum + (order.price || 0), 0);
        setTotalSales(total);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  const handleNewShopSuccess = () => {
    setShowNewShopForm(false);
    setLoading(true);
    // Refetch shops
    fetchShops();
  };
  
  const handleEditLocationSuccess = () => {
    setEditingShopId(null);
    setLoading(true);
    // Refetch shops
    fetchShops();
  };
  
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
      
      // If we have shops, fetch stats
      if (data && data.length > 0) {
        fetchStats(data.map(shop => shop.id));
      }
    } catch (error) {
      console.error('Error in fetchShops:', error);
      toast.error('Something went wrong while loading your shops');
    } finally {
      setLoading(false);
    }
  };
  
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
              
              <Button 
                className="flex items-center gap-2 shadow-sm animate-on-load"
                onClick={() => setShowNewShopForm(true)}
              >
                <Plus size={16} />
                Register New Shop
              </Button>
            </div>
            
            {/* Dashboard stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-on-load">
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
                      <div className="text-2xl font-bold">{pendingOrdersCount}</div>
                      <p className="text-xs text-muted-foreground">Awaiting processing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card shadow-sm card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-primary/10 rounded-full">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{completedOrdersCount}</div>
                      <p className="text-xs text-muted-foreground">Marked Completed</p>
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
                      <div className="text-2xl font-bold">{totalSales.toFixed(2)} Rs</div>
                      <p className="text-xs text-muted-foreground">Lifetime revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {showNewShopForm ? (
              <Card className="bg-card shadow-sm animate-on-load">
                <CardHeader>
                  <CardTitle>Set Up New Shop</CardTitle>
                  <CardDescription>
                    First, select your shop location on the map
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ShopLocationForm 
                    onSuccess={handleNewShopSuccess}
                    onCancel={() => setShowNewShopForm(false)}
                  />
                </CardContent>
              </Card>
            ) : editingShopId ? (
              <Card className="bg-card shadow-sm animate-on-load">
                <CardHeader>
                  <CardTitle>Edit Shop Location</CardTitle>
                  <CardDescription>
                    Update your shop location on the map
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ShopLocationForm 
                    shopId={editingShopId}
                    onSuccess={handleEditLocationSuccess}
                    onCancel={() => setEditingShopId(null)}
                  />
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="shops" className="w-full animate-on-load">
                <TabsList className="grid grid-cols-3 max-w-md mb-8">
                  <TabsTrigger value="shops">My Shop</TabsTrigger>
                  <TabsTrigger value="orders">Print Orders</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  {/* <TabsTrigger value="settings">Settings</TabsTrigger> */}
                </TabsList>
                
                <TabsContent value="shops" className="space-y-6">
                  <Card className="bg-card shadow-sm"> 
                    <CardHeader>
                        <CardTitle>My Shop</CardTitle>
                        <CardDescription>
                          Manage your shop location settings
                        </CardDescription>
                      </CardHeader>

                    {loading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="rounded-md h-8 w-8 border-4 border-t-primary border-r-transparent border-l-transparent border-b-transparent animate-spin"></div>
                    </div>
                    ) : shops.length > 0 ? (
                      <div className="space-y-6 px-6 pb-6">
                      {/* <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> */}
                        <div className="space-y-4">
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
                                {shop.latitude && shop.longitude ? (
                                  <div className="mt-3 flex items-center text-xs text-green-600">
                                    <MapPin size={12} className="mr-1" />
                                    Location set: {shop.latitude.toFixed(4)}, {shop.longitude.toFixed(4)}
                                  </div>
                                ) : (
                                  <div className="mt-3 flex items-center text-xs text-amber-600">
                                    <MapPin size={12} className="mr-1" />
                                    No location set
                                  </div>
                                )}
                              </CardContent>
                              <CardFooter className="border-t px-6 py-4 bg-muted/50 flex justify-center">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setEditingShopId(shop.id)}
                                >
                                  {shop.latitude && shop.longitude ? 'Update Location' : 'Set Location'}
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
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
                          <Button className="flex items-center gap-2" onClick={() => setShowNewShopForm(true)}>
                            <Plus size={16} />
                            Register New Shop
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </Card>
                </TabsContent>
                
                <TabsContent value="orders">
                  <ShopOrdersTab />
                </TabsContent>
                
                <TabsContent value="pricing">
                  <ShopPricingTab />
                </TabsContent>
                
                {/* <TabsContent value="settings">
                  <Card className="bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle>Shop Settings</CardTitle>
                      <CardDescription>
                        Manage your shop locations and settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex items-center justify-center py-10">
                          <div className="rounded-md h-8 w-8 border-4 border-t-primary border-r-transparent border-l-transparent border-b-transparent animate-spin"></div>
                        </div>
                      ) : shops.length > 0 ? (
                        <div className="space-y-6">
                          <h3 className="text-lg font-medium">Your Shop Locations</h3>
                          <div className="space-y-4">
                            {shops.map((shop) => (
                              <Card key={shop.id} className="bg-card shadow-sm">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-base">{shop.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="pb-2">
                                  <p className="text-sm text-muted-foreground">{shop.address}</p>
                                  {shop.latitude && shop.longitude ? (
                                    <div className="mt-2 flex items-center text-sm text-green-600">
                                      <MapPin size={14} className="mr-1" />
                                      Location: {shop.latitude.toFixed(6)}, {shop.longitude.toFixed(6)}
                                    </div>
                                  ) : (
                                    <div className="mt-2 flex items-center text-sm text-amber-600">
                                      <MapPin size={14} className="mr-1" />
                                      No location set
                                    </div>
                                  )}
                                </CardContent>
                                <CardFooter>
                                  <Button 
                                    size="sm" 
                                    onClick={() => setEditingShopId(shop.id)}
                                  >
                                    {shop.latitude && shop.longitude ? 'Update Location' : 'Set Location'}
                                  </Button>
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="p-5 bg-muted rounded-full mb-5">
                            <MapPin size={48} className="text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium">No shops registered</h3>
                          <p className="text-sm text-muted-foreground max-w-md mt-2 mb-4">
                            Register your first print shop to manage locations
                          </p>
                          <Button onClick={() => setShowNewShopForm(true)}>
                            Register New Shop
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent> */}
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </UserRedirect>
  );
};

export default ShopkeeperDashboard;
