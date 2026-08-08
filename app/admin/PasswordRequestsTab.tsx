'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { acceptPasswordRequest, rejectPasswordRequest } from './password_actions'

const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try {
      switch (type) {
        case 'light':
          window.navigator.vibrate(10)
          break
        case 'medium':
          window.navigator.vibrate(25)
          break
        case 'heavy':
          window.navigator.vibrate(55)
          break
        case 'success':
          window.navigator.vibrate([15, 30, 15])
          break
        case 'warning':
          window.navigator.vibrate([35, 45, 35])
          break
        case 'error':
          window.navigator.vibrate([80, 45, 80])
          break
      }
    } catch (_) {}
  }
}

export default function PasswordRequestsTab() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    setLoading(true)
    const { data, error } = await supabase
      .from('password_reset_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (data) setRequests(data)
    setLoading(false)
  }

  async function handleAccept(reqId: string, email: string, newPassword: string) {
    triggerHaptic('light')
    setActionLoading(reqId)
    setErrorMsg(null)
    setSuccessMsg(null)

    const res = await acceptPasswordRequest(reqId, email, newPassword)
    if (res.error) {
      triggerHaptic('error')
      setErrorMsg(res.error)
    } else {
      triggerHaptic('success')
      setSuccessMsg(`Password successfully changed for ${email}.`)
      fetchRequests()
    }
    setActionLoading(null)
  }

  async function handleReject(reqId: string, email: string) {
    triggerHaptic('light')
    setActionLoading(reqId)
    setErrorMsg(null)
    setSuccessMsg(null)

    const res = await rejectPasswordRequest(reqId)
    if (res.error) {
      triggerHaptic('error')
      setErrorMsg(res.error)
    } else {
      triggerHaptic('warning')
      setSuccessMsg(`Rejected request for ${email}.`)
      fetchRequests()
    }
    setActionLoading(null)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 pl-2">
        <h2 className="text-4xl font-sans font-black text-black tracking-tight">Security & Access</h2>
        <p className="text-gray-800 font-bold text-base mt-2 font-medium max-w-2xl">Review and authorize password reset requests initiated by Core Members.</p>
      </div>
      
      <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border border-2 md:border-4 border-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pl-2">
          <h3 className="text-xl font-bold text-black flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <i className="fas fa-key text-yellow-400 text-sm"></i>
            </div>
            Pending Reset Requests
          </h3>
          <button 
            onClick={() => { triggerHaptic('light'); fetchRequests(); }} 
            className="px-5 py-2.5 bg-slate-200 hover:bg-[#3c3c3e] rounded-full text-xs font-bold text-black transition-all flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto"
          >
            <i className="fas fa-sync-alt"></i> Refresh Log
          </button>
        </div>

        {errorMsg && (
          <div className="mb-8 p-4 rounded-none text-sm font-semibold border bg-red-500/10 text-red-400 border-red-500/20">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-8 p-4 rounded-none text-sm font-semibold border bg-green-500/10 text-green-400 border-green-500/20">
            {successMsg}
          </div>
        )}

        <div className="bg-slate-950 rounded-md overflow-hidden border border-slate-800">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-none p-6 flex justify-between animate-pulse h-24"></div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-green-500/20">
                <i className="fas fa-check-circle text-2xl text-green-400"></i>
              </div>
              <h3 className="text-lg font-bold text-black mb-2">No pending requests</h3>
              <p className="text-gray-800 font-bold text-sm font-medium">All security verifications are complete.</p>
            </div>
          ) : (
            <div className="p-4 md:p-6 space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="bg-white border border-white/[0.02] rounded-none p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:bg-slate-900 hover:border-white/[0.05] transition-all duration-300">
                  <div>
                    <h3 className="text-base font-bold text-black mb-1.5">{req.email}</h3>
                    <div className="text-xs font-bold text-gray-800 font-bold uppercase tracking-widest flex items-center gap-2">
                      <i className="fas fa-clock text-black"></i> {new Date(req.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 w-full md:w-auto pt-2 md:pt-0">
                    <button 
                      onClick={() => handleAccept(req.id, req.email, req.new_password)}
                      disabled={actionLoading === req.id}
                      className="flex-1 md:flex-none px-5 py-3 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-black rounded-full text-xs font-bold transition-all disabled:opacity-50 active:scale-95"
                    >
                      {actionLoading === req.id ? 'Processing...' : 'Authorize'}
                    </button>
                    <button 
                      onClick={() => handleReject(req.id, req.email)}
                      disabled={actionLoading === req.id}
                      className="flex-1 md:flex-none px-5 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-black rounded-full text-xs font-bold transition-all disabled:opacity-50 active:scale-95"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
