"use client";

import React, { useState } from "react";
import { triggerHaptic } from "@/utils/haptic";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  LayoutGrid,
  List,
  UserCheck,
  Building,
} from "lucide-react";

interface TeamTabProps {
  team: any[];
  loadingTeam: boolean;
  fetchTeam: () => void;
  supabase: any;
  showStatus: (
    id: string,
    msg: string,
    type: "error" | "success" | "info",
  ) => void;
}

export default function TeamTab({
  team,
  loadingTeam,
  fetchTeam,
  supabase,
  showStatus,
}: TeamTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = Array.from(
    new Set(team.map((m) => m.department || m.domain).filter(Boolean)),
  );

  const filteredTeam = team.filter((m) => {
    const nameMatch = m.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = m.role?.toLowerCase().includes(searchTerm.toLowerCase());
    const deptMatch =
      departmentFilter === "all" ||
      (m.department || m.domain) === departmentFilter;
    return (nameMatch || roleMatch) && deptMatch;
  });

  const openCreateModal = () => {
    triggerHaptic("light");
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const openEditModal = (m: any) => {
    triggerHaptic("light");
    setEditingMember(m);
    setIsModalOpen(true);
  };

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const imageFile = formData.get("image") as File;
    let imageUrl = editingMember?.image_url || "";

    try {
      showStatus("team_save", "Updating roster payload...", "info");

      if (imageFile && imageFile.size > 0) {
        const ext = imageFile.name.split(".").pop();
        const fileName = `team_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("webpage")
          .upload(`team/${fileName}`, imageFile);
        if (uploadError) throw uploadError;
        const { data: pub } = supabase.storage
          .from("webpage")
          .getPublicUrl(`team/${fileName}`);
        imageUrl = pub.publicUrl;
      }

      const payload = {
        name: formData.get("name"),
        role: formData.get("role"),
        department: formData.get("department"),
        bio: formData.get("bio"),
        image_url: imageUrl,
        linkedin_url: formData.get("linkedin_url"),
        github_url: formData.get("github_url"),
        twitter_url: formData.get("twitter_url"),
        display_order: parseInt(formData.get("display_order") as string) || 0,
      };

      if (editingMember) {
        const { error } = await supabase
          .from("team_members")
          .update(payload)
          .eq("id", editingMember.id);
        if (error) throw error;
        showStatus("team_save", "Member updated!", "success");
      } else {
        const { error } = await supabase.from("team_members").insert(payload);
        if (error) throw error;
        showStatus("team_save", "Member added!", "success");
      }
      setIsModalOpen(false);
      fetchTeam();
    } catch (err: any) {
      showStatus("team_save", err.message || "Failed to save member", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteMember(id: string) {
    if (!confirm("Remove this team member?")) return;
    try {
      triggerHaptic("medium");
      showStatus("team_del", "Removing team member...", "info");
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);
      if (error) throw error;
      showStatus("team_del", "Member removed!", "success");
      fetchTeam();
    } catch (err: any) {
      showStatus("team_del", err.message || "Failed to remove member", "error");
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#a4d8ff] tracking-widest uppercase">
            &#47;&#47; ROSTER DIRECTORY
          </span>
          <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Core Team Roster ({team.length})
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#0078d4] hover:bg-[#0060aa] text-white text-xs font-semibold shadow-lg shadow-[#0078d4]/20 flex items-center gap-2 shrink-0 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Core Member</span>
        </button>
      </div>

      {/* Toolbar Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or role title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-[#0078d4]"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {departments.length > 0 && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 focus:outline-none focus:border-[#0078d4]"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-[#0078d4] text-white"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table"
                  ? "bg-[#0078d4] text-white"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loadingTeam ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs animate-pulse">
          Loading team roster...
        </div>
      ) : filteredTeam.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 font-mono text-xs">
          No team members match the search query.
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeam.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group relative"
            >
              <span className="absolute top-4 right-4 px-2 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-slate-400 border border-slate-700">
                #{m.display_order ?? 0}
              </span>

              <div className="flex flex-col items-center text-center space-y-3 pt-2">
                {m.image_url ? (
                  <img
                    src={m.image_url}
                    alt={m.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700/80 shadow-md group-hover:border-[#0078d4] transition-colors"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0078d4] to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {m.name ? m.name.charAt(0) : "M"}
                  </div>
                )}

                <div>
                  <h3 className="font-syne font-bold text-base text-white group-hover:text-[#a4d8ff] transition-colors">
                    {m.name}
                  </h3>
                  <span className="text-xs text-[#0078d4] font-medium block">
                    {m.role}
                  </span>
                  {(m.department || m.domain) && (
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[10px] font-mono border border-purple-500/20">
                      {m.department || m.domain}
                    </span>
                  )}
                </div>

                {m.bio && (
                  <p className="text-[11px] text-slate-400 font-light line-clamp-2">
                    {m.bio}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  {m.linkedin_url && (
                    <a
                      href={m.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <i className="fa-brands fa-linkedin text-sm" />
                    </a>
                  )}
                  {m.github_url && (
                    <a
                      href={m.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <i className="fa-brands fa-github text-sm" />
                    </a>
                  )}
                  {m.twitter_url && (
                    <a
                      href={m.twitter_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-sky-400 transition-colors"
                    >
                      <i className="fa-brands fa-twitter text-sm" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(m)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(m.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Member Info</th>
                  <th className="py-3.5 px-4">Role Title</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Social Handles</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredTeam.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      #{m.display_order ?? 0}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {m.image_url ? (
                          <img
                            src={m.image_url}
                            alt={m.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold">
                            {m.name?.charAt(0)}
                          </div>
                        )}
                        <span className="font-semibold text-white group-hover:text-[#a4d8ff] transition-colors">
                          {m.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {m.role}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[10px] font-mono border border-purple-500/20">
                        {m.department || m.domain || "General"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        {m.linkedin_url && (
                          <a
                            href={m.linkedin_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <i className="fa-brands fa-linkedin text-sm hover:text-blue-400" />
                          </a>
                        )}
                        {m.github_url && (
                          <a
                            href={m.github_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <i className="fa-brands fa-github text-sm hover:text-white" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(m.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Team Member Drawer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#0e1424] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <h3 className="font-syne font-bold text-base text-white">
                {editingMember ? "Edit Core Member" : "Add Core Team Member"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingMember?.name || ""}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    name="role"
                    required
                    defaultValue={editingMember?.role || ""}
                    placeholder="e.g. Technical Lead / Lead Developer"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department / Domain
                  </label>
                  <input
                    type="text"
                    name="department"
                    defaultValue={
                      editingMember?.department ||
                      editingMember?.domain ||
                      "Web Dev"
                    }
                    placeholder="Technical / PR / Design / Operations"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Display Order (#)
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    defaultValue={editingMember?.display_order ?? 1}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bio / Summary
                </label>
                <textarea
                  name="bio"
                  rows={2}
                  defaultValue={editingMember?.bio || ""}
                  placeholder="Short background profile..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedin_url"
                    defaultValue={editingMember?.linkedin_url || ""}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    name="github_url"
                    defaultValue={editingMember?.github_url || ""}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    name="twitter_url"
                    defaultValue={editingMember?.twitter_url || ""}
                    placeholder="https://x.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Profile Photo Upload
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#0078d4] file:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0078d4] hover:bg-[#0060aa] text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingMember
                      ? "Update Member"
                      : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
