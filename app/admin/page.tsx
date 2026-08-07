'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { UserCog, Key, Calendar, Users, PieChart, Settings, ShieldCheck, LogOut, UserPlus, Trash2, CalendarPlus, ListTodo, IndianRupee, Gift, CreditCard, Clock, MapPin, ExternalLink, Edit2, UserPen, X, AlertTriangle, Menu, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import SidebarLayout from '../../components/admin/SidebarLayout'
import EventsManagement from '../../components/admin/EventsManagement'
import NavMenu from '../../components/ui/menu-hover-effects'

const AnalyticsDashboard = dynamic(() => import('./AnalyticsDashboard'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-8">
      <div className="h-10 bg-slate-200 rounded-none w-1/4 mb-4"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-black rounded-none p-5 h-28"></div>
        ))}
      </div>
      <div className="bg-white border border-black rounded-none h-80"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-black rounded-none h-80"></div>
        <div className="bg-white border border-black rounded-none h-80"></div>
      </div>
    </div>
  )
})

import SettingsTab from './SettingsTab'
import PasswordRequestsTab from './PasswordRequestsTab'

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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'events' | 'team' | 'analytics' | 'settings' | 'password_reqs'>('events')
  const supabase = createClient()

  const [userRole, setUserRole] = useState<'admin' | 'core_member' | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [team, setTeam] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingTeam, setLoadingTeam] = useState(true)
  const [editingTeamMember, setEditingTeamMember] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [allowTeamsToggle, setAllowTeamsToggle] = useState(false)
  const [eventPricingType, setEventPricingType] = useState<'free' | 'paid'>('free')
  const [chargeType, setChargeType] = useState<'per_person' | 'per_team'>('per_person')
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  
  const [statusMsg, setStatusMsg] = useState<{ id: string, msg: string, type: 'error' | 'success' | 'info' } | null>(null)

  // Custom Modal States
  const [resettingUser, setResettingUser] = useState<{ id: string, email: string } | null>(null)
  const [newPasswordValue, setNewPasswordValue] = useState('')
  const [resetModalError, setResetModalError] = useState<string | null>(null)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [deletingUser, setDeletingUser] = useState<{ id: string, email: string } | null>(null)

  useEffect(() => {
    checkUserRole()
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'events') fetchEvents()
    if (activeTab === 'team') fetchTeam()
  }, [activeTab])

  async function checkUserRole() {

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase.from('member_profiles').select('role').eq('id', session.user.id).single()
    if (data) setUserRole(data.role)
  }

  function showStatus(id: string, msg: string, type: 'error' | 'success' | 'info') {
    setStatusMsg({ id, msg, type })
    setTimeout(() => setStatusMsg(null), 4000)
  }

  async function compressAndConvertImage(file: File, maxW = 900, maxH = 900, quality = 0.72): Promise<File> {
    if (typeof window === 'undefined' || !window.FileReader) return file
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxW) {
              height = Math.round((height * maxW) / width)
              width = maxW
            }
          } else {
            if (height > maxH) {
              width = Math.round((width * maxH) / height)
              height = maxH
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(file)
            return
          }

          ctx.drawImage(img, 0, 0, width, height)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                  type: 'image/webp',
                  lastModified: Date.now()
                })
                resolve(compressedFile)
              } else {
                resolve(file)
              }
            },
            'image/webp',
            quality
          )
        }
        img.onerror = () => resolve(file)
      }
      reader.onerror = () => resolve(file)
    })
  }

  async function uploadImage(file: File, pathPrefix: string) {
    const compressed = await compressAndConvertImage(file)
    const fileName = `${pathPrefix}-${Math.random().toString(36).substring(2)}-${Date.now()}.webp`
    
    const { data, error } = await supabase.storage.from('images').upload(fileName, compressed)
    if (error) throw error
    
    const { data: publicData } = supabase.storage.from('images').getPublicUrl(fileName)
    return publicData.publicUrl
  }

  async function fetchUsers() {
    setLoadingUsers(true)
    const { data, error } = await supabase.from('member_profiles').select('*').order('created_at', { ascending: false })
    if (!error && data) setUsers(data)
    setLoadingUsers(false)
  }

  async function updateUserRole(userId: string, newRole: string) {
    showStatus(`user_${userId}`, 'Updating...', 'info')
    const { error } = await supabase.rpc('set_user_roles', { target_user_id: userId, new_role: newRole })
    if (error) showStatus(`user_${userId}`, `Failed: ${error.message}`, 'error')
    else {
      showStatus(`user_${userId}`, 'Updated!', 'success')
    }
  }

  const openPasswordResetModal = (userId: string, email: string) => {
    setResettingUser({ id: userId, email })
    setNewPasswordValue('')
    setResetModalError(null)
  }

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resettingUser) return
    if (newPasswordValue.length < 6) {
      setResetModalError('Password must be at least 6 characters.')
      triggerHaptic('error')
      return
    }

    setIsResettingPassword(true)
    setResetModalError(null)
    
    showStatus(`user_${resettingUser.id}`, 'Updating password...', 'info')
    const { data: { session } } = await supabase.auth.getSession()
    let err = null
    
    if (session?.user.id === resettingUser.id) {
      const { error } = await supabase.auth.updateUser({ password: newPasswordValue })
      err = error
    } else {
      const { error } = await supabase.rpc('admin_change_password', { target_user_id: resettingUser.id, new_password: newPasswordValue })
      err = error
    }

    setIsResettingPassword(false)

    if (err) {
      setResetModalError(err.message)
      showStatus(`user_${resettingUser.id}`, `Failed: ${err.message}`, 'error')
      triggerHaptic('error')
    } else {
      showStatus(`user_${resettingUser.id}`, 'Password Updated!', 'success')
      setResettingUser(null)
      triggerHaptic('success')
    }
  }

  const openDeleteUserModal = (userId: string, email: string) => {
    setDeletingUser({ id: userId, email })
  }

  const confirmDeleteUser = async () => {
    if (!deletingUser) return
    const userId = deletingUser.id
    const email = deletingUser.email

    setDeletingUser(null)
    showStatus(`user_${userId}`, 'Deleting...', 'info')
    
    const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId })
    
    if (error) {
      showStatus(`user_${userId}`, `Failed: ${error.message}`, 'error')
      triggerHaptic('error')
    } else {
      showStatus(`user_${userId}`, 'User Deleted', 'success')
      fetchUsers()
      triggerHaptic('success')
    }
  }

  async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    showStatus('create_user', 'Creating account...', 'info')

    const tempClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data, error } = await tempClient.auth.signUp({ email, password })

    if (error) {
      showStatus('create_user', `Failed: ${error.message}`, 'error')
      return
    }

    if (!data.user) {
      showStatus('create_user', 'Failed: Unknown error, no user returned.', 'error')
      return
    }

    if (data.user.identities && data.user.identities.length === 0) {
      showStatus('create_user', 'Failed: This email already exists!', 'error')
      return
    }

    if (role !== 'user') {
      const { error: elevateError } = await supabase.rpc('set_user_roles', { target_user_id: data.user.id, new_role: role })
      if (elevateError) {
        showStatus('create_user', `Created, but elevation failed: ${elevateError.message}`, 'error')
        fetchUsers()
        return
      }
    }

    showStatus('create_user', 'Account Created Successfully!', 'success')
    ;(e.target as HTMLFormElement).reset()
    fetchUsers()
  }

  async function fetchEvents() {
    setLoadingEvents(true)
    const { data, error } = await supabase.from('events').select('*').order('date_start', { ascending: false })
    if (!error && data) setEvents(data)
    setLoadingEvents(false)
  }

  async function handleCreateEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsCreatingEvent(true)
    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const dateStartRaw = formData.get('date_start') as string
    const date_start = dateStartRaw ? new Date(dateStartRaw).toISOString() : new Date().toISOString()
    const status = formData.get('status') as string
    const type = formData.get('type') as string
    const imageFile = formData.get('image') as File
    const certificateHtml = formData.get('certificate_html') as string
    
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    const randomSuffix = Math.random().toString(36).substring(2, 6)
    const slug = `${baseSlug}-${randomSuffix}`


    const agendaJson = formData.get('agenda_json') as string
    const speakersJson = formData.get('speakers_json') as string
    
    let agenda = []
    let speakers = []
    try { if (agendaJson) agenda = JSON.parse(agendaJson) } catch (e) {}
    try { if (speakersJson) speakers = JSON.parse(speakersJson) } catch (e) {}

    const form_requirements: Record<string, any> = {

      req_reg_num: formData.get('req_reg_num') === 'on',
      req_branch: formData.get('req_branch') === 'on',
      req_spec: formData.get('req_spec') === 'on',
      allow_teams: formData.get('allow_teams') === 'on',
      allow_external_students: formData.get('allow_external_students') === 'on',
      min_team_size: formData.get('allow_teams') === 'on' ? parseInt(formData.get('min_team_size') as string) || 2 : 1,
      max_team_size: formData.get('allow_teams') === 'on' ? parseInt(formData.get('max_team_size') as string) || 1 : 1,
      provide_certificates: formData.get('provide_certificates') === 'on',
      certificate_html: certificateHtml || null,
      event_pricing: eventPricingType,
      charge_type: eventPricingType === 'paid' ? chargeType : null,
      registration_fee: eventPricingType === 'paid' ? parseInt(formData.get('registration_fee') as string) || 0 : 0,
      agenda,
      speakers,

    }

    showStatus('create_event', 'Uploading and saving...', 'info')
    
    let image_url = ''
    if (imageFile && imageFile.size > 0) {
      try {
        image_url = await uploadImage(imageFile, 'event')
      } catch (err: any) {
        showStatus('create_event', `Poster Upload Failed: ${err.message}`, 'error')
        setIsCreatingEvent(false)
        return
      }
    }

    const maxCapStr = formData.get('max_capacity') as string
    const max_capacity = maxCapStr ? parseInt(maxCapStr) : null

    const { error } = await supabase.from('events').insert([{ 
      title, slug, date_start, status, type, location: formData.get('location'), description: formData.get('description'), image_url, registration_open: formData.get('registration_open') === 'on', form_requirements, certificate_html: certificateHtml, max_capacity 
    }])
    
    if (error) {
      showStatus('create_event', `Failed: ${error.message}`, 'error')
    } else {
      showStatus('create_event', 'Event Created Successfully!', 'success')
      ;(e.target as HTMLFormElement).reset()
      fetchEvents()
    }
    setIsCreatingEvent(false)
  }

  async function deleteEvent(id: string, title: string) {
    if (confirm("Are you sure you want to delete this event?")) {
      const { data: evt } = await supabase.from('events').select('image_url').eq('id', id).single()
      if (evt?.image_url) {
        try {
          const url = evt.image_url
          if (url.includes('/storage/v1/object/public/images/')) {
            const path = url.split('/storage/v1/object/public/images/')[1]
            await supabase.storage.from('images').remove([path])
          }
        } catch (err) {
          console.error('Failed to remove event poster from storage:', err)
        }
      }
      await supabase.from('events').delete().eq('id', id)
      fetchEvents()
    }
  }

  async function toggleRegistration(id: string, currentState: boolean) {
    showStatus(`event_${id}`, 'Toggling...', 'info')
    const { error } = await supabase.from('events').update({ registration_open: !currentState }).eq('id', id)
    if (error) {
      showStatus(`event_${id}`, `Failed: ${error.message}`, 'error')
    } else {
      fetchEvents()
    }
  }

  async function toggleEventStatus(id: string, currentStatus: string) {
    showStatus(`event_${id}`, 'Updating status...', 'info')
    const newStatus = currentStatus === 'completed' ? 'upcoming' : 'completed'
    const { error } = await supabase.from('events').update({ status: newStatus }).eq('id', id)
    if (error) {
      showStatus(`event_${id}`, `Failed: ${error.message}`, 'error')
    } else {
      fetchEvents()
    }
  }

  async function fetchTeam() {
    setLoadingTeam(true)
    const { data, error } = await supabase.from('team_members').select('*').order('created_at', { ascending: true })
    if (!error && data) setTeam(data)
    setLoadingTeam(false)
  }

  async function handleCreateTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsCreatingTeam(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const linkedin_url = formData.get('linkedin_url') as string
    const github_url = formData.get('github_url') as string
    const twitter_url = formData.get('twitter_url') as string
    const instagram_url = formData.get('instagram_url') as string
    const email = formData.get('email') as string
    const portfolio_url = formData.get('portfolio_url') as string
    const imageFile = formData.get('image') as File

    showStatus('create_team', 'Uploading and saving...', 'info')
    
    let image_url = ''
    if (imageFile && imageFile.size > 0) {
      try {
        image_url = await uploadImage(imageFile, 'team')
      } catch (err: any) {
        showStatus('create_team', `Upload Failed: ${err.message}`, 'error')
        setIsCreatingTeam(false)
        return
      }
    }

    const payload = { name, role, linkedin_url, github_url, twitter_url, instagram_url, email, portfolio_url, image_url, category: 'team' }

    const { error } = await supabase.from('team_members').insert([payload])
    if (error) {
      showStatus('create_team', `Failed: ${error.message}`, 'error')
    } else {
      showStatus('create_team', 'Team Member Created Successfully!', 'success')
      ;(e.target as HTMLFormElement).reset()
      fetchTeam()
    }
    setIsCreatingTeam(false)
  }

  async function handleUpdateTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingTeamMember) return

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const linkedin_url = formData.get('linkedin_url') as string
    const github_url = formData.get('github_url') as string
    const twitter_url = formData.get('twitter_url') as string
    const instagram_url = formData.get('instagram_url') as string
    const email = formData.get('email') as string
    const portfolio_url = formData.get('portfolio_url') as string
    const imageFile = formData.get('image') as File

    showStatus('update_team', 'Uploading and updating...', 'info')
    
    let image_url = editingTeamMember.image_url || ''
    if (imageFile && imageFile.size > 0) {
      try {
        image_url = await uploadImage(imageFile, 'team')
      } catch (err: any) {
        showStatus('update_team', `Upload Failed: ${err.message}`, 'error')
        return
      }
    }

    const payload = { name, role, linkedin_url, github_url, twitter_url, instagram_url, email, portfolio_url, image_url, category: 'team' }

    const { error } = await supabase.from('team_members').update(payload).eq('id', editingTeamMember.id)
    if (error) {
      showStatus('update_team', `Failed: ${error.message}`, 'error')
    } else {
      showStatus('update_team', 'Team Member Updated Successfully!', 'success')
      setEditingTeamMember(null)
      fetchTeam()
    }
  }

  async function deleteTeam(id: string) {
    if (confirm("Are you sure you want to delete this member?")) {
      const { data: member } = await supabase.from('team_members').select('image_url').eq('id', id).single()
      if (member?.image_url) {
        try {
          const url = member.image_url
          if (url.includes('/storage/v1/object/public/images/')) {
            const path = url.split('/storage/v1/object/public/images/')[1]
            await supabase.storage.from('images').remove([path])
          }
        } catch (err) {
          console.error('Failed to remove team member avatar from storage:', err)
        }
      }
      await supabase.from('team_members').delete().eq('id', id)
      fetchTeam()
    }
  }

  if (userRole === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-black text-[#f4f4f5] font-sans relative overflow-hidden">
        {/* Glowing Backgrounds */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 hidden"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-purple-500/8 hidden"></div>
        
        {/* Brand Preloader Content */}
        <div className="flex flex-col items-center gap-6 animate-pulse z-10">
          <img src="https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png" alt="MSC Logo" className="w-16 h-16 object-contain animate-bounce" style={{ animationDuration: '2s' }} />
          <div className="flex flex-col items-center gap-1">
            <h1 className="font-sans font-black tracking-widest text-xl bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all bg-clip-text text-transparent">
              MSC PORTAL
            </h1>
            <p className="text-[10px] text-gray-800 font-bold uppercase tracking-widest font-semibold">Establishing Secure Handshake...</p>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-black/20 border-t-blue-500 animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] bg-[#050505] text-black font-sans overflow-y-auto relative">
      {/* Background glowing gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 hidden animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-purple-500/8 hidden animate-pulse" style={{ animationDuration: '12s' }}></div>
      </div>

      
      <SidebarLayout
        items={userRole === 'admin' ? [
        { id: 'users', label: 'Users', icon: Users },
        { id: 'password_reqs', label: 'Passwords', icon: Key },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'team', label: 'Team', icon: UserCog },
        { id: 'analytics', label: 'Analytics', icon: PieChart },
        { id: 'settings', label: 'Settings', icon: Settings }
      ] : [
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'team', label: 'Team', icon: UserCog },
        { id: 'analytics', label: 'Analytics', icon: PieChart },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]}
        activeItem={activeTab}
        onSelect={(id: any) => { triggerHaptic('light'); setActiveTab(id); }}
        logoText={userRole === 'admin' ? 'MSC ADMIN' : 'MSC CORE'}
        onLogout={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}
      >
        <div className="w-full">

        <div className="max-w-[1400px] mx-auto">
          {/* USER TAB */}
          {activeTab === 'users' && userRole === 'admin' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10 pl-2">
                <h2 className="text-4xl font-sans font-black text-black tracking-tight">User Access Provisioning</h2>
                <p className="text-gray-800 font-bold text-base mt-2 font-medium max-w-2xl">Manage accounts and platform authorizations for MSC Core Members. Changes to roles or passwords take effect immediately.</p>
              </div>
              
              <div className="bg-white rounded-[32px] p-6 md:p-10 mb-8 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border border-2 md:border-4 border-black">
                <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all/10 flex items-center justify-center">
                    <UserPlus className="text-black w-5 h-5" strokeWidth={2} />
                  </div>
                  Provision Core Account
                </h3>
                
                <form onSubmit={handleCreateUser} className="bg-black/40 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-end border border-white/[0.02]">
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[10px] font-bold text-gray-800 font-bold uppercase tracking-widest pl-1">Email Address</label>
                    <input type="email" name="email" required placeholder="new@member.com" autoComplete="off" className="px-5 py-4 bg-black border border-[#2c2c2e] focus:border-black focus:ring-4 focus:ring-blue-500/20 rounded-none text-black text-sm font-medium outline-none transition-all placeholder:text-[#3c3c3e]" />
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[10px] font-bold text-gray-800 font-bold uppercase tracking-widest pl-1">Password</label>
                    <input type="password" name="password" required placeholder="••••••••" autoComplete="new-password" className="px-5 py-4 bg-black border border-[#2c2c2e] focus:border-black focus:ring-4 focus:ring-blue-500/20 rounded-none text-black text-sm font-medium outline-none transition-all placeholder:text-[#3c3c3e]" />
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[10px] font-bold text-gray-800 font-bold uppercase tracking-widest pl-1">Assign Role</label>
                    <select name="role" className="px-5 py-4 bg-black border border-[#2c2c2e] focus:border-black focus:ring-4 focus:ring-blue-500/20 rounded-none text-black text-sm font-medium outline-none transition-all appearance-none cursor-pointer bg-no-repeat bg-[right_16px_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23a1a1aa%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')]">
                      <option value="core_member">Core Member</option>
                    </select>
                  </div>
                  <div>
                    <button type="submit" className="w-full py-4 px-6 bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]  active:scale-95">Create Account</button>
                  </div>
                </form>
                {statusMsg?.id === 'create_user' && <div className={`mt-6 text-sm font-semibold pl-2 ${statusMsg.type === 'error' ? 'text-red-400' : statusMsg.type === 'success' ? 'text-green-400' : 'text-black'}`}>{statusMsg.msg}</div>}
              </div>

              <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border border-2 md:border-4 border-black">
                <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-3 pl-2">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Users className="text-purple-400 w-5 h-5" strokeWidth={2} />
                  </div>
                  System Directory
                </h3>
                
                <div className="bg-black/40 rounded-3xl overflow-hidden border border-white/[0.02]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                        <th className="text-gray-800 font-bold font-bold text-[10px] uppercase tracking-widest px-8 py-5">Email Address</th>
                        <th className="text-gray-800 font-bold font-bold text-[10px] uppercase tracking-widest px-8 py-5">Role</th>
                        <th className="text-gray-800 font-bold font-bold text-[10px] uppercase tracking-widest px-8 py-5 text-right">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {loadingUsers ? (
                        [...Array(4)].map((_, idx) => (
                          <tr key={idx} className="animate-pulse">
                            <td className="px-8 py-6"><div className="h-4 bg-slate-200 rounded-full w-48"></div></td>
                            <td className="px-8 py-6"><div className="h-10 bg-white rounded-none w-32"></div></td>
                            <td className="px-8 py-6 text-right flex justify-end gap-3">
                              <div className="h-10 bg-white rounded-full w-24"></div>
                              <div className="h-10 bg-red-500/5 rounded-full w-24"></div>
                            </td>
                          </tr>
                        ))
                      ) : users.length === 0 ? (
                        <tr><td colSpan={3} className="text-center py-16 text-gray-800 font-bold font-medium">No users found in directory.</td></tr>
                      ) : (
                        users.map(u => (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-8 py-6 font-medium text-black">{u.email}</td>
                            <td className="px-8 py-6">
                              <select
                                defaultValue={u.role}
                                onChange={(e) => { triggerHaptic('medium'); updateUserRole(u.id, e.target.value); }}
                                disabled={u.role === 'admin'}
                                className="px-4 py-2.5 rounded-none bg-white text-black text-xs font-bold border border-black focus:border-black focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 appearance-none pr-8 cursor-pointer bg-no-repeat bg-[right_10px_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2386868b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')]"
                              >
                                <option value="core_member">Core Member</option>
                                {u.role === 'admin' && <option value="admin">Admin</option>}
                              </select>
                            </td>
                            <td className="px-8 py-6 text-right flex items-center justify-end gap-3">
                              <span className={`text-xs font-semibold ${statusMsg?.id === `user_${u.id}` ? (statusMsg.type === 'error' ? 'text-red-400' : statusMsg.type === 'success' ? 'text-green-400' : 'text-gray-800 font-bold') : 'hidden'}`}>{statusMsg?.id === `user_${u.id}` ? statusMsg.msg : ''}</span>
                              <button onClick={() => { triggerHaptic('light'); openPasswordResetModal(u.id, u.email); }} disabled={u.role === 'admin'} className="px-4 py-2 bg-white group-hover:bg-slate-200 rounded-full text-xs font-bold text-black transition-all disabled:opacity-30 flex items-center gap-2 border border-black active:scale-95"><Key className="w-3.5 h-3.5 text-gray-800 font-bold" strokeWidth={2} /> Reset</button>
                              <button onClick={() => { triggerHaptic('heavy'); openDeleteUserModal(u.id, u.email); }} disabled={u.role === 'admin'} className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-black rounded-full text-xs font-bold transition-all disabled:opacity-30 flex items-center gap-2 active:scale-95"><Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> Delete</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
{/* EVENTS TAB */}
          {activeTab === 'events' && (
            <EventsManagement
              events={events}
              loadingEvents={loadingEvents}
              userRole={userRole}
              isCreatingEvent={isCreatingEvent}
              statusMsg={statusMsg}
              handleCreateEvent={handleCreateEvent}
              deleteEvent={deleteEvent}
              toggleEventStatus={toggleEventStatus}
              toggleRegistration={toggleRegistration}
              allowTeamsToggle={allowTeamsToggle}
              setAllowTeamsToggle={setAllowTeamsToggle}
              eventPricingType={eventPricingType}
              setEventPricingType={setEventPricingType}
              chargeType={chargeType}
              setChargeType={setChargeType}
              triggerHaptic={triggerHaptic}
            />
          )}
          
{/* TEAM TAB */}
          {activeTab === 'team' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10 pl-2">
                <h2 className="text-4xl font-sans font-black text-black tracking-tight">Team Directory</h2>
                <p className="text-gray-800 font-bold text-base mt-2 font-medium max-w-2xl">Manage public profile cards, roles, and social links for Microsoft Student Community core members.</p>
              </div>
              
              {['admin', 'coremember', 'core_member'].includes(userRole) && (
                <div className="bg-white rounded-[32px] p-6 md:p-10 mb-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border border-2 md:border-4 border-black">
                  <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-3 pl-2">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <UserPlus className="text-purple-400 w-5 h-5" strokeWidth={2} />
                    </div>
                    Add Team Member
                  </h3>
                  <form onSubmit={handleCreateTeam} className="flex flex-col gap-6">
                    <div className="bg-black/40 rounded-3xl p-6 md:p-8 border border-white/[0.02] grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="flex flex-col gap-2.5 md:col-span-1">
                        <label className="text-[10px] font-bold text-gray-800 font-bold uppercase tracking-widest pl-1">Full Name</label>
                        <input type="text" name="name" required placeholder="e.g. John Doe" className="px-5 py-4 bg-black border border-[#2c2c2e] focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-none text-black text-sm font-medium outline-none transition-all placeholder:text-[#3c3c3e]" />
                      </div>
                      <div className="flex flex-col gap-2.5 md:col-span-1">
                        <label className="text-[10px] font-bold text-gray-800 font-bold uppercase tracking-widest pl-1">Role</label>
                        <input type="text" name="role" required placeholder="e.g. Technical Lead" className="px-5 py-4 bg-black border border-[#2c2c2e] focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-none text-black text-sm font-medium outline-none transition-all placeholder:text-[#3c3c3e]" />
                      </div>
                      <div className="flex flex-col gap-2.5 md:col-span-1">
                        <label className="text-[10px] font-bold text-gray-800 font-bold uppercase tracking-widest pl-1">Category</label>
                        <select name="category" required className="px-5 py-4 bg-black border border-[#2c2c2e] focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-none text-black text-sm font-medium outline-none transition-all appearance-none cursor-pointer bg-no-repeat bg-[right_16px_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2386868b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')]">
                          <option value="Lead">Lead</option>
                          <option value="Co-Lead">Co-Lead</option>
                          <option value="Core Team">Core Team</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2.5 md:col-span-1">
                        <label className="text-[10px] font-bold text-gray-800 font-bold uppercase tracking-widest pl-1">Profile Image <span className="lowercase font-normal text-gray-800 font-bold/70">(optional)</span></label>
                        <input type="file" name="image" accept="image/*" className="w-full bg-black border border-[#2c2c2e] focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-none px-5 py-3.5 text-black text-sm font-medium outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20 file:transition-all cursor-pointer" />
                      </div>

                      <div className="flex flex-col gap-2.5 md:col-span-1">
                        <label className="text-[10px] font-bold text-gray-800 font-bold uppercase tracking-widest pl-1 flex items-center justify-between">
                          <span>LinkedIn URL <span className="lowercase font-normal text-gray-800 font-bold/70">(optional)</span></span>
                          <i className="fab fa-linkedin text-[#0a66c2]"></i>
                        </label>
                        <input type="url" name="linkedin_url" placeholder="https://linkedin.com/in/username" className="px-5 py-4 bg-black border border-[#2c2c2e] focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-none text-black text-sm font-medium outline-none transition-all placeholder:text-[#3c3c3e]" />
                      </div>
                      <div className="flex flex-col gap-2.5 md:col-span-1">
                        <label className="text-[10px] font-bold text-gray-800 font-bold uppercase tracking-widest pl-1 flex items-center justify-between">
                          <span>GitHub URL <span className="lowercase font-normal text-gray-800 font-bold/70">(optional)</span></span>
                          <i className="fab fa-github text-black"></i>
                        </label>
                        <input type="url" name="github_url" placeholder="https://github.com/username" className="px-5 py-4 bg-black border border-[#2c2c2e] focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-none text-black text-sm font-medium outline-none transition-all placeholder:text-[#3c3c3e]" />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button type="submit" disabled={isCreatingTeam} className="w-full md:w-auto px-10 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-full font-bold text-sm transition-all text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-2">
                        {isCreatingTeam ? <><span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-white"></span> Adding Member...</> : 'Add to Directory'}
                      </button>
                    </div>
                  </form>
                  {statusMsg?.id === 'create_team' && <div className={`mt-6 text-sm font-semibold pl-2 ${statusMsg.type === 'error' ? 'text-red-400' : statusMsg.type === 'success' ? 'text-green-400' : 'text-purple-400'}`}>{statusMsg.msg}</div>}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingTeam ? (
                  [...Array(3)].map((_, idx) => (
                    <div key={idx} className="bg-white rounded-[32px] overflow-hidden border border-2 md:border-4 border-black animate-pulse h-64"></div>
                  ))
                ) : team.length === 0 ? (
                  <div className="col-span-full bg-white rounded-[32px] p-16 text-center border border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-gray-800 font-bold font-medium text-lg">No team members added yet.</p>
                  </div>
                ) : (
                  team.map(member => (
                    <div key={member.id} className="bg-white rounded-[32px] p-6 flex flex-col items-center text-center border border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-1.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-purple-500/10 transition-all duration-400 relative overflow-hidden">
                      {['admin', 'coremember', 'core_member'].includes(userRole) && (
                        <button onClick={() => { triggerHaptic('heavy'); deleteTeam(member.id); }} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500 flex items-center justify-center text-red-500 hover:text-black transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-10">
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                      )}
                      
                      <div className="w-24 h-24 rounded-full mb-5 overflow-hidden border-2 border-[#2c2c2e] group-hover:border-purple-500/50 transition-colors bg-black/60 flex items-center justify-center relative">
                        {member.image_url ? (
                          <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-gray-800 font-bold">{member.name.charAt(0)}</span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-black mb-1 group-hover:text-purple-400 transition-colors">{member.name}</h3>
                      <p className="text-gray-800 font-bold text-sm font-medium mb-1.5">{member.role}</p>
                      <span className="px-3 py-1 bg-black rounded-full text-[10px] font-bold text-black uppercase tracking-widest border border-[#2c2c2e] mb-5">
                        {member.category}
                      </span>
                      
                      <div className="flex gap-3 mt-auto">
                        {member.linkedin_url && (
                          <a href={member.linkedin_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-black hover:bg-[#0a66c2]/20 border border-[#2c2c2e] hover:border-[#0a66c2]/30 flex items-center justify-center text-gray-800 font-bold hover:text-[#0a66c2] transition-colors">
                            <i className="fab fa-linkedin-in text-[15px]"></i>
                          </a>
                        )}
                        {member.github_url && (
                          <a href={member.github_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-black hover:bg-[#E0E0E0] border border-[#2c2c2e] hover:border-slate-300 flex items-center justify-center text-gray-800 font-bold hover:text-black transition-colors">
                            <i className="fab fa-github text-[15px]"></i>
                          </a>
                        )}
                        {!member.linkedin_url && !member.github_url && (
                          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-2">No Links Provided</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
                </div>
            </div>
          )}
          
{/* ANALYTICS TAB */}
          {activeTab === 'analytics' && <AnalyticsDashboard />}


          {/* PASSWORD REQUESTS TAB */}
          {activeTab === 'password_reqs' && userRole === 'admin' && <PasswordRequestsTab />}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && <SettingsTab />}

          {/* ABOUT TAB */}
        </div>
      </div>
      </SidebarLayout>

      {/* Password Reset Modal Overlay */}
      {resettingUser && (
        <div className="fixed inset-0 bg-black/80  z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-black rounded-none max-w-md w-full overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] shadow-black/40 p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-black mb-2 flex items-center gap-2">
              <Key className="text-black" strokeWidth={1.5} /> Reset Password
            </h3>
            <p className="text-xs text-gray-800 font-bold mb-5">Change password for <strong className="text-black">{resettingUser.email}</strong>.</p>
            
            <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-black uppercase tracking-wider">New Password</label>
                <input 
                  type="password" 
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="p-3 bg-black border border-black focus:border-black rounded-none text-black outline-none text-sm transition-all"
                />
              </div>

              {resetModalError && <p className="text-xs font-semibold text-red-400">{resetModalError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => { triggerHaptic('light'); setResettingUser(null); }}
                  className="px-4 py-2.5 bg-white hover:bg-slate-200 border border-black rounded-none text-xs font-bold text-black transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isResettingPassword}
                  className="px-5 py-2.5 bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all hover:bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all rounded-full text-xs font-bold text-black transition-colors cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 hover:opacity-90"
                >
                  {isResettingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/80  z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-red-500/20 rounded-none max-w-md w-full overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] shadow-black/40 p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
              <AlertTriangle strokeWidth={1.5} /> Delete Account
            </h3>
            <p className="text-sm text-black/70 leading-relaxed mb-6">
              Are you absolutely sure you want to delete <strong className="text-black font-bold">{deletingUser.email}</strong>? This action is permanent and cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => { triggerHaptic('light'); setDeletingUser(null); }}
                className="px-4 py-2.5 bg-white hover:bg-slate-200 border border-black rounded-none text-xs font-bold text-black transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDeleteUser}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 rounded-full text-xs font-bold text-black transition-colors cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
