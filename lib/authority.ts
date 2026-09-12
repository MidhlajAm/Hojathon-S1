import { generateText } from "@/lib/gemini-service";

export interface AuthorityLocation {
  lat: number;
  lng: number;
  label?: string;
}

export interface AuthorityIssue {
  category: string;
  issueType?: string;
  title?: string;
  description?: string;
}

export interface AuthorityCoverage {
  name: string;
  type: "municipality" | "utility" | "district";
  bounds?: { north: number; south: number; east: number; west: number };
}

export interface AuthorityRecord {
  id: string;
  name: string;
  department: string;
  category: string;
  jurisdiction: string;
  coverage: AuthorityCoverage;
  officialWebsite?: string;
  officialComplaintPortal?: string;
  officialEmail?: string;
  officialEmailVerified?: boolean;
  officialEmailSource?: string;
}

export interface AuthorityMatch {
  authority: AuthorityRecord;
  reason: string;
  confidence: number;
  source: "rules" | "gemini-assisted";
}

const KOCHI_BOUNDS = {
  north: 10.08,
  south: 9.82,
  east: 76.42,
  west: 76.13,
};

const AUTHORITY_CATALOG: readonly AuthorityRecord[] = [
  {
    id: "auth-roads",
    name: "Local Road Authority",
    department: "Public Works - Roads",
    category: "road",
    jurisdiction: "Kochi Corporation",
    coverage: { name: "Kochi Corporation", type: "municipality", bounds: KOCHI_BOUNDS },
    officialComplaintPortal: "https://kochicorporation.lsgkerala.gov.in/",
    officialEmail: "road.authority@example.gov",
    officialEmailVerified: false,
    officialEmailSource: "Prototype placeholder; replace with verified authority data",
  },
  {
    id: "auth-waste",
    name: "Municipal Health Wing",
    department: "Solid Waste Management",
    category: "waste",
    jurisdiction: "Kochi Corporation",
    coverage: { name: "Kochi Corporation", type: "municipality", bounds: KOCHI_BOUNDS },
    officialComplaintPortal: "https://kochicorporation.lsgkerala.gov.in/",
    officialEmail: "waste.desk@example.gov",
    officialEmailVerified: false,
    officialEmailSource: "Prototype placeholder; replace with verified authority data",
  },
  {
    id: "auth-lighting",
    name: "Electrical Division",
    department: "Street Lighting",
    category: "streetlight",
    jurisdiction: "Kochi Corporation",
    coverage: { name: "Kochi Corporation", type: "municipality", bounds: KOCHI_BOUNDS },
    officialComplaintPortal: "https://kochicorporation.lsgkerala.gov.in/",
    officialEmail: "lighting@example.gov",
    officialEmailVerified: false,
    officialEmailSource: "Prototype placeholder; replace with verified authority data",
  },
  {
    id: "auth-water",
    name: "Water Authority",
    department: "Water Distribution - Kochi Division",
    category: "water",
    jurisdiction: "Kerala Water Authority",
    coverage: { name: "Kochi Division", type: "utility", bounds: KOCHI_BOUNDS },
    officialWebsite: "https://kwa.kerala.gov.in/",
    officialEmail: "leaks@example.gov",
    officialEmailVerified: false,
    officialEmailSource: "Prototype placeholder; replace with verified authority data",
  },
  {
    id: "auth-environment",
    name: "Municipal Environment Cell",
    department: "Urban Forestry and Environment",
    category: "environment",
    jurisdiction: "Kochi Corporation",
    coverage: { name: "Kochi Corporation", type: "municipality", bounds: KOCHI_BOUNDS },
    officialComplaintPortal: "https://kochicorporation.lsgkerala.gov.in/",
    officialEmail: "environment@example.gov",
    officialEmailVerified: false,
    officialEmailSource: "Prototype placeholder; replace with verified authority data",
  },
  {
    id: "auth-property",
    name: "Municipal Asset Maintenance Division",
    department: "Public Property and Facilities",
    category: "public_property",
    jurisdiction: "Kochi Corporation",
    coverage: { name: "Kochi Corporation", type: "municipality", bounds: KOCHI_BOUNDS },
    officialComplaintPortal: "https://kochicorporation.lsgkerala.gov.in/",
    officialEmail: "property.maintenance@example.gov",
    officialEmailVerified: false,
    officialEmailSource: "Prototype placeholder; replace with verified authority data",
  },
  {
    id: "auth-general",
    name: "Municipal Grievance Cell",
    department: "General Complaints",
    category: "other",
    jurisdiction: "Kochi Corporation",
    coverage: { name: "Kochi Corporation", type: "municipality", bounds: KOCHI_BOUNDS },
    officialComplaintPortal: "https://kochicorporation.lsgkerala.gov.in/",
    officialEmail: "grievance@example.gov",
    officialEmailVerified: false,
    officialEmailSource: "Prototype placeholder; replace with verified authority data",
  },
];

const FALLBACK_ID = "auth-general";

function inCoverage(authority: AuthorityRecord, location: AuthorityLocation): boolean {
  const bounds = authority.coverage.bounds;
  return !bounds || (
    location.lat >= bounds.south &&
    location.lat <= bounds.north &&
    location.lng >= bounds.west &&
    location.lng <= bounds.east
  );
}

function findById(id: string): AuthorityRecord | undefined {
  return AUTHORITY_CATALOG.find((authority) => authority.id === id);
}

function ruleMatch(issue: AuthorityIssue, location: AuthorityLocation): AuthorityMatch {
  const authority = AUTHORITY_CATALOG.find(
    (candidate) => candidate.category === issue.category && inCoverage(candidate, location),
  ) ?? findById(FALLBACK_ID)!;

  return {
    authority,
    reason: authority.id === FALLBACK_ID
      ? "No specialized catalog entry matched the issue and location."
      : `The issue category '${issue.category}' is handled by this department in ${authority.coverage.name}.`,
    confidence: authority.id === FALLBACK_ID ? 0.45 : 0.9,
    source: "rules",
  };
}

export function listAuthorities(): readonly AuthorityRecord[] {
  return AUTHORITY_CATALOG;
}

export async function findAuthority(
  issue: AuthorityIssue,
  location: AuthorityLocation,
): Promise<AuthorityMatch> {
  const fallback = ruleMatch(issue, location);
  const candidates = AUTHORITY_CATALOG.filter((authority) => inCoverage(authority, location));
  if (!candidates.length || (!process.env.GEMINI_API_KEYS && !process.env.GEMINI_API_KEY)) {
    return fallback;
  }

  try {
    const result = await generateText({
      systemInstruction: "Choose only an authority ID from the supplied catalog. Never invent an authority, department, email, or URL.",
      prompt: JSON.stringify({
        task: "Select the responsible authority for this civic issue.",
        issue,
        location,
        authorities: candidates.map(({ id, name, department, category, jurisdiction, coverage }) => ({
          id,
          name,
          department,
          category,
          jurisdiction,
          coverage,
        })),
      }),
      responseSchema: {
        type: "object",
        properties: {
          authorityId: { type: "string", enum: candidates.map((authority) => authority.id) },
          reason: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["authorityId", "reason", "confidence"],
      },
    });
    const selected = JSON.parse(result.text) as {
      authorityId?: string;
      reason?: string;
      confidence?: number;
    };
    const authority = selected.authorityId ? findById(selected.authorityId) : undefined;
    if (!authority || !candidates.some((candidate) => candidate.id === authority.id)) return fallback;
    return {
      authority,
      reason: selected.reason?.trim() || fallback.reason,
      confidence: typeof selected.confidence === "number"
        ? Math.min(1, Math.max(0, selected.confidence))
        : fallback.confidence,
      source: "gemini-assisted",
    };
  } catch {
    return fallback;
  }
}
