import { Badge } from "@/components/ui/badge";
import {
  proposalStateLabels,
  proposalStateColors,
  type ProposalStateValue,
} from "@/lib/utils/proposal-states";

export function ProposalStatus({
  state,
  sanctioned,
}: {
  state: ProposalStateValue;
  sanctioned?: boolean;
}) {
  if (sanctioned) {
    return (
      <Badge className="border-semantic-error/40 bg-semantic-error/20 text-semantic-error">
        Sanctioned
      </Badge>
    );
  }

  return (
    <Badge className={proposalStateColors[state]}>
      {proposalStateLabels[state]}
    </Badge>
  );
}
