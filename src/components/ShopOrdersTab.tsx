import React, { useState, useEffect } from 'react';
import { 
  Calendar, FileText, Clock, Printer, AlertTriangle, CheckCircle, 
  User, X, Eye, DollarSign 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type PrintJob = {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  customer_id: string;
  shop_id: string;
  paper_size: string;
  color_mode: string;
  copies: number;
  double_sided: boolean;
  stapling: boolean;
  price: number;
  file_path: string;
  customer_name?: string;
};

const statusStyles = {
  pending: {
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: Clock,
  },
  completed: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
  },
  cancelled: {
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: AlertTriangle,
  },
};

const ShopOrdersTab = ({ shopId }: { shopId?: string }) => {
  const { user } = useAuth();
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [confirmingCancelId, setConfirmingCancelId] = useState<string | null>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserShops = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', user.id);
          
        if (error) {
          console.error('Error fetching shops:', error);
          toast.error('Failed to load shops');
          return;
        }
        
        if (data && data.length > 0) {
          setShops(data);
          setSelectedShopId(shopId || data[0].id);
        }
      } catch (error) {
        console.error('Error in fetchUserShops:', error);
      }
    };
    
    fetchUserShops();
  }, [user, shopId]);

  useEffect(() => {
    if (selectedShopId) {
      fetchPrintJobs(selectedShopId);
    }
  }, [selectedShopId, user]);

  const fetchPrintJobs = async (currentShopId: string) => {
    if (!user || !currentShopId) return;

    try {
      setLoading(true);
      
      console.log('Fetching print jobs for shop:', currentShopId);
      
      const { data: jobsData, error: jobsError } = await supabase
        .from('print_jobs')
        .select('*')
        .eq('shop_id', currentShopId)
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        toast.error('Failed to load orders');
        setLoading(false);
        return;
      }

      console.log('Fetched jobs data:', jobsData);

      if (!jobsData || jobsData.length === 0) {
        setPrintJobs([]);
        setLoading(false);
        return;
      }

      const customerIds = [...new Set(jobsData.map(job => job.customer_id))];
      
      const { data: customersData, error: customersError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', customerIds);

      if (customersError) {
        console.error('Error fetching customer profiles:', customersError);
        toast.error('Failed to load customer details');
      }

      const jobsWithCustomerNames = jobsData.map(job => ({
        ...job,
        customer_name: customersData?.find(c => c.id === job.customer_id)?.name || 'Unknown Customer',
      }));

      setPrintJobs(jobsWithCustomerNames);
    } catch (error: any) {
      console.error('Error fetching print jobs:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const markJobAsCompleted = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('print_jobs')
        .update({ status: 'completed' })
        .eq('id', jobId);

      if (error) throw error;

      setPrintJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, status: 'completed' } 
            : job
        )
      );

      toast.success('Order marked as completed');
    } catch (error: any) {
      console.error('Error completing order:', error);
      toast.error(error.message || 'Failed to complete order');
    }
  };

  const cancelOrder = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('print_jobs')
        .update({ status: 'cancelled' })
        .eq('id', jobId);

      if (error) throw error;

      setPrintJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, status: 'cancelled' } 
            : job
        )
      );

      setConfirmingCancelId(null);
      toast.success('Order cancelled successfully');
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error(error.message || 'Failed to cancel order');
    }
  };

  const viewDocument = async (filePath: string) => {
    try {
      setViewingDocument(filePath);
      
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      setDocumentUrl(data.publicUrl);
    } catch (error) {
      console.error('Error getting document URL:', error);
      toast.error('Failed to load the document');
      setViewingDocument(null);
    }
  };

  const filteredJobs = printJobs.filter(job => {
    if (activeTab === 'all') return true;
    return job.status === activeTab;
  });

  if (loading) {
    return (
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Print Orders</CardTitle>
          <CardDescription>
            Manage customer print jobs
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <div className="h-6 w-6 border-2 border-t-primary border-r-transparent border-l-transparent border-b-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        </CardContent>
      </Card>
    );
  }

  if (!selectedShopId && shops.length > 0) {
    return (
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Select Shop</CardTitle>
          <CardDescription>
            Choose a shop to view print orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {shops.map(shop => (
              <Button 
                key={shop.id} 
                variant="outline" 
                className="justify-start h-auto p-4 text-left" 
                onClick={() => setSelectedShopId(shop.id)}
              >
                <div>
                  <h3 className="font-medium">{shop.name}</h3>
                  <p className="text-sm text-muted-foreground">{shop.address}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (shops.length === 0) {
    return (
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>No Shops Found</CardTitle>
          <CardDescription>
            Register a shop to manage print orders
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <div className="p-5 bg-muted rounded-full mb-5">
            <Printer size={48} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground max-w-md mt-2 text-center">
            You don't have any registered shops. Create a shop first to manage print orders.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Print Orders</CardTitle>
          <CardDescription>
            Manage customer print jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shops.length > 1 && (
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Select Shop</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedShopId || ''}
                onChange={(e) => setSelectedShopId(e.target.value)}
              >
                {shops.map(shop => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              <TabsTrigger value="all">All Orders</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredJobs.length === 0 ? (
                <div className="flex flex-col items-center py-8">
                  <div className="p-5 bg-muted rounded-full mb-5">
                    <FileText size={48} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No {activeTab} orders</h3>
                  <p className="text-sm text-muted-foreground max-w-md mt-2 text-center">
                    {activeTab === 'pending' 
                      ? "You don't have any pending print orders."
                      : activeTab === 'completed'
                      ? "You don't have any completed print orders."
                      : activeTab === 'cancelled'
                      ? "You don't have any cancelled print orders."
                      : "You don't have any print orders yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((job) => {
                    const status = job.status as keyof typeof statusStyles;
                    const StatusIcon = statusStyles[status]?.icon || Clock;

                    return (
                      <div 
                        key={job.id}
                        className="p-4 border rounded-lg flex flex-col space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3 items-center">
                            <div className={`p-2 rounded-full ${statusStyles[status]?.bgColor || 'bg-gray-100'}`}>
                              <StatusIcon size={18} className={`${statusStyles[status]?.textColor || 'text-gray-800'}`} />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">Order #{job.id.substring(0, 8)}</h4>
                                <Badge 
                                  variant="outline" 
                                  className={`${statusStyles[status]?.textColor || ''} ${statusStyles[status]?.bgColor || ''}`}
                                >
                                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <DollarSign className="h-4 w-4" />
                              {job.price?.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">
                            <span className="text-muted-foreground">Customer:</span> {job.customer_name}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Paper:</span> {job.paper_size}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Color:</span> {job.color_mode === 'bw' ? 'B&W' : 'Color'}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Copies:</span> {job.copies}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Double-sided:</span> {job.double_sided ? 'Yes' : 'No'}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stapling:</span> {job.stapling ? 'Yes' : 'No'}
                          </div>
                        </div>
                        
                        <div className="pt-2 flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewDocument(job.file_path)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Document
                          </Button>
                          
                          {job.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => markJobAsCompleted(job.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Completed
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setConfirmingCancelId(job.id)}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancel Order
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {documentUrl && (
              <iframe 
                src={documentUrl} 
                className="w-full h-full min-h-[70vh]" 
                title="Document Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmingCancelId} onOpenChange={() => setConfirmingCancelId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this print order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmingCancelId(null)}>
              No, Keep Order
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => confirmingCancelId && cancelOrder(confirmingCancelId)}
            >
              Yes, Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShopOrdersTab;
