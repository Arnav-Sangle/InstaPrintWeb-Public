
import React from 'react';
import Navbar from '@/components/Navbar';
import UserRedirect from '@/components/UserRedirect';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Users, Store, FileText, PieChart, Settings, Map, Bell } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Mock platform statistics
  const platformStats = {
    totalUsers: 3240,
    totalShops: 148,
    totalOrders: 12458,
    totalRevenue: '$124,580.50'
  };
  
  // Mock recent users
  const recentUsers = [
    {
      id: 'USR-001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      type: 'customer',
      joined: '2023-10-15'
    },
    {
      id: 'USR-002',
      name: 'Quick Print Store',
      email: 'contact@quickprint.com',
      type: 'shopkeeper',
      joined: '2023-10-10'
    },
    {
      id: 'USR-003',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      type: 'customer',
      joined: '2023-10-18'
    }
  ];
  
  // Mock recent shops
  const recentShops = [
    {
      id: 'SHP-001',
      name: 'Quick Print Store',
      address: '123 Main St, New York, NY',
      owner: 'Robert Johnson',
      status: 'active'
    },
    {
      id: 'SHP-002',
      name: 'City Print Center',
      address: '456 Park Ave, Boston, MA',
      owner: 'Maria Garcia',
      status: 'pending'
    },
    {
      id: 'SHP-003',
      name: 'Express Printing',
      address: '789 Oak St, Chicago, IL',
      owner: 'David Kim',
      status: 'active'
    }
  ];
  
  return (
    <UserRedirect requiredRole="admin">
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container px-4 md:px-6 pt-28 pb-16">
          <div className="max-w-6xl mx-auto">
            <header className="mb-10">
              <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Admin Dashboard</h1>
              <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Manage users, print shops, and platform settings
              </p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <Card className="glass animate-scale-in">
                <CardHeader className="pb-2">
                  <CardDescription>Total Users</CardDescription>
                  <CardTitle className="text-3xl">{platformStats.totalUsers}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    +124 this month
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="pb-2">
                  <CardDescription>Print Shops</CardDescription>
                  <CardTitle className="text-3xl">{platformStats.totalShops}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    +12 this month
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="pb-2">
                  <CardDescription>Total Orders</CardDescription>
                  <CardTitle className="text-3xl">{platformStats.totalOrders}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    +458 this month
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="pb-2">
                  <CardDescription>Platform Revenue</CardDescription>
                  <CardTitle className="text-3xl">{platformStats.totalRevenue}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    +$12,450 this month
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mb-10 glass rounded-xl p-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-2xl font-semibold mb-4">Admin Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30">
                  <Users className="h-6 w-6" />
                  <span>Manage Users</span>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30">
                  <Store className="h-6 w-6" />
                  <span>Manage Shops</span>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30">
                  <PieChart className="h-6 w-6" />
                  <span>View Reports</span>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30">
                  <Settings className="h-6 w-6" />
                  <span>Platform Settings</span>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <Card className="glass animate-fade-in">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Users</CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between bg-white/30 dark:bg-black/10 p-3 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user.type === 'shopkeeper' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {user.type === 'shopkeeper' ? <Store className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{user.joined}</p>
                          <p className="text-xs capitalize">{user.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-white/30 dark:bg-black/10 flex justify-center">
                  <Button variant="ghost" size="sm" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="glass animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Shops</CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentShops.map((shop) => (
                      <div key={shop.id} className="flex items-center justify-between bg-white/30 dark:bg-black/10 p-3 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <Store className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{shop.name}</p>
                            <p className="text-xs text-muted-foreground">{shop.address}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{shop.owner}</p>
                          <p className={`text-xs capitalize ${
                            shop.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {shop.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-white/30 dark:bg-black/10 flex justify-center">
                  <Button variant="ghost" size="sm" className="w-full">
                    <Store className="h-4 w-4 mr-2" />
                    Add New Shop
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <Tabs defaultValue="approvals">
              <TabsList className="mb-6">
                <TabsTrigger value="approvals">
                  <Bell className="h-4 w-4 mr-2" />
                  Pending Approvals
                </TabsTrigger>
                <TabsTrigger value="map">
                  <Map className="h-4 w-4 mr-2" />
                  Shop Map
                </TabsTrigger>
                <TabsTrigger value="reports">
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="approvals" className="animate-fade-in">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Pending Approvals</CardTitle>
                    <CardDescription>
                      Approve or reject pending shop registrations and special requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-white/30 dark:bg-black/10 p-4 rounded-md border border-yellow-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium">City Print Center</h3>
                            <p className="text-sm text-muted-foreground">New shop registration</p>
                          </div>
                          <div className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                            Pending
                          </div>
                        </div>
                        <p className="text-sm mb-4">
                          A new print shop has requested to join the platform. Please review their details and approve or reject.
                        </p>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" size="sm">Reject</Button>
                          <Button size="sm">Approve</Button>
                        </div>
                      </div>
                      
                      <div className="bg-white/30 dark:bg-black/10 p-4 rounded-md border border-yellow-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium">Express Printing</h3>
                            <p className="text-sm text-muted-foreground">Special pricing request</p>
                          </div>
                          <div className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                            Pending
                          </div>
                        </div>
                        <p className="text-sm mb-4">
                          Express Printing has requested a special pricing structure for bulk orders. Review and approve.
                        </p>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" size="sm">Reject</Button>
                          <Button size="sm">Approve</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="map" className="animate-fade-in">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Shop Map</CardTitle>
                    <CardDescription>
                      View and manage all print shops on the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-[16/9] bg-secondary/50 rounded-md flex items-center justify-center">
                      <div className="text-center p-8">
                        <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-medium mb-2">Map View</h3>
                        <p className="text-muted-foreground mb-6">
                          Interactive map showing all print shops on the platform
                        </p>
                        <Button>
                          Load Map
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reports" className="animate-fade-in">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Platform Reports</CardTitle>
                    <CardDescription>
                      View detailed reports on platform usage and performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-white/30 dark:bg-black/10 p-4 rounded-md hover:bg-white/50 dark:hover:bg-black/20 transition-colors cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">Monthly Revenue Report</p>
                              <p className="text-xs text-muted-foreground">October 2023</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </div>
                      
                      <div className="bg-white/30 dark:bg-black/10 p-4 rounded-md hover:bg-white/50 dark:hover:bg-black/20 transition-colors cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">User Growth Report</p>
                              <p className="text-xs text-muted-foreground">Q3 2023</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </div>
                      
                      <div className="bg-white/30 dark:bg-black/10 p-4 rounded-md hover:bg-white/50 dark:hover:bg-black/20 transition-colors cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">Shop Performance Report</p>
                              <p className="text-xs text-muted-foreground">September 2023</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </div>
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
