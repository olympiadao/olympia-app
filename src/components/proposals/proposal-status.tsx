import { Badge } from "@/components/ui/badge";
import {
  proposalStateLabels,
  proposalStateColors,
  type ProposalStateValue,
} from "@/lib/utils/proposal-states";

export function ProposalStatus({
  state,
  sanctioned,
  blocked,
}: {
  state: ProposalStateValue;
  sanctioned?: boolean;
  blocked?: boolean;
}) {
  if (sanctioned) {
    return (
      <Badge className="border-semantic-error/40 bg-semantic-error/20 text-semantic-error">
        Sanctioned
      </Badge>
    );
  }

  if (blocked) {
    return (
      <Badge className="border-semantic-error/40 bg-semantic-error/20 text-semantic-error">
        Blocked
      </Badge>
    );
  }

  return (
    <Badge className={proposalStateColors[state]}>
      {proposalStateLabels[state]}
    </Badge>
  );
}
