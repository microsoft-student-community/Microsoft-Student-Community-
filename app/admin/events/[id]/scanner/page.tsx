import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import QRScanner from '@/app/admin/QRScanner'

export const dynamic = 'force-dynamic'

export default async function EventScannerPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return notFound()

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, title, date_start, slug')
    .or(`slug.eq.${id}${isUUID ? `,id.eq.${id}` : ''}`)
    .single()

  if (eventError || !event) return notFound()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center pt-16 p-6">
      <div className="max-w-xl w-full">
        <Link href={`/admin/events/${event.slug || id}`} className="text-slate-400 hover:text-slate-100 transition-colors flex items-center gap-2 text-sm font-semibold mb-8">
          <i className="fas fa-arrow-left"></i> Back to Event
        </Link>
        
        <div className="mb-8 text-center bg-slate-900 border border-slate-800 rounded-md p-6">
          <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
            Dedicated Scanner
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">{event.title}</h1>
          <p className="text-slate-400 text-sm">
            <i className="fas fa-calendar-alt mr-2"></i>
            {new Date(event.date_start).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' })}
          </p>
        </div>

        <QRScanner eventId={event.id} />
      </div>
    </div>
  )
}
