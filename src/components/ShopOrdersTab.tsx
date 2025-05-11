import React, { useState, useEffect } from 'react';
import { 
  Calendar, FileText, Clock, Printer, AlertTriangle, CheckCircle, 
  User, X, Eye, LucideIndianRupee, Mail 
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
import { Database } from '@/integrations/supabase/types';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import PrintJobViewer from './PrintJobViewer';
import { PrintSpecs, PaperSize, ColorMode } from './PrintSpecifications';

type DatabasePrintJob = Database['public']['Tables']['print_jobs']['Row'] & {
  page_count?: number;
};

type DatabaseProfile = Database['public']['Tables']['profiles']['Row'];
type DatabaseShop = Database['public']['Tables']['shops']['Row'];

type PrintJobWithProfile = DatabasePrintJob & {
  profiles?: Pick<DatabaseProfile, 'name' | 'email'> | null;
};

type PrintJob = {
  id: string;
  customer_id: string;
  shop_id: string;
  file_path: string;
  status: string;
  created_at: string;
  updated_at: string;
  price: number | null;
  customer_name: string;
  customer_email: string;
  specifications: PrintSpecs;
};

interface User {
  id: string;
  email: string;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface ShopOrdersTabProps {
  shopId?: string;
  onOrderCompleted?: () => void;
}

interface SupabaseError {
  message: string;
  details: string;
  hint: string;
  code: string;
}

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

const ShopOrdersTab: React.FC<ShopOrdersTabProps> = ({ shopId: initialShopId, onOrderCompleted }) => {
  const { user } = useAuth();
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [confirmingCancelId, setConfirmingCancelId] = useState<string | null>(null);
  const [shops, setShops] = useState<DatabaseShop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(initialShopId || null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const handleError = (error: unknown) => {
    console.error('Error:', error);
    if (error instanceof Error) {
      setError(error.message);
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      setError((error as SupabaseError).message);
    } else {
      setError('An unexpected error occurred');
    }
  };

  const fetchUserShops = async (force = false) => {
    if (!user) return;

    const now = Date.now();
    if (!force && now - lastFetchTime < 5000) {
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id);
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setShops(data);
        if (!selectedShopId) {
          setSelectedShopId(initialShopId || data[0].id);
        }
        setError(null);
        setLastFetchTime(now);
      }
    } catch (error: unknown) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchPrintJobs = async (currentShopId: string, force = false) => {
    if (!user || !currentShopId) return;

    const now = Date.now();
    if (!force && now - lastFetchTime < 5000) {
      return;
    }

    try {
      setLoading(true);
      
      const { data: jobsData, error: jobsError } = await supabase
        .from('print_jobs')
        .select(`
          *,
          profiles:customer_id(name, email)
        `)
        .eq('shop_id', currentShopId)
        .order('created_at', { ascending: false });
      
      if (jobsError) {
        throw jobsError;
      }

      if (!jobsData || jobsData.length === 0) {
        setPrintJobs([]);
        setError(null);
        setLastFetchTime(now);
        return;
      }

      const jobsWithCustomerDetails = (jobsData as PrintJobWithProfile[]).map(job => ({
        id: job.id,
        customer_id: job.customer_id,
        shop_id: job.shop_id,
        file_path: job.file_path,
        status: job.status,
        created_at: job.created_at,
        updated_at: job.updated_at,
        price: job.price,
        customer_name: job.profiles?.name || 'Unknown Customer',
        customer_email: job.profiles?.email || 'Unknown Email',
        specifications: {
          paperSize: job.paper_size as PaperSize,
          colorMode: job.color_mode as ColorMode,
          copies: job.copies,
          doubleSided: job.double_sided,
          stapling: job.stapling,
          pageCount: job.page_count ?? 1,
          pricePerPage: null
        }
      }));

      setPrintJobs(jobsWithCustomerDetails);
      setError(null);
      setLastFetchTime(now);
    } catch (error: unknown) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const loadShops = async (force: boolean = false) => {
      if (!mounted) return;
      
      try {
        await fetchUserShops(force);
      } catch (error) {
        console.error('Error in loadShops:', error);
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          retryTimeout = setTimeout(() => loadShops(true), 1000 * retryCount);
        }
      }
    };

    loadShops(true);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mounted) {
        retryCount = 0;
        loadShops(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, initialShopId]);

  useEffect(() => {
    let mounted = true;
    let channel: RealtimeChannel;
    let retryTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const loadJobs = async (force: boolean = false) => {
      if (!mounted || !selectedShopId) return;
      
      try {
        await fetchPrintJobs(selectedShopId, force);
      } catch (error) {
        console.error('Error in loadJobs:', error);
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          retryTimeout = setTimeout(() => loadJobs(true), 1000 * retryCount);
        }
      }
    };

    const setupSubscription = (currentShopId: string) => {
      channel = supabase
        .channel(`shop_orders_${currentShopId}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'print_jobs',
            filter: `shop_id=eq.${currentShopId}`
          }, 
          () => {
            if (mounted) {
              loadJobs(true);
            }
          }
        )
        .subscribe();
    };

    if (selectedShopId) {
      loadJobs(true);
      setupSubscription(selectedShopId);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mounted && selectedShopId) {
        retryCount = 0;
        loadJobs(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedShopId, user]);

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

      if (onOrderCompleted) {
        onOrderCompleted();
      }

      sendOrderCompletedEmail(jobId);

      toast.success('Order marked as completed');
    } catch (error: unknown) {
      console.error('Error completing order:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to complete order');
      } else {
        toast.error('Failed to complete order');
      }
    }
  };

  const sendOrderCompletedEmail = async (orderId: string) => {
    try {
      console.log("inside try mail")
      const { data, error } = await supabase.functions.invoke('send-order-completed-email', {
        body: { orderId }
      });

      if (error) {
        console.error('Error sending order completed email:', error);
        toast.error('Order marked as completed, but failed to send notification email');
      } else {
        console.log('Order completed email sent:', data);
        toast.success('Order completion notification email sent to customer');
      }
    } catch (error) {
      console.error('Error sending order completed email:', error);
      toast.error('Order marked as completed, but failed to send notification email');
    }
  };

  const handleViewDocument = async (job: PrintJob) => {
    try {
      // Get signed URL for the document
      const { data: { signedUrl }, error } = await supabase
        .storage
        .from('documents')
        .createSignedUrl(job.file_path, 3600); // 1 hour expiry

      if (error) {
        throw error;
      }

      setDocumentUrl(signedUrl);
      setViewingDocument(job.id);
    } catch (error) {
      console.error('Error getting document URL:', error);
      toast.error('Failed to load document preview');
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

  if (error) {
    return (
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Print Orders</CardTitle>
          <CardDescription>
            Manage customer print jobs
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <div className="p-5 bg-red-100 rounded-full mb-5">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-500">Error Loading Orders</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-2 text-center">
            {error}. Please try refreshing the page.
          </p>
          <Button 
            className="mt-6" 
            onClick={() => {
              setError(null);
              setLoading(true);
              if (selectedShopId) {
                fetchPrintJobs(selectedShopId).finally(() => setLoading(false));
              }
            }}
          >
            Retry
          </Button>
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
            <TabsList className="mb-2">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
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
                              <LucideIndianRupee className="h-4 w-4" />
                              Rs. {job.price?.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 mt-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">
                              <span className="text-muted-foreground">Customer:</span> {job.customer_name}
                            </p>
                          </div>
                          
                          {job.customer_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm">
                                <span className="text-muted-foreground">Email:</span> {job.customer_email}
                              </p>
                            </div>
                          )}
                        </div>
                      
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Paper:</span> {job.specifications.paperSize}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Color:</span> {job.specifications.colorMode === 'bw' ? 'B&W' : 'Color'}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Copies:</span> {job.specifications.copies}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Double-sided:</span> {job.specifications.doubleSided ? 'Yes' : 'No'}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stapling:</span> {job.specifications.stapling ? 'Yes' : 'No'}
                          </div>
                          {/* <div>
                            <span className="text-muted-foreground">Price:</span> <span className="flex items-center"><LucideIndianRupee size={14} className="mr-0.5" />{job.price?.toFixed(2)}</span>
                          </div> */}
                        </div>
                        
                        <div className="pt-2 flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDocument(job)}
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

      {viewingDocument && documentUrl && (
        <PrintJobViewer
          documentUrl={documentUrl}
          printSpecs={printJobs.find(job => job.id === viewingDocument)?.specifications || {
            paperSize: 'A4' as const,
            colorMode: 'bw' as const,
            copies: 1,
            doubleSided: false,
            stapling: false,
            pageCount: printJobs.find(job => job.id === viewingDocument)?.specifications.pageCount ?? 1,
            pricePerPage: null
          }}
          onClose={() => {
            setViewingDocument(null);
            setDocumentUrl(null);
          }}
          onAccept={async () => {
            if (!viewingDocument) return;
            
            try {
              const { error } = await supabase
                .from('print_jobs')
                .update({ status: 'completed' })
                .eq('id', viewingDocument);
                
              if (error) throw error;
              
              // Send order completed email notification
              await sendOrderCompletedEmail(viewingDocument);
              
              toast.success('Order marked as completed');
              setViewingDocument(null);
              setDocumentUrl(null);
              
              // Refresh orders list
              if (selectedShopId) {
                fetchPrintJobs(selectedShopId, true);
              }
              
              // Notify parent component
              if (onOrderCompleted) {
                onOrderCompleted();
              }
            } catch (error) {
              console.error('Error completing print job:', error);
              toast.error('Failed to complete print job');
            }
          }}
          showActions={true}
        />
      )}
    </>
  );
};

export default ShopOrdersTab;
