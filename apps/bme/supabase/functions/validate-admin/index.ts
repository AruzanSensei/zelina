import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response('Unauthorized', { status: 401, headers: corsHeaders })
        }

        // Gunakan SERVICE_ROLE_KEY (aman di sisi server, tidak pernah ke browser)
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return new Response('Unauthorized', { status: 401, headers: corsHeaders })
        }

        // Verifikasi email terhadap whitelist di database
        const { data: adminExists, error: dbError } = await supabase
            .from('allowed_admins')
            .select('email')
            .eq('email', user.email?.toLowerCase() ?? '')
            .single()

        if (dbError || !adminExists) {
            return new Response(
                JSON.stringify({ isAdmin: false, error: 'Akses administrator ditolak.' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({ isAdmin: true, user }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (err) {
        return new Response(err.message, { status: 500, headers: corsHeaders })
    }
})
