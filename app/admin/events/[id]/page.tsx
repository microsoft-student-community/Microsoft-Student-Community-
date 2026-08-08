import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import RegistrationsTable from './RegistrationsTable'
import CSVImportBlock from './CSVImportBlock'

export const dynamic = 'force-dynamic'

export default async function AdminEventViewer({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return notFound()

  const { data: profile } = await supabase
    .from('member_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const userRole = profile?.role

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .or(`slug.eq.${id}${isUUID ? `,id.eq.${id}` : ''}`)
    .single()

  if (eventError || !event) return notFound()

  const { data: registrations } = await supabase
    .from('registrations')
    .select('*')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        <div className="max-w-6xl mx-auto">
          <Link href="/admin" className="text-slate-400 hover:text-slate-100 transition-colors flex items-center gap-2 text-sm font-semibold mb-8">
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </Link>

          <div className="bg-slate-900 border border-slate-800 rounded-md p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 mb-1">{event.title}</h1>
              <p className="text-slate-400 text-sm">
                <i className="fas fa-calendar-alt mr-2 text-blue-400"></i>
                {new Date(event.date_start).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-blue-400">{registrations?.length || 0}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registrations</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6 flex flex-wrap gap-3">
            <Link
              href={`/admin/events/${event.slug || id}/scanner`}
              className="px-5 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white rounded-md font-bold transition-all flex items-center gap-2 text-sm"
            >
              <i className="fas fa-qrcode"></i> Open Live Scanner
            </Link>
            {userRole === 'admin' && (
              <Link
                href={`/admin/events/${event.slug || id}/edit`}
                className="px-5 py-2.5 bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700 rounded-md font-bold transition-all flex items-center gap-2 text-sm"
              >
                <i className="fas fa-edit"></i> Edit Event Details
              </Link>
            )}
          </div>

          <CSVImportBlock eventId={event.id} />

          <RegistrationsTable registrations={registrations || []} eventTitle={event.title} eventId={event.id} />
        </div>
      </main>
    </div>
  )
}
