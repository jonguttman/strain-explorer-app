"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Simple email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function Gateway() {
  const router = useRouter();
  const [kioskKey, setKioskKey] = useState("");

  // Magic link state
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleKioskLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (kioskKey.trim()) {
      router.push(`/?key=${encodeURIComponent(kioskKey.trim())}`);
    }
  };

  const handleRequestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    // Validate email
    if (!email.trim() || !isValidEmail(email.trim())) {
      setErrorMessage("Enter a valid email address to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/request-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setSuccessMessage("If an account exists for this email, we've sent a sign-in link.");
        setEmail("");
      } else {
        setErrorMessage("We couldn't send a sign-in link right now. Please try again in a moment.");
      }
    } catch {
      setErrorMessage("We couldn't send a sign-in link right now. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6eddc] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo + Product Lockup */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/TOPsilly2026.svg"
            alt="The Original Psilly"
            width={180}
            height={36}
            priority
          />
          <div className="mt-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[#3f301f]">
              Tripdar™
            </h1>
            <p className="text-sm text-[#6b5841] mt-1">
              Trip radar powered by Fungapedia
            </p>
            <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-wide">
              In partnership with The Original Psilly
            </p>
          </div>
        </div>

        {/* Main card with two columns */}
        <div className="bg-white rounded-3xl border border-[#ddcbaa] shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e8dcc4]">
            {/* Left: Launch Tripdar Kiosk */}
            <div className="p-8">
              <h2 className="text-xl font-semibold text-[#3f301f] mb-2">
                Launch Tripdar Kiosk
              </h2>
              <p className="text-sm text-stone-600 mb-6">
                Have an access link? Enter your access key to open the Tripdar experience browser.
              </p>

              <form onSubmit={handleKioskLaunch} className="space-y-4">
                <div>
                  <label
                    htmlFor="kioskKey"
                    className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5"
                  >
                    Access Key
                  </label>
                  <input
                    type="text"
                    id="kioskKey"
                    value={kioskKey}
                    onChange={(e) => setKioskKey(e.target.value)}
                    placeholder="Enter your key"
                    className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm text-[#3f301f] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#3f301f] focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!kioskKey.trim()}
                  className="w-full rounded-full bg-[#3f301f] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2d2216] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Go
                </button>
              </form>

              <p className="mt-6 text-xs text-stone-500 leading-relaxed">
                Don&apos;t have an access key? Contact your Psilly representative to request an invite link.
              </p>
            </div>

            {/* Right: Tripdar Guides - Magic Link */}
            <div className="p-8 bg-[#fdfbf7]">
              <h2 className="text-xl font-semibold text-[#3f301f] mb-2">
                Tripdar Guides
              </h2>
              <p className="text-sm text-stone-600 mb-6">
                Staff and certified guides can sign in to access training materials and their engagement portal.
              </p>

              <form onSubmit={handleRequestMagicLink} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm text-[#3f301f] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#3f301f] focus:border-transparent"
                  />
                </div>

                {errorMessage && (
                  <p className="text-[11px] text-rose-500">
                    {errorMessage}
                  </p>
                )}

                {successMessage && (
                  <p className="text-[11px] text-emerald-600">
                    {successMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[#3f301f] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2d2216] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? "Sending…" : "Send sign-in link"}
                </button>

                <p className="text-[11px] text-stone-500 leading-relaxed">
                  We&apos;ll email you a one-time sign-in link. No password required.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} The Original Psilly. Tripdar™ powered by Fungapedia. All rights reserved.
          </p>
          <p className="text-[9px] text-stone-400 uppercase tracking-wide max-w-md mx-auto">
            CONFIDENTIAL BETA. Tripdar™ and the underlying Fungapedia dataset are proprietary and intended only for authorized Psilly partners.
          </p>
        </div>
      </div>
    </div>
  );
}
