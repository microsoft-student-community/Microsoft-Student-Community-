import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createAuthedClient } from '@/utils/supabase/server'

export async function GET() {
  // Never expose service-role backed debugging routes in production.
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const authed = await createAuthedClient()
  const { data: authData, error: authError } = await authed.auth.getUser()
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await authed
    .from('member_profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  const role = (profile?.role || '').toLowerCase()
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('member_profiles')
    .select('email, role')
    .limit(20)

  return NextResponse.json({ data, error })

  return NextResponse.json({ data, error })
}
