import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

function calcTime(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function AgendaList({ items }: { items: any[] }) {
  if (!items || items.length === 0) {
    return <div className="text-slate-400 italic py-4">No agenda items scheduled yet.</div>;
  }
  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex gap-4 p-3.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="shrink-0 text-xs font-mono text-[#0078d4] w-20 pt-0.5">{item.time || item.t}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-200 leading-snug">{item.title || item.d}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface Props {
  event: any;
  registeredCount: number;
  onClose: () => void;
  onRegisterClick: () => void;
}

const TABS = ['Overview', 'Schedule', 'Speakers', 'Venue'];

export default function EventModal({ event, registeredCount, onClose, onRegisterClick }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState('Overview');
  const [time, setTime] = useState(() => event ? calcTime(event.date_start) : { days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!event) return;
    const id = setInterval(() => setTime(calcTime(event.date_start)), 1000);
    return () => clearInterval(id);
  }, [event]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!event) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  const capacity = event.max_capacity || 0;
  const isUnlimited = !capacity;
  const pct = isUnlimited ? 0 : Math.round((registeredCount / capacity) * 100);

  const isFree = event.form_requirements?.event_pricing === 'free' || !event.form_requirements?.registration_fee;
  const price = isFree ? 0 : event.form_requirements.registration_fee;

  const agenda = event.form_requirements?.agenda || [];
  const speakers = event.form_requirements?.speakers || [];

  const dateStr = new Date(event.date_start).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const timeStr = new Date(event.date_start).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 py-10 overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl relative mt-auto mb-auto"
        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Banner */}
        <div className="relative h-56 md:h-72 bg-slate-900">
          {event.banner_url ? (
            <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#0078d4]/40 to-purple-500/40" />
          )}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(17,24,39,1) 0%, rgba(17,24,39,0.4) 50%, transparent 100%)' }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white transition-colors text-xl leading-none bg-black/20 backdrop-blur-md z-50 cursor-pointer"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          >
            ×
          </button>
          <div className="absolute bottom-5 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs font-semibold text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/25 capitalize">
                {event.type || 'Event'}
              </span>
              <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                MSC SRM
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{event.title}</h2>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row">
          {/* Left 70% */}
          <div className="flex-1 min-w-0 p-6">
            {/* Meta row */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#0078d4]"><rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.3" /><path d="M4.5 1v2.5M9.5 1v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                {dateStr}
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#0078d4]"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" /><path d="M7 4v3.5L9 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {timeStr}
              </span>
              <span className="flex items-center gap-1.5 truncate max-w-[200px]" title={event.location || 'TBA'}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#0078d4]"><path d="M7 1.5a4 4 0 014 4C11 9 7 13 7 13S3 9 3 5.5a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.3" /><circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2" /></svg>
                {event.location || 'TBA'}
              </span>
              <span className="flex items-center gap-1.5 ml-auto">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 bg-gradient-to-br from-blue-500 to-purple-500">
                  MSC
                </div>
                Microsoft Student Community
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-white/[0.06] overflow-x-auto pb-1">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg whitespace-nowrap ${tab === t ? 'text-white border-b-2 border-[#0078d4] bg-white/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="min-h-[250px]">
              {tab === 'Overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <p className="text-slate-300 leading-relaxed text-[15px] whitespace-pre-wrap">{event.description || "Join us for an incredible experience of learning, networking, and building the future."}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Attendees', value: registeredCount.toLocaleString() },
                      { label: 'Capacity', value: isUnlimited ? 'Unlimited' : capacity.toLocaleString() },
                      { label: 'Speakers', value: String(speakers.length) },
                      { label: 'Price', value: isFree ? 'Free' : `₹${price}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="text-xl font-extrabold text-white mb-0.5">{value}</div>
                        <div className="text-xs text-slate-500">{label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === 'Schedule' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <AgendaList items={agenda} />
                </motion.div>
              )}

              {tab === 'Speakers' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {speakers.length === 0 ? (
                    <div className="text-slate-400 italic py-4">No speakers announced yet.</div>
                  ) : (
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                      {speakers.map((s: any, idx: number) => (
                        <div key={idx} className="flex-shrink-0 w-[180px] p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-lg font-bold mb-3 mx-auto overflow-hidden bg-slate-800"
                            style={{ boxShadow: `0 0 15px rgba(0,120,212,0.2)` }}
                          >
                            {s.photo ? (
                              <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              (s.name || '?').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="font-semibold text-white text-sm text-center leading-tight">{s.name}</div>
                          <div className="text-xs text-slate-400 text-center mt-1 font-medium">{s.role}</div>
                          {s.company && <div className="text-[11px] text-[#0078d4] text-center mt-1">{s.company}</div>}
                          {s.linkedin && (
                            <div className="mt-3 flex justify-center">
                              <a href={s.linkedin} target="_blank" rel="noreferrer" className="text-xs text-slate-300 hover:text-white transition-colors border border-white/20 px-3 py-1 rounded-full">
                                LinkedIn
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {tab === 'Venue' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="font-semibold text-white mb-1">Event Location</div>
                    <div className="text-sm text-slate-400">{event.location || 'To be announced'}</div>
                  </div>
                  <div
                    className="w-full h-48 rounded-xl overflow-hidden relative"
                    style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}
                  >
                    {/* Map placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
                      <div
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0078d4] to-purple-600 flex items-center justify-center relative z-10"
                        style={{ boxShadow: '0 0 24px rgba(0,120,212,0.5)' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white">
                          <path d="M10 2a6 6 0 016 6c0 5-6 10-6 10S4 13 4 8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.5" />
                          <circle cx="10" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <div className="text-sm text-slate-300 text-center px-4 font-medium relative z-10">SRM University, AP</div>
                    </div>
                    {/* Grid lines to suggest a map */}
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(0,120,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,120,212,0.5) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right sidebar 30% */}
          <div className="lg:w-80 p-6 lg:border-l border-t lg:border-t-0 bg-slate-900/50" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {/* Countdown */}
            {event.status !== 'completed' && (
              <div className="mb-6">
                <div className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wider">Event starts in</div>
                <div className="flex gap-2">
                  {[
                    { v: time.days, l: 'Days' },
                    { v: time.hours, l: 'Hrs' },
                    { v: time.minutes, l: 'Min' },
                    { v: time.seconds, l: 'Sec' },
                  ].map(({ v, l }) => (
                    <div key={l} className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 flex flex-col items-center justify-center shadow-inner">
                      <div className="text-lg font-extrabold text-white font-mono">{pad(v)}</div>
                      <div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Capacity */}
            {!isUnlimited && (
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400 font-medium">{registeredCount.toLocaleString()} / {capacity.toLocaleString()} spots</span>
                  <span className={pct >= 85 ? 'text-amber-400 font-semibold' : 'text-slate-400 font-medium'}>{pct}% full</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 85 ? 'bg-amber-400' : 'bg-[#0078d4]'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                {pct >= 85 && pct < 100 && (
                  <div className="text-xs text-amber-400 mt-2 font-medium flex items-center gap-1.5">
                    <span>⚡</span> Only {capacity - registeredCount} spots left!
                  </div>
                )}
                {pct >= 100 && (
                  <div className="text-xs text-red-400 mt-2 font-bold flex items-center gap-1.5">
                    <span>🔥</span> Sold Out!
                  </div>
                )}
              </div>
            )}

            {/* Tier selection */}
            <div className="mb-6">
              <div className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wider">Ticket Tier</div>
              <div className="space-y-2">
                <div className={`p-4 rounded-xl border transition-all bg-[#0078d4]/10 border-[#0078d4] shadow-[0_0_15px_rgba(0,120,212,0.15)]`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm text-slate-200">
                      {event.form_requirements?.charge_type === 'per_team' ? 'Team Pass' : 'Standard Pass'}
                    </span>
                    <span className="font-bold text-[15px] text-white bg-white/10 px-2 py-0.5 rounded-md">
                      {isFree ? 'Free' : `₹${price}`}
                    </span>
                  </div>
                  <ul className="space-y-1 mt-3">
                    <li className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0078d4]"></span> Access to all sessions
                    </li>
                    <li className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0078d4]"></span> Official E-Certificate
                    </li>
                    {event.form_requirements?.charge_type === 'per_team' && (
                      <li className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Valid for {event.form_requirements?.max_team_size || 4} members
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA */}
            {event.status === 'completed' ? (
              <div className="text-center py-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="font-semibold text-slate-300 mb-1">Event Completed</div>
                <div className="text-xs text-slate-500 mb-3">Thank you to everyone who attended!</div>
                <button
                  onClick={onRegisterClick}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#0078d4] to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Open Event Portal
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                </button>
              </div>
            ) : !event.registration_open ? (
              <div className="text-center py-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <div className="font-semibold text-yellow-400 mb-1">Registrations Closed</div>
                <div className="text-xs text-yellow-500/70 mb-1">Keep an eye out for updates.</div>
              </div>
            ) : pct >= 100 && !isUnlimited ? (
              <div className="text-center py-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="font-semibold text-red-400 mb-1">Sold Out</div>
                <div className="text-xs text-red-500/70 mb-1">No more spots available.</div>
              </div>
            ) : (
              <button
                onClick={onRegisterClick}
                className="w-full py-3.5 rounded-xl text-[15px] font-bold text-white shadow-lg transition-all active:scale-[0.98] bg-gradient-to-r from-[#0078d4] to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-[0_0_20px_rgba(0,120,212,0.4)] flex items-center justify-center gap-2 cursor-pointer z-50 relative"
              >
                {isFree ? 'Register for Free' : `Register Now · ₹${price}`}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
              </button>
            )}

            <p className="text-[11px] text-slate-500 text-center mt-4">
              Secure checkout · Instant QR badge
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
