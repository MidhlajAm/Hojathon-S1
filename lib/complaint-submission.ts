import { sendComplaintEmail, type EmailProvider } from "@/lib/email";

export interface ComplaintAttachment {
  filename: string;
  url: string;
}

export interface ComplaintDetails {
  recipientEmail: string;
  subject: string;
  body: string;
  attachment?: ComplaintAttachment;
  idempotencyKey?: string;
}

export type ComplaintSendStatus = "sent" | "failed" | "duplicate";

export interface ComplaintSubmissionResult {
  status: ComplaintSendStatus;
  recipientEmail: string;
  provider: string;
  attempts: number;
  messageId?: string;
  error?: string;
}

const successfulSubmissions = new Set<string>();
const inFlightSubmissions = new Set<string>();

function submissionKey(details: ComplaintDetails): string {
  return details.idempotencyKey?.trim() || [
    details.recipientEmail.trim().toLowerCase(),
    details.subject.trim(),
    details.body.trim(),
    details.attachment?.url ?? "",
  ].join("|");
}

function validate(details: ComplaintDetails): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.recipientEmail)) {
    throw new Error("A valid authority recipient email is required.");
  }
  if (!details.subject.trim() || !details.body.trim()) {
    throw new Error("Complaint subject and body are required.");
  }
}

function retryable(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes("timeout") || message.includes("temporarily") || message.includes("connection") || message.includes("econn");
}

export async function submitComplaint(
  details: ComplaintDetails,
  provider: EmailProvider = { name: "smtp", send: sendComplaintEmail },
): Promise<ComplaintSubmissionResult> {
  validate(details);
  const key = submissionKey(details);
  if (successfulSubmissions.has(key)) {
    return {
      status: "duplicate",
      recipientEmail: details.recipientEmail,
      provider: provider.name,
      attempts: 0,
    };
  }
  if (inFlightSubmissions.has(key)) {
    return {
      status: "duplicate",
      recipientEmail: details.recipientEmail,
      provider: provider.name,
      attempts: 0,
    };
  }

  const maxAttempts = 3;
  let lastError: unknown;
  let attempts = 0;
  inFlightSubmissions.add(key);
  try {
    for (attempts = 1; attempts <= maxAttempts; attempts += 1) {
      try {
        const receipt = await provider.send({
          to: details.recipientEmail,
          subject: details.subject,
          text: details.body,
          imageUrl: details.attachment?.url,
        });
        successfulSubmissions.add(key);
        return {
          status: "sent",
          recipientEmail: details.recipientEmail,
          provider: provider.name,
          attempts,
          messageId: receipt.messageId,
        };
      } catch (error) {
        lastError = error;
        if (!retryable(error) || attempts === maxAttempts) break;
      }
    }
  } finally {
    inFlightSubmissions.delete(key);
  }

  return {
    status: "failed",
    recipientEmail: details.recipientEmail,
    provider: provider.name,
    attempts,
    error: lastError instanceof Error ? lastError.message : String(lastError),
  };
}