import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { CheckCircle2, Ticket, ArrowLeft, AlertTriangle, XCircle, UserCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CheckinPage({ params, searchParams }: { params: Promise<{ hash: string }>, searchParams: Promise<{ eventId?: string }> }) {
  const supabase = await createClient()
  const { hash } = await params
  const { eventId } = await searchParams

  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <div className="p-8 bg-slate-900 border border-rose-500/30 rounded-lg text-center max-w-md shadow-sm">
          <h2 className="text-xl font-bold mb-3 text-rose-400">Unauthorized Access</h2>
          <p className="text-slate-400 mb-6 text-sm">You must be logged in as a Core Team member to access the check-in scanner.</p>
          <Link href="/login" className="inline-flex px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium transition-colors text-sm">Go to Login</Link>
        </div>
      </div>
    )
  }

  const { data: reg, error } = await supabase
    .from('registrations')
    .select(`
      *,
      events ( id, title, date_start, location, slug )
    `)
    .eq('hash_payload', hash)
    .single()

  if (error || !reg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 p-6">
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-lg text-center w-full max-w-md shadow-sm">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
            <XCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Invalid Ticket</h2>
          <p className="text-slate-400 mb-8 text-sm">This QR code does not match any valid registration in the database. It may be forged or from an old event.</p>
          <Link href={eventId ? `/admin/events/${eventId}/scanner` : "/admin"} className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors">
            {eventId ? "← Back to Scanner" : "← Back to Dashboard"}
          </Link>
        </div>
      </div>
    )
  }

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId || '')
  const matchesEvent = eventId 
    ? (isUUID ? reg.event_id === eventId : (reg.events as any)?.slug === eventId)
    : true

  if (eventId && !matchesEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 p-6">
        <div className="p-8 bg-slate-900 border border-amber-500/30 rounded-lg text-center w-full max-w-md shadow-sm">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Wrong Event</h2>
          <p className="text-slate-400 mb-8 text-sm">This ticket is valid, but it is for <strong>{(reg.events as any)?.title}</strong>, not the event you are currently scanning for.</p>
          <Link href={`/admin/events/${eventId}/scanner`} className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors">← Back to Scanner</Link>
        </div>
      </div>
    )
  }

  const isTeam = reg.team_data && reg.team_data.members && reg.team_data.members.length > 0;
  const primaryCheckedIn = reg.checked_in;
  const allMembersCheckedIn = isTeam ? reg.team_data.members.every((m: any) => m.checked_in) : true;
  const completelyCheckedIn = primaryCheckedIn && allMembersCheckedIn;
  const event = reg.events

  async function markPrimaryAsAttended() {
    'use server'
    const sb = await createClient()
    await sb.from('registrations').update({ checked_in: true }).eq('hash_payload', hash)
    revalidatePath(`/admin/checkin/${hash}`)
  }

  async function markMemberAsAttended(memberIndex: number) {
    'use server'
    const sb = await createClient()
    const { data: latestReg } = await sb.from('registrations').select('team_data').eq('hash_payload', hash).single()
    if (!latestReg || !latestReg.team_data || !latestReg.team_data.members) return;
    
    const updatedTeamData = { ...latestReg.team_data }
    if (updatedTeamData.members[memberIndex]) {
      updatedTeamData.members[memberIndex].checked_in = true
    }
    
    await sb.from('registrations').update({ team_data: updatedTeamData }).eq('hash_payload', hash)
    revalidatePath(`/admin/checkin/${hash}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 flex flex-col items-center font-sans">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <Link href={eventId ? `/admin/events/${eventId}/scanner` : "/admin"} className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> {eventId ? "Back to Scanner" : "Workspace Dashboard"}
          </Link>
          <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-semibold text-slate-400 tracking-wider">
            CHECK-IN PORTAL
          </div>
        </div>

        <div className={`w-full p-5 rounded-lg mb-6 flex items-center gap-4 border ${completelyCheckedIn ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-900 border-slate-800'}`}>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${completelyCheckedIn ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-500' : 'bg-blue-900/20 border-blue-500/20 text-blue-500'}`}>
             {completelyCheckedIn ? <CheckCircle2 className="w-6 h-6" /> : <Ticket className="w-6 h-6" />}
          </div>
          <div>
            <h2 className={`text-xl font-bold ${completelyCheckedIn ? 'text-emerald-400' : 'text-slate-100'}`}>
              {completelyCheckedIn ? 'Everyone Checked In!' : isTeam ? 'Valid Team Ticket' : 'Valid Ticket Found'}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {event.title}
            </p>
          </div>
        </div>

        {!isTeam && !primaryCheckedIn && (
          <form action={markPrimaryAsAttended} className="mb-8">
            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 border border-blue-500/50 rounded-lg font-bold text-white transition-colors flex justify-center items-center gap-2">
              <UserCheck className="w-5 h-5" /> Mark as Attended
            </button>
          </form>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5 border-b border-slate-800 pb-3">Primary Registrant Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-10">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</p>
              <p className="text-base font-semibold text-slate-200">{reg.form_data?.fullName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</p>
              <p className="text-base font-semibold text-slate-200">{reg.lead_email}</p>
            </div>
            {reg.form_data?.regNum && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Registration No.</p>
                <p className="text-base font-semibold text-blue-400 font-mono">{reg.form_data.regNum}</p>
              </div>
            )}
            {reg.form_data?.branch && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Branch</p>
                <p className="text-base font-semibold text-slate-200">{reg.form_data.branch}</p>
              </div>
            )}
            {reg.form_data?.specialization && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Specialization</p>
                <p className="text-base font-semibold text-slate-200">{reg.form_data.specialization}</p>
              </div>
            )}
            {reg.form_data?.year && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Year of Study</p>
                <p className="text-base font-semibold text-slate-200">{reg.form_data.year}</p>
              </div>
            )}
          </div>
          {isTeam && (
            <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400">Check-In Status</span>
              {primaryCheckedIn ? (
                <span className="px-3 py-1.5 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 rounded-md text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Checked In
                </span>
              ) : (
                <form action={markPrimaryAsAttended}>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors text-sm">
                    Check In Primary
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {reg.team_data && reg.team_data.members && reg.team_data.members.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5 border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="flex items-center gap-3">
                Team Members ({reg.team_data.members.length})
                {reg.team_data.teamName && <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 text-[10px]">Team: {reg.team_data.teamName}</span>}
              </span>
              {reg.team_data.leadIndex === 0 && <span className="text-blue-400 text-[10px] px-2 py-0.5 border border-blue-500/20 bg-blue-500/10 rounded">Primary is Team Lead</span>}
            </h3>

            <div className="flex flex-col gap-4">
              {reg.team_data.members.map((member: any, index: number) => {
                const memberIndex = index + 1;
                const isLead = reg.team_data.leadIndex === memberIndex;
                
                return (
                  <div key={index} className="bg-slate-950 rounded-md p-5 border border-slate-800 relative">
                    {isLead && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-purple-900/30 text-purple-400 border border-purple-500/20 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded">Team Lead</span>
                      </div>
                    )}
                    <h4 className="text-slate-200 font-semibold mb-3 text-sm">Member {index + 2}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Name</p>
                        <p className="text-xs font-semibold text-slate-300">{member.fullName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</p>
                        <p className="text-xs font-semibold text-slate-300 truncate" title={member.email}>{member.email || 'N/A'}</p>
                      </div>
                      {member.regNum && (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Reg No.</p>
                          <p className="text-xs font-semibold text-blue-400 font-mono">{member.regNum}</p>
                        </div>
                      )}
                      {member.branch && (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Branch</p>
                          <p className="text-xs font-semibold text-slate-300">{member.branch}</p>
                        </div>
                      )}
                      {member.specialization && (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Spec.</p>
                          <p className="text-xs font-semibold text-slate-300">{member.specialization}</p>
                        </div>
                      )}
                      {member.year && (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Year</p>
                          <p className="text-xs font-semibold text-slate-300">{member.year}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">Check-In Status</span>
                      {member.checked_in ? (
                        <span className="px-2.5 py-1 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 rounded text-[11px] font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" /> Checked In
                        </span>
                      ) : (
                        <form action={markMemberAsAttended.bind(null, index)}>
                          <button type="submit" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors text-xs">
                            Check In Member
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
