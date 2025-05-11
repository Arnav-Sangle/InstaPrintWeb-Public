
import React from 'react';
import Navbar from '@/components/Navbar';
import UserRedirect from '@/components/UserRedirect';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, FileText, Printer, Settings, Package, PieChart, Clock, X } from 'lucide-react';

const ShopkeeperDashboard = () => {
  const { user } = useAuth();
  
  // Mock print jobs (in a real app, these would come from an API)
  const pendingJobs = [
    {
      id: 'ORD-003',
      customer: 'John Doe',
      date: '2023-10-20',
      totalPages: 25,
      price: '$7.50',
      files: ['report.pdf'],
      colorMode: 'Color',
      paperSize: 'A4',
      copies: 1,
      doubleSided: true
    },
    {
      id: 'ORD-004',
      customer: 'Jane Smith',
      date: '2023-10-20',
      totalPages: 8,
      price: '$2.40',
      files: ['document.pdf'],
      colorMode: 'Black & White',
      paperSize: 'Letter',
      copies: 2,
      doubleSided: false
    }
  ];
  
  const processingJobs = [
    {
      id: 'ORD-002',
      customer: 'Alex Johnson',
      date: '2023-10-18',
      totalPages: 35,
      price: '$12.25',
      files: ['presentation.pptx', 'notes.pdf'],
      colorMode: 'Color',
      paperSize: 'A4',
      copies: 1,
      doubleSided: true
    }
  ];
  
  // Mock shop statistics
  const shopStats = {
    totalOrders: 124,
    completedOrders: 118,
    pendingOrders: 6,
    totalRevenue: '$2,450.75'
  };
  
  return (
    <UserRedirect requiredRole="shopkeeper">
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container px-4 md:px-6 pt-28 pb-16">
          <div className="max-w-6xl mx-auto">
            <header className="mb-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Shop Dashboard</h1>
                  <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    Manage print jobs and shop settings
                  </p>
                </div>
                
                <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Shop is Open</span>
                  <Button variant="outline" size="sm" className="ml-2">
                    <Settings className="h-4 w-4 mr-2" />
                    Shop Settings
                  </Button>
                </div>
              </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <Card className="glass animate-scale-in">
                <CardHeader className="pb-2">
                  <CardDescription>Total Orders</CardDescription>
                  <CardTitle className="text-3xl">{shopStats.totalOrders}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    All time
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="pb-2">
                  <CardDescription>Completed</CardDescription>
                  <CardTitle className="text-3xl">{shopStats.completedOrders}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {((shopStats.completedOrders / shopStats.totalOrders) * 100).toFixed(1)}% completion rate
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="pb-2">
                  <CardDescription>Pending</CardDescription>
                  <CardTitle className="text-3xl">{shopStats.pendingOrders}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Awaiting action
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="pb-2">
                  <CardDescription>Revenue</CardDescription>
                  <CardTitle className="text-3xl">{shopStats.totalRevenue}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Total earnings
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mb-10 glass rounded-xl p-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30">
                  <Printer className="h-6 w-6" />
                  <span>Printer Status</span>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30">
                  <Package className="h-6 w-6" />
                  <span>Manage Orders</span>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30">
                  <PieChart className="h-6 w-6" />
                  <span>View Reports</span>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30">
                  <Settings className="h-6 w-6" />
                  <span>Shop Settings</span>
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="pending">
              <TabsList className="mb-6">
                <TabsTrigger value="pending">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Pending Jobs
                </TabsTrigger>
                <TabsTrigger value="processing">
                  <Printer className="h-4 w-4 mr-2" />
                  Processing
                </TabsTrigger>
                <TabsTrigger value="ready">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Ready for Pickup
                </TabsTrigger>
                <TabsTrigger value="completed">
                  <Package className="h-4 w-4 mr-2" />
                  Completed
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="animate-fade-in">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Pending Print Jobs</h2>
                  
                  {pendingJobs.map((job) => (
                    <Card key={job.id} className="overflow-hidden glass">
                      <CardHeader className="bg-white/30 dark:bg-black/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">Order #{job.id}</CardTitle>
                            <CardDescription>{job.customer} • {job.date}</CardDescription>
                          </div>
                          <div className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                            Pending Approval
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Files</p>
                            <div className="space-y-2">
                              {job.files.map((file, index) => (
                                <div key={index} className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span className="text-sm">{file}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Print Details</p>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="text-muted-foreground">Mode:</span> {job.colorMode}
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Size:</span> {job.paperSize}
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Copies:</span> {job.copies}
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Double-sided:</span> {job.doubleSided ? 'Yes' : 'No'}
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Pages:</span> {job.totalPages}
                              </p>
                              <p className="text-sm font-medium mt-1">
                                <span className="text-muted-foreground">Price:</span> {job.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-3 border-t bg-white/30 dark:bg-black/10">
                        <Button variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept & Print
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  
                  {pendingJobs.length === 0 && (
                    <Card className="glass text-center py-12">
                      <CardContent>
                        <div className="mx-auto rounded-full bg-secondary w-12 h-12 flex items-center justify-center mb-4">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">No pending jobs</h3>
                        <p className="text-muted-foreground">
                          There are no pending print jobs at the moment.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="processing" className="animate-fade-in">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Processing Jobs</h2>
                  
                  {processingJobs.map((job) => (
                    <Card key={job.id} className="overflow-hidden glass">
                      <CardHeader className="bg-white/30 dark:bg-black/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">Order #{job.id}</CardTitle>
                            <CardDescription>{job.customer} • {job.date}</CardDescription>
                          </div>
                          <div className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            Processing
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Files</p>
                            <div className="space-y-2">
                              {job.files.map((file, index) => (
                                <div key={index} className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span className="text-sm">{file}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Print Details</p>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="text-muted-foreground">Mode:</span> {job.colorMode}
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Size:</span> {job.paperSize}
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Pages:</span> {job.totalPages}
                              </p>
                              <p className="text-sm font-medium mt-1">
                                <span className="text-muted-foreground">Price:</span> {job.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-3 border-t bg-white/30 dark:bg-black/10">
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Ready
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  
                  {processingJobs.length === 0 && (
                    <Card className="glass text-center py-12">
                      <CardContent>
                        <div className="mx-auto rounded-full bg-secondary w-12 h-12 flex items-center justify-center mb-4">
                          <Printer className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">No jobs in progress</h3>
                        <p className="text-muted-foreground">
                          There are no print jobs currently being processed.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="ready" className="animate-fade-in">
                <Card className="glass text-center py-12">
                  <CardContent>
                    <div className="mx-auto rounded-full bg-secondary w-12 h-12 flex items-center justify-center mb-4">
                      <CheckCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No orders ready for pickup</h3>
                    <p className="text-muted-foreground">
                      There are no print jobs ready for customer pickup at the moment.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="completed" className="animate-fade-in">
                <Card className="glass text-center py-12">
                  <CardContent>
                    <div className="mx-auto rounded-full bg-secondary w-12 h-12 flex items-center justify-center mb-4">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Completed orders history</h3>
                    <p className="text-muted-foreground mb-6">
                      View your order history and completed print jobs
                    </p>
                    <Button>
                      <Clock className="h-4 w-4 mr-2" />
                      View Order History
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

export default ShopkeeperDashboard;
