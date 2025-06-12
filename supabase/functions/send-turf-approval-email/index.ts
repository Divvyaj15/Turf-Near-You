
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TurfSubmissionRequest {
  turfData: any;
  ownerData: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { turfData, ownerData }: TurfSubmissionRequest = await req.json();
    
    console.log('Sending turf approval email for:', turfData.name);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Turf Submission - Approval Required</h1>
        
        <h2>Turf Details:</h2>
        <ul>
          <li><strong>Name:</strong> ${turfData.name}</li>
          <li><strong>Area:</strong> ${turfData.area}</li>
          <li><strong>Address:</strong> ${turfData.address}</li>
          <li><strong>Sports:</strong> ${turfData.supported_sports?.join(', ') || 'Not specified'}</li>
          <li><strong>Base Price:</strong> ₹${turfData.base_price_per_hour}/hour</li>
          <li><strong>Capacity:</strong> ${turfData.capacity} players</li>
          <li><strong>Surface Type:</strong> ${turfData.surface_type}</li>
          <li><strong>Description:</strong> ${turfData.description}</li>
          <li><strong>Amenities:</strong> ${turfData.amenities?.join(', ') || 'None'}</li>
          <li><strong>Contact Phone:</strong> ${turfData.contact_phone}</li>
          <li><strong>Contact Email:</strong> ${turfData.contact_email}</li>
        </ul>

        <h2>Owner Details:</h2>
        <ul>
          <li><strong>Business Name:</strong> ${ownerData.business_name}</li>
          <li><strong>Owner Name:</strong> ${ownerData.owner_name}</li>
          <li><strong>Business Type:</strong> ${ownerData.business_type}</li>
          <li><strong>Contact Phone:</strong> ${ownerData.contact_phone}</li>
          <li><strong>Contact Email:</strong> ${ownerData.contact_email}</li>
          <li><strong>Address:</strong> ${ownerData.address}</li>
          <li><strong>Years of Operation:</strong> ${ownerData.years_of_operation}</li>
        </ul>

        <div style="margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
          <h3>Actions Required:</h3>
          <p>Please review this turf submission and take appropriate action through the admin panel.</p>
          <p><strong>Turf ID:</strong> ${turfData.id}</p>
          <p><strong>Owner ID:</strong> ${ownerData.id}</p>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          This email was sent automatically from TurfConnect when a new turf was submitted for approval.
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "TurfConnect <onboarding@resend.dev>",
      to: ["divvyavidhyutjain601@gmail.com"],
      subject: `New Turf Submission: ${turfData.name} - Approval Required`,
      html: emailHtml,
    });

    console.log("Turf approval email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending turf approval email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
