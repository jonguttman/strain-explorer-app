import Image from "next/image";

export function BetaGate() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#f6eddc] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo + Product Lockup */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/TOPsilly2026.svg"
            alt="The Original Psilly"
            width={180}
            height={30}
            className="opacity-80"
          />
          <div className="mt-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#3f301f]">
              Tripdar™
            </h1>
            <p className="text-xs text-[#6b5841] mt-1">
              Trip radar powered by Fungapedia
            </p>
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-3xl border border-[#e2d3b5] bg-white/90 shadow-lg p-8 text-center">
          {/* Lock icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f6eddc] border border-[#e2d3b5]">
            <svg
              className="h-7 w-7 text-[#8b7a5c]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-[#3f301f] mb-3">
            Confidential beta – invite only
          </h2>

          <p className="text-sm text-[#6b5841] leading-relaxed mb-4">
            Tripdar is part of a private beta program for partners of The Original Psilly. 
            To protect our proprietary Fungapedia methodology and content, access is limited to invited testers.
          </p>

          <p className="text-sm text-[#8b7a5c] leading-relaxed mb-6">
            If you&apos;ve been invited, please use the personal link that was shared
            with you (it will include a{" "}
            <code className="px-1.5 py-0.5 rounded bg-[#f6eddc] text-xs font-mono text-[#3f301f]">
              ?key=...
            </code>{" "}
            parameter).
          </p>

          <a
            href="mailto:hello@theoriginalpsilly.com?subject=Tripdar%20Beta%20Invite%20Request"
            className="inline-flex items-center justify-center rounded-full bg-[#3f301f] px-6 py-3 text-sm font-semibold text-[#f6eddc] hover:bg-[#2d1d12] transition shadow-sm"
          >
            Request a beta invite
          </a>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-[9px] text-stone-400">
            © {currentYear} The Original Psilly. Tripdar™ powered by Fungapedia. All rights reserved.
          </p>
          <p className="text-[8px] leading-snug text-stone-400 uppercase tracking-wide max-w-sm mx-auto">
            CONFIDENTIAL BETA. Tripdar™ and the underlying Fungapedia dataset are proprietary and intended only for authorized Psilly partners.
            Unauthorized disclosure, distribution, or reproduction is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}

