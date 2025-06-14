
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

    // Create verification links (you can customize these URLs)
    const adminPanelUrl = `https://your-admin-panel.com/turfs/${turfData.id}`;
    const approveUrl = `https://your-admin-panel.com/approve-turf/${turfData.id}`;
    const rejectUrl = `https://your-admin-panel.com/reject-turf/${turfData.id}`;

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🏟️ New Turf Registration</h1>
          <p style="color: #e8f4f8; margin: 10px 0 0 0; font-size: 16px;">Business Verification Required</p>
        </div>
        
        <div style="padding: 30px; background-color: white;">
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #856404; margin: 0 0 10px 0; display: flex; align-items: center;">
              ⚠️ Action Required: Business Verification
            </h3>
            <p style="color: #856404; margin: 0; font-size: 14px;">
              A new turf has been submitted and requires your verification before going live on the platform.
            </p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
            <!-- Turf Details -->
            <div>
              <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 20px;">
                🏟️ Turf Information
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Name:</td><td style="padding: 8px 0; color: #2c3e50;">${turfData.name}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Area:</td><td style="padding: 8px 0; color: #2c3e50;">${turfData.area}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Address:</td><td style="padding: 8px 0; color: #2c3e50;">${turfData.address}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Surface:</td><td style="padding: 8px 0; color: #2c3e50;">${turfData.surface_type}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Capacity:</td><td style="padding: 8px 0; color: #2c3e50;">${turfData.capacity} players</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Base Price:</td><td style="padding: 8px 0; color: #27ae60; font-weight: bold;">₹${turfData.base_price_per_hour}/hour</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Sports:</td><td style="padding: 8px 0; color: #2c3e50;">${turfData.supported_sports?.join(', ') || 'Not specified'}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Contact:</td><td style="padding: 8px 0; color: #2c3e50;">${turfData.contact_phone}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Email:</td><td style="padding: 8px 0; color: #2c3e50;">${turfData.contact_email}</td></tr>
              </table>
            </div>

            <!-- Owner Details -->
            <div>
              <h2 style="color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px; margin-bottom: 20px;">
                👨‍💼 Business Owner
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Business Name:</td><td style="padding: 8px 0; color: #2c3e50;">${ownerData.business_name}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Owner Name:</td><td style="padding: 8px 0; color: #2c3e50;">${ownerData.owner_name}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Business Type:</td><td style="padding: 8px 0; color: #2c3e50;">${ownerData.business_type}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Phone:</td><td style="padding: 8px 0; color: #2c3e50;">${ownerData.contact_phone}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Email:</td><td style="padding: 8px 0; color: #2c3e50;">${ownerData.contact_email}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Address:</td><td style="padding: 8px 0; color: #2c3e50;">${ownerData.address}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #34495e;">Experience:</td><td style="padding: 8px 0; color: #2c3e50;">${ownerData.years_of_operation} years</td></tr>
              </table>
            </div>
          </div>

          ${turfData.description ? `
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #495057; margin: 0 0 10px 0;">📝 Description</h3>
            <p style="color: #6c757d; margin: 0; line-height: 1.6;">${turfData.description}</p>
          </div>
          ` : ''}

          ${turfData.amenities && turfData.amenities.length > 0 ? `
          <div style="background-color: #e8f5e8; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #155724; margin: 0 0 15px 0;">🏢 Amenities Available</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${turfData.amenities.map((amenity: string) => `
                <span style="background-color: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                  ${amenity}
                </span>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- Pricing Information -->
          <div style="background-color: #fff3cd; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #856404; margin: 0 0 15px 0;">💰 Pricing Details</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              <div>
                <strong style="color: #856404;">Peak Hours:</strong><br>
                <span style="color: #6c757d;">${turfData.peak_hours_start} - ${turfData.peak_hours_end}</span>
              </div>
              <div>
                <strong style="color: #856404;">Peak Premium:</strong><br>
                <span style="color: #6c757d;">${turfData.peak_hours_premium_percentage}%</span>
              </div>
              <div>
                <strong style="color: #856404;">Weekend Premium:</strong><br>
                <span style="color: #6c757d;">${turfData.weekend_premium_percentage}%</span>
              </div>
              <div>
                <strong style="color: #856404;">Base Rate:</strong><br>
                <span style="color: #28a745; font-weight: bold;">₹${turfData.base_price_per_hour}/hour</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; text-align: center;">
            <h3 style="color: #495057; margin: 0 0 20px 0;">🔍 Business Verification Actions</h3>
            <p style="color: #6c757d; margin: 0 0 25px 0; font-size: 14px;">
              Please verify the business details and documentation before approving this turf for the platform.
            </p>
            
            <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
              <a href="${approveUrl}" style="background-color: #28a745; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                ✅ Approve Turf
              </a>
              <a href="${adminPanelUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                👀 View Details
              </a>
              <a href="${rejectUrl}" style="background-color: #dc3545; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                ❌ Reject Turf
              </a>
            </div>
          </div>

          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin-top: 30px;">
            <h4 style="color: #0c5460; margin: 0 0 10px 0;">📊 Quick Stats</h4>
            <div style="color: #0c5460; font-size: 14px;">
              <strong>Turf ID:</strong> ${turfData.id}<br>
              <strong>Owner ID:</strong> ${ownerData.id}<br>
              <strong>Submission Date:</strong> ${new Date().toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        <div style="background-color: #6c757d; padding: 20px; text-align: center;">
          <p style="color: #f8f9fa; margin: 0; font-size: 12px;">
            This email was sent automatically from TurfConnect when a new turf was submitted for approval.<br>
            Please verify all business details and documentation before making a decision.
          </p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "TurfConnect <onboarding@resend.dev>",
      to: ["divvyavidhyutjain601@gmail.com"],
      subject: `🏟️ New Turf Registration: ${turfData.name} - Business Verification Required`,
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
