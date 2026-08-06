"use client";

import React, { useState } from "react";
import { triggerHaptic } from "@/utils/haptic";
import {
  FileText,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  X,
  ExternalLink,
} from "lucide-react";

interface BlogsTabProps {
  blogs: any[];
  loadingBlogs: boolean;
  fetchBlogs: () => void;
  supabase: any;
  showStatus: (
    id: string,
    msg: string,
    type: "error" | "success" | "info",
  ) => void;
}

export default function BlogsTab({
  blogs,
  loadingBlogs,
  fetchBlogs,
  supabase,
  showStatus,
}: BlogsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredBlogs = blogs.filter((b) => {
    const titleMatch =
      b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "published" && b.is_published !== false) ||
      (statusFilter === "draft" && b.is_published === false);
    return titleMatch && statusMatch;
  });

  const openCreateModal = () => {
    triggerHaptic("light");
    setEditingBlog(null);
    setIsModalOpen(true);
  };

  const openEditModal = (blog: any) => {
    triggerHaptic("light");
    setEditingBlog(blog);
    setIsModalOpen(true);
  };

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const imageFile = formData.get("cover_image") as File;
    let coverUrl = editingBlog?.cover_image || "";

    try {
      showStatus("blog_save", "Processing article payload...", "info");
      if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `blog_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("webpage")
          .upload(`blogs/${fileName}`, imageFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from("webpage")
          .getPublicUrl(`blogs/${fileName}`);
        coverUrl = publicUrlData.publicUrl;
      }

      const rawTitle = formData.get("title") as string;
      const slug =
        formData.get("slug") ||
        rawTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

      const payload = {
        title: rawTitle,
        slug: slug,
        author: formData.get("author") || "MSC Editorial Team",
        read_time: formData.get("read_time") || "5 min read",
        excerpt: formData.get("excerpt"),
        content: formData.get("content"),
        cover_image: coverUrl,
        is_published: formData.get("is_published") === "on",
      };

      if (editingBlog) {
        const { error } = await supabase
          .from("blogs")
          .update(payload)
          .eq("id", editingBlog.id);
        if (error) throw error;
        showStatus("blog_save", "Article updated!", "success");
      } else {
        const { error } = await supabase.from("blogs").insert(payload);
        if (error) throw error;
        showStatus("blog_save", "New article created!", "success");
      }

      setIsModalOpen(false);
      fetchBlogs();
    } catch (err: any) {
      showStatus("blog_save", err.message || "Failed to save article", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      triggerHaptic("medium");
      showStatus("blog_del", "Deleting article...", "info");
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) throw error;
      showStatus("blog_del", "Article deleted!", "success");
      fetchBlogs();
    } catch (err: any) {
      showStatus("blog_del", err.message || "Failed to delete", "error");
    }
  }

  async function handleTogglePublish(id: string, currentState: boolean) {
    try {
      triggerHaptic("light");
      const { error } = await supabase
        .from("blogs")
        .update({ is_published: !currentState })
        .eq("id", id);
      if (!error) fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#a4d8ff] tracking-widest uppercase">
            &#47;&#47; EDITORIAL &amp; ARTICLES
          </span>
          <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Knowledge Articles & Stories ({blogs.length})
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#0078d4] hover:bg-[#0060aa] text-white text-xs font-semibold shadow-lg shadow-[#0078d4]/20 flex items-center gap-2 shrink-0 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Toolbar Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by article title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-[#0078d4]"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["all", "published", "draft"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-all ${
                statusFilter === st
                  ? "bg-[#0078d4] text-white"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Table View */}
      {loadingBlogs ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs animate-pulse">
          Loading editorial articles...
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 font-mono text-xs">
          No articles match current filters.
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  <th className="py-3.5 px-4">Article</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Read Time</th>
                  <th className="py-3.5 px-4">Published Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredBlogs.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {item.cover_image ? (
                          <img
                            src={item.cover_image}
                            alt={item.title}
                            className="w-12 h-10 rounded-lg object-cover border border-slate-700/80 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-semibold text-white group-hover:text-[#a4d8ff] transition-colors block truncate max-w-sm">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            /{item.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {item.author || "MSC Team"}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {item.read_time || "5 min read"}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {new Date(
                        item.created_at || Date.now(),
                      ).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() =>
                          handleTogglePublish(
                            item.id,
                            item.is_published !== false,
                          )
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold cursor-pointer transition-all ${
                          item.is_published !== false
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {item.is_published !== false ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Live
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Draft
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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

      {/* Article Writer / Editor Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0e1424] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <h3 className="font-syne font-bold text-base text-white">
                {editingBlog ? "Edit Article" : "Write Article"}
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
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingBlog?.title || ""}
                  placeholder="e.g. Building Scalable Web Apps with Next.js 15"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    name="author"
                    defaultValue={editingBlog?.author || "MSC Tech Team"}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Read Time Tag
                  </label>
                  <input
                    type="text"
                    name="read_time"
                    defaultValue={editingBlog?.read_time || "5 min read"}
                    placeholder="e.g. 4 min read"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  name="slug"
                  defaultValue={editingBlog?.slug || ""}
                  placeholder="custom-article-slug"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#0078d4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Short Excerpt
                </label>
                <textarea
                  name="excerpt"
                  rows={2}
                  defaultValue={editingBlog?.excerpt || ""}
                  placeholder="Summary snippet for article card preview..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Article Body (Markdown supported) *
                </label>
                <textarea
                  name="content"
                  rows={6}
                  required
                  defaultValue={editingBlog?.content || ""}
                  placeholder="Article content..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#0078d4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cover Image Upload
                </label>
                <input
                  type="file"
                  name="cover_image"
                  accept="image/*"
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#0078d4] file:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_published"
                  name="is_published"
                  defaultChecked={editingBlog?.is_published !== false}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-[#0078d4]"
                />
                <label
                  htmlFor="is_published"
                  className="text-xs text-slate-300 font-medium"
                >
                  Publish Article Immediately Live
                </label>
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
                    : editingBlog
                      ? "Update Article"
                      : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
