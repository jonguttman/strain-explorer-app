/**
 * Guide Session Management
 * 
 * PROTOTYPE-ONLY AUTH: This is a simple dev/preview session system using
 * HTTP-only cookies with HMAC signing. It should be replaced with a proper
 * session solution before production deployment.
 */

import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import crypto from "crypto";
import type { GuideAccount } from "@/lib/types";
import { getGuideById } from "./guideAuth";

const COOKIE_NAME = "psilly_guide_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Use an environment variable or fallback for development
const SESSION_SECRET =
  process.env.GUIDE_SESSION_SECRET || "dev-session-secret-change-in-production";

interface SessionPayload {
  guideId: string;
  expiresAt: number;
}

/**
 * Sign a payload using HMAC-SHA256
 */
function signPayload(payload: SessionPayload): string {
  const data = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("hex");
  return Buffer.from(`${data}.${signature}`).toString("base64");
}

/**
 * Verify and decode a signed session token
 */
function verifyAndDecodeToken(token: string): SessionPayload | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const lastDotIndex = decoded.lastIndexOf(".");
    if (lastDotIndex === -1) return null;

    const data = decoded.slice(0, lastDotIndex);
    const signature = decoded.slice(lastDotIndex + 1);

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(data)
      .digest("hex");

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(data) as SessionPayload;

    // Check expiration
    if (payload.expiresAt < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Create a session cookie value for a guide
 */
export function createSessionToken(guideId: string): string {
  const payload: SessionPayload = {
    guideId,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  return signPayload(payload);
}

/**
 * Get the guide from the current request cookies (for API routes)
 */
export async function getGuideFromRequest(
  request: NextRequest
): Promise<GuideAccount | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAndDecodeToken(token);
  if (!payload) return null;

  const guide = getGuideById(payload.guideId);
  return guide ?? null;
}

/**
 * Get the guide from server component cookies
 */
export async function getGuideFromCookies(): Promise<GuideAccount | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAndDecodeToken(token);
  if (!payload) return null;

  const guide = getGuideById(payload.guideId);
  return guide ?? null;
}

/**
 * Cookie options for setting/clearing the session
 */
export const SESSION_COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DURATION_MS / 1000,
};

export const COOKIE_NAME_EXPORT = COOKIE_NAME;

