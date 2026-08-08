"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import { TicketTemplate } from "./TicketTemplate";
import {
  submitPublicRegistration,
  lookupTeamRegistration,
  joinMatchmakingTeam,
} from "../events/actions";
import { createClient } from "@/utils/supabase/client";
import { X, Download } from "lucide-react";

function openRazorpayCheckout(options: any): Promise<any> {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const rzp = new (window as any).Razorpay({
        ...options,
        handler: (response: any) => resolve(response),
        modal: { ondismiss: () => resolve(null) },
      });
      rzp.open();
    };
    document.body.appendChild(script);
  });
}

function CertificatePreview({ member, reqs, event, currentReg }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [dimensions, setDimensions] = useState({ w: 1122, h: 794 });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const containerWidth = entry.contentRect.width;
        setScale(containerWidth / dimensions.w);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [dimensions.w]);

  const htmlContent = reqs.certificate_html
    .replace(
      /<link\s+([^>]*href="https:\/\/fonts\.googleapis\.com[^"]*")/gi,
      (match: string) => {
        if (!match.includes("crossorigin")) {
          return match.replace("<link", '<link crossorigin="anonymous"');
        }
        return match;
      },
    )
    .replace(/\{\{NAME\}\}/g, member.name)
    .replace(/\{\{EVENT_TITLE\}\}/g, event.title || "")
    .replace(
      /\{\{EVENT_DATE\}\}/g,
      new Date(event.date_start).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    )
    .replace(
      /\{\{COLLEGE_NAME\}\}/g,
      currentReg.form_data?.collegeName || "SRMAP",
    );

  const htmlWithReporter =
    htmlContent +
    `
    <script>
      window.onload = () => {
        const content = document.body.firstElementChild || document.body;
        const w = content.scrollWidth || 1122;
        const h = content.scrollHeight || 794;
        if (w > 0 && h > 0) {
          window.parent.postMessage({ type: 'CERT_SIZE', memberId: '${member.id}', w, h }, '*');
        }
      };
    </script>
  `;

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === "CERT_SIZE" && e.data?.memberId === member.id) {
        if (e.data.w > 0 && e.data.h > 0) {
          setDimensions({ w: e.data.w, h: e.data.h });
        }
      }
    };
    window.addEventListener("message", handleMsg);
    return () => window.removeEventListener("message", handleMsg);
  }, [member.id]);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-3xl relative shadow-2xl mb-6 bg-white overflow-hidden rounded-xl"
      style={{ aspectRatio: `${dimensions.w}/${dimensions.h}` }}
    >
      <iframe
        id={`certificate-node-${member.id}`}
        title={`Certificate for ${member.name}`}
        className="absolute top-0 left-0 border-0 pointer-events-none bg-white"
        style={{
          width: `${dimensions.w}px`,
          height: `${dimensions.h}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        srcDoc={htmlWithReporter}
      />
    </div>
  );
}

export default function EventPortalTabs({
  event,
  isWaitlistMode = false,
  openTeams = [],
  invitedTeam = null,
}: {
  event: any;
  isWaitlistMode?: boolean;
  openTeams?: any[];
  invitedTeam?: any;
}) {
  const isOpen = !!event.registration_open;
  const [activeTab, setActiveTab] = useState<
    "register" | "matchmaking" | "check" | "certificate"
  >(event.status === "completed" || !isOpen ? "check" : "register");
  const [mounted, setMounted] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // Registration State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [currentReg, setCurrentReg] = useState<any>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

  // Lookup State
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Certificate Security States
  const [unlockedCerts, setUnlockedCerts] = useState<Record<string, boolean>>(
    {},
  );
  const [certInputs, setCertInputs] = useState<Record<string, string>>({});

  // Matchmaking State
  const [selectedJoinTeam, setSelectedJoinTeam] = useState<any>(null);
  const [joinLoading, setJoinLoading] = useState(false);

  // Dynamic Form State
  const [teamSize, setTeamSize] = useState(1);
  const [teamLeadIndex, setTeamLeadIndex] = useState(0);
  const [isInternal, setIsInternal] = useState(true);
  const ticketRef = useRef<HTMLDivElement>(null);

  const reqs = event.form_requirements || {
    req_reg_num: true,
    req_branch: false,
    req_spec: false,
    allow_teams: false,
    max_team_size: 1,
    provide_certificates: true,
  };
  const provideCertificates = reqs.provide_certificates !== false;

  useEffect(() => {
    setMounted(true);
    if (invitedTeam) {
      setActiveTab("matchmaking");
      setSelectedJoinTeam(invitedTeam);
    }
  }, [invitedTeam]);

  const [liveTeams, setLiveTeams] = useState<any[]>(openTeams);
  const supabase = createClient();

  useEffect(() => {
    setLiveTeams(openTeams);

    if (activeTab === "matchmaking" && event.id) {
      const channel = supabase
        .channel(`matchmaking_${event.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "teams",
            filter: `event_id=eq.${event.id}`,
          },
          async () => {
            const { data } = await supabase
              .from("teams")
              .select("*")
              .eq("event_id", event.id)
              .eq("looking_for_members", true);
            if (data) setLiveTeams(data);
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeTab, event.id, openTeams]);

  async function handleRegistrationSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        setErrorMsg(
          "Only @srmap.edu.in email addresses are allowed for SRMAP students.",
        );
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
      if (reqs.req_spec)
        baseData.specialization = formData.get("specialization");
    } else {
      baseData.collegeName = formData.get("collegeName");
      baseData.city = formData.get("city");
    }

    const teamMembers = [];
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
          const memberRegNum =
            formData.get(`member_${i}_regNum`)?.toString() || "";
          if (!memberRegNum.toUpperCase().startsWith("AP")) {
            setErrorMsg(
              `Member ${i + 1}'s Registration Number must start with AP.`,
            );
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
    baseData.teamLeadIndex = teamLeadIndex;

    if (isCreatingTeam) {
      baseData.teamName = formData.get("teamName");
      baseData.lookingForMembers = formData.get("lookingForMembers") === "on";
      baseData.maxTeamSize = teamSize;
    }

    const isPaid = event.form_requirements?.event_pricing === "paid";

    if (isPaid) {
      const fee = event.form_requirements.registration_fee;
      const chargeType = event.form_requirements.charge_type;

      let amountInPaise: number;
      if (chargeType === "per_team") {
        amountInPaise = fee * 100;
      } else {
        const totalMembers = 1 + teamMembers.length;
        amountInPaise = fee * totalMembers * 100;
      }

      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInPaise,
          receipt: `evt_${event.id}_${Date.now()}`,
          notes: { event_id: event.id, email: baseData.email },
        }),
      });
      const orderData = await orderRes.json();
      if (orderData.error) {
        setErrorMsg(orderData.error);
        setLoading(false);
        return;
      }

      const paymentResult = await openRazorpayCheckout({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: "MSC SRMAP",
        description: `Registration: ${event.title}`,
        prefill: { email: baseData.email, name: baseData.fullName },
      });

      if (!paymentResult) {
        setErrorMsg("Payment was cancelled.");
        setLoading(false);
        return;
      }

      const verifyRes = await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentResult,
          event_id: event.id,
          payer_email: baseData.email,
          amount: amountInPaise,
          charge_type: chargeType,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.verified) {
        setErrorMsg("Payment verification failed.");
        setLoading(false);
        return;
      }

      baseData.payment_data = {
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_order_id: paymentResult.razorpay_order_id,
        amount_paid: amountInPaise / 100,
        charge_type: chargeType,
      };
    }

    const res = await submitPublicRegistration(event.id, baseData);
    setLoading(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else if (res?.success) {
      if (res.isWaitlisted) {
        setShowWaitlistModal(true);
      } else {
        setCurrentHash(res.hash_payload);
        if (res.team_id) setCurrentTeamId(res.team_id);
        if (res.registration) {
          setCurrentReg(res.registration);
        }
        setShowTicketModal(true);
      }
    }
  }

  async function handleLookupSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLookupLoading(true);
    setLookupError(null);

    const res = await lookupTeamRegistration(event.id, lookupEmail);
    setLookupLoading(false);

    if (res?.error) {
      setLookupError(res.error);
    } else if (res?.success) {
      setCurrentHash(res.hash_payload);
      if (res.registration) setCurrentReg(res.registration);
      setShowTicketModal(true);
    }
  }

  async function handleJoinSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setJoinLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const memberData = {
      fullName: formData.get("joinName"),
      email: formData.get("joinEmail"),
      year: formData.get("joinYear"),
      branch: formData.get("joinBranch"),
      regNum: formData.get("joinRegNum"),
    };

    const res = await joinMatchmakingTeam(selectedJoinTeam.id, memberData);
    setJoinLoading(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else if (res?.success) {
      setCurrentHash(res.hash_payload);
      setSelectedJoinTeam(null);
      setShowTicketModal(true);
    }
  }

  async function downloadTicket() {
    if (!ticketRef.current) return;

    // Temporarily remove offending cross-origin stylesheets (e.g., from browser extensions)
    // that cause html-to-image to throw a SecurityError.
    const problematicNodes: { node: Element, parent: Node, nextSibling: Node | null }[] = [];
    document.querySelectorAll('link[rel="stylesheet"], style').forEach(node => {
      try {
        // @ts-ignore
        const rules = (node as any).sheet?.cssRules;
      } catch (e: any) {
        if (e.name === 'SecurityError' && node.parentNode) {
          problematicNodes.push({
            node,
            parent: node.parentNode,
            nextSibling: node.nextSibling
          });
          node.parentNode.removeChild(node);
        }
      }
    });

    try {
      const htmlToImage = await import("html-to-image");
      const dataUrl = await htmlToImage.toPng(ticketRef.current, {
        backgroundColor: "#F3F5F8",
        pixelRatio: 2,
        style: { transform: "scale(1)", transformOrigin: "top left" },
        imagePlaceholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" // 1x1 transparent png
      });
      const link = document.createElement("a");
      link.download = `Event-Ticket-${currentHash?.substring(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate ticket image:", err);
    } finally {
      // Restore the removed nodes
      problematicNodes.forEach(({ node, parent, nextSibling }) => {
        if (nextSibling) {
          parent.insertBefore(node, nextSibling);
        } else {
          parent.appendChild(node);
        }
      });
    }
  }

  async function downloadCertificate(memberId: string, memberName: string) {
    const certEl = document.getElementById(`certificate-node-${memberId}`);
    if (!certEl) return;

    // Temporarily remove offending cross-origin stylesheets
    const problematicNodes: { node: Element, parent: Node, nextSibling: Node | null }[] = [];
    document.querySelectorAll('link[rel="stylesheet"], style').forEach(node => {
      try {
        // @ts-ignore
        const rules = (node as any).sheet?.cssRules;
      } catch (e: any) {
        if (e.name === 'SecurityError' && node.parentNode) {
          problematicNodes.push({ node, parent: node.parentNode, nextSibling: node.nextSibling });
          node.parentNode.removeChild(node);
        }
      }
    });

    try {
      const htmlToImage = await import("html-to-image");

      let targetNode = certEl;
      if (certEl.tagName.toLowerCase() === "iframe") {
        const iframeDoc = (certEl as HTMLIFrameElement).contentDocument;
        if (iframeDoc && iframeDoc.body) {
          targetNode = iframeDoc.body;
        }
      }

      const dataUrl = await htmlToImage.toPng(targetNode, {
        backgroundColor: "#0a0a0b",
        pixelRatio: 2,
        imagePlaceholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      });
      const link = document.createElement("a");
      link.download = `${memberName.replace(/[^a-zA-Z0-9]/g, "_")}-Certificate.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate certificate image:", err);
    } finally {
      // Restore the removed nodes
      problematicNodes.forEach(({ node, parent, nextSibling }) => {
        if (nextSibling) {
          parent.insertBefore(node, nextSibling);
        } else {
          parent.appendChild(node);
        }
      });
    }
  }

  const qrCodeUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/admin/checkin/${currentHash}`
      : "";
  const certType = currentReg?.form_data?.certificate_type || "none";
  const isWinner = certType === "winner";
  const isRunnerUp = certType === "runner_up";
  const isParticipation = certType === "participation";
  const hasCertificate = isWinner || isRunnerUp || isParticipation;

  const eligibleMembers: {
    id: string;
    name: string;
    regNum?: string;
    email?: string;
  }[] = [];
  if (currentReg && hasCertificate) {
    if (currentReg.checked_in) {
      eligibleMembers.push({
        id: "primary",
        name: currentReg.form_data?.fullName || currentReg.lead_email,
        regNum: currentReg.form_data?.regNum,
        email: currentReg.lead_email,
      });
    }
    if (currentReg.team_data && currentReg.team_data.members) {
      currentReg.team_data.members.forEach((m: any, i: number) => {
        if (m.checked_in) {
          eligibleMembers.push({
            id: `member-${i}`,
            name: m.fullName || m.email,
            regNum: m.regNum,
            email: m.email,
          });
        }
      });
    }
  }

  const handleUnlockCert = (
    memberId: string,
    expectedRegNum: string | undefined,
    expectedEmail: string | undefined,
  ) => {
    const input = (certInputs[memberId] || "").trim().toLowerCase();

    if (expectedRegNum) {
      if (input === expectedRegNum.trim().toLowerCase()) {
        setUnlockedCerts((prev) => ({ ...prev, [memberId]: true }));
      } else {
        alert("Incorrect Registration Number. Please check and try again.");
      }
    } else if (expectedEmail) {
      if (input === expectedEmail.trim().toLowerCase()) {
        setUnlockedCerts((prev) => ({ ...prev, [memberId]: true }));
      } else {
        alert("Incorrect Email Address. Please check and try again.");
      }
    } else {
      setUnlockedCerts((prev) => ({ ...prev, [memberId]: true }));
    }
  };

  return (
    <>
      <div className="w-full">
        {/* Tabs */}
        <div className="flex flex-col md:flex-row gap-2 mb-8 bg-[#18181b]  p-2 rounded-2xl border border-white/5">
          {event.status !== "completed" && (
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-4 px-6 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "register" ? (isWaitlistMode ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]" : "bg-[#0078d4]/10 text-[#0078d4] border border-[#0078d4]/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]") : "text-slate-500 hover:text-white hover:bg-[#18181b]"}`}
            >
              <i
                className={`fas ${isWaitlistMode ? "fa-clock" : "fa-user-plus"}`}
              ></i>
              {isWaitlistMode ? "Join Waitlist" : "Register Now"}
            </button>
          )}



          <button
            onClick={() => setActiveTab("check")}
            className={`flex-1 py-4 px-6 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "check"
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                : "text-slate-500 hover:text-white hover:bg-[#18181b]"
              }`}
          >
            <i className="fas fa-search"></i> Check Team Details
          </button>

          {provideCertificates && (
            <button
              onClick={() => setActiveTab("certificate")}
              className={`flex-1 py-4 px-6 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "certificate"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                  : "text-slate-500 hover:text-white hover:bg-[#18181b]"
                }`}
            >
              <i className="fas fa-certificate"></i> E-Certificate
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="bg-[#18181b]  border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl min-h-[400px]">
          {/* REGISTER TAB */}
          {activeTab === "register" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-8 border-b border-white/5 pb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isWaitlistMode
                    ? "Join Event Waitlist"
                    : "Event Registration"}
                </h2>
                <p className="text-slate-500 text-sm">
                  Secure your spot by filling out the form below.
                </p>
              </div>

              {!isOpen ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 text-red-500">
                    <i className="fas fa-lock text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">
                    Registrations are Closed
                  </h3>
                  <p className="text-red-400/60 text-sm mb-6">
                    The administration has closed registrations for this event.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setActiveTab("check")}
                      className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 rounded-xl font-bold transition-colors"
                    >
                      <i className="fas fa-search mr-2"></i> Find Team Details
                    </button>
                    {provideCertificates && (
                      <button
                        onClick={() => setActiveTab("certificate")}
                        className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-xl font-bold transition-colors"
                      >
                        <i className="fas fa-certificate mr-2"></i> Download
                        E-Certificate
                      </button>
                    )}
                  </div>
                </div>
              ) : currentHash ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-500">
                    <i className="fas fa-check text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-green-400 mb-2">
                    You are Registered!
                  </h3>
                  <p className="text-green-400/60 text-sm mb-6">
                    Your registration was successful. Keep your ticket safe!
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowTicketModal(true)}
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-bold transition-colors text-white"
                    >
                      View My Ticket
                    </button>
                    {currentTeamId && (
                      <button
                        onClick={async () => {
                          const inviteUrl = `${window.location.origin}/event-portal?event=${event.slug || event.id}&invite=${currentTeamId}`;
                          try {
                            await navigator.clipboard.writeText(inviteUrl);
                            alert("Invite link copied to clipboard!");
                          } catch (err) {
                            console.warn(
                              "Clipboard access denied. Falling back to prompt:",
                              err,
                            );
                            window.prompt("Copy this invite link:", inviteUrl);
                          }
                        }}
                        className="px-6 py-3 bg-[#18181b] hover:bg-[#18181b] border border-white/10 rounded-xl font-bold transition-colors text-white flex items-center gap-2"
                      >
                        <i className="fas fa-link"></i> Copy Invite Link
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleRegistrationSubmit}
                  className="flex flex-col gap-6"
                >
                  {errorMsg && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-semibold">
                      {errorMsg}
                    </div>
                  )}

                  {reqs.allow_external_students && (
                    <div className="flex flex-col gap-3 p-5 bg-[#0078d4]/10 border border-[#0078d4]/20 rounded-xl mb-2">
                      <h4 className="text-[13px] font-bold text-[#0078d4] uppercase tracking-wider">
                        Are you an SRMAP Student?
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
                          <span className="text-sm font-semibold text-white">
                            Yes, I am from SRMAP
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="student_type"
                            checked={!isInternal}
                            onChange={() => setIsInternal(false)}
                            className="w-4 h-4 accent-blue-500"
                          />
                          <span className="text-sm font-semibold text-white/80">
                            No, I am from another College/University
                          </span>
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
                        placeholder="Full Name"
                        className="p-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                        Student Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="you@university.edu"
                        className="p-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isInternal ? (
                      <>
                        {reqs.req_reg_num && (
                          <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                              Reg No.
                            </label>
                            <input
                              type="text"
                              name="regNum"
                              required
                              placeholder="APXX11XXXX"
                              className="p-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                          </div>
                        )}
                        {reqs.req_branch && (
                          <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                              Branch
                            </label>
                            <select
                              name="branch"
                              required
                              defaultValue=""
                              className="p-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors w-full"
                            >
                              <option value="" disabled>
                                Select Branch
                              </option>
                              <option value="CSE">CSE</option>
                              <option value="ECE">ECE</option>
                              <option value="EEE">EEE</option>
                              <option value="BSc">BSc</option>
                              <option value="BBA">BBA</option>
                              <option value="MBA">MBA</option>
                              <option value="Mechanical">Mechanical</option>
                              <option value="Civil">Civil</option>
                              <option value="others">others</option>
                            </select>
                          </div>
                        )}
                        {reqs.req_spec && (
                          <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                              Specialization
                            </label>
                            <input
                              type="text"
                              name="specialization"
                              required
                              placeholder="e.g. AI/ML"
                              className="p-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col gap-2 lg:col-span-2">
                          <label className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                            College/University Name
                          </label>
                          <input
                            type="text"
                            name="collegeName"
                            required
                            placeholder="e.g. VIT Chennai"
                            className="p-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
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
                            placeholder="e.g. Chennai"
                            className="p-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
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
                        defaultValue=""
                        className="p-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="" disabled>
                          Select Year
                        </option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                  </div>

                  {reqs.allow_teams &&
                    reqs.max_team_size &&
                    reqs.max_team_size > 1 && (
                      <div className="mt-4 pt-6 border-t border-white/10">
                        <h4 className="text-lg font-bold text-white mb-4">
                          Team Registration (Optional)
                        </h4>

                        <div className="flex items-center gap-3 mb-6 p-4 bg-[#18181b] border border-white/10 rounded-xl">
                          <input
                            type="checkbox"
                            id="createTeamToggle"
                            checked={isCreatingTeam}
                            onChange={(e) => {
                              setIsCreatingTeam(e.target.checked);
                              if (!e.target.checked) setTeamSize(1);
                            }}
                            className="w-5 h-5 accent-blue-500 rounded border-white/20 bg-black"
                          />
                          <label
                            htmlFor="createTeamToggle"
                            className="text-sm font-semibold text-white cursor-pointer select-none"
                          >
                            I want to create or register a Team
                          </label>
                        </div>

                        {isCreatingTeam && (
                          <div className="flex flex-col gap-6 p-5 bg-[#18181b] rounded-xl border border-white/10 mb-6">
                            <div className="flex flex-col gap-2 mb-2 border-b border-white/10 pb-6">
                              <label className="text-[13px] font-semibold text-[#0078d4] uppercase tracking-wider">
                                Team Name
                              </label>
                              <input
                                type="text"
                                name="teamName"
                                required
                                placeholder="Enter a cool team name"
                                className="p-3 bg-black border border-blue-500/30 rounded-xl text-white focus:outline-none focus:border-blue-500 w-full mb-4 transition-colors"
                              />

                              <label className="text-[13px] font-semibold text-[#0078d4] uppercase tracking-wider">
                                How many members are you registering right now?
                              </label>
                              <select
                                value={teamSize}
                                onChange={(e) =>
                                  setTeamSize(parseInt(e.target.value))
                                }
                                className="p-3 bg-black border border-blue-500/30 rounded-xl text-white focus:outline-none focus:border-blue-500 w-full md:w-1/2 mb-4 transition-colors"
                              >
                                {Array.from(
                                  { length: reqs.max_team_size },
                                  (_, i) => i + 1,
                                ).map((num: number) => (
                                  <option key={num} value={num}>
                                    {num === 1
                                      ? "Just me (1)"
                                      : `${num} Members`}
                                  </option>
                                ))}
                              </select>

                              {teamSize > 1 && (
                                <>
                                  <label className="text-[13px] font-semibold text-[#0078d4] uppercase tracking-wider mt-2">
                                    Who is the Team Lead?
                                  </label>
                                  <select
                                    value={teamLeadIndex}
                                    onChange={(e) =>
                                      setTeamLeadIndex(parseInt(e.target.value))
                                    }
                                    className="p-3 bg-black border border-blue-500/30 rounded-xl text-white focus:outline-none focus:border-blue-500 w-full md:w-1/2 transition-colors"
                                  >
                                    <option value={0}>
                                      Me (Primary Registrant)
                                    </option>
                                    {Array.from(
                                      { length: teamSize - 1 },
                                      (_, i) => i + 1,
                                    ).map((num: number) => (
                                      <option key={num} value={num}>
                                        Member {num + 1}
                                      </option>
                                    ))}
                                  </select>
                                </>
                              )}
                            </div>

                            {teamSize > 1 &&
                              Array.from(
                                { length: teamSize - 1 },
                                (_, i) => i + 1,
                              ).map((num: number) => (
                                <div
                                  key={num}
                                  className="flex flex-col gap-4 pt-4 first:pt-0 border-t border-white/5"
                                >
                                  <h5 className="text-sm font-bold text-white/80 mt-4">
                                    Member {num + 1} Details
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                      <label className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                                        Name
                                      </label>
                                      <input
                                        type="text"
                                        name={`member_${num}_name`}
                                        placeholder={`Member ${num + 1} Name`}
                                        className="p-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                      <label className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                                        Email (Leave blank for an empty slot)
                                      </label>
                                      <input
                                        type="email"
                                        name={`member_${num}_email`}
                                        placeholder={`member${num + 1}@example.com`}
                                        className="p-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {isInternal && (
                                      <>
                                        {reqs.req_reg_num && (
                                          <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                                              Reg No.
                                            </label>
                                            <input
                                              type="text"
                                              name={`member_${num}_regNum`}
                                              placeholder="Reg Number"
                                              className="p-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                          </div>
                                        )}
                                        {reqs.req_branch && (
                                          <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                                              Branch
                                            </label>
                                            <select
                                              name={`member_${num}_branch`}
                                              defaultValue=""
                                              className="p-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors w-full"
                                            >
                                              <option value="">
                                                Select Branch
                                              </option>
                                              <option value="CSE">CSE</option>
                                              <option value="ECE">ECE</option>
                                              <option value="EEE">EEE</option>
                                              <option value="BSc">BSc</option>
                                              <option value="BBA">BBA</option>
                                              <option value="MBA">MBA</option>
                                              <option value="Mechanical">
                                                Mechanical
                                              </option>
                                              <option value="Civil">
                                                Civil
                                              </option>
                                              <option value="others">
                                                others
                                              </option>
                                            </select>
                                          </div>
                                        )}
                                        {reqs.req_spec && (
                                          <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                                              Specialization
                                            </label>
                                            <input
                                              type="text"
                                              name={`member_${num}_spec`}
                                              placeholder="Spec"
                                              className="p-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                          </div>
                                        )}
                                      </>
                                    )}
                                    <div className="flex flex-col gap-2">
                                      <label className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                                        Year
                                      </label>
                                      <select
                                        name={`member_${num}_year`}
                                        defaultValue=""
                                        className="p-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                                      >
                                        <option value="">Select Year</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              ))}


                          </div>
                        )}
                      </div>
                    )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full mt-4 p-4 rounded-xl font-bold transition-all shadow-lg text-white disabled:opacity-50 ${isWaitlistMode ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-[0_0_20px_rgba(234,179,8,0.2)]" : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-[0_0_20px_rgba(59,130,246,0.2)]"}`}
                  >
                    {loading
                      ? "Processing..."
                      : isWaitlistMode
                        ? "Join Waitlist Queue"
                        : "Complete Registration"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* MATCHMAKING TAB */}
          {activeTab === "matchmaking" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-8 border-b border-white/5 pb-6">
                <h2 className="text-2xl font-bold text-cyan-400 mb-2">
                  Team Matchmaking
                </h2>
                <p className="text-slate-500 text-sm">
                  Looking for a team? Browse teams that are actively seeking
                  members and join one instantly!
                </p>
              </div>

              {liveTeams.length === 0 ? (
                <div className="text-center p-12 bg-[#18181b] rounded-2xl border border-white/10">
                  <div className="w-16 h-16 bg-[#18181b] rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                    <i className="fas fa-users-slash text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    No Open Teams
                  </h3>
                  <p className="text-sm text-slate-500">
                    Check back later or register a new team yourself!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {liveTeams.map((team: any) => (
                    <div
                      key={team.id}
                      className="bg-[#1e1e24] border border-cyan-500/20 rounded-2xl p-6 relative group overflow-hidden hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {team.team_name}
                      </h3>
                      <p className="text-xs text-cyan-400 font-semibold mb-4 uppercase tracking-wider">
                        Accepting Members
                      </p>

                      <div className="bg-black rounded-xl p-4 mb-5 border border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <i className="fas fa-user-tie text-xs"></i>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Team Leader</p>
                            <p className="text-sm font-bold text-white">
                              {team.leader_name}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 pl-11">
                          {team.leader_year} Year &bull; {team.leader_branch}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedJoinTeam(team)}
                        className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)] flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-right-to-bracket"></i> Request to
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CHECK TAB */}
          {activeTab === "check" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-8 border-b border-white/5 pb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Check Team Details & Retrieve Ticket
                </h2>
                <p className="text-slate-500 text-sm">
                  Enter the Team Lead&apos;s email address to recover your
                  registration form and QR code.
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <form
                  onSubmit={handleLookupSubmit}
                  className="flex flex-col gap-6"
                >
                  {lookupError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-semibold">
                      {lookupError}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                      Team Lead Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={lookupEmail}
                      onChange={(e) => setLookupEmail(e.target.value)}
                      placeholder="lead@university.edu"
                      className="p-4 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 text-lg transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={lookupLoading}
                    className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-bold transition-all shadow-lg text-white disabled:opacity-50"
                  >
                    {lookupLoading ? "Searching..." : "Find My Ticket"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* CERTIFICATE TAB */}
          {provideCertificates && activeTab === "certificate" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {!currentReg ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-24 h-24 bg-[#18181b] rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <i className="fas fa-lock text-4xl text-white/20"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    E-Certificates Locked
                  </h2>
                  <p className="text-slate-500 text-center max-w-md">
                    Please go to the <b>&quot;Check Team Details&quot;</b> tab
                    and enter your email address to view your certificate!
                  </p>
                </div>
              ) : !hasCertificate ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-24 h-24 bg-[#18181b] rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <i
                      className={`fas text-4xl ${event.status === "completed" ? "fa-hourglass-half text-orange-400" : "fa-lock text-white/20"}`}
                    ></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    No Certificate Assigned Yet
                  </h2>
                  <p className="text-slate-500 text-center max-w-md">
                    {event.status === "completed"
                      ? "The administration is currently processing the certificates for this event. Check back shortly!"
                      : "Certificates will be available here after the event concludes and attendance is verified."}
                  </p>
                </div>
              ) : eligibleMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <i className="fas fa-user-times text-4xl text-red-500/50"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-red-400 mb-4">
                    No Attendance Recorded
                  </h2>
                  <p className="text-red-400/60 text-center max-w-md">
                    Certificates are only issued to members who have officially
                    checked in at the venue. If you believe this is an error,
                    please contact the administration.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <div className="mb-8 border-b border-white/5 pb-6 w-full text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Your E-Certificates
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Download official certificates for all checked-in members
                      below.
                    </p>
                  </div>

                  {eligibleMembers.map((member) => (
                    <div
                      key={member.id}
                      className="w-full mb-10 flex flex-col items-center"
                    >
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <i
                          className={`fas ${isWinner ? "fa-trophy text-yellow-400" : isRunnerUp ? "fa-medal text-gray-300" : "fa-award text-green-400"}`}
                        ></i>
                        {member.name}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isWinner ? "bg-yellow-500/20 text-yellow-400" : isRunnerUp ? "bg-gray-500/20 text-gray-300" : "bg-green-500/20 text-green-400"}`}
                        >
                          {isWinner
                            ? "Winner"
                            : isRunnerUp
                              ? "Runner Up"
                              : "Participation"}
                        </span>
                      </h3>

                      {!unlockedCerts[member.id] ? (
                        <div className="w-full max-w-md bg-[#18181b] border border-white/10 rounded-[16px] shadow-md p-8 flex flex-col items-center text-center">
                          <i className="fas fa-shield-halved text-3xl text-[#0078d4] mb-4"></i>
                          <h4 className="text-md font-bold text-white mb-2">
                            Verify Your Identity
                          </h4>
                          <p className="text-slate-500 text-xs mb-4">
                            Enter your{" "}
                            <b>
                              {member.regNum
                                ? "Registration Number"
                                : "Email Address"}
                            </b>{" "}
                            to view this certificate.
                          </p>
                          <input
                            type="text"
                            placeholder={
                              member.regNum
                                ? "e.g. AP21110011234"
                                : "you@srmap.edu.in"
                            }
                            value={certInputs[member.id] || ""}
                            onChange={(e) =>
                              setCertInputs((prev) => ({
                                ...prev,
                                [member.id]: e.target.value,
                              }))
                            }
                            className="w-full p-3 bg-black border border-white/10 rounded-xl text-white text-center mb-4 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                          <button
                            onClick={() =>
                              handleUnlockCert(
                                member.id,
                                member.regNum,
                                member.email,
                              )
                            }
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-bold text-white transition-all"
                          >
                            <i className="fas fa-certificate mr-2"></i> View
                            Certificate
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center w-full">
                          {reqs.certificate_html ? (
                            <CertificatePreview
                              member={member}
                              reqs={reqs}
                              event={event}
                              currentReg={currentReg}
                            />
                          ) : (
                            <div className="w-full max-w-md bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center mb-4">
                              <i className="fas fa-check-circle text-green-400 text-3xl mb-2"></i>
                              <p className="text-green-400 font-bold">
                                Certificate Ready!
                              </p>
                            </div>
                          )}
                          <button
                            onClick={() =>
                              downloadCertificate(member.id, member.name)
                            }
                            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-bold text-white transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] flex items-center gap-2"
                          >
                            <i className="fas fa-download"></i> Download
                            Certificate
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TICKET MODAL */}
      {mounted &&
        showTicketModal &&
        currentHash &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-start justify-center p-4 sm:p-6 bg-black  overflow-y-auto"
            onClick={() => setShowTicketModal(false)}
          >
            <div
              className="relative max-w-lg w-full flex flex-col items-center pt-12 pb-12 m-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowTicketModal(false)}
                className="absolute top-0 right-0 px-4 py-2 bg-[#18181b] hover:bg-[#18181b] text-white rounded-full text-xs font-bold flex items-center gap-2  border border-white/20 transition-all cursor-pointer z-50 shadow-lg"
              >
                <X className="w-4 h-4" /> Close
              </button>
              <div ref={ticketRef} className="w-full">
                <TicketTemplate
                  event={event}
                  registration={currentReg}
                  hashPayload={currentHash}
                  qrUrl={qrCodeUrl}
                />
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={downloadTicket}
                  className="flex-1 py-3 px-6 bg-[#0078d4] hover:bg-[#0063b1] rounded-xl font-bold text-white transition-all shadow-[0_0_20px_rgba(0,120,212,0.3)] flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> Download Ticket
                </button>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="flex-1 py-3 px-6 bg-[#18181b] hover:bg-[#18181b] border border-white/20 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <X className="w-4 h-4" /> Close Ticket
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* WAITLIST MODAL */}
      {mounted &&
        showWaitlistModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black "
            onClick={() => setShowWaitlistModal(false)}
          >
            <div
              className="bg-[#1a1a24] border border-yellow-500/20 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-400">
                <i className="fas fa-clock text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-3">
                You&apos;re on the Waitlist!
              </h3>
              <p className="text-slate-400 text-sm mb-8">
                The event is currently full. You&apos;ve been added to the
                waitlist and will be notified if a spot opens up.
              </p>
              <button
                onClick={() => setShowWaitlistModal(false)}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl font-bold text-black transition-all"
              >
                Got it!
              </button>
            </div>
          </div>,
          document.body,
        )}

      {/* JOIN TEAM MODAL */}
      {mounted &&
        selectedJoinTeam &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black "
            onClick={() => setSelectedJoinTeam(null)}
          >
            <div
              className="bg-[#1a1a24] border border-cyan-500/20 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-cyan-400">
                  Join {selectedJoinTeam.team_name}
                </h3>
                <button
                  onClick={() => setSelectedJoinTeam(null)}
                  className="w-8 h-8 bg-[#18181b] hover:bg-[#18181b] rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              </div>

              <form onSubmit={handleJoinSubmit} className="flex flex-col gap-4">
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    name="joinName"
                    required
                    placeholder="Full Name"
                    className="p-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    name="joinEmail"
                    required
                    placeholder="you@srmap.edu.in"
                    className="p-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                      Reg No.
                    </label>
                    <input
                      type="text"
                      name="joinRegNum"
                      placeholder="APXX11XXXX"
                      className="p-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                      Branch
                    </label>
                    <input
                      type="text"
                      name="joinBranch"
                      placeholder="CSE"
                      className="p-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                    Year
                  </label>
                  <select
                    name="joinYear"
                    required
                    defaultValue=""
                    className="p-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="" disabled>
                      Select Year
                    </option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={joinLoading}
                  className="w-full mt-2 p-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-bold text-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] disabled:opacity-50"
                >
                  {joinLoading ? "Joining..." : "Join Team"}
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
