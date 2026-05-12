import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ConsultationStatus } from "@/lib/consultations";
import { adminSessionCookieName, isValidAdminSession } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const allowedStatuses: ConsultationStatus[] = ["new", "contacted", "scheduled", "closed"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await params;
  const { status } = (await request.json()) as { status?: ConsultationStatus };

  if (!status || !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  let query;

  try {
    query = createSupabaseAdminClient()
      .from("consultation_requests")
      .update({ status })
      .eq("id", id);
  } catch {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다." },
      { status: 500 },
    );
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const isAuthenticated = isValidAdminSession(cookieStore.get(adminSessionCookieName)?.value);

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
