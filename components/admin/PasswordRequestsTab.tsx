"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { triggerHaptic } from "@/utils/haptic";
import {
  acceptPasswordRequest,
  rejectPasswordRequest,
} from "@/app/admin/password_actions";
import {
  ShieldAlert,
  RotateCw,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Clock,
  Key,
  ShieldCheck,
} from "lucide-react";

export default function PasswordRequestsTab() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("password_reset_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (data) setRequests(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleAccept(
    reqId: string,
    email: string,
    newPassword: string,
  ) {
    triggerHaptic("light");
    setActionLoading(reqId);
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await acceptPasswordRequest(reqId, email, newPassword);
    if (res.error) setErrorMsg(res.error);
    else {
      setSuccessMsg(`Password reset successfully approved for ${email}.`);
      fetchRequests();
    }
    setActionLoading(null);
  }

  async function handleReject(reqId: string, email: string) {
    triggerHaptic("light");
    setActionLoading(reqId);
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await rejectPasswordRequest(reqId);
    if (res.error) setErrorMsg(res.error);
    else {
      setSuccessMsg(`Rejected password request for ${email}.`);
      fetchRequests();
    }
    setActionLoading(null);
  }

  const handleCopyPassword = (pwd: string, id: string) => {
    triggerHaptic("light");
    navigator.clipboard.writeText(pwd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase">
            &#47;&#47; SECURITY QUEUE
          </span>
          <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Password Reset Queue ({requests.length})
          </h1>
        </div>

        <button
          onClick={fetchRequests}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer"
        >
          <RotateCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>Refresh Queue</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          {successMsg}
        </div>
      )}

      {/* Requests Queue Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs animate-pulse">
          Fetching reset queue...
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 font-mono text-xs space-y-2">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto opacity-80" />
          <p>No pending password reset requests in queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase">
                    Pending Approval
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(
                      req.created_at || Date.now(),
                    ).toLocaleTimeString()}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">
                    Requested Account
                  </h4>
                  <p className="text-sm font-semibold text-white truncate">
                    {req.email}
                  </p>
                </div>

                {req.requested_password && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500">
                      Requested New Password:
                    </span>
                    <div className="flex items-center justify-between">
                      <code className="text-xs text-emerald-400 font-mono">
                        {req.requested_password}
                      </code>
                      <button
                        onClick={() =>
                          handleCopyPassword(req.requested_password, req.id)
                        }
                        className="p-1 rounded text-slate-400 hover:text-white"
                        title="Copy Password"
                      >
                        {copiedId === req.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() =>
                    handleAccept(req.id, req.email, req.requested_password)
                  }
                  disabled={actionLoading === req.id}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Reset</span>
                </button>
                <button
                  onClick={() => handleReject(req.id, req.email)}
                  disabled={actionLoading === req.id}
                  className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-semibold text-xs flex items-center justify-center transition-all disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
