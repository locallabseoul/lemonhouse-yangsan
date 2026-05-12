import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminSessionCookieName, isValidAdminSession } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) {
    return unauthorized;
  }

  let query;

  try {
    query = createSupabaseAdminClient()
      .from("consultation_requests")
      .select("*")
      .order("created_at", { ascending: false });
  } catch {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다." },
      { status: 500 },
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const isAuthenticated = isValidAdminSession(cookieStore.get(adminSessionCookieName)?.value);

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
