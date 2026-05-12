import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminSessionCookieName, isValidAdminSession } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const bucketName = "site-assets";
const maxUploadSize = 10 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) {
    return unauthorized;
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = sanitizeFolder(String(formData.get("folder") ?? "uploads"));

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "업로드할 이미지 파일이 필요합니다." }, { status: 400 });
  }

  if (!allowedImageTypes.has(file.type)) {
    return NextResponse.json(
      { error: "jpg, png, webp, gif 이미지만 업로드할 수 있습니다." },
      { status: 400 },
    );
  }

  if (file.size > maxUploadSize) {
    return NextResponse.json(
      { error: "이미지는 10MB 이하만 업로드할 수 있습니다." },
      { status: 400 },
    );
  }

  const extension = getFileExtension(file.name, file.type);
  const path = `${folder}/${Date.now()}-${randomUUID()}.${extension}`;

  try {
    const supabase = createSupabaseAdminClient();
    const bucketError = await ensureUploadBucket(supabase);

    if (bucketError) {
      return NextResponse.json({ error: bucketError }, { status: 500 });
    }

    const { error } = await supabase.storage.from(bucketName).upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);

    return NextResponse.json({ url: data.publicUrl, path });
  } catch {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다." },
      { status: 500 },
    );
  }
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const isAuthenticated = isValidAdminSession(cookieStore.get(adminSessionCookieName)?.value);

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

function sanitizeFolder(value: string) {
  return value.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "uploads";
}

async function ensureUploadBucket(supabase: ReturnType<typeof createSupabaseAdminClient>) {
  const { error: getError } = await supabase.storage.getBucket(bucketName);

  if (!getError) {
    return null;
  }

  const { error: createError } = await supabase.storage.createBucket(bucketName, {
    allowedMimeTypes: Array.from(allowedImageTypes),
    fileSizeLimit: maxUploadSize,
    public: true,
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    return createError.message;
  }

  return null;
}

function getFileExtension(fileName: string, mimeType: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension && ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) {
    return extension === "jpeg" ? "jpg" : extension;
  }

  return mimeType.split("/")[1] === "jpeg" ? "jpg" : mimeType.split("/")[1];
}
