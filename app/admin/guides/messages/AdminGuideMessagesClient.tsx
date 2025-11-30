"use client";

import { useState } from "react";
import type { GuideAccount, GuideMessage } from "@/lib/types";

type AdminGuideMessagesClientProps = {
  initialGuides: GuideAccount[];
  initialMessages: GuideMessage[];
};

export function AdminGuideMessagesClient({
  initialGuides,
  initialMessages,
}: AdminGuideMessagesClientProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [targetGuideId, setTargetGuideId] = useState<string>("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSending(true);

    try {
      const res = await fetch("/api/admin/guide-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId: targetGuideId,
          subject,
          body,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setMessages([data.message, ...messages]);
        setSubject("");
        setBody("");
        setSuccess("Message sent successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setIsSending(false);
    }
  };

  const getGuideName = (guideId: string) => {
    if (guideId === "all") return "All guides";
    const guide = initialGuides.find((g) => g.id === guideId);
    return guide?.name ?? guideId;
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Compose new message */}
      <section className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          New Message
        </h2>
        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="target"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                To
              </label>
              <select
                id="target"
                value={targetGuideId}
                onChange={(e) => setTargetGuideId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="all">All guides</option>
                {initialGuides.map((guide) => (
                  <option key={guide.id} value={guide.id}>
                    {guide.name} ({guide.username})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Enter subject..."
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="body"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Message
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Write your message..."
            />
          </div>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!subject.trim() || !body.trim() || isSending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </section>

      {/* Message history */}
      <section className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            Message History
          </h2>
        </div>
        {messages.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-500">
            No messages yet
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.map((msg) => (
              <div key={msg.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {msg.subject}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {msg.body}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-500">
                      {formatDate(msg.createdAt)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      To: {getGuideName(msg.guideId)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Read by: {msg.readBy.length}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

