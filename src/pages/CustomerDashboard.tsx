
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserRedirect from '@/components/UserRedirect';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUp, Map, Clock, FileText, Printer, ShoppingBag } from 'lucide-react';
import FileCheck from '@/components/FileCheck';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user } = useAuth();
  
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-on-load">
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
                      <div className="text-2xl font-bold">0</div>
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
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">Finished orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card shadow-sm card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Favorite Shops</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-primary/10 rounded-full">
                      <Printer className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">Saved print shops</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="orders" className="w-full animate-on-load">
              <TabsList className="grid grid-cols-3 max-w-md mb-8">
                <TabsTrigger value="orders">My Orders</TabsTrigger>
                <TabsTrigger value="shops">Print Shops</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="orders" className="space-y-6">
                <Card className="bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle>My Active Orders</CardTitle>
                    <CardDescription>
                      Track and manage your current print jobs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center py-8">
                    <div className="p-5 bg-muted rounded-full mb-5">
                      <FileText size={48} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No active orders</h3>
                    <p className="text-sm text-muted-foreground max-w-md mt-2 text-center">
                      You don't have any active print orders. Create a new print job to get started.
                    </p>
                    <Button className="mt-6 flex items-center gap-2" asChild>
                      <Link to="/print-order">
                        <FileUp size={16} />
                        New Print Job
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="shops">
                <Card className="bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle>Find Print Shops</CardTitle>
                    <CardDescription>
                      Browse nearby print shops to place your order
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="p-5 bg-muted rounded-full mb-5">
                        <Map size={48} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">Explore Print Shops</h3>
                      <p className="text-sm text-muted-foreground max-w-md mt-2">
                        Browse available print shops in your area
                      </p>
                      <Button className="mt-6">View Map</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history">
                <Card className="bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                      View your past print orders
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="p-5 bg-muted rounded-full mb-5">
                      <Clock size={48} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No order history</h3>
                    <p className="text-sm text-muted-foreground max-w-md mt-2">
                      Your completed print orders will appear here
                    </p>
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

export default CustomerDashboard;
