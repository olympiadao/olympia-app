export const ProposalState = {
  Pending: 0,
  Active: 1,
  Canceled: 2,
  Defeated: 3,
  Succeeded: 4,
  Queued: 5,
  Expired: 6,
  Executed: 7,
} as const;

export type ProposalStateValue = (typeof ProposalState)[keyof typeof ProposalState];

export const proposalStateLabels: Record<ProposalStateValue, string> = {
  [ProposalState.Pending]: "Pending",
  [ProposalState.Active]: "Active",
  [ProposalState.Canceled]: "Canceled",
  [ProposalState.Defeated]: "Rejected",
  [ProposalState.Succeeded]: "Succeeded",
  [ProposalState.Queued]: "Queued",
  [ProposalState.Expired]: "Expired",
  [ProposalState.Executed]: "Executed",
};

export const proposalStateColors: Record<ProposalStateValue, string> = {
  [ProposalState.Pending]: "text-text-muted bg-bg-elevated",
  [ProposalState.Active]: "text-brand-green bg-brand-green-subtle",
  [ProposalState.Canceled]: "text-text-subtle bg-bg-elevated",
  [ProposalState.Defeated]: "text-orange-400 bg-orange-400/10",
  [ProposalState.Succeeded]: "text-brand-green bg-brand-green-subtle",
  [ProposalState.Queued]: "text-text-muted bg-bg-elevated",
  [ProposalState.Expired]: "text-text-subtle bg-bg-elevated",
  [ProposalState.Executed]: "text-brand-green bg-brand-green-subtle",
};
