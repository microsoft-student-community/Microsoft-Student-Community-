'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type EventStat = {
  title: string
  teamsRegistered: number
  individualsRegistered: number
  totalMembers: number
  checkedInMembers: number
  checkinRate: number
}

export default function AnalyticsDashboard() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    totalParticipants: 0,
    checkInRate: 0,
  })
  const [eventStats, setEventStats] = useState<EventStat[]>([])

  useEffect(() => {
    fetchAnalytics()

    const channel = supabase.channel('analytics_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        fetchAnalytics()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchAnalytics() {
    setLoading(true)

    try {
      const [
        { count: usersCount },
        { count: eventsCount },
        { data: regs }
      ] = await Promise.all([
        supabase.from('member_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('registrations').select('created_at, checked_in, form_data, team_data, event_id, events(title)')
      ])

      const totalRegs = regs?.length || 0
      let totalParticipantsCount = 0
      let checkedInCount = 0

      const eventMap: Record<string, EventStat> = {}

      if (regs) {
        regs.forEach(reg => {
          const isTeam = reg.team_data && typeof reg.team_data === 'object' && Array.isArray((reg.team_data as any).members)
          const teamMembers = isTeam ? ((reg.team_data as any).members as any[]) : []
          const attendeeCount = 1 + teamMembers.length

          totalParticipantsCount += attendeeCount
          if (reg.checked_in) {
            checkedInCount += attendeeCount
          }

          const eventTitle = (reg.events as any)?.title || 'Unknown Event'
          if (!eventMap[eventTitle]) {
            eventMap[eventTitle] = {
              title: eventTitle,
              teamsRegistered: 0,
              individualsRegistered: 0,
              totalMembers: 0,
              checkedInMembers: 0,
              checkinRate: 0
            }
          }

          if (isTeam) {
            eventMap[eventTitle].teamsRegistered += 1
          } else {
            eventMap[eventTitle].individualsRegistered += 1
          }

          eventMap[eventTitle].totalMembers += attendeeCount
          if (reg.checked_in) {
            eventMap[eventTitle].checkedInMembers += attendeeCount
          }
        })
      }

      const rate = totalParticipantsCount > 0 ? Math.round((checkedInCount / totalParticipantsCount) * 100) : 0

      setStats({
        totalUsers: usersCount || 0,
        totalEvents: eventsCount || 0,
        totalRegistrations: totalRegs,
        totalParticipants: totalParticipantsCount,
        checkInRate: rate
      })

      const eventStatsArray = Object.values(eventMap).map(stat => ({
        ...stat,
        checkinRate: stat.totalMembers > 0 ? Math.round((stat.checkedInMembers / stat.totalMembers) * 100) : 0
      })).sort((a, b) => b.totalMembers - a.totalMembers)

      setEventStats(eventStatsArray)

    } catch (error) {
      console.error('Failed to parse analytics metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a84ff]"></div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
      <div className="mb-10 pl-2">
        <h2 className="text-4xl font-sans font-black text-black tracking-tight">Platform Analytics</h2>
        <p className="text-gray-800 font-bold text-base mt-2 font-medium max-w-2xl">Real-time statistics, registration timeline, and demographic breakdowns.</p>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="bg-white rounded-[32px] p-6 relative overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border border-2 md:border-4 border-black hover:border-[#0a84ff]/30 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-800 font-bold text-[10px] font-bold uppercase tracking-widest z-10 relative">Total Participants</span>
            <div className="w-10 h-10 rounded-full bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all/10 flex items-center justify-center text-black z-10 relative group-hover:bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all group-hover:text-black transition-all">
              <i className="fas fa-user-friends text-sm"></i>
            </div>
          </div>
          <p className="text-4xl font-sans font-black text-black tracking-tight relative z-10">{stats.totalParticipants}</p>
        </div>

        <div className="bg-white rounded-[32px] p-6 relative overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border border-2 md:border-4 border-black hover:border-pink-500/30 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-800 font-bold text-[10px] font-bold uppercase tracking-widest z-10 relative">Submissions</span>
            <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 z-10 relative group-hover:bg-pink-500 group-hover:text-black transition-all">
              <i className="fas fa-ticket-alt text-sm"></i>
            </div>
          </div>
          <p className="text-4xl font-sans font-black text-black tracking-tight relative z-10">{stats.totalRegistrations}</p>
        </div>
        
        <div className="bg-white rounded-[32px] p-6 relative overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border border-2 md:border-4 border-black hover:border-purple-500/30 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-800 font-bold text-[10px] font-bold uppercase tracking-widest z-10 relative">Events Hosted</span>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 z-10 relative group-hover:bg-purple-500 group-hover:text-black transition-all">
              <i className="fas fa-calendar-alt text-sm"></i>
            </div>
          </div>
          <p className="text-4xl font-sans font-black text-black tracking-tight relative z-10">{stats.totalEvents}</p>
        </div>

        <div className="bg-white rounded-[32px] p-6 relative overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border border-2 md:border-4 border-black hover:border-green-500/30 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-800 font-bold text-[10px] font-bold uppercase tracking-widest z-10 relative">Check-in Rate</span>
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 z-10 relative group-hover:bg-green-500 group-hover:text-black transition-all">
              <i className="fas fa-user-check text-sm"></i>
            </div>
          </div>
          <p className="text-4xl font-sans font-black text-black tracking-tight relative z-10">{stats.checkInRate}%</p>
        </div>

        <div className="bg-white rounded-[32px] p-6 relative overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border border-2 md:border-4 border-black hover:border-yellow-500/30 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-800 font-bold text-[10px] font-bold uppercase tracking-widest z-10 relative">Core Members</span>
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 z-10 relative group-hover:bg-yellow-500 group-hover:text-black transition-all">
              <i className="fas fa-users text-sm"></i>
            </div>
          </div>
          <p className="text-4xl font-sans font-black text-black tracking-tight relative z-10">{stats.totalUsers}</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border border-2 md:border-4 border-black">
        <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-3 pl-2">
          <div className="w-10 h-10 rounded-full bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all/10 flex items-center justify-center">
            <i className="fas fa-list-alt text-black text-sm"></i>
          </div>
          Event Conversion Analytics
        </h3>
        
        <div className="bg-black/40 rounded-3xl overflow-hidden border border-white/[0.02]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                <th className="text-gray-800 font-bold font-bold text-[10px] uppercase tracking-widest px-8 py-5">Event</th>
                <th className="text-gray-800 font-bold font-bold text-[10px] uppercase tracking-widest px-8 py-5 text-center">Individuals</th>
                <th className="text-gray-800 font-bold font-bold text-[10px] uppercase tracking-widest px-8 py-5 text-center">Teams</th>
                <th className="text-gray-800 font-bold font-bold text-[10px] uppercase tracking-widest px-8 py-5 text-center">Total Members</th>
                <th className="text-gray-800 font-bold font-bold text-[10px] uppercase tracking-widest px-8 py-5">Check-in Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {eventStats.map((stat, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6 font-bold text-black group-hover:text-black transition-colors">{stat.title}</td>
                  <td className="px-8 py-6 text-center text-black font-medium">{stat.individualsRegistered}</td>
                  <td className="px-8 py-6 text-center text-black font-medium">{stat.teamsRegistered}</td>
                  <td className="px-8 py-6 text-center text-black font-bold">{stat.totalMembers}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${stat.checkinRate > 50 ? 'bg-green-500' : stat.checkinRate > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                          style={{ width: `${stat.checkinRate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold w-9 text-right text-black">{stat.checkinRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {eventStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-gray-800 font-bold font-medium">No event data available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
