// Supabase Edge Function — delete-account
// Deletes the signed-in customer's login. Their business, reviews, taps and payment
// requests are removed automatically (every table references auth.users with ON DELETE CASCADE).
//
// Deploy with the exact name:  delete-account   (JWT verification ON, the default)
// Secrets: SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided automatically.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    // Identify the caller from THEIR token, never from the request body.
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'Please sign in again.' }, 401)

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) return json({ error: 'Could not delete your account. Please try again.' }, 500)
    return json({ ok: true })
  } catch {
    return json({ error: 'Could not delete your account. Please try again.' }, 500)
  }
})
