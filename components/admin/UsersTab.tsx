"use client";

import React, { useState } from "react";
import { triggerHaptic } from "@/utils/haptic";
import {
  ShieldCheck,
  Search,
  Key,
  Trash2,
  X,
  UserCheck,
  Shield,
  User,
  AlertTriangle,
} from "lucide-react";

interface UsersTabProps {
  users: any[];
  loadingUsers: boolean;
  fetchUsers: () => void;
  supabase: any;
  showStatus: (
    id: string,
    msg: string,
    type: "error" | "success" | "info",
  ) => void;
  userRole: "admin" | "core_member" | null;
}

export default function UsersTab({
  users,
  loadingUsers,
  fetchUsers,
  supabase,
  showStatus,
  userRole,
}: UsersTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [resettingUser, setResettingUser] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [resetModalError, setResetModalError] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [deletingUser, setDeletingUser] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const filteredUsers = users.filter((u) => {
    const emailMatch = u.email
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const roleMatch = roleFilter === "all" || u.role === roleFilter;
    return emailMatch && roleMatch;
  });

  async function handleConfirmResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resettingUser || !newPasswordValue.trim()) return;
    setIsResettingPassword(true);
    setResetModalError(null);
    try {
      triggerHaptic("light");
      showStatus("user_reset", "Updating user password...", "info");
      const res = await fetch("/api/admin/reset-user-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: resettingUser.id,
          newPassword: newPasswordValue.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      showStatus(
        "user_reset",
        `Password updated for ${resettingUser.email}`,
        "success",
      );
      setResettingUser(null);
      setNewPasswordValue("");
    } catch (err: any) {
      setResetModalError(err.message || "An unexpected error occurred");
      showStatus(
        "user_reset",
        err.message || "Failed to reset password",
        "error",
      );
    } finally {
      setIsResettingPassword(false);
    }
  }

  async function handleConfirmDeleteUser() {
    if (!deletingUser) return;
    try {
      triggerHaptic("medium");
      showStatus(
        "user_del",
        `Deleting account ${deletingUser.email}...`,
        "info",
      );
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: deletingUser.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");
      showStatus("user_del", `Deleted user ${deletingUser.email}`, "success");
      setDeletingUser(null);
      fetchUsers();
    } catch (err: any) {
      showStatus("user_del", err.message || "Failed to delete user", "error");
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#a4d8ff] tracking-widest uppercase">
            &#47;&#47; ACCESS CONTROL &amp; ACCOUNTS
          </span>
          <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Member Accounts ({users.length})
          </h1>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user account email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-[#0078d4]"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "admin", "core_member"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-all ${
                roleFilter === r
                  ? "bg-[#0078d4] text-white"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              {r === "core_member" ? "Core" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      {loadingUsers ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs animate-pulse">
          Loading user accounts...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 font-mono text-xs">
          No user accounts found matching query.
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  <th className="py-3.5 px-4">User Account</th>
                  <th className="py-3.5 px-4">Role Access</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Security Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredUsers.map((u) => {
                  const role = u.role || "core_member";
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0078d4] to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {u.email?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-white group-hover:text-[#a4d8ff] transition-colors block">
                              {u.email}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              ID: {u.id?.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                            role === "admin"
                              ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                              : "bg-[#0078d4]/10 text-[#a4d8ff] border-[#0078d4]/30"
                          }`}
                        >
                          {role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              setResettingUser({ id: u.id, email: u.email })
                            }
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors"
                            title="Reset Account Password"
                          >
                            <Key className="w-3.5 h-3.5 text-amber-400" />
                            <span>Reset Password</span>
                          </button>
                          <button
                            onClick={() =>
                              setDeletingUser({ id: u.id, email: u.email })
                            }
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0e1424] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <h3 className="font-syne font-bold text-base text-white">
                Reset Account Password
              </h3>
              <button
                onClick={() => setResettingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleConfirmResetPassword}
              className="p-6 space-y-4"
            >
              <p className="text-xs text-slate-400 font-light">
                Setting new password for account:{" "}
                <span className="font-semibold text-white">
                  {resettingUser.email}
                </span>
              </p>

              {resetModalError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {resetModalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword || !newPasswordValue.trim()}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs shadow-md disabled:opacity-50"
                >
                  {isResettingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirm Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0e1424] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-syne font-bold text-base text-white">
                Delete Account Confirmation
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Are you sure you want to permanently delete account{" "}
              <span className="font-semibold text-white">
                {deletingUser.email}
              </span>
              ? This operation cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
