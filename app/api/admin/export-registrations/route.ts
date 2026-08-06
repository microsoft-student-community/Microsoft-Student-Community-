import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import ExcelJS from "exceljs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/export-registrations?event_id=<uuid>
 *
 * Generates an .xlsx file on-demand from live Supabase registration data.
 * Server-side admin verification: the caller must be an authenticated user
 * whose member_profiles.role === "admin".
 */
export async function GET(request: NextRequest) {
  // --- 1. Authenticate the caller ---
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  // --- 2. Verify admin role ---
  const { data: profile } = await supabase
    .from("member_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Insufficient privileges." },
      { status: 403 },
    );
  }

  // --- 3. Validate the event_id parameter ---
  const eventId = request.nextUrl.searchParams.get("event_id");
  if (
    !eventId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      eventId,
    )
  ) {
    return NextResponse.json(
      { error: "Invalid or missing event_id parameter." },
      { status: 400 },
    );
  }

  // --- 4. Fetch event metadata (for the filename) ---
  const adminClient = createAdminClient();
  const { data: event, error: eventError } = await adminClient
    .from("events")
    .select("id, title, date")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  // --- 5. Fetch all registrations for this event ---
  const { data: registrations, error: regError } = await adminClient
    .from("registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (regError) {
    console.error("[ERROR] Failed to fetch registrations:", regError);
    return NextResponse.json(
      { error: "Failed to fetch registrations." },
      { status: 500 },
    );
  }

  const rows = registrations || [];

  // --- 6. Build Excel workbook ---
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MSC Admin Panel";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Registrations");

  // Define columns — covers all standard form_data fields plus metadata
  sheet.columns = [
    { header: "S.No", key: "sno", width: 6 },
    { header: "Full Name", key: "fullName", width: 24 },
    { header: "Email", key: "email", width: 30 },
    { header: "Registration Number", key: "regNum", width: 22 },
    { header: "Year", key: "year", width: 8 },
    { header: "Branch", key: "branch", width: 18 },
    { header: "Specialization", key: "specialization", width: 22 },
    { header: "College Name", key: "collegeName", width: 28 },
    { header: "City", key: "city", width: 16 },
    { header: "Team Name", key: "teamName", width: 20 },
    { header: "Team Members", key: "teamMembers", width: 36 },
    { header: "Status", key: "status", width: 12 },
    { header: "Checked In", key: "checkedIn", width: 12 },
    { header: "Registered At", key: "registeredAt", width: 22 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0078D4" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  // Populate rows
  rows.forEach((reg: any, index: number) => {
    const fd = reg.form_data || {};
    const td = reg.team_data || {};

    const teamMemberNames = (td.members || [])
      .map((m: any) => m.fullName || m.email || "")
      .filter(Boolean)
      .join(", ");

    sheet.addRow({
      sno: index + 1,
      fullName: fd.fullName || "",
      email: fd.email || reg.lead_email || "",
      regNum: fd.regNum || "",
      year: fd.year || "",
      branch: fd.branch || "",
      specialization: fd.specialization || "",
      collegeName: fd.collegeName || "",
      city: fd.city || "",
      teamName: td.team_name || "",
      teamMembers: teamMemberNames,
      status: reg.status || "",
      checkedIn: reg.checked_in ? "Yes" : "No",
      registeredAt: reg.created_at
        ? new Date(reg.created_at).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })
        : "",
    });
  });

  // Auto-filter on all columns
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };

  // --- 7. Serialize and return as downloadable .xlsx ---
  const buffer = await workbook.xlsx.writeBuffer();

  const safeTitle = event.title
    .replace(/[^a-zA-Z0-9_\- ]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50);
  const year = event.date
    ? new Date(event.date).getFullYear()
    : new Date().getFullYear();
  const filename = `${safeTitle}-${year}-Registrations.xlsx`;

  return new NextResponse(buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
