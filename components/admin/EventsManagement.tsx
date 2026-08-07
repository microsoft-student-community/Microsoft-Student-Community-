'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { CalendarPlus, Calendar, Clock, MapPin, ExternalLink, Edit2, Trash2, CheckCircle2, AlertCircle, UploadCloud, FileJson, X, ChevronRight, BarChart3, Users, LayoutList } from 'lucide-react'

// Define prop types based on existing page.tsx usage
interface Event {
  id: string
  title: string
  description: string
  date_start: string
  location?: string
  status: string
  registration_open?: boolean
  image_url?: string
  slug?: string
}

interface EventsManagementProps {
  events: Event[]
  loadingEvents: boolean
  userRole: string
  isCreatingEvent: boolean
  statusMsg: { id: string, msg: string, type: 'error' | 'success' | 'info' } | null
  handleCreateEvent: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  deleteEvent: (id: string, title: string) => Promise<void>
  toggleEventStatus: (id: string, currentStatus: string) => Promise<void>
  toggleRegistration: (id: string, currentState: boolean) => Promise<void>

  allowTeamsToggle: boolean
  setAllowTeamsToggle: (val: boolean) => void
  eventPricingType: 'free' | 'paid'
  setEventPricingType: (val: 'free' | 'paid') => void
  chargeType: 'per_person' | 'per_team'
  setChargeType: (val: 'per_person' | 'per_team') => void
  triggerHaptic?: (type: 'light' | 'medium' | 'heavy') => void
}

export default function EventsManagement({
  events,
  loadingEvents,
  userRole,
  isCreatingEvent,
  statusMsg,
  handleCreateEvent,
  deleteEvent,
  toggleEventStatus,

  toggleRegistration,
  allowTeamsToggle,
  setAllowTeamsToggle,
  eventPricingType,
  setEventPricingType,
  chargeType,
  setChargeType,
  triggerHaptic = () => {}
}: EventsManagementProps) {
  



  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [agendaItems, setAgendaItems] = useState([{ time: '09:00 AM', title: 'Check-in & Networking' }])
  const [speakerItems, setSpeakerItems] = useState([{ name: 'Guest Speaker 1', role: 'Industry Expert' }])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPosterPreview(url)
    }
  }

  const removeFile = () => {
    setPosterPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-black tracking-tight">Events Management</h2>
      </div>
      

      {userRole === 'admin' && (
        <div className="bg-white rounded-none border border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-12 overflow-hidden">
          <div className="p-8 border-b border-2 md:border-4 border-black bg-[#fdfaf6] border-b-4 border-black">
            <h3 className="text-xl font-bold tracking-tight text-black flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all/10 flex items-center justify-center">
                <CalendarPlus className="text-black w-5 h-5" />
              </div>
              Create New Event
            </h3>
            <p className="text-gray-800 font-bold text-[13px] mt-1 ml-[52px]">Fill out the details below to launch a new event.</p>
          </div>
          
          <form onSubmit={handleCreateEvent} className="p-8 flex flex-col gap-[32px]">
            
            {/* Section 1: Event Information */}
            <div className="flex flex-col gap-6">
              <h4 className="text-[14px] font-bold text-black uppercase tracking-wider border-b border-2 md:border-4 border-black pb-2">1. Event Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2 md:col-span-1">
                  <label className="text-[14px] font-medium text-black">Event Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" required placeholder="e.g. Hackathon 2.0" className="px-4 py-3 bg-[#f4f4f0] border border-2 md:border-4 border-black focus:border-black focus:ring-4 focus:ring-blue-500/10 focus:border-black transition-all duration-300 rounded-none text-black text-[15px] transition-all placeholder:text-gray-800 font-bold outline-none" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-1">
                  <label className="text-[14px] font-medium text-black">Event Type <span className="text-red-500">*</span></label>
                  <select name="type" required className="px-4 py-3 bg-[#f4f4f0] border border-2 md:border-4 border-black focus:border-black focus:ring-4 focus:ring-blue-500/10 focus:border-black transition-all duration-300 rounded-none text-black text-[15px] transition-all appearance-none cursor-pointer outline-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23a1a1aa%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat">
                    <option value="hackathon">Hackathon</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 md:col-span-1">
                  <label className="text-[14px] font-medium text-black">Status <span className="text-red-500">*</span></label>
                  <select name="status" className="px-4 py-3 bg-[#f4f4f0] border border-2 md:border-4 border-black focus:border-black focus:ring-4 focus:ring-blue-500/10 focus:border-black transition-all duration-300 rounded-none text-black text-[15px] transition-all appearance-none cursor-pointer outline-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23a1a1aa%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat">
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Schedule & Venue */}
            <div className="flex flex-col gap-6">
              <h4 className="text-[14px] font-bold text-black uppercase tracking-wider border-b border-2 md:border-4 border-black pb-2">2. Schedule & Venue</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2 md:col-span-1">
                  <label className="text-[14px] font-medium text-black">Date <span className="text-red-500">*</span></label>
                  <input type="date" name="date_start" required className="px-4 py-3 bg-[#f4f4f0] border border-2 md:border-4 border-black focus:border-black focus:ring-4 focus:ring-blue-500/10 focus:border-black transition-all duration-300 rounded-none text-black text-[15px] transition-all cursor-text outline-none css-invert-calendar" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-1">
                  <label className="text-[14px] font-medium text-black">Venue / Location</label>
                  <input type="text" name="location" placeholder="e.g. Mini Auditorium" className="px-4 py-3 bg-[#f4f4f0] border border-2 md:border-4 border-black focus:border-black focus:ring-4 focus:ring-blue-500/10 focus:border-black transition-all duration-300 rounded-none text-black text-[15px] transition-all placeholder:text-gray-800 font-bold outline-none" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-1">
                  <label className="text-[14px] font-medium text-black">Maximum Capacity <span className="text-[12px] text-gray-800 font-bold ml-1">(Optional)</span></label>
                  <input type="number" name="max_capacity" min="1" placeholder="e.g. 150" className="px-4 py-3 bg-[#f4f4f0] border border-2 md:border-4 border-black focus:border-black focus:ring-4 focus:ring-blue-500/10 focus:border-black transition-all duration-300 rounded-none text-black text-[15px] transition-all placeholder:text-gray-800 font-bold outline-none" />
                </div>
              </div>
            </div>

            {/* Section 3: Description */}
            <div className="flex flex-col gap-6">
              <h4 className="text-[14px] font-bold text-black uppercase tracking-wider border-b border-2 md:border-4 border-black pb-2">3. Description</h4>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-black">Event Details <span className="text-red-500">*</span></label>
                <textarea name="description" required placeholder="Describe the event, agenda, speakers, and important details..." className="px-4 py-3 bg-[#f4f4f0] border border-2 md:border-4 border-black focus:border-black focus:ring-4 focus:ring-blue-500/10 focus:border-black transition-all duration-300 rounded-none text-black text-[15px] transition-all placeholder:text-gray-800 font-bold outline-none resize-y min-h-[180px]"></textarea>
                <p className="text-[13px] text-gray-800 font-bold mt-1">Markdown is supported for formatting.</p>
              </div>
            </div>

            {/* Section 4: Assets */}
            <div className="flex flex-col gap-6">
              <h4 className="text-[14px] font-bold text-black uppercase tracking-wider border-b border-2 md:border-4 border-black pb-2">4. Assets & Templates</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-medium text-black">Event Poster <span className="text-[12px] text-gray-800 font-bold ml-1">(Optional)</span></label>
                  <div className="relative w-full h-[220px] bg-[#f4f4f0] border-2 border-dashed border-2 md:border-4 border-black rounded-none hover:border-black transition-colors flex flex-col items-center justify-center overflow-hidden group">
                    {posterPreview ? (
                      <>
                        <img src={posterPreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white/10 rounded-[6px] text-black text-sm font-medium hover:bg-slate-200 transition-colors">Change</button>
                          <button type="button" onClick={removeFile} className="px-4 py-2 bg-red-500/20 rounded-[6px] text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 pointer-events-none">
                        <UploadCloud className="w-10 h-10 text-gray-800 font-bold mx-auto mb-3" />
                        <p className="text-[14px] text-black font-medium mb-1">Drag & drop your image here</p>
                        <p className="text-[13px] text-gray-800 font-bold mb-4">JPEG, PNG, WEBP up to 5MB</p>
                        <div className="px-4 py-2 bg-white border border-2 md:border-4 border-black rounded-[6px] text-black text-[13px] font-medium inline-block pointer-events-auto cursor-pointer hover:bg-[#E0E0E0] transition-colors" onClick={() => fileInputRef.current?.click()}>Browse Files</div>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" name="image" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-medium text-black flex justify-between">
                    <span>Certificate Template <span className="text-[12px] text-gray-800 font-bold ml-1">(Optional)</span></span>
                  </label>
                  <div className="bg-[#f4f4f0] border border-2 md:border-4 border-black rounded-none h-[220px] flex flex-col overflow-hidden">
                    <div className="bg-[#fdfaf6] border-b-4 border-black px-4 py-2 border-b border-2 md:border-4 border-black flex items-center justify-between">
                      <div className="flex items-center gap-2 text-black text-xs font-mono">
                        <FileJson className="w-3 h-3" /> template.html
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded uppercase tracking-widest font-bold">Variables</span>
                      </div>
                    </div>
                    <div className="flex flex-1 overflow-hidden">
                      <textarea 
                        name="certificate_html" 
                        placeholder="<div style='...'>...</div>" 
                        className="flex-1 bg-transparent text-black text-[13px] font-mono p-4 outline-none resize-none placeholder:text-gray-800 font-bold"
                        spellCheck={false}
                      ></textarea>
                      <div className="w-[120px] bg-[#121214] border-l border-2 md:border-4 border-black p-3 flex flex-col gap-2 overflow-y-auto">
                        <div className="text-[10px] font-bold text-gray-800 font-bold uppercase tracking-wider mb-1">Placeholders</div>
                        <code className="text-[11px] text-black bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all/10 px-1.5 py-1 rounded select-all cursor-text">{'{{NAME}}'}</code>
                        <code className="text-[11px] text-black bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all/10 px-1.5 py-1 rounded select-all cursor-text">{'{{EVENT_TITLE}}'}</code>
                        <code className="text-[11px] text-black bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all/10 px-1.5 py-1 rounded select-all cursor-text">{'{{DATE}}'}</code>
                        <code className="text-[11px] text-black bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all/10 px-1.5 py-1 rounded select-all cursor-text">{'{{CERTIFICATE_ID}}'}</code>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            
            {/* Section 5: Public Registration Form Rules */}
            <div className="flex flex-col gap-6">
              <h4 className="text-[14px] font-bold text-black uppercase tracking-wider border-b border-2 md:border-4 border-black pb-2">5. Public Registration Form Rules</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Mandatory Fields */}
                <div className="bg-[#f4f4f0] border border-2 md:border-4 border-black p-6 rounded-none flex flex-col gap-4">
                  <h5 className="text-[15px] font-bold text-black uppercase tracking-wider mb-2">Mandatory Fields</h5>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-black">Student Email</span>
                    <span className="text-[10px] bg-[#E0E0E0] text-black px-2 py-0.5 rounded border border-black uppercase font-bold tracking-widest">Locked</span>
                  </div>
                  
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[14px] font-medium text-black group-hover:text-blue-600 transition-colors">Require Registration Number</span>
                    <input type="checkbox" name="req_reg_num" className="w-5 h-5 border-2 border-black rounded-none checked:bg-[#FFEB3B] checked:border-black transition-all cursor-pointer" />
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[14px] font-medium text-black group-hover:text-blue-600 transition-colors">Require Branch</span>
                    <input type="checkbox" name="req_branch" className="w-5 h-5 border-2 border-black rounded-none checked:bg-[#FFEB3B] checked:border-black transition-all cursor-pointer" />
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[14px] font-medium text-black group-hover:text-blue-600 transition-colors">Require Specialization</span>
                    <input type="checkbox" name="req_spec" className="w-5 h-5 border-2 border-black rounded-none checked:bg-[#FFEB3B] checked:border-black transition-all cursor-pointer" />
                  </label>
                </div>

                {/* Eligibility & Teams */}
                <div className="bg-[#f4f4f0] border border-2 md:border-4 border-black p-6 rounded-none flex flex-col gap-4">
                  <h5 className="text-[15px] font-bold text-black uppercase tracking-wider mb-2">Participant Eligibility</h5>
                  
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[14px] font-medium text-black group-hover:text-blue-600 transition-colors">Allow Students from Other Colleges</span>
                    <input type="checkbox" name="allow_external_students" defaultChecked className="w-5 h-5 border-2 border-black rounded-none checked:bg-[#FFEB3B] checked:border-black transition-all cursor-pointer" />
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[14px] font-medium text-black group-hover:text-blue-600 transition-colors">Provide E-Certificates</span>
                    <input type="checkbox" name="provide_certificates" defaultChecked className="w-5 h-5 border-2 border-black rounded-none checked:bg-[#FFEB3B] checked:border-black transition-all cursor-pointer" />
                  </label>

                  <div className="border-t-2 border-black my-2"></div>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[14px] font-bold text-black group-hover:text-blue-600 transition-colors">Allow Team Registrations</span>
                    <div className="relative inline-flex items-center">
                      <input type="checkbox" name="allow_teams" checked={allowTeamsToggle} onChange={(e) => setAllowTeamsToggle(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFEB3B] border-2 border-black"></div>
                    </div>
                  </label>

                  {allowTeamsToggle && (
                    <div className="flex items-center justify-between mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <span className="text-[13px] font-bold text-gray-800">Team Size Range</span>
                      <div className="flex items-center gap-2">
                        <input type="number" name="min_team_size" min="2" max="10" defaultValue="2" className="w-16 px-2 py-1.5 bg-white border border-2 border-black text-black text-[14px] font-bold outline-none focus:ring-2 focus:ring-black rounded-none" placeholder="Min" />
                        <span className="text-black font-bold">-</span>
                        <input type="number" name="max_team_size" min="2" max="10" defaultValue="4" className="w-16 px-2 py-1.5 bg-white border border-2 border-black text-black text-[14px] font-bold outline-none focus:ring-2 focus:ring-black rounded-none" placeholder="Max" />
                      </div>
                    </div>
                  )}
                </div>
                
              </div>
            </div>

            {/* Section 6: Pricing & Fee Setup */}
            <div className="flex flex-col gap-6">
              <h4 className="text-[14px] font-bold text-black uppercase tracking-wider border-b border-2 md:border-4 border-black pb-2">6. Pricing & Fee Setup</h4>
              <div className="bg-[#f4f4f0] border border-2 md:border-4 border-black p-6 rounded-none">
                <div className="flex flex-col md:flex-row gap-8">
                  
                  <div className="flex-1 flex flex-col gap-4">
                    <label className="text-[14px] font-medium text-black">Event Pricing Mode</label>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setEventPricingType('free')} className={`flex-1 py-3 border-2 border-black rounded-none font-bold text-[14px] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${eventPricingType === 'free' ? 'bg-[#FFEB3B] text-black' : 'bg-white text-black'}`}>Free</button>
                      <button type="button" onClick={() => setEventPricingType('paid')} className={`flex-1 py-3 border-2 border-black rounded-none font-bold text-[14px] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${eventPricingType === 'paid' ? 'bg-black text-white' : 'bg-white text-black'}`}>Paid</button>
                    </div>
                  </div>

                  {eventPricingType === 'paid' && (
                    <div className="flex-1 flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300 border-l-2 border-dashed border-black pl-8">
                      <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-medium text-black">Charge Type</label>
                        <div className="flex gap-4 mt-1">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="charge_type_ui" checked={chargeType === 'per_person'} onChange={() => setChargeType('per_person')} className="w-4 h-4 text-black border-2 border-black focus:ring-black cursor-pointer" />
                            <span className="text-[14px] font-bold text-black group-hover:text-blue-600 transition-colors">Per Person</span>
                          </label>
                          <label className={`flex items-center gap-2 cursor-pointer group ${!allowTeamsToggle ? 'opacity-50' : ''}`}>
                            <input type="radio" name="charge_type_ui" checked={chargeType === 'per_team'} onChange={() => allowTeamsToggle && setChargeType('per_team')} disabled={!allowTeamsToggle} className="w-4 h-4 text-black border-2 border-black focus:ring-black cursor-pointer disabled:cursor-not-allowed" />
                            <span className="text-[14px] font-bold text-black group-hover:text-blue-600 transition-colors">Per Team</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-2">
                        <label className="text-[14px] font-medium text-black">Registration Fee (₹)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800 font-bold">₹</span>
                          <input type="number" name="registration_fee" required={eventPricingType === 'paid'} min="1" placeholder="e.g. 200" className="w-full pl-10 pr-4 py-3 bg-white border border-2 border-black focus:border-black focus:ring-2 focus:ring-black transition-all rounded-none text-black text-[15px] font-bold outline-none" />
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Section 7: Launch Settings */}

            <div className="flex flex-col gap-6">
              <h4 className="text-[14px] font-bold text-black uppercase tracking-wider border-b border-2 md:border-4 border-black pb-2">7. Launch Settings</h4>
              <div className="bg-[#f4f4f0] border border-2 md:border-4 border-black p-6 rounded-none flex items-center justify-between">
                <div>
                  <h5 className="text-[15px] font-medium text-black">Open Registrations Instantly</h5>
                  <p className="text-[13px] text-gray-800 font-bold mt-1">Allow users to register as soon as this event is published.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="registration_open" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all"></div>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-2 md:border-4 border-black flex flex-col md:flex-row items-center justify-end gap-4 mt-2">
              <button type="button" className="w-full md:w-auto px-6 py-3 rounded-none text-[15px] font-medium text-black hover:bg-[#E0E0E0] transition-colors order-2 md:order-1">
                Save Draft
              </button>
              <button type="submit" disabled={isCreatingEvent} className="w-full md:w-auto px-8 py-3 bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all hover:bg-blue-700 text-white disabled:bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all/50 disabled:cursor-not-allowed rounded-none font-medium text-[15px] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all active:scale-[0.98] flex items-center justify-center min-w-[160px] order-1 md:order-2">
                {isCreatingEvent ? (
                  <span className="w-5 h-5 border-2 border-slate-300 border-t-white rounded-full animate-spin"></span>
                ) : (
                  'Publish Event'
                )}
              </button>
            </div>
            
            {statusMsg?.id === 'create_event' && (
              <div className={`mt-2 p-4 rounded-none text-[14px] font-medium flex items-center gap-2 ${statusMsg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : statusMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-black/20'}`}>
                {statusMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {statusMsg.msg}
              </div>
            )}
            
          </form>
        </div>
      )}
      
      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
        {loadingEvents ? (
          [...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-none overflow-hidden border border-2 md:border-4 border-black animate-pulse h-[420px]"></div>
          ))
        ) : events.length === 0 ? (
          <div className="col-span-full bg-white rounded-none p-16 text-center border border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-gray-800 font-bold font-medium text-[16px]">No events configured yet.</p>
          </div>
        ) : (
          events.map(evt => (
            <div key={evt.id} className="bg-white rounded-none overflow-hidden border border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:border-2 md:border-4 border-black transition-all duration-300 flex flex-col group translate-y-0 hover:-translate-y-1">
              <div className="relative h-48 bg-[#f4f4f0] w-full overflow-hidden border-b border-2 md:border-4 border-black">
                {evt.image_url ? (
                  <img src={evt.image_url} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <Calendar className="w-10 h-10 mb-2 opacity-50" strokeWidth={1.5} />
                    <span className="text-[11px] font-medium uppercase tracking-widest">No Poster</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] backdrop-blur-md ${evt.status === 'completed' ? 'bg-[#E0E0E0] text-gray-800 font-bold border border-2 md:border-4 border-black' : 'bg-green-500 text-white'}`}>
                    {evt.status === 'completed' ? 'Archived' : 'Active'}
                  </span>
                  {!evt.registration_open && (
                    <span className="px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] backdrop-blur-md bg-red-500 text-white">
                      Locked
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-[18px] font-bold text-black mb-4 line-clamp-1 group-hover:text-black transition-colors">{evt.title}</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6">
                    <div className="flex items-start gap-2 text-[13px] text-black font-medium">
                      <Clock className="w-4 h-4 text-gray-800 font-bold shrink-0 mt-0.5" />
                      <span className="leading-tight">{new Date(evt.date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {evt.location && (
                      <div className="flex items-start gap-2 text-[13px] text-black font-medium">
                        <MapPin className="w-4 h-4 text-gray-800 font-bold shrink-0 mt-0.5" />
                        <span className="leading-tight line-clamp-2">{evt.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Unified Action Bar */}
                <div className="pt-5 border-t border-2 md:border-4 border-black flex gap-2 justify-between">
                  <Link href={`/admin/events/${evt.slug || evt.id}`} onClick={() => triggerHaptic('light')} className="flex-1 bg-[#E0E0E0] hover:bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all/10 text-black hover:text-black border border-black hover:border-[#0a84ff]/20 rounded-[8px] py-2 text-[13px] font-medium transition-all flex items-center justify-center gap-2">
                    Manage <ChevronRight className="w-4 h-4" />
                  </Link>
                  
                  {userRole === 'admin' && (
                    <div className="flex gap-2">
                      <Link href={`/admin/events/${evt.slug || evt.id}/edit`} onClick={() => triggerHaptic('light')} className="w-[36px] h-[36px] rounded-[8px] bg-[#E0E0E0] hover:bg-[#FFEB3B] text-black font-black uppercase tracking-widest border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]  border border-black hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] hover:shadow-none transition-all/10 flex items-center justify-center text-black hover:text-black transition-all" title="Edit Event">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => { triggerHaptic('heavy'); deleteEvent(evt.id, evt.title); }} className="w-[36px] h-[36px] rounded-[8px] bg-red-500/5 hover:bg-red-500/10 flex items-center justify-center text-black hover:text-red-400 transition-all cursor-pointer" title="Delete Event">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
