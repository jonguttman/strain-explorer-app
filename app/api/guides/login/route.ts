/**
 * Guide Login API
 * 
 * PROTOTYPE-ONLY AUTH: Simple username/password login for the Guides portal.
 * Should be replaced with proper auth before production.
 */

import { NextRequest, NextResponse } from "next/server";
import { getGuideByUsername, verifyPassword } from "@/lib/guideAuth";
import { createSessionToken, SESSION_COOKIE_OPTIONS, COOKIE_NAME_EXPORT } from "@/lib/guideSession";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find the guide
    const guide = getGuideByUsername(username);
    if (!guide) {
      return NextResponse.json(
        { ok: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, guide.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Create session token
    const token = createSessionToken(guide.id);

    // Create response with cookie
    const response = NextResponse.json({
      ok: true,
      guide: {
        id: guide.id,
        name: guide.name,
        role: guide.role,
      },
    });

    response.cookies.set(COOKIE_NAME_EXPORT, token, SESSION_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { ok: false, error: "An error occurred during login" },
      { status: 500 }
    );
  }
}

