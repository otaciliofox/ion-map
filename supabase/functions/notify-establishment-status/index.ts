import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const APP_URL = 'https://otaciliofox.github.io/ion-map'

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: { id: string; name: string; status: string; rejection_reason: string | null; user_id: string }
  old_record: { status: string } | null
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': Bearer , 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'ion-map <onboarding@resend.dev>', to, subject, html }),
  })
  return res.ok
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json()
    const newStatus = payload.record?.status
    const oldStatus = payload.old_record?.status
    if (!newStatus || newStatus === oldStatus) return new Response('no-op', { status: 200 })
    if (newStatus !== 'active' && newStatus !== 'inactive') return new Response('no-op', { status: 200 })

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { data: { user } } = await supabase.auth.admin.getUserById(payload.record.user_id)
    const ownerEmail = user?.email
    const ownerName = (user?.user_metadata?.full_name as string) ?? 'Responsável'
    if (!ownerEmail) return new Response('no email', { status: 200 })

    const estName = payload.record.name
    const dashboardUrl = ${APP_URL}/painel

    let subject: string, html: string
    if (newStatus === 'active') {
      subject = ✅  foi aprovado no ion-map!
      html = <div style=
