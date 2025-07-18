
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalRequest {
  turfId?: string; // Made optional since turf owner might not have turfs yet
  ownerId: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { turfId, ownerId, action, rejectionReason }: ApprovalRequest = await req.json();
    
    console.log(`Processing ${action} for turf:`, turfId);

    if (action === 'approve') {
      // Update turf status to active (only if turfId is provided)
      if (turfId) {
        const { error: turfError } = await supabase
          .from('turfs')
          .update({ status: 'active' })
          .eq('id', turfId);

        if (turfError) {
          throw new Error(`Failed to approve turf: ${turfError.message}`);
        }
      }

      // Update owner verification status to verified
      const { error: ownerError } = await supabase
        .from('turf_owners')
        .update({ verification_status: 'verified' })
        .eq('id', ownerId);

      if (ownerError) {
        throw new Error(`Failed to verify owner: ${ownerError.message}`);
      }

      console.log('Turf and owner approved successfully');
    } else if (action === 'reject') {
      // Update turf status to rejected (only if turfId is provided)
      if (turfId) {
        const { error: turfError } = await supabase
          .from('turfs')
          .update({ status: 'rejected' })
          .eq('id', turfId);

        if (turfError) {
          throw new Error(`Failed to reject turf: ${turfError.message}`);
        }
      }

      // Update owner verification status to rejected
      const { error: ownerError } = await supabase
        .from('turf_owners')
        .update({ 
          verification_status: 'rejected',
          rejection_reason: rejectionReason 
        })
        .eq('id', ownerId);

      if (ownerError) {
        throw new Error(`Failed to reject owner: ${ownerError.message}`);
      }

      console.log('Turf and owner rejected successfully');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error processing approval:", error);
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
