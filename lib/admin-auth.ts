import { createHmac, timingSafeEqual } from "crypto";

export const adminSessionCookieName = "lemonhouse_admin_session";

const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
const adminPassword = process.env.ADMIN_PASSWORD ?? "admin";
const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? "lemonhouse-local-admin-secret";

export function isValidAdminCredential(username: string, password: string) {
  return username === adminUsername && password === adminPassword;
}

export function createAdminSessionValue() {
  const issuedAt = Date.now().toString();
  const payload = `${adminUsername}.${issuedAt}`;
  const signature = sign(payload);

  return `${payload}.${signature}`;
}

export function isValidAdminSession(sessionValue?: string) {
  if (!sessionValue) {
    return false;
  }

  const parts = sessionValue.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [username, issuedAt, signature] = parts;
  if (username !== adminUsername) {
    return false;
  }

  const issuedAtTime = Number(issuedAt);
  if (!Number.isFinite(issuedAtTime)) {
    return false;
  }

  const maxAgeMs = 1000 * 60 * 60 * 12;
  if (Date.now() - issuedAtTime > maxAgeMs) {
    return false;
  }

  const expected = sign(`${username}.${issuedAt}`);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret).update(payload).digest("hex");
}
