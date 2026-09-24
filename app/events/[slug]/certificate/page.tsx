"use client";

import { useEffect, useRef, useState, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getErrorMessage } from "@/utils/errors";

function CertificateDownloader({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const email = searchParams?.get("email");
  const [status, setStatus] = useState("Initializing...");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!email) {
      setStatus("Error: No email provided in URL. Add ?email=your@email.com");
      return;
    }

    async function processCertificate() {
      try {
        setStatus("Fetching event details...");
        const supabase = createClient();
        
        const { data: event, error: eventErr } = await supabase
          .from("events")
          .select("*")
          .eq("slug", resolvedParams.slug)
          .single();

        if (eventErr || !event) throw new Error("Event not found");

        setStatus("Locating registration...");
        
        const { data: regs, error: regErr } = await supabase
          .from("registrations")
          .select("*")
          .eq("event_id", event.id)
          .or(`lead_email.ilike."${email}",team_data->members.cs.[{"email":"${email}"}]`);

        if (regErr || !regs || regs.length === 0) throw new Error("Registration not found for this email");

        const reg = regs[0];
        
        let name = reg.form_data?.fullName || reg.lead_email;
        let college = reg.form_data?.collegeName || "SRMAP";

        if (reg.lead_email.toLowerCase() !== email!.toLowerCase() && reg.team_data?.members) {
           const member = reg.team_data.members.find((m: any) => m.email.toLowerCase() === email!.toLowerCase());
           if (member) {
              name = member.fullName || member.email;
           }
        }

        setStatus("Rendering certificate...");
        
        const rawHtml = event.form_requirements?.certificate_html;
        if (typeof rawHtml !== "string" || !rawHtml.trim()) {
          throw new Error("No certificate template configured for this event.");
        }

        const htmlContent = rawHtml
          .replace(
            /<link\s+([^>]*href="https:\/\/fonts\.googleapis\.com[^"]*")/gi,
            (match: string) => match.includes("crossorigin") ? match : match.replace("<link", '<link crossorigin="anonymous"')
          )
          .replace(/<img\s+(?![^>]*crossorigin)[^>]*>/gi, (match: string) => match.replace("<img", '<img crossorigin="anonymous"'))
          .replace(/\{\{NAME\}\}/g, name)
          .replace(/\{\{EVENT_TITLE\}\}/g, event.title || "")
          .replace(/\{\{EVENT_DATE\}\}/g, new Date(event.date_start).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }))
          .replace(/\{\{COLLEGE_NAME\}\}/g, college);

        if (containerRef.current) {
          containerRef.current.innerHTML = htmlContent;
          
          setStatus("Generating image...");
          const htmlToImage = await import("html-to-image");
          
          await new Promise(r => setTimeout(r, 1000));

          const dataUrl = await htmlToImage.toPng(containerRef.current, {
            backgroundColor: "#0a0a0b",
            pixelRatio: 2,
            imagePlaceholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
            onImageErrorHandler: () => undefined,
            style: { transform: "scale(1)", transformOrigin: "top left" },
          });

          setStatus("Downloading...");
          const link = document.createElement("a");
          link.download = `${name.replace(/[^a-zA-Z0-9]/g, "_")}-Certificate.png`;
          link.href = dataUrl;
          link.click();
          
          setStatus("Certificate Downloaded!");
        }

      } catch (err: unknown) {
        setStatus(`Error: ${getErrorMessage(err)}`);
      }
    }

    processCertificate();
  }, [email, resolvedParams.slug]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
      <div className="bg-[#18181b]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full text-center">
        <h1 className="text-xl font-bold text-white mb-4">Certificate Downloader</h1>
        <p className="text-slate-400 mb-6">{status}</p>
        
        {status === "Certificate Downloaded!" && (
          <p className="text-sm text-green-400">
            Check your downloads folder. You can safely close this tab now.
          </p>
        )}
      </div>

      <div 
        ref={containerRef} 
        style={{ 
          position: "absolute", 
          top: "-9999px", 
          left: "-9999px",
          width: "1122px",
          height: "794px",
          overflow: "hidden"
        }} 
      />
    </div>
  );
}

export default function CertificateDownloadPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center"><p className="text-white">Loading...</p></div>}>
      <CertificateDownloader params={params} />
    </Suspense>
  );
}
