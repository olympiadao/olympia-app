import { Badge } from "@/components/ui/badge";
import {
  proposalStateLabels,
  proposalStateColors,
  type ProposalStateValue,
} from "@/lib/utils/proposal-states";

export function ProposalStatus({ state }: { state: ProposalStateValue }) {
  return (
    <Badge className={proposalStateColors[state]}>
      {proposalStateLabels[state]}
    </Badge>
  );
}
