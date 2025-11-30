"use client";

import { useState } from "react";

type AccessKeyLinkCellProps = {
  keyId: string;
};

export function AccessKeyLinkCell({ keyId }: AccessKeyLinkCellProps) {
  const [copied, setCopied] = useState(false);

  // We'll use a relative link so it works with localhost and ngrok:
  const relativeUrl = `/?key=${encodeURIComponent(keyId)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(relativeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore errors for now
    }
  }

  return (
    <div className="flex items-center gap-2">
      <code className="rounded bg-slate-50 px-2 py-1 text-xs font-mono text-slate-700">
        {relativeUrl}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

