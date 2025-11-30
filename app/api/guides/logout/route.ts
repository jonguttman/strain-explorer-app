/**
 * Guide Logout API
 * 
 * Clears the session cookie to log out the guide.
 */

import { NextResponse } from "next/server";
import { COOKIE_NAME_EXPORT } from "@/lib/guideSession";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  // Clear the session cookie
  response.cookies.set(COOKIE_NAME_EXPORT, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

