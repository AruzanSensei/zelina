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

        // SERVICE_ROLE_KEY hanya ada di sisi server ini
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return new Response('Unauthorized', { status: 401, headers: corsHeaders })
        }

        // Validasi whitelist admin sebelum izinkan akses data
        const { data: adminExists } = await supabase
            .from('allowed_admins')
            .select('email')
            .eq('email', user.email?.toLowerCase() ?? '')
            .single()

        if (!adminExists) {
            return new Response('Forbidden', { status: 403, headers: corsHeaders })
        }

        const method = req.method

        // GET: Ambil data transaksi user dari database
        if (method === 'GET') {
            const { data, error } = await supabase
                .from('bme_user_data')
                .select('settings, history, templates, tabs, updated_at')
                .eq('user_id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') {
                return new Response(
                    JSON.stringify({ error: error.message }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            return new Response(
                JSON.stringify(data || {}),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // POST/PUT: Simpan (upsert) data transaksi user ke database
        if (method === 'POST' || method === 'PUT') {
            const body = await req.json()
            const { settings, history, templates, tabs } = body

            const { error } = await supabase
                .from('bme_user_data')
                .upsert({
                    user_id: user.id,
                    settings,
                    history,
                    templates,
                    tabs,
                    updated_at: new Date().toISOString()
                })

            if (error) {
                return new Response(
                    JSON.stringify({ error: error.message }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            return new Response(
                JSON.stringify({ success: true }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // PATCH: Tambahkan satu item history baru secara atomic (prepend)
        if (method === 'PATCH') {
            const body = await req.json()
            const { new_history_item } = body

            const { error } = await supabase.rpc('prepend_history_item', {
                user_id_param: user.id,
                new_item: new_history_item
            })

            if (error) {
                return new Response(
                    JSON.stringify({ error: error.message }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            return new Response(
                JSON.stringify({ success: true }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
    } catch (err) {
        return new Response(err.message, { status: 500, headers: corsHeaders })
    }
})
