"use client";

import { useState, useEffect } from "react";

interface MessageWithRead {
  id: string;
  guideId: string | "all";
  subject: string;
  body: string;
  createdAt: string;
  readBy: string[];
  isRead: boolean;
}

export default function GuideMessagesPage() {
  const [messages, setMessages] = useState<MessageWithRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const res = await fetch("/api/guides/messages");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async (message: MessageWithRead) => {
    if (expandedId === message.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(message.id);

    // Mark as read if not already
    if (!message.isRead) {
      try {
        await fetch("/api/guides/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId: message.id }),
        });

        // Optimistically update UI
        setMessages((prev) =>
          prev.map((m) =>
            m.id === message.id ? { ...m, isRead: true } : m
          )
        );
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="text-center text-stone-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#3f301f]">Messages</h1>
        <p className="mt-1 text-sm text-stone-600">
          {unreadCount > 0
            ? `You have ${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
            : "You're all caught up!"}
        </p>
      </div>

      {/* Message list */}
      {messages.length === 0 ? (
        <div className="rounded-2xl border border-[#ddcbaa] bg-white p-8 text-center">
          <p className="text-stone-500">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-2xl border bg-white overflow-hidden transition ${
                message.isRead
                  ? "border-[#ddcbaa]"
                  : "border-amber-300 shadow-sm"
              }`}
            >
              <button
                type="button"
                onClick={() => handleExpand(message)}
                className="w-full px-5 py-4 text-left hover:bg-stone-50 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!message.isRead && (
                        <span className="flex-shrink-0 h-2 w-2 rounded-full bg-amber-500" />
                      )}
                      <p
                        className={`font-medium truncate ${
                          message.isRead
                            ? "text-stone-700"
                            : "text-[#3f301f]"
                        }`}
                      >
                        {message.subject}
                      </p>
                    </div>
                    {expandedId !== message.id && (
                      <p className="text-sm text-stone-500 mt-1 truncate">
                        {message.body.slice(0, 100)}
                        {message.body.length > 100 ? "..." : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-stone-400">
                      {formatDate(message.createdAt)}
                    </p>
                    <svg
                      className={`h-4 w-4 text-stone-400 mt-1 ml-auto transition-transform ${
                        expandedId === message.id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Expanded body */}
              {expandedId === message.id && (
                <div className="px-5 pb-5 pt-2 border-t border-stone-100">
                  <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
                    {message.body}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

