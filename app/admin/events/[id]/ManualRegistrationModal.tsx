"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { adminAddRegistration } from "./actions";
import { useRouter } from "next/navigation";

export default function ManualRegistrationModal({
  event,
  isOpen,
  onClose,
  onSuccess,
}: {
  event: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const reqs = event?.form_requirements || {};
  const teamsRequired = !!(reqs.allow_teams && (reqs.max_team_size || 1) > 1);
  const minTeamSize = reqs.min_team_size || 1;
  const maxTeamSize = reqs.max_team_size || 1;
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInternal, setIsInternal] = useState(true);
  const [teamSize, setTeamSize] = useState(teamsRequired ? minTeamSize : 1);
  
  const router = useRouter();

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const baseData: any = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      year: formData.get("year"),
    };

    if (isInternal) {
      if (!baseData.email.toString().toLowerCase().endsWith("@srmap.edu.in")) {
        setErrorMsg("Only @srmap.edu.in email addresses are allowed for SRMAP students.");
        setLoading(false);
        return;
      }
      if (reqs.req_reg_num) {
        const regNumVal = formData.get("regNum")?.toString() || "";
        if (!regNumVal.toUpperCase().startsWith("AP")) {
          setErrorMsg("SRMAP Registration Number must start with AP.");
          setLoading(false);
          return;
        }
        baseData.regNum = regNumVal;
      }
      if (reqs.req_branch) baseData.branch = formData.get("branch");
      if (reqs.req_spec) baseData.specialization = formData.get("specialization");
    } else {
      baseData.collegeName = formData.get("collegeName");
      baseData.city = formData.get("city");
    }

    const teamMembers = [];
    if (teamsRequired) {
      for (let i = 1; i < teamSize; i++) {
        const memberEmail = formData.get(`member_${i}_email`)?.toString() || "";
        if (!memberEmail.trim()) continue;

        if (isInternal && !memberEmail.toLowerCase().endsWith("@srmap.edu.in")) {
          setErrorMsg(`Member ${i + 1} must use an @srmap.edu.in email address.`);
          setLoading(false);
          return;
        }

        const member: any = {
          fullName: formData.get(`member_${i}_name`),
          email: memberEmail,
          year: formData.get(`member_${i}_year`),
        };
        
        if (isInternal) {
          if (reqs.req_reg_num) {
            const memberRegNum = formData.get(`member_${i}_regNum`)?.toString() || "";
            if (!memberRegNum.toUpperCase().startsWith("AP")) {
              setErrorMsg(`Member ${i + 1}'s Registration Number must start with AP.`);
              setLoading(false);
              return;
            }
            member.regNum = memberRegNum;
          }
          if (reqs.req_branch) member.branch = formData.get(`member_${i}_branch`);
          if (reqs.req_spec) member.spec = formData.get(`member_${i}_spec`);
        }
        teamMembers.push(member);
      }
      
      baseData.teamMembers = teamMembers;
      baseData.teamName = formData.get("teamName");
      baseData.lookingForMembers = false;
      baseData.maxTeamSize = teamSize;
    }

    try {
      const res = await adminAddRegistration(event.id, baseData);
      if (res?.error) {
        setErrorMsg(res.error);
      } else if (res?.success) {
        onSuccess();
        onClose();
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred.");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl relative flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Add Manual Registration</h2>
            <p className="text-sm text-slate-400 mt-1">
              Bypass payment and waitlist to manually add a participant/team.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="manual-reg-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-semibold">
                {errorMsg}
              </div>
            )}

            {reqs.allow_external_students && (
              <div className="flex flex-col gap-3 p-5 bg-[#0078d4]/10 border border-[#0078d4]/20 rounded-xl">
                <h4 className="text-[13px] font-bold text-[#0078d4] uppercase tracking-wider">
                  Student Type
                </h4>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="student_type"
                      checked={isInternal}
                      onChange={() => setIsInternal(true)}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-sm font-semibold text-white">SRMAP Student</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="student_type"
                      checked={!isInternal}
                      onChange={() => setIsInternal(false)}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-sm font-semibold text-white/80">External Student</span>
                  </label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Enter full name"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder={isInternal ? "username@srmap.edu.in" : "email@example.com"}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                />
              </div>

              {isInternal && reqs.req_reg_num && (
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="regNum"
                    required
                    placeholder="e.g. AP21110010001"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                  />
                </div>
              )}

              {isInternal && reqs.req_branch && (
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                    Branch / Program
                  </label>
                  <select
                    name="branch"
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all appearance-none"
                  >
                    <option value="">Select Branch</option>
                    <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                    <option value="B.Tech Electronics">B.Tech Electronics</option>
                    <option value="B.Tech Mechanical">B.Tech Mechanical</option>
                    <option value="B.Tech Civil">B.Tech Civil</option>
                    <option value="B.Tech Electrical">B.Tech Electrical</option>
                    <option value="BBA">BBA</option>
                    <option value="BSc">BSc</option>
                    <option value="BA">BA</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              {!isInternal && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                      College/University Name
                    </label>
                    <input
                      type="text"
                      name="collegeName"
                      required
                      placeholder="Enter college name"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="Enter city"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                  Year of Study
                </label>
                <select
                  name="year"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all appearance-none"
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {teamsRequired && (
              <div className="mt-8 border-t border-white/10 pt-8">
                <div className="flex flex-col gap-2 mb-6">
                  <h3 className="text-lg font-bold text-white">Team Details</h3>
                  <p className="text-slate-400 text-sm">
                    This event requires teams. Min: {minTeamSize}, Max: {maxTeamSize}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 mb-6">
                  <label className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                    Team Name
                  </label>
                  <input
                    type="text"
                    name="teamName"
                    required
                    placeholder="Enter team name"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                  />
                </div>

                <div className="space-y-8">
                  {Array.from({ length: teamSize - 1 }).map((_, i) => (
                    <div key={`member_${i + 1}`} className="bg-white/5 border border-white/10 rounded-xl p-6 relative">
                      <div className="absolute top-4 right-4 flex gap-2">
                        {i === teamSize - 2 && teamSize > minTeamSize && (
                          <button
                            type="button"
                            onClick={() => setTeamSize((s: number) => Math.max(minTeamSize, s - 1))}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      
                      <h4 className="text-white font-bold mb-4">Team Member {i + 2}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name={`member_${i + 1}_name`}
                            required
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                            Email
                          </label>
                          <input
                            type="email"
                            name={`member_${i + 1}_email`}
                            required
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-all"
                          />
                        </div>

                        {isInternal && reqs.req_reg_num && (
                          <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                              Registration Number
                            </label>
                            <input
                              type="text"
                              name={`member_${i + 1}_regNum`}
                              required
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-all"
                            />
                          </div>
                        )}
                        
                        {isInternal && reqs.req_branch && (
                          <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                              Branch
                            </label>
                            <input
                              type="text"
                              name={`member_${i + 1}_branch`}
                              required
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-all"
                            />
                          </div>
                        )}
                        
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                            Year
                          </label>
                          <select
                            name={`member_${i + 1}_year`}
                            required
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-all"
                          >
                            <option value="">Select Year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {teamSize < maxTeamSize && (
                  <button
                    type="button"
                    onClick={() => setTeamSize((s: number) => Math.min(maxTeamSize, s + 1))}
                    className="mt-4 w-full py-3 rounded-xl border border-dashed border-white/20 text-slate-400 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                  >
                    <Plus size={16} /> Add Another Member
                  </button>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-white/10 bg-[#18181b] shrink-0 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="manual-reg-form"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : null}
            {loading ? "Adding..." : "Add Registration"}
          </button>
        </div>
      </div>
    </div>
  );
}
