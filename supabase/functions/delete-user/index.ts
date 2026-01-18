// Supabase Edge Function: User Account komplett löschen
// Deploy: supabase functions deploy delete-user

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabase Client mit Service Role Key erstellen (hat Admin-Rechte)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Authorization Header prüfen (JWT Token vom eingeloggten User)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // User aus dem JWT Token extrahieren
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Invalid token or user not found')
    }

    console.log(`Deleting user: ${user.id}`)

    // 1. User-bezogene Daten löschen (in der richtigen Reihenfolge wegen Foreign Keys)

    // Achievements löschen
    const { error: achievementsError } = await supabaseAdmin
      .from('user_achievements')
      .delete()
      .eq('user_id', user.id)

    if (achievementsError) {
      console.error('Error deleting achievements:', achievementsError)
    }

    // Lernziel-Fortschritt löschen
    const { error: lernzielError } = await supabaseAdmin
      .from('user_lernziel_fortschritt')
      .delete()
      .eq('user_id', user.id)

    if (lernzielError) {
      console.error('Error deleting lernziel progress:', lernzielError)
    }

    // Aufgaben-Fortschritt löschen
    const { error: aufgabenError } = await supabaseAdmin
      .from('user_aufgaben_fortschritt')
      .delete()
      .eq('user_id', user.id)

    if (aufgabenError) {
      console.error('Error deleting aufgaben progress:', aufgabenError)
    }

    // User-Profil löschen (id = auth.users.id)
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      // Weiter machen, auch wenn Profil nicht existiert
    }

    // 2. Auth-User löschen (aus auth.users)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)
      throw new Error(`Failed to delete auth user: ${deleteError.message}`)
    }

    console.log(`Successfully deleted user: ${user.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User account successfully deleted',
        userId: user.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in delete-user function:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
