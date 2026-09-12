import { analyzeIssue, type IssueAnalysisResult } from "@/lib/issue-analysis";
import { findAuthority, type AuthorityMatch } from "@/lib/authority";
import { findAuthorityEmail, type AuthorityEmailResult } from "@/lib/authority-email";
import { getComplaintRequirements } from "@/lib/complaint-requirements";
import { generateComplaint, type GeneratedComplaint } from "@/lib/complaint-generator";
import { submitComplaint, type ComplaintSubmissionResult } from "@/lib/complaint-submission";
import { CURRENT_USER, createIssue, recordComplaint } from "@/lib/db/store";
import type { Complaint } from "@/lib/types";

export interface ComplaintWorkflowInput {
  imageUrl: string;
  imageMimeType: string;
  location: { lat: number; lng: number; label?: string };
  description?: string;
  reporterName?: string;
  idempotencyKey?: string;
}

export interface ComplaintWorkflowResult {
  status: "submitted" | "failed" | "duplicate";
  complaintId?: string;
  recipientEmail?: string;
  complaint?: GeneratedComplaint;
  submission?: ComplaintSubmissionResult;
  analysis?: IssueAnalysisResult;
  authority?: AuthorityMatch;
  email?: AuthorityEmailResult;
  error?: string;
  storedComplaint?: Complaint;
}

export async function runComplaintWorkflow(input: ComplaintWorkflowInput): Promise<ComplaintWorkflowResult> {
  try {
    const analysis = await analyzeIssue({
      image: { url: input.imageUrl, mimeType: input.imageMimeType },
      additionalContext: input.description,
    });
    const authority = await findAuthority(
      {
        category: analysis.category,
        issueType: analysis.issueType,
        title: analysis.shortDescription,
        description: analysis.detailedDescription,
      },
      input.location,
    );
    const email = await findAuthorityEmail(authority.authority, {
      category: analysis.category,
      issueType: analysis.issueType,
      title: analysis.shortDescription,
      description: analysis.detailedDescription,
    }, input.location);
    if (!email.found || !email.email) {
      return { status: "failed", analysis, authority, email, error: email.reason };
    }

    const requirements = getComplaintRequirements(authority.authority, {
      category: analysis.category,
      issueType: analysis.issueType,
      title: analysis.shortDescription,
      description: analysis.detailedDescription,
    });
    const complaint = await generateComplaint({
      authority: authority.authority,
      issue: {
        category: analysis.category,
        issueType: analysis.issueType,
        title: analysis.shortDescription,
        description: analysis.detailedDescription,
        severity: analysis.severity,
        shortDescription: analysis.shortDescription,
        detailedDescription: analysis.detailedDescription,
      },
      location: input.location,
      imageUrl: input.imageUrl,
      requirements,
      reporterName: input.reporterName ?? CURRENT_USER.name,
    });
    const submission = await submitComplaint({
      recipientEmail: email.email,
      subject: complaint.subject,
      body: complaint.body,
      attachment: { filename: "issue-photo.jpg", url: complaint.imageUrl },
      idempotencyKey: input.idempotencyKey,
    });
    if (submission.status === "failed") {
      return { status: "failed", analysis, authority, email, complaint, submission, error: submission.error };
    }
    if (submission.status === "duplicate") {
      return { status: "duplicate", analysis, authority, email, complaint, submission, recipientEmail: email.email };
    }

    const storedIssue = createIssue({
      authorId: CURRENT_USER.id,
      authorName: input.reporterName ?? CURRENT_USER.name,
      imageUrl: input.imageUrl,
      description: input.description,
      location: input.location,
      analysis: {
        isCivicIssue: true,
        title: analysis.shortDescription,
        category: analysis.category,
        summary: analysis.detailedDescription,
        severity: analysis.severity,
        confidence: analysis.confidence,
        tags: [analysis.issueType],
      },
      complaintStatus: "submitted",
    });
    const storedComplaint: Complaint = {
      id: `CIV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      issueId: storedIssue.id,
      authority: {
        id: authority.authority.id,
        name: authority.authority.name,
        department: authority.authority.department,
        email: email.email,
        jurisdiction: authority.authority.jurisdiction,
      },
      to: email.email,
      subject: complaint.subject,
      body: complaint.body,
      attachments: [{ name: "issue-photo.jpg", url: complaint.imageUrl }],
      status: "submitted",
      submittedAt: new Date().toISOString(),
      channel: "email",
      receipt: submission.messageId,
      timeline: [{ at: new Date().toISOString(), label: "Complaint submitted automatically", note: email.email }],
    };
    recordComplaint(storedComplaint);
    return {
      status: "submitted",
      complaintId: storedComplaint.id,
      recipientEmail: email.email,
      complaint,
      submission,
      analysis,
      authority,
      email,
      storedComplaint,
    };
  } catch (error) {
    return { status: "failed", error: error instanceof Error ? error.message : String(error) };
  }
}