import { QRCodeSVG } from 'qrcode.react'

interface AttendeeBadge {
  id: string
  name: string
  regNum: string
  email: string
  teamName: string
  role: 'TEAM LEADER' | 'MEMBER' | 'PARTICIPANT'
  college: string
  hashPayload: string
}

export default function IDCardModal({
  isOpen,
  onClose,
  registrations,
  eventTitle
}: {
  isOpen: boolean
  onClose: () => void
  registrations: any[]
  eventTitle: string
}) {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  // Generate the check-in URL for a registration hash
  const getQrUrl = (hash: string) => {
    return typeof window !== 'undefined' ? `${window.location.origin}/admin/checkin/${hash}` : ''
  }

  // Flatten registrations to generate an individual ID badge for each attendee (Team Leader + All Members)
  const attendeeBadges: AttendeeBadge[] = registrations.flatMap((reg) => {
    const badges: AttendeeBadge[] = []
    const isTeam = Boolean(reg.team_data || (reg.team_data?.members && reg.team_data.members.length > 0))
    const teamName = reg.team_data?.teamName || reg.team_data?.team_name || ''
    const college = reg.form_data?.collegeName || 'SRM University AP'

    // 1. Team Leader / Primary Attendee
    badges.push({
      id: `${reg.id}-lead`,
      name: reg.form_data?.fullName || 'Team Leader',
      regNum: reg.form_data?.regNum || '',
      email: reg.lead_email || '',
      teamName: teamName,
      role: isTeam ? 'TEAM LEADER' : 'PARTICIPANT',
      college: college,
      hashPayload: reg.hash_payload
    })

    // 2. Normal Team Members
    if (reg.team_data?.members && Array.isArray(reg.team_data.members)) {
      reg.team_data.members.forEach((member: any, idx: number) => {
        if (member && (member.fullName || member.email || member.regNum)) {
          badges.push({
            id: `${reg.id}-m-${idx}`,
            name: member.fullName || `Member ${idx + 2}`,
            regNum: member.regNum || '',
            email: member.email || '',
            teamName: teamName,
            role: 'MEMBER',
            college: college,
            hashPayload: reg.hash_payload
          })
        }
      })
    }

    return badges
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm print:bg-white print:backdrop-blur-none">
      
      {/* Non-Printable Modal Controls */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center bg-black/50 border-b border-white/10 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-white">ID Card Preview ({attendeeBadges.length} Badges)</h2>
          <p className="text-xs text-white/50">{registrations.length} team(s) selected • Ready for printing</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <i className="fas fa-print"></i> Print Badges ({attendeeBadges.length})
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="w-full h-full pt-24 pb-10 overflow-y-auto print:p-0 print:overflow-visible">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 print:gap-4 print:justify-start">
          
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page { size: A4; margin: 10mm; }
              body * { visibility: hidden; }
              #printable-badges, #printable-badges * { visibility: visible; }
              #printable-badges { position: absolute; left: 0; top: 0; width: 100%; display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-start; }
              .id-badge { page-break-inside: avoid; border: 1.5px solid #d1d5db !important; background-color: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          `}} />

          <div id="printable-badges" className="flex flex-wrap justify-center gap-6 print:gap-4">
            {attendeeBadges.map((badge) => (
              <div 
                key={badge.id} 
                className="id-badge w-[220px] h-[350px] bg-white border border-gray-300 rounded-xl overflow-hidden flex flex-col items-center justify-between p-4 shadow-xl print:shadow-none relative"
                style={{ width: '220px', height: '350px' }}
              >
                {/* Header Banner */}
                <div className={`absolute top-0 w-full h-10 ${badge.role === 'TEAM LEADER' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-800'} flex items-center justify-center px-2`}>
                  <span className="text-[10px] font-black text-white tracking-widest uppercase truncate text-center w-full">
                    {eventTitle}
                  </span>
                </div>

                {/* Badge Content */}
                <div className="mt-11 w-full flex flex-col items-center flex-grow">
                  {/* Participant Name */}
                  <h3 className="text-base font-black text-gray-900 text-center leading-tight mb-1 break-words w-full px-1 line-clamp-2">
                    {badge.name}
                  </h3>
                  
                  {/* Registration Number */}
                  {badge.regNum && (
                    <span className="text-xs font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mb-1">
                      {badge.regNum}
                    </span>
                  )}

                  {/* SRM Official Email */}
                  {badge.email && (
                    <p className="text-[9px] font-medium text-gray-500 text-center truncate max-w-[200px] mb-2" title={badge.email}>
                      {badge.email}
                    </p>
                  )}

                  {/* QR Code */}
                  <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm mb-2">
                    <QRCodeSVG value={getQrUrl(badge.hashPayload)} size={100} level="M" />
                  </div>

                  {/* Role / Team Label Footer */}
                  <div className="mt-auto w-full flex flex-col items-center">
                    {badge.teamName && (
                      <span className="text-[9px] text-gray-600 font-bold uppercase truncate max-w-[200px] mb-1">
                        TEAM: {badge.teamName}
                      </span>
                    )}
                    <div className={`w-full py-1 rounded text-center border ${
                      badge.role === 'TEAM LEADER' 
                        ? 'bg-blue-100 border-blue-300 text-blue-800' 
                        : 'bg-gray-100 border-gray-200 text-gray-700'
                    }`}>
                      <span className="text-[10px] font-black tracking-widest uppercase">
                        {badge.role}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
