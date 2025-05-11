
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserRedirect from '@/components/UserRedirect';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUp, FileText, ShoppingBag } from 'lucide-react';
import FileCheck from '@/components/FileCheck';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ActiveOrders from '@/components/ActiveOrders';
import OrderHistory from '@/components/OrderHistory';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
  });
  
  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    if (!user) return;
    
    try {
      // Get active orders (pending)
      const { data: activeOrders, error: activeError } = await supabase
        .from('print_jobs')
        .select('*')
        .eq('customer_id', user.id)
        .eq('status', 'pending');
      
      if (activeError) throw activeError;
      
      // Get completed orders (completed or cancelled)
      const { data: completedOrders, error: completedError } = await supabase
        .from('print_jobs')
        .select('*')
        .eq('customer_id', user.id)
        .in('status', ['completed', 'cancelled']);
      
      if (completedError) throw completedError;
      
      setStats({
        activeOrders: activeOrders.length,
        completedOrders: completedOrders.length,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };
  
  return (
    <UserRedirect requiredRole="customer">
      <div className="min-h-screen dashboard-gradient">
        <Navbar />
        
        <div className="container px-4 md:px-6 pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="animate-on-load">
                <h1 className="text-3xl font-bold tracking-tight">Customer Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Welcome back, {user?.name || 'Customer'}
                </p>
              </div>
              
              <Button className="flex items-center gap-2 shadow-sm animate-on-load" asChild>
                <Link to="/print-order">
                  <FileUp size={16} />
                  New Print Job
                </Link>
              </Button>
            </div>
            
            {/* Dashboard stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-on-load">
              <Card className="bg-card shadow-sm card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-primary/10 rounded-full">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.activeOrders}</div>
                      <p className="text-xs text-muted-foreground">Current print jobs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card shadow-sm card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-primary/10 rounded-full">
                      <FileCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.completedOrders}</div>
                      <p className="text-xs text-muted-foreground">Finished orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="active-orders" className="w-full animate-on-load">
              <TabsList className="grid grid-cols-2 max-w-md mb-8">
                <TabsTrigger value="active-orders">Active Orders</TabsTrigger>
                <TabsTrigger value="order-history">Order History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active-orders" className="space-y-6">
                <ActiveOrders />
              </TabsContent>
              
              <TabsContent value="order-history">
                <OrderHistory />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </UserRedirect>
  );
};

export default CustomerDashboard;
