/**
 * Magic Link Request API (Stub)
 * 
 * This is a placeholder endpoint for the passwordless sign-in flow.
 * It currently just logs the request and returns success.
 * 
 * TODO: Integrate with an email provider (e.g., Resend, SendGrid)
 * to send actual magic link emails.
 */

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { ok: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // For now, just log the request (no actual email sent)
    console.log("Magic link requested for", email);

    // In a real implementation, we would:
    // 1. Check if the email exists in our guides database
    // 2. Generate a secure, time-limited token
    // 3. Send an email with the magic link
    // 4. Store the token for verification

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Magic link request error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}

