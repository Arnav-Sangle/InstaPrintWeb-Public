
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import UserRedirect from '@/components/UserRedirect';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, MapPin, CreditCard, Clock, CheckCircle, Plus } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  
  // Mock printing orders (in a real app, these would come from an API)
  const orders = [
    {
      id: 'ORD-001',
      status: 'ready',
      shop: 'Quick Print Store',
      date: '2023-10-15',
      totalPages: 12,
      price: '$4.80',
      files: ['document.pdf']
    },
    {
      id: 'ORD-002',
      status: 'processing',
      shop: 'City Print Center',
      date: '2023-10-18',
      totalPages: 35,
      price: '$12.25',
      files: ['presentation.pptx', 'notes.pdf']
    }
  ];
  
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800'
  };
  
  return (
    <UserRedirect requiredRole="customer">
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container px-4 md:px-6 pt-28 pb-16">
          <div className="max-w-6xl mx-auto">
            <header className="mb-10">
              <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Welcome, {user?.name}</h1>
              <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Manage your printing orders and create new print requests
              </p>
            </header>
            
            <div className="mb-12 glass rounded-xl p-6 animate-scale-in">
              <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30">
                  <Upload className="h-6 w-6" />
                  <span>New Print Job</span>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30">
                  <MapPin className="h-6 w-6" />
                  <span>Find Print Shops</span>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30">
                  <Clock className="h-6 w-6" />
                  <span>Track Orders</span>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30">
                  <CreditCard className="h-6 w-6" />
                  <span>Payment History</span>
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="orders">
              <TabsList className="mb-6">
                <TabsTrigger value="orders">My Orders</TabsTrigger>
                <TabsTrigger value="saved">Saved Documents</TabsTrigger>
                <TabsTrigger value="favorite">Favorite Shops</TabsTrigger>
              </TabsList>
              
              <TabsContent value="orders" className="animate-fade-in">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Recent Orders</h2>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </div>
                  
                  {orders.length > 0 ? (
                    <div className="grid gap-6">
                      {orders.map((order) => (
                        <Card key={order.id} className="overflow-hidden glass">
                          <CardHeader className="bg-white/30 dark:bg-black/10">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-xl">Order #{order.id}</CardTitle>
                                <CardDescription>{order.shop} • {order.date}</CardDescription>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status as keyof typeof statusColors]}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Files</p>
                                <div className="space-y-2">
                                  {order.files.map((file, index) => (
                                    <div key={index} className="flex items-center">
                                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                      <span className="text-sm">{file}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Details</p>
                                <p className="text-sm">{order.totalPages} pages</p>
                                <p className="text-sm font-medium mt-1">{order.price}</p>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between border-t bg-white/30 dark:bg-black/10">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                            {order.status === 'ready' && (
                              <Button size="sm">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm Pickup
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="glass text-center py-12">
                      <CardContent>
                        <div className="mx-auto rounded-full bg-secondary w-12 h-12 flex items-center justify-center mb-4">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">No orders yet</h3>
                        <p className="text-muted-foreground mb-6">
                          You haven't placed any print orders yet. Start by creating a new print job.
                        </p>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Print Job
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="saved" className="animate-fade-in">
                <Card className="glass text-center py-12">
                  <CardContent>
                    <div className="mx-auto rounded-full bg-secondary w-12 h-12 flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No saved documents</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't saved any documents yet. Upload documents and save them for future use.
                    </p>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="favorite" className="animate-fade-in">
                <Card className="glass text-center py-12">
                  <CardContent>
                    <div className="mx-auto rounded-full bg-secondary w-12 h-12 flex items-center justify-center mb-4">
                      <MapPin className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No favorite shops</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't added any print shops to your favorites yet. Browse nearby shops and add them to your favorites.
                    </p>
                    <Button>
                      <MapPin className="h-4 w-4 mr-2" />
                      Find Print Shops
                    </Button>
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
