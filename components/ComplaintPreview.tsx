"use client";

import { useState } from "react";
import type { ComplaintDraft } from "@/lib/agent/types";

/**
 * §9 — the citizen always sees exactly what will be sent, and can change it,
 * before anything leaves the platform.
 */
export default function ComplaintPreview({
  draft,
  onChange,
  onConfirm,
  submitting,
}: {
  draft: ComplaintDraft;
  onChange: (draft: ComplaintDraft) => void;
  onConfirm: () => void;
  submitting: boolean;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <section className="overflow-hidden rounded-card border border-rule bg-surface">
      <header className="border-b border-rule px-5 py-4">
        <h2 className="text-xl font-semibold tracking-tight-display">
          This is what gets sent
        </h2>
        <p className="mt-1 text-sm text-muted">
          Read it over. Nothing is submitted until you say so.
        </p>
      </header>

      <dl className="px-5 py-4 text-[15px]">
        <div className="flex gap-3 py-1.5">
          <dt className="w-16 shrink-0 text-muted">To</dt>
          <dd className="min-w-0 break-words font-medium">{draft.to}</dd>
        </div>
        <div className="flex gap-3 py-1.5">
          <dt className="w-16 shrink-0 text-muted">Subject</dt>
          <dd className="min-w-0 font-medium">
            {editing ? (
              <input
                value={draft.subject}
                onChange={(event) =>
                  onChange({ ...draft, subject: event.target.value })
                }
                className="w-full rounded-md border border-rule px-2 py-1 focus:border-action focus:outline-none"
              />
            ) : (
              draft.subject
            )}
          </dd>
        </div>
      </dl>

      <div className="border-t border-rule px-5 py-4">
        {editing ? (
          <textarea
            value={draft.body}
            onChange={(event) => onChange({ ...draft, body: event.target.value })}
            rows={14}
            aria-label="Complaint text"
            className="w-full resize-y rounded-md border border-rule p-3 text-[15px] leading-6 focus:border-action focus:outline-none"
          />
        ) : (
          <p className="max-w-[68ch] whitespace-pre-wrap text-[15px] leading-6 text-ink">
            {draft.body}
          </p>
        )}
      </div>

      <div className="border-t border-rule px-5 py-3 text-sm text-muted">
        {draft.attachments.map((attachment) => (
          <p key={attachment.url}>Attached: {attachment.name}</p>
        ))}
        <p>
          Attached: location{" "}
          <span className="font-mono text-[13px]">
            {draft.location.lat.toFixed(4)}, {draft.location.lng.toFixed(4)}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-rule px-5 py-4 sm:flex-row-reverse">
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className="rounded-lg bg-action px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-action-ink disabled:opacity-60"
        >
          {submitting ? "Submitting" : "Confirm & submit"}
        </button>
        <button
          type="button"
          onClick={() => setEditing((current) => !current)}
          disabled={submitting}
          className="rounded-lg border border-rule px-5 py-2.5 text-[15px] font-semibold text-ink hover:bg-ground disabled:opacity-60"
        >
          {editing ? "Done editing" : "Edit"}
        </button>
      </div>
    </section>
  );
}
