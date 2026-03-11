export const PROPOSAL_CATEGORIES = [
  { value: "SECURITY", label: "Security", description: "CVE patches, vulnerability fixes, security audits" },
  { value: "INFRASTRUCTURE", label: "Infrastructure", description: "Node software, RPC endpoints, networking" },
  { value: "DEVELOPMENT", label: "Development", description: "Protocol features, client improvements" },
  { value: "GOVERNANCE", label: "Governance", description: "Parameter changes, voting mechanism updates" },
  { value: "COMMUNITY", label: "Community", description: "Documentation, education, outreach" },
  { value: "OPERATIONS", label: "Operations", description: "Operational costs, maintenance, tooling" },
] as const;

export type ProposalCategory = (typeof PROPOSAL_CATEGORIES)[number]["value"];

export const proposalCategoryColors: Record<ProposalCategory, string> = {
  SECURITY: "text-semantic-error bg-semantic-error/10",
  INFRASTRUCTURE: "text-semantic-info bg-semantic-info/10",
  DEVELOPMENT: "text-brand-green bg-brand-green-subtle",
  GOVERNANCE: "text-brand-amber bg-brand-amber-subtle",
  COMMUNITY: "text-text-muted bg-bg-elevated",
  OPERATIONS: "text-text-muted bg-bg-elevated",
};

/**
 * Parse category and title from a proposal description.
 * Format: "[CATEGORY] Title text\nBody..."
 * Returns { category, title, body } or null category if no prefix found.
 */
export function parseProposalDescription(description: string): {
  category: ProposalCategory | null;
  title: string;
  body: string;
} {
  const lines = description.split("\n");
  const firstLine = lines[0] || "";
  const body = lines.slice(1).join("\n").trim();

  const match = firstLine.match(/^\[(\w+)\]\s*(.*)/);
  if (match) {
    const rawCategory = match[1]!.toUpperCase();
    const validCategories = PROPOSAL_CATEGORIES.map((c) => c.value) as readonly string[];
    const category = validCategories.includes(rawCategory)
      ? (rawCategory as ProposalCategory)
      : null;
    return { category, title: match[2] || "Untitled", body };
  }

  return { category: null, title: firstLine || "Untitled", body };
}
