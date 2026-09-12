import type { AuthorityIssue, AuthorityLocation, AuthorityRecord } from "@/lib/authority";

export interface AuthorityEmailInput {
  id?: string;
  name?: string;
  department?: string;
  jurisdiction?: string;
  officialEmail?: string;
  officialEmailVerified?: boolean;
  officialEmailSource?: string;
}

export interface AuthorityEmailResult {
  found: boolean;
  email?: string;
  authorityId?: string;
  authorityName?: string;
  department?: string;
  jurisdiction?: string;
  source?: string;
  reason: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isVerifiedAuthority(authority: AuthorityEmailInput): boolean {
  return Boolean(
    authority.officialEmail &&
    authority.officialEmailVerified === true &&
    isValidEmail(authority.officialEmail),
  );
}

export async function findAuthorityEmail(
  authority: AuthorityEmailInput | AuthorityRecord,
  issue: AuthorityIssue,
  location: AuthorityLocation,
): Promise<AuthorityEmailResult> {
  void issue;
  void location;
  if (!isVerifiedAuthority(authority)) {
    return {
      found: false,
      authorityId: authority.id,
      authorityName: authority.name,
      department: authority.department,
      jurisdiction: authority.jurisdiction,
      source: authority.officialEmailSource,
      reason: "No verified official complaint email is available for this authority.",
    };
  }

  return {
    found: true,
    email: authority.officialEmail,
    authorityId: authority.id,
    authorityName: authority.name,
    department: authority.department,
    jurisdiction: authority.jurisdiction,
    source: authority.officialEmailSource ?? "Controlled authority registry",
    reason: "Email returned from the verified authority registry.",
  };
}