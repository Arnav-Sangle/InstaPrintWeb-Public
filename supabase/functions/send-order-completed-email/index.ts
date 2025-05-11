import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  orderId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { orderId } = await req.json() as RequestBody;
    
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // Get Postmark token from environment variable
    const POSTMARK_SERVER_TOKEN = Deno.env.get("VITE_POSTMARK_SERVER_TOKEN");
    if (!POSTMARK_SERVER_TOKEN) {
      throw new Error("VITE_POSTMARK_SERVER_TOKEN environment variable is not set");
    }

    // Arnav supa
    const supabaseUrl = Deno.env.get("VITE_SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("VITE_SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the order details along with customer information
    const { data: orderData, error: orderError } = await supabase
      .from("print_jobs")
      .select(`
        *,
        profiles:customer_id(name, email)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !orderData) {
      throw new Error(orderError?.message || "Order not found");
    }

    // Get shop details
    const { data: shopData, error: shopError } = await supabase
      .from("shops")
      .select("name, address")
      .eq("id", orderData.shop_id)
      .single();

    if (shopError || !shopData) {
      throw new Error(shopError?.message || "Shop not found");
    }

    const customerEmail = orderData.profiles?.email;
    const customerName = orderData.profiles?.name || "Customer";
    
    console.log("before genrate mail link")

    if (!customerEmail) {
      throw new Error("Customer email not found");
    }

    // Prepare email content
    const emailHtml = `
      <h1>InstaPrint</h1>
      <h2>Order Completed</h2>
      <p>Dear ${customerName},</p>
      <p><b>Your order is ready for collection!</b></p>
      <p>Please proceed to collect your completed order from the shop.</p>
      <div style="margin: 20px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h3 style="margin-top: 0;">Order Details:</h3>
        <ul style="list-style: none; padding-left: 0;">
          <li>Order ID: ${orderData.id.substring(0, 8)}</li>
          <li>Shop: ${shopData.name}</li>
          <li>Location: ${shopData.address}</li>
          <li>Paper Size: ${orderData.paper_size}</li>
          <li>Pages: ${orderData.page_count}</li>
          <li>Copies: ${orderData.copies}</li>
          <li>Color Mode: ${orderData.color_mode === 'bw' ? 'Black & White' : 'Color'}</li>
          <li>Double-sided: ${orderData.double_sided ? 'Yes' : 'No'}</li>
          <li>Stapling: ${orderData.stapling ? 'Yes' : 'No'}</li>
          <li>Price: Rs. ${orderData.price?.toFixed(2) || '0.00'}</li>
        </ul>
      </div>
      <p>Thank you for using InstaPrint!</p>
    `;

    // Send email using Postmark API
    const response = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": POSTMARK_SERVER_TOKEN
      },
      body: JSON.stringify({
        "From": "siddhanth.wankhade21@pccoepune.org", // Replace with your verified sender email
        "To": customerEmail,
        "Subject": "InstaPrint: Your Order is Ready for Collection",
        "HtmlBody": emailHtml,
        "MessageStream": "outbound"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Postmark API error:", errorData);
      throw new Error("Failed to send email: ${errorData.Message || 'Unknown error'}");
    }

    console.log("Email sent successfully to ${customerEmail} for order ${orderId}");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Order completion email sent",
        recipient: customerEmail 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-order-completed-email function:", error);
    
    return new Response(
      // JSON.stringify({ error: error.message}),
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});