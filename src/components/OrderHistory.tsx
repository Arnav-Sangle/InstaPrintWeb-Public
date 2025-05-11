import React, { useState, useEffect } from 'react';
import { FileText, Clock, AlertTriangle, CheckCircle, Eye, LucideIndianRupee } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const supaCallTimeout = 0

type PrintJob = {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  shop_id: string;
  paper_size: string;
  color_mode: string;
  copies: number;
  double_sided: boolean;
  stapling: boolean;
  price: number;
  file_path: string;
  shop_name?: string;
};

const statusStyles = {
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

const OrderHistory = () => {
  const { user } = useAuth();
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchPrintJobs = async (force: boolean = false) => {
    if (!user) return;

    // Only fetch if forced or if it's been more than 5 seconds since last fetch
    const now = Date.now();
    if (!force && now - lastFetchTime < 5000) {
      return;
    }

    try {
      setLoading(true);
      setTimeout(async () => {
        const { data: jobsData, error: jobsError } = await supabase
            .from('print_jobs')
            .select('*')
            .eq('customer_id', user.id)
            .in('status', ['completed', 'cancelled'])
            .order('created_at', { ascending: false });

        if (jobsError) {
            console.error('Error fetching jobs:', jobsError);
            setError('Failed to load your orders');
            return;
        }

        const shopIds = [...new Set(jobsData.map(job => job.shop_id))];
        const { data: shopsData, error: shopsError } = await supabase
            .from('shops')
            .select('id, name')
            .in('id', shopIds);

        if (shopsError) {
            console.error('Error fetching shops:', shopsError);
            setError('Failed to load shop details');
            return;
        }

        const jobsWithShopNames = jobsData.map(job => ({
            ...job,
            shop_name: shopsData?.find(s => s.id === job.shop_id)?.name || 'Unknown Shop',
        }));

        setPrintJobs(jobsWithShopNames);
        setError(null);
        setLastFetchTime(now);
      }, supaCallTimeout) 

    } catch (error: any) {
      console.error('Error fetching print jobs:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let channel: any;
    let retryTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const loadJobs = async (force: boolean = false) => {
      if (!mounted) return;
      
      try {
        await fetchPrintJobs(force);

      } catch (error) {
        console.error('Error in loadJobs:', error);
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          retryTimeout = setTimeout(() => loadJobs(true), 1000 * retryCount);
        }
      }
    };

    const setupSubscription = () => {
      if (!user?.id) return;

      channel = supabase
        .channel('public:print_jobs')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'print_jobs',
            filter: `customer_id=eq.${user.id}`
          }, 
          () => {
            if (mounted) {
              loadJobs(true);
            }
          }
        )
        .subscribe();
    };

    // Initial load
    loadJobs(true);
    setupSubscription();

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mounted) {
        retryCount = 0;
        loadJobs(true); // Force refresh when tab becomes visible
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
  }, [user]);

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

  if (loading) {
    return (
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            View your completed and cancelled orders
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <div className="h-6 w-6 border-2 border-t-primary border-r-transparent border-l-transparent border-b-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground">Loading your order history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            View your completed and cancelled orders
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
              fetchPrintJobs().finally(() => setLoading(false));
            }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (printJobs.length === 0) {
    return (
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            View your completed and cancelled orders
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <div className="p-5 bg-muted rounded-full mb-5">
            <FileText size={48} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No order history</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-2 text-center">
            You don't have any completed or cancelled orders yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            View your completed and cancelled orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {printJobs.map((job) => {
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
                        <h4 className="font-medium">{job.shop_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${statusStyles[status]?.textColor || ''} ${statusStyles[status]?.bgColor || ''}`}
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
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
                    <div>
                      <span className="text-muted-foreground">Price:</span> <span className="flex items-center"><LucideIndianRupee size={14} className="mr-0.5" />{job.price?.toFixed(2)}</span>  
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => viewDocument(job.file_path)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Document
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
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
    </>
  );
};

export default OrderHistory; 