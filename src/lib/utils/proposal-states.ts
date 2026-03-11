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
  [ProposalState.Defeated]: "Defeated",
  [ProposalState.Succeeded]: "Succeeded",
  [ProposalState.Queued]: "Queued",
  [ProposalState.Expired]: "Expired",
  [ProposalState.Executed]: "Executed",
};

export const proposalStateColors: Record<ProposalStateValue, string> = {
  [ProposalState.Pending]: "text-text-muted bg-bg-elevated",
  [ProposalState.Active]: "text-brand-green bg-brand-green-subtle",
  [ProposalState.Canceled]: "text-text-subtle bg-bg-elevated",
  [ProposalState.Defeated]: "text-semantic-error bg-semantic-error/10",
  [ProposalState.Succeeded]: "text-brand-green bg-brand-green-subtle",
  [ProposalState.Queued]: "text-brand-amber bg-brand-amber-subtle",
  [ProposalState.Expired]: "text-text-subtle bg-bg-elevated",
  [ProposalState.Executed]: "text-semantic-info bg-semantic-info/10",
};
