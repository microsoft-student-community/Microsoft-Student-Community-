import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import RegistrationsTable from './RegistrationsTable'
import CSVImportBlock from './CSVImportBlock'

export const dynamic = 'force-dynamic'

export default async function AdminEventViewer({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  // Verify access (handled by proxy.ts but safe to check)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return notFound()

  // Fetch user role
  const { data: profile } = await supabase
    .from('member_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const userRole = profile?.role

  // Fetch Event by slug (or UUID fallback)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .or(`slug.eq.${id}${isUUID ? `,id.eq.${id}` : ''}`)
    .single()

  if (eventError || !event) return notFound()

  // Fetch all registrations using the verified event UUID
  const { data: registrations, error: regsError } = await supabase
    .from('registrations')
    .select('*')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex h-screen bg-[#09090b] text-[#f4f4f5] font-sans overflow-hidden">
      <main className="flex-1 overflow-y-auto p-4 md:p-10 relative">
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-blue-500/15 blur-[100px] z-0 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <Link href="/admin" className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm font-semibold mb-8">
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </Link>

          <div className="bg-[#18181b]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-8 mb-8 shadow-2xl flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
              <p className="text-white/40 text-sm">
                <i className="fas fa-calendar-alt mr-2 text-blue-400"></i> {new Date(event.date_start).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' })}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-blue-400 block">{registrations?.length || 0}</span>
              <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Total Registrations</span>
            </div>
          </div>

          {/* External Registration Importer */}
          {userRole === 'admin' && (
            <CSVImportBlock eventId={event.id} />
          )}

          {/* Main Registrations Table */}
          <RegistrationsTable registrations={registrations || []} eventTitle={event.title} eventId={event.id} />
        </div>
      </main>
    </div>
  )
}
