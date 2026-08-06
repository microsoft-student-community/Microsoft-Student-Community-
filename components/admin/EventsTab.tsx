"use client";

import React, { useState } from "react";
import { triggerHaptic } from "@/utils/haptic";
import {
  Calendar,
  Search,
  Plus,
  QrCode,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  LayoutGrid,
  List,
  X,
  Upload,
  Sparkles,
  Download,
} from "lucide-react";

interface EventsTabProps {
  events: any[];
  loadingEvents: boolean;
  fetchEvents: () => void;
  supabase: any;
  showStatus: (
    id: string,
    msg: string,
    type: "error" | "success" | "info",
  ) => void;
  onOpenQRScanner?: (eventId?: string) => void;
}

export default function EventsTab({
  events,
  loadingEvents,
  fetchEvents,
  supabase,
  showStatus,
  onOpenQRScanner,
}: EventsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "published" | "draft">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const categories = Array.from(
    new Set(events.map((e) => e.category).filter(Boolean)),
  );

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.venue?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      (filterType === "published" && e.is_published !== false) ||
      (filterType === "draft" && e.is_published === false);
    const matchesCategory =
      categoryFilter === "all" || e.category === categoryFilter;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const openCreateModal = () => {
    triggerHaptic("light");
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event: any) => {
    triggerHaptic("light");
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const imageFile = formData.get("poster_image") as File;
    let posterUrl = editingEvent?.poster_url || "";

    try {
      showStatus("event_save", "Processing event record...", "info");

      if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `event_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("webpage")
          .upload(`events/${fileName}`, imageFile);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("webpage")
          .getPublicUrl(`events/${fileName}`);
        posterUrl = publicUrlData.publicUrl;
      }

      const payload = {
        title: formData.get("title"),
        description: formData.get("description"),
        date: formData.get("date"),
        venue: formData.get("venue"),
        category: formData.get("category") || "Workshop",
        poster_url: posterUrl,
        is_published: formData.get("is_published") === "on",
      };

      if (editingEvent) {
        const { error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", editingEvent.id);
        if (error) throw error;
        showStatus("event_save", "Event updated successfully!", "success");
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
        showStatus("event_save", "New event created!", "success");
      }

      setIsModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      showStatus("event_save", err.message || "Failed to save event", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      triggerHaptic("medium");
      showStatus("event_del", "Deleting event...", "info");
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      showStatus("event_del", "Event deleted!", "success");
      fetchEvents();
    } catch (err: any) {
      showStatus("event_del", err.message || "Failed to delete event", "error");
    }
  }

  async function handleTogglePublish(id: string, currentState: boolean) {
    try {
      triggerHaptic("light");
      const { error } = await supabase
        .from("events")
        .update({ is_published: !currentState })
        .eq("id", id);
      if (!error) fetchEvents();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDownloadRegistrations(eventId: string, eventTitle: string) {
    try {
      setDownloadingId(eventId);
      triggerHaptic("light");
      showStatus("export", `Generating export for ${eventTitle}...`, "info");

      const response = await fetch(
        `/api/admin/export-registrations?event_id=${eventId}`,
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Export failed (${response.status})`);
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `${eventTitle}-Registrations.xlsx`;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      showStatus("export", `Excel file downloaded for ${eventTitle}.`, "success");
    } catch (err: any) {
      showStatus("export", err.message || "Failed to export registrations.", "error");
    } finally {
      setDownloadingId(null);
    }
  }

  const publishedCount = events.filter((e) => e.is_published !== false).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#a4d8ff] tracking-widest uppercase">
            &#47;&#47; OPERATIONS MANAGEMENT
          </span>
          <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Events & Attendance ({events.length})
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#0078d4] hover:bg-[#0060aa] text-white text-xs font-semibold shadow-lg shadow-[#0078d4]/20 flex items-center gap-2 shrink-0 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {/* Toolbar Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by event title or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-[#0078d4]"
          />
        </div>

        {/* Filters & View Switches */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
            {(["all", "published", "draft"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterType(st)}
                className={`px-3 py-1 rounded-lg font-medium capitalize transition-all ${
                  filterType === st
                    ? "bg-[#0078d4] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 focus:outline-none focus:border-[#0078d4]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/60">
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
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-[#0078d4] text-white"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loadingEvents ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs animate-pulse">
          Fetching events registry...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 font-mono text-xs">
          No events match the search criteria.
        </div>
      ) : viewMode === "table" ? (
        /* Data Table */
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  <th className="py-3.5 px-4">Event Info</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Venue</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredEvents.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {item.poster_url ? (
                          <img
                            src={item.poster_url}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700/80 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-semibold text-white group-hover:text-[#a4d8ff] transition-colors block truncate max-w-xs">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-slate-400 line-clamp-1 font-light">
                            {item.description || "No description"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0078d4]/10 border border-[#0078d4]/30 text-[#a4d8ff] text-[10px] font-mono font-semibold">
                        {item.category || "Workshop"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {item.venue || "TBD"}
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
                          onClick={() => handleDownloadRegistrations(item.id, item.title)}
                          disabled={downloadingId === item.id}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 transition-colors disabled:opacity-50"
                          title="Download Registrations (Excel)"
                        >
                          <Download className={`w-3.5 h-3.5 ${downloadingId === item.id ? 'animate-pulse' : ''}`} />
                        </button>
                        {onOpenQRScanner && (
                          <button
                            onClick={() => onOpenQRScanner(item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-[#0078d4] text-slate-300 hover:text-white transition-colors"
                            title="Scan QR Attendance"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(item.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors"
                          title="Delete Event"
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
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group"
            >
              <div className="space-y-3">
                {item.poster_url && (
                  <img
                    src={item.poster_url}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-xl border border-slate-800"
                  />
                )}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0078d4]/10 border border-[#0078d4]/30 text-[#a4d8ff] text-[10px] font-mono font-semibold">
                    {item.category || "Workshop"}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold ${
                      item.is_published !== false
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {item.is_published !== false ? "PUBLISHED" : "DRAFT"}
                  </span>
                </div>

                <h3 className="font-syne font-bold text-base text-white group-hover:text-[#a4d8ff] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 font-light">
                  {item.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono pt-2 border-t border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-[#0078d4]" />
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                {onOpenQRScanner && (
                  <button
                    onClick={() => onOpenQRScanner(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#0078d4]/10 hover:bg-[#0078d4]/20 border border-[#0078d4]/30 text-[#a4d8ff] text-xs font-medium flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan QR</span>
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadRegistrations(item.id, item.title)}
                    disabled={downloadingId === item.id}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 disabled:opacity-50"
                    title="Download Registrations (Excel)"
                  >
                    <Download className={`w-3.5 h-3.5 ${downloadingId === item.id ? 'animate-pulse' : ''}`} />
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(item.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Event Drawer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#0e1424] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <h3 className="font-syne font-bold text-base text-white">
                {editingEvent ? "Edit Event" : "Create New Event"}
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
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingEvent?.title || ""}
                  placeholder="e.g. Azure Cloud Innovation Summit"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    required
                    defaultValue={
                      editingEvent?.date
                        ? new Date(editingEvent.date).toISOString().slice(0, 16)
                        : ""
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingEvent?.category || "Workshop"}
                    placeholder="Workshop / Speaker / Hackathon"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Venue / Location
                </label>
                <input
                  type="text"
                  name="venue"
                  defaultValue={editingEvent?.venue || ""}
                  placeholder="e.g. Auditorium / Online Teams"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingEvent?.description || ""}
                  placeholder="Event highlights and agenda..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Poster Image Upload
                </label>
                <input
                  type="file"
                  name="poster_image"
                  accept="image/*"
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#0078d4] file:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_published"
                  name="is_published"
                  defaultChecked={editingEvent?.is_published !== false}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-[#0078d4] focus:ring-0"
                />
                <label
                  htmlFor="is_published"
                  className="text-xs text-slate-300 font-medium"
                >
                  Publish Immediately on Portal
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
                    : editingEvent
                      ? "Update Event"
                      : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
