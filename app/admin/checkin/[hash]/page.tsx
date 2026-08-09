import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CheckinPage({ params, searchParams }: { params: Promise<{ hash: string }>, searchParams: Promise<{ eventId?: string }> }) {
  const supabase = await createClient()
  const { hash } = await params
  const { eventId } = await searchParams

  // Verify Admin / Core Team status is handled by proxy.ts, but let's be safe
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white">
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
          <p className="text-white/60 mb-6">You must be logged in as a Core Team member to access the check-in scanner.</p>
          <Link href="/login" className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold transition-colors">Go to Login</Link>
        </div>
      </div>
    )
  }

  // Fetch the registration (including events slug)
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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white p-6">
        <div className="p-8 bg-[#18181b] border border-white/10 rounded-2xl text-center w-full max-w-md shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <i className="fas fa-times-circle text-3xl text-red-500"></i>
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Invalid Ticket</h2>
          <p className="text-white/60 text-sm mb-6">This QR code or hash payload does not exist in our registration records.</p>
          <Link href="/admin" className="inline-block px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all text-sm">Return to Admin</Link>
        </div>
      </div>
    )
  }

  const isTeam = reg.team_data && reg.team_data.members && reg.team_data.members.length > 0

  async function handleCheckinAction(formData: FormData) {
    'use server'
    const targetSupabase = await createClient()
    const targetType = formData.get('type') as string
    const memberIndex = formData.get('memberIndex') ? parseInt(formData.get('memberIndex') as string) : null

    // Create Admin Supabase Client for bypassing RLS
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (targetType === 'PRIMARY') {
      await supabaseAdmin.from('registrations').update({ checked_in: true }).eq('id', reg.id)
    } else if (targetType === 'MEMBER' && memberIndex !== null) {
      const updatedMembers = [...reg.team_data.members]
      if (updatedMembers[memberIndex]) {
        updatedMembers[memberIndex].checked_in = true
        const updatedTeamData = { ...reg.team_data, members: updatedMembers }
        await supabaseAdmin.from('registrations').update({ team_data: updatedTeamData }).eq('id', reg.id)
      }
    }

    const eventSlug = reg.events?.slug || reg.event_id
    revalidatePath(`/admin/checkin/${hash}`)
    revalidatePath(`/admin/events/${eventSlug}`)
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans">
      {/* Ambient Lights */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg bg-[#18181b]/60 backdrop-blur-xl border border-white/10 rounded-[28px] overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header Bar */}
        <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Gate Check-in Desk</span>
            <h1 className="text-lg font-bold text-white leading-none">{reg.events?.title || 'MSC Event'}</h1>
          </div>
          <Link href={eventId ? `/admin/events/${reg.events?.slug || reg.event_id}` : '/admin'} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all text-xs">
            <i className="fas fa-times"></i>
          </Link>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Status Indicator Banner */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
            (isTeam ? (reg.checked_in && reg.team_data.members.every((m: any) => m.checked_in)) : reg.checked_in)
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
          }`}>
            <i className={`fas ${(isTeam ? (reg.checked_in && reg.team_data.members.every((m: any) => m.checked_in)) : reg.checked_in) ? 'fa-check-double text-lg' : 'fa-ticket-alt'}`}></i>
            <div className="text-xs font-bold uppercase tracking-wider">
              {(isTeam ? (reg.checked_in && reg.team_data.members.every((m: any) => m.checked_in)) : reg.checked_in) 
                ? 'All Attendees Checked In' 
                : isTeam ? 'Team Ticket (Check-in Required)' : 'Ticket Verified'}
            </div>
          </div>

          {/* Primary Registrant Card */}
          <div className="bg-black/20 rounded-2xl p-5 border border-white/5 relative overflow-hidden">
            {isTeam && reg.team_data.leadIndex === 0 && (
              <span className="absolute top-4 right-4 text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Team Lead
              </span>
            )}
            
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block mb-3">Primary Registrant</span>
            
            <div className="space-y-3 mb-5">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-white/30 block mb-0.5">Full Name</span>
                <span className="text-base font-bold text-white block">{reg.form_data?.fullName || 'N/A'}</span>
              </div>
              
              <div>
                <span className="text-[9px] uppercase tracking-wider text-white/30 block mb-0.5">Email Address</span>
                <span className="text-xs font-bold text-white/80 font-mono block truncate">{reg.lead_email}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                {reg.form_data?.regNum && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-white/30 block mb-0.5">Roll No.</span>
                    <span className="text-xs font-bold text-blue-400 font-mono">{reg.form_data.regNum}</span>
                  </div>
                )}
                {reg.form_data?.branch && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-white/30 block mb-0.5">Branch</span>
                    <span className="text-xs font-bold text-white/80">{reg.form_data.branch}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-white/40 uppercase">Status</span>
              {reg.checked_in ? (
                <span className="px-3.5 py-1.5 bg-green-500/10 border border-green-500/30 text-green-500 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <i className="fas fa-check-circle"></i> Checked In
                </span>
              ) : (
                <form action={handleCheckinAction}>
                  <input type="hidden" name="type" value="PRIMARY" />
                  <button type="submit" className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer">
                    Check In Primary
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Team Roster Members */}
          {isTeam && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1 text-white/40">
                <i className="fas fa-users text-xs"></i>
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Team Members ({reg.team_data.members.length})
                </span>
              </div>

              <div className="space-y-3">
                {reg.team_data.members.map((member: any, index: number) => {
                  const isLead = reg.team_data.leadIndex === (index + 1)
                  return (
                    <div key={index} className="bg-black/20 rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{member.fullName || 'N/A'}</span>
                          {isLead && (
                            <span className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold uppercase tracking-wider px-2 py-0.2 rounded-full">Lead</span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/50 flex items-center gap-2 font-mono">
                          <span>{member.regNum || member.email}</span>
                          {member.branch && <span>• {member.branch}</span>}
                        </div>
                      </div>

                      <div>
                        {member.checked_in ? (
                          <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg text-[10px] font-bold flex items-center gap-1">
                            <i className="fas fa-check-circle"></i> Done
                          </span>
                        ) : (
                          <form action={handleCheckinAction}>
                            <input type="hidden" name="type" value="MEMBER" />
                            <input type="hidden" name="memberIndex" value={index} />
                            <button type="submit" className="px-4 py-1.5 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/30 rounded-xl text-[10px] font-bold transition-all cursor-pointer">
                              Check In
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

        {/* Footer Action */}
        <div className="p-6 bg-black/20 border-t border-white/5 flex justify-end">
          <Link href={eventId ? `/admin/events/${reg.events?.slug || reg.event_id}` : '/admin'} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white text-center transition-all">
            Return to Dashboard
          </Link>
        </div>

      </div>
    </div>
  )
}
