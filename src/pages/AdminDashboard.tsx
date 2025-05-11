
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import UserRedirect from '@/components/UserRedirect';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ShoppingBag, Settings, Store, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  return (
    <UserRedirect requiredRole="admin">
      <div className="min-h-screen dashboard-gradient">
        <Navbar />
        
        <div className="container px-4 md:px-6 pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="animate-on-load">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Welcome back, {user?.name || 'Administrator'}
                </p>
              </div>
              
              <Button className="flex items-center gap-2 shadow-sm animate-on-load">
                <Shield size={16} />
                System Settings
              </Button>
            </div>
            
            {/* Dashboard stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-on-load">
              <Card className="bg-card shadow-sm card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-primary/10 rounded-full">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">Registered users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card shadow-sm card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Print Shops</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-primary/10 rounded-full">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">Active shops</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card shadow-sm card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Print Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-primary/10 rounded-full">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">Total orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card shadow-sm card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-green-100 rounded-full">
                      <div className="h-5 w-5 rounded-full bg-green-500"></div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">All Systems Normal</div>
                      <p className="text-xs text-muted-foreground">100% uptime</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="users" className="w-full animate-on-load">
              <TabsList className="grid grid-cols-3 max-w-md mb-8">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="shops">Shops</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="users" className="space-y-6">
                <Card className="bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      View and manage user accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="p-5 bg-muted rounded-full mb-5">
                        <Users size={48} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No users yet</h3>
                      <p className="text-sm text-muted-foreground max-w-md mt-2">
                        User management interface will be available here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="shops">
                <Card className="bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle>Shop Management</CardTitle>
                    <CardDescription>
                      Oversee all registered print shops
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="p-5 bg-muted rounded-full mb-5">
                        <Store size={48} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No shops registered</h3>
                      <p className="text-sm text-muted-foreground max-w-md mt-2">
                        Shop management interface will be available here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card className="bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>
                      Configure platform settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="p-5 bg-muted rounded-full mb-5">
                        <Settings size={48} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">System settings</h3>
                      <p className="text-sm text-muted-foreground max-w-md mt-2">
                        System configuration interface will be available here
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

export default AdminDashboard;
