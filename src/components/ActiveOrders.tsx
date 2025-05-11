
import React, { useState, useEffect } from 'react';
import { CalendarDays, FileText, Clock, Printer, AlertTriangle, CheckCircle, Eye, LucideIndianRupee } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

const ActiveOrders = () => {
  const { user } = useAuth();
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  const fetchPrintJobs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: jobsData, error: jobsError } = await supabase
        .from('print_jobs')
        .select('*')
        .eq('customer_id', user.id)
        .not('status', 'eq', 'cancelled')
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        toast.error('Failed to load your orders. Please refresh the page.');
        setLoading(false);
        return;
      }

      const shopIds = [...new Set(jobsData.map(job => job.shop_id))];
      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('id, name')
        .in('id', shopIds);

      if (shopsError) {
        console.error('Error fetching shops:', shopsError);
        toast.error('Failed to load shop details. Please refresh the page.');
        setLoading(false);
        return;
      }

      const jobsWithShopNames = jobsData.map(job => ({
        ...job,
        shop_name: shopsData?.find(s => s.id === job.shop_id)?.name || 'Unknown Shop',
      }));

      setPrintJobs(jobsWithShopNames);
    } catch (error: any) {
      console.error('Error fetching print jobs:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadJobs = async () => {
      await fetchPrintJobs();
    };

    loadJobs();

    const channel = supabase
      .channel('public:print_jobs')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'print_jobs',
          filter: `customer_id=eq.${user?.id}`
        }, 
        () => {
          fetchPrintJobs();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const cancelOrder = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('print_jobs')
        .update({ status: 'cancelled' })
        .eq('id', jobId)
        .eq('customer_id', user?.id);

      if (error) throw error;

      // After cancellation, remove it from the displayed list
      setPrintJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));

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

  if (loading) {
    return (
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>My Active Orders</CardTitle>
          <CardDescription>
            Track and manage your current print jobs
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <div className="h-6 w-6 border-2 border-t-primary border-r-transparent border-l-transparent border-b-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground">Loading your orders...</p>
        </CardContent>
      </Card>
    );
  }

  if (printJobs.length === 0) {
    return (
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
          <Button className="mt-6" asChild>
            <Link to="/print-order">New Print Job</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>My Active Orders</CardTitle>
          <CardDescription>
            Track and manage your current print jobs
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
                  
                  <div className="pt-2 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => viewDocument(job.file_path)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Document
                    </Button>
                    
                    {job.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => cancelOrder(job.id)}
                      >
                        Cancel Order
                      </Button>
                    )}
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

export default ActiveOrders;
