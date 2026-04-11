import {
  Wallet,
  Landmark,
  Vote,
  FileText,
  Timer,
  Zap,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const fundingSteps = [
  {
    icon: Wallet,
    title: "Transaction Fees",
    description:
      "Every transaction pays a basefee via EIP-1559. The basefee is directed to the Treasury. Block rewards and tips remain completely untouched. Miners are unaffected.",
    detail: "Funded by basefee revenue, not inflation",
  },
  {
    icon: Landmark,
    title: "Treasury",
    description:
      "Protocol-managed vault accumulates basefee revenue and voluntary on-chain donations. Real-time monitoring via public dashboard.",
    detail: "Immutable vault with on-chain transparency",
  },
  {
    icon: Vote,
    title: "Governance",
    description:
      "Community proposals allocate treasury funds through on-chain voting with timelock security and sanctions compliance at every layer.",
    detail: "Membership-based voting with 3-layer sanctions defense",
  },
];

const governanceSteps = [
  {
    icon: FileText,
    title: "Propose",
    description:
      "Anyone can submit a governance proposal on-chain. Proposals define the action to execute and the supporting rationale.",
  },
  {
    icon: Vote,
    title: "Vote",
    description:
      "Members cast on-chain votes during a defined voting period. A quorum threshold must be met for the proposal to pass.",
  },
  {
    icon: Timer,
    title: "Queue",
    description:
      "Approved proposals enter a security timelock. This delay provides the community time to review before execution.",
  },
  {
    icon: Zap,
    title: "Execute",
    description:
      "After the timelock expires, the proposal executes automatically. Treasury transfers happen on-chain with full auditability.",
  },
  {
    icon: Eye,
    title: "Disclose",
    description:
      "All outcomes are publicly reported and independently verifiable. Proposal records form a permanent on-chain record.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-12">
      {/* Treasury Funding */}
      <div>
        <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-brand-green">
          Treasury Funding
        </p>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          How It Works
        </h1>
        <p className="mb-8 max-w-2xl text-sm text-text-muted">
          Sustainable protocol funding without impacting miners. Transaction fee
          revenue flows through three stages.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {fundingSteps.map((step, i) => (
            <Card key={step.title} className="transition-all duration-200 hover:-translate-y-0.5 hover:border-border-brand">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green-subtle">
                  <step.icon className="h-5 w-5 text-brand-green" />
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-background">
                  {i + 1}
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="mb-3 text-sm leading-relaxed text-text-muted">
                {step.description}
              </p>
              <p className="font-mono text-xs text-text-subtle">
                {step.detail}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Governance Process */}
      <div>
        <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-brand-green">
          Governance Process
        </p>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">
          From Proposal to Execution
        </h2>
        <p className="mb-8 max-w-2xl text-sm text-text-muted">
          Five stages from idea to execution: every step on-chain, transparent,
          and auditable.
        </p>

        {/* Desktop: horizontal timeline */}
        <div className="hidden md:block">
          <div className="grid grid-cols-5 gap-4">
            {governanceSteps.map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                {i < governanceSteps.length - 1 && (
                  <div className="absolute top-5 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-px bg-border-brand" />
                )}
                <div className="relative z-10 mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-background">
                  {i + 1}
                </div>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green-subtle">
                  <step.icon className="h-[18px] w-[18px] text-brand-green" />
                </div>
                <h3 className="mb-2 text-sm font-semibold">{step.title}</h3>
                <p className="text-xs leading-relaxed text-text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden">
          <div className="relative border-l-2 border-border-brand pl-8">
            {governanceSteps.map((step, i) => (
              <div key={step.title} className="relative mb-8 last:mb-0">
                <div className="absolute -left-[calc(1rem+5px)] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-background">
                  {i + 1}
                </div>
                <div className="mb-1 flex items-center gap-2">
                  <step.icon className="h-4 w-4 text-brand-green" />
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                </div>
                <p className="text-xs leading-relaxed text-text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
