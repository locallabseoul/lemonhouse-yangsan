import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminSessionCookieName, isValidAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const cookieStore = await cookies();
  const isAuthenticated = isValidAdminSession(cookieStore.get(adminSessionCookieName)?.value);

  return NextResponse.json({ authenticated: isAuthenticated });
}
