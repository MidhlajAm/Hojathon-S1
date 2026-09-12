"use client";

import { useState } from "react";
import { timeAgo } from "@/lib/format";
import type { Comment } from "@/lib/types";

export default function CommentThread({
  issueId,
  comments: initial,
}: {
  issueId: string;
  comments: Comment[];
}) {
  const [comments, setComments] = useState(initial);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const body = text.trim();
    if (!body) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/issues/${issueId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Could not post that.");

      setComments(data.comments as Comment[]);
      setText("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not post that.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold tracking-tight-display">
        {comments.length === 0
          ? "No one has added anything yet"
          : `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`}
      </h2>

      <form onSubmit={send} className="mt-3">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          placeholder="Add what you know about this — how long it has been there, whether anyone was hurt."
          aria-label="Add a comment"
          className="w-full resize-y rounded-lg border border-rule bg-surface px-3 py-2 text-[15px] leading-6 focus:border-action focus:outline-none"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={sending || text.trim().length === 0}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-agent disabled:opacity-50"
          >
            {sending ? "Posting" : "Post comment"}
          </button>
          {error ? (
            <span className="text-sm text-sev-high">{error}</span>
          ) : null}
        </div>
      </form>

      <ul className="mt-5 space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="border-t border-rule pt-4">
            <p className="text-sm">
              <span className="font-semibold">{comment.author}</span>{" "}
              <span className="text-muted">{timeAgo(comment.createdAt)}</span>
            </p>
            <p className="mt-1 max-w-[68ch] text-[15px] leading-6">
              {comment.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
