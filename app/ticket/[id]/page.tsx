import { createAdminClient } from "@/utils/supabase/admin";
import TicketClient from "./TicketClient";
import { notFound } from "next/navigation";

export const revalidate = 0; // Ensure it never caches stale ticket data

export default async function TicketPage(props: { params: Promise<{ id: string }> }) {
 const params = await props.params;
 const ticketId = params.id;

 if (!ticketId) {
 notFound();
 }

 const supabase = createAdminClient();

 const { data: registration, error } = await supabase
 .from("registrations")
 .select("*, events(title, date_start, venue, category, poster_url)")
 .eq("id", ticketId)
 .single();

 if (error || !registration) {
 return (
 <div className="min-h-screen bg-[#050914] flex items-center justify-center p-4">
 <div className="p-8 rounded-[32px] bg-slate-900 border border-white/10 text-center max-w-md w-full shadow-md">
 <i className="fa-solid fa-triangle-exclamation text-4xl text-rose-500 mb-4"></i>
 <h1 className="text-2xl font-syne font-bold text-white mb-2">Invalid Ticket</h1>
 <p className="text-slate-400 font-mono text-sm">
 This digital ticket could not be found or has been invalidated.
 </p>
 </div>
 </div>
 );
 }

 return <TicketClient ticket={registration} />;
}
