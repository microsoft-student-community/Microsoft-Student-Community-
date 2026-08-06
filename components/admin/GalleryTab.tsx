"use client";

import React, { useState } from "react";
import { triggerHaptic } from "@/utils/haptic";
import {
  Image as ImageIcon,
  Search,
  Plus,
  Trash2,
  Copy,
  Check,
  X,
  Eye,
  Calendar,
  Sparkles,
} from "lucide-react";

interface GalleryTabProps {
  gallery: any[];
  loadingGallery: boolean;
  fetchGallery: () => void;
  supabase: any;
  showStatus: (
    id: string,
    msg: string,
    type: "error" | "success" | "info",
  ) => void;
}

export default function GalleryTab({
  gallery,
  loadingGallery,
  fetchGallery,
  supabase,
  showStatus,
}: GalleryTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = Array.from(
    new Set(gallery.map((g) => g.category).filter(Boolean)),
  );

  const filteredGallery = gallery.filter((item) => {
    const titleMatch = item.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const categoryMatch =
      categoryFilter === "all" || item.category === categoryFilter;
    return titleMatch && categoryMatch;
  });

  async function handleCreateGallery(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const imageFile = formData.get("image") as File;

    try {
      showStatus("gallery_create", "Uploading image asset...", "info");
      let imageUrl = "";

      if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `gallery_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("webpage")
          .upload(`gallery/${fileName}`, imageFile);

        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from("webpage")
          .getPublicUrl(`gallery/${fileName}`);
        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("gallery_items").insert({
        title: formData.get("title"),
        category: formData.get("category") || "Event",
        image_url: imageUrl,
      });

      if (error) throw error;

      showStatus("gallery_create", "Media asset added to gallery!", "success");
      setIsModalOpen(false);
      fetchGallery();
    } catch (err: any) {
      showStatus(
        "gallery_create",
        err.message || "Failed to upload image",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteGallery(id: string) {
    if (!confirm("Are you sure you want to delete this media asset?")) return;
    try {
      triggerHaptic("medium");
      showStatus("gallery_delete", "Deleting media asset...", "info");
      const { error } = await supabase
        .from("gallery_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
      showStatus("gallery_delete", "Media asset deleted!", "success");
      fetchGallery();
    } catch (err: any) {
      showStatus(
        "gallery_delete",
        err.message || "Failed to delete image",
        "error",
      );
    }
  }

  const handleCopyUrl = (url: string, id: string) => {
    triggerHaptic("light");
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#a4d8ff] tracking-widest uppercase">
            &#47;&#47; CONTENT ASSET LIBRARY
          </span>
          <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Media & Photo Gallery ({gallery.length})
          </h1>
        </div>

        <button
          onClick={() => {
            triggerHaptic("light");
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#0078d4] hover:bg-[#0060aa] text-white text-xs font-semibold shadow-lg shadow-[#0078d4]/20 flex items-center gap-2 shrink-0 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Media Asset</span>
        </button>
      </div>

      {/* Toolbar Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by caption or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-[#0078d4]"
          />
        </div>

        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 focus:outline-none focus:border-[#0078d4]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Media Grid Canvas */}
      {loadingGallery ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs animate-pulse">
          Loading media library...
        </div>
      ) : filteredGallery.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 font-mono text-xs">
          No media assets found matching search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={item.image_url}
                  alt={item.title || "Gallery image"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                  <button
                    onClick={() => setPreviewImage(item.image_url)}
                    className="p-2 rounded-xl bg-slate-800/90 text-white hover:bg-slate-700 transition-colors"
                    title="Preview Image"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopyUrl(item.image_url, item.id)}
                    className="p-2 rounded-xl bg-slate-800/90 text-white hover:bg-[#0078d4] transition-colors"
                    title="Copy Image URL"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteGallery(item.id)}
                    className="p-2 rounded-xl bg-slate-800/90 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    title="Delete Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Meta Details */}
              <div className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-semibold">
                    {item.category || "Event"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(
                      item.created_at || Date.now(),
                    ).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white truncate">
                  {item.title || "Untitled Showcase Photo"}
                </h4>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] p-4 bg-black/90 backdrop-blur-md flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-800">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-contain max-h-[85vh]"
            />
          </div>
        </div>
      )}

      {/* Upload Media Drawer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0e1424] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <h3 className="font-syne font-bold text-base text-white">
                Upload Media Asset
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGallery} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Title / Caption
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Keynote Speaker Group Photo"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  defaultValue="Event"
                  placeholder="Event / Workshop / Showcase"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Image File *
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  required
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
                  {isSubmitting ? "Uploading..." : "Upload Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
