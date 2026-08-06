"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { triggerHaptic } from "@/utils/haptic";
import {
  Settings,
  User,
  Shield,
  Upload,
  CheckCircle2,
  AlertCircle,
  Save,
  Key,
  Database,
  Lock,
} from "lucide-react";

const compressAndConvertImage = async (
  file: File,
  maxW = 500,
  maxH = 500,
  quality = 0.7,
): Promise<File> => {
  if (typeof window === "undefined" || !window.FileReader) return file;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(
                new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                  type: "image/webp",
                  lastModified: Date.now(),
                }),
              );
            } else resolve(file);
          },
          "image/webp",
          quality,
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export default function SettingsTab() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [msg, setMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from("member_profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    if (data) setProfile(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    triggerHaptic("light");

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      role: formData.get("role"),
      bio: formData.get("bio"),
      linkedin_url: formData.get("linkedin_url"),
      github_url: formData.get("github_url"),
    };

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const { error } = await supabase
        .from("member_profiles")
        .update(payload)
        .eq("id", session.user.id);
      if (error) throw error;

      setMsg({
        text: "Admin profile preferences updated successfully!",
        type: "success",
      });
      fetchProfile();
    } catch (err: any) {
      setMsg({ text: err.message || "Failed to save settings", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setMsg(null);

    try {
      const compressed = await compressAndConvertImage(file);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const fileName = `avatar_${session.user.id}_${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("webpage")
        .upload(`avatars/${fileName}`, compressed);
      if (uploadError) throw uploadError;

      const { data: pubData } = supabase.storage
        .from("webpage")
        .getPublicUrl(`avatars/${fileName}`);

      const avatarUrl = pubData.publicUrl;

      const { error: updateError } = await supabase
        .from("member_profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", session.user.id);
      if (updateError) throw updateError;

      setMsg({ text: "Profile avatar updated!", type: "success" });
      fetchProfile();
    } catch (err: any) {
      setMsg({ text: err.message || "Failed avatar upload", type: "error" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div>
        <span className="text-[10px] font-mono text-[#a4d8ff] tracking-widest uppercase">
          &#47;&#47; CONFIGURATION &amp; PREFERENCES
        </span>
        <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
          Portal & Account Settings
        </h1>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-3 ${
            msg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs animate-pulse">
          Loading settings preferences...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Avatar Card */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6 flex flex-col items-center text-center">
            <div className="relative group">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name || "Avatar"}
                  className="w-28 h-28 rounded-3xl object-cover border-2 border-[#0078d4] shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#0078d4] to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                  {profile?.email ? profile.email.charAt(0).toUpperCase() : "A"}
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-3xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 cursor-pointer backdrop-blur-xs"
              >
                <Upload className="w-4 h-4" />
                <span>{uploadingAvatar ? "Uploading..." : "Change"}</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />

            <div>
              <h3 className="font-syne font-bold text-lg text-white">
                {profile?.name || profile?.email?.split("@")[0]}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {profile?.email}
              </p>
              <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-[#0078d4]/10 text-[#a4d8ff] border border-[#0078d4]/30 text-[10px] font-mono uppercase">
                {profile?.role || "Core Member"}
              </span>
            </div>
          </div>

          {/* Right Side: Account Settings Form */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
            <h3 className="font-syne font-bold text-base text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#0078d4]" />
              Admin Profile Information
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={profile?.name || ""}
                    placeholder="Your Full Name"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    name="role"
                    defaultValue={profile?.role || "Admin"}
                    placeholder="Community Lead / Admin"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bio / Profile Tagline
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  defaultValue={profile?.bio || ""}
                  placeholder="Short bio..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedin_url"
                    defaultValue={profile?.linkedin_url || ""}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    name="github_url"
                    defaultValue={profile?.github_url || ""}
                    placeholder="https://github.com/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#0078d4] hover:bg-[#0060aa] text-white text-xs font-semibold shadow-lg shadow-[#0078d4]/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Preferences"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
