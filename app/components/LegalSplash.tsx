"use client";

import { useState, useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "tripdar_legal_ack_v1";

// Safe way to check localStorage without hydration mismatch
function getStoredAck(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

// Track if we're on the client
function getIsClient() {
  return typeof window !== "undefined";
}

function subscribeNoop() {
  return () => {};
}

export default function LegalSplash() {
  // Use useSyncExternalStore for safe client detection (avoids SSR mismatch)
  const isClient = useSyncExternalStore(
    subscribeNoop,
    getIsClient,
    () => false // Server snapshot
  );

  // Use useSyncExternalStore for safe localStorage access
  const storedAck = useSyncExternalStore(
    subscribeToStorage,
    getStoredAck,
    () => false // Server snapshot
  );

  // Track if user clicked accept in this session
  const [sessionAccepted, setSessionAccepted] = useState(false);

  const handleAccept = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setSessionAccepted(true);
  }, []);

  // Don't render anything on server or if already accepted
  if (!isClient || storedAck || sessionAccepted) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center px-4 sm:px-6 pointer-events-auto"
      style={{ background: "rgba(0, 0, 0, 0.35)" }}
    >
      <div
        className="relative z-[1000] max-w-xl w-full rounded-3xl border shadow-xl flex flex-col"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
          maxHeight: "85vh",
        }}
      >
        {/* Header - stays fixed */}
        <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "var(--card-border)" }}>
          <p
            className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-2"
            style={{ color: "var(--ink-subtle)" }}
          >
            Legal Notice
          </p>
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--ink-main)" }}
          >
            Important Notice
          </h2>
        </div>

        {/* Scrollable body */}
        <div
          className="flex-1 overflow-y-auto px-6 py-4"
          style={{ maxHeight: "50vh" }}
        >
          <ul className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            <li className="flex gap-3">
              <span
                className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: "var(--accent)" }}
              />
              <span>
                Tripdar is an <strong style={{ color: "var(--ink-main)" }}>educational tool only</strong>. 
                It does not sell, facilitate, or arrange the sale or trade of any substances.
              </span>
            </li>
            <li className="flex gap-3">
              <span
                className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: "var(--accent)" }}
              />
              <span>
                Nothing in this app is medical advice, diagnosis, or treatment.
              </span>
            </li>
            <li className="flex gap-3">
              <span
                className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: "var(--accent)" }}
              />
              <span>
                Psilocybin and other substances may be <strong style={{ color: "var(--ink-main)" }}>illegal</strong> in 
                your jurisdiction. It is your responsibility to know and follow local laws.
              </span>
            </li>
            <li className="flex gap-3">
              <span
                className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: "var(--accent)" }}
              />
              <span>
                Always consult a qualified healthcare professional before making any decisions about 
                your health, medications, or substance use.
              </span>
            </li>
            <li className="flex gap-3">
              <span
                className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: "var(--accent)" }}
              />
              <span>
                Never drive or operate machinery under the influence of any psychoactive substance.
              </span>
            </li>
            <li className="flex gap-3">
              <span
                className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: "var(--accent)" }}
              />
              <span>
                If you are in crisis or feel unsafe, please seek local emergency or crisis support immediately.
              </span>
            </li>
          </ul>
        </div>

        {/* Footer with button - stays fixed */}
        <div className="px-6 pb-6 pt-4 border-t" style={{ borderColor: "var(--card-border)" }}>
          <button
            type="button"
            onClick={handleAccept}
            className="w-full inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-semibold shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: "var(--accent)",
              color: "#fff",
            }}
          >
            I Understand
          </button>
          <p
            className="mt-3 text-[11px] text-center leading-snug"
            style={{ color: "var(--ink-subtle)" }}
          >
            By continuing, you acknowledge that you have read and understood this notice.
          </p>
        </div>
      </div>
    </div>
  );
}
