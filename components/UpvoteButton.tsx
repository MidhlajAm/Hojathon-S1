"use client";

import { useState, useTransition } from "react";
import { ArrowUpIcon } from "./icons";

export default function UpvoteButton({
  issueId,
  initialCount,
  initialVoted,
}: {
  issueId: string;
  initialCount: number;
  initialVoted: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [pending, startTransition] = useTransition();

  function toggle() {
    // Optimistic: the count moves under the finger, and reconciles with the
    // server's number when it answers.
    const nextVoted = !voted;
    setVoted(nextVoted);
    setCount((current) => current + (nextVoted ? 1 : -1));

    startTransition(async () => {
      try {
        const response = await fetch(`/api/issues/${issueId}/vote`, {
          method: "POST",
        });
        if (!response.ok) throw new Error("vote failed");
        const data = (await response.json()) as {
          upvotes: number;
          upvoted: boolean;
        };
        setCount(data.upvotes);
        setVoted(data.upvoted);
      } catch {
        setVoted(!nextVoted);
        setCount((current) => current + (nextVoted ? -1 : 1));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={voted}
      className={`flex items-center gap-1.5 rounded-chip px-2 py-1 font-medium transition-colors ${
        voted
          ? "bg-action/10 text-action"
          : "text-muted hover:bg-ground hover:text-ink"
      }`}
    >
      <ArrowUpIcon className="h-[18px] w-[18px]" />
      <span>{count}</span>
      <span className="sr-only">
        {voted ? "Remove your support" : "Support this report"}
      </span>
    </button>
  );
}
