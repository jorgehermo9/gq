import { CirclePlay } from "lucide-react";
import ActionButton from "@/components/action-button/action-button";

interface Props {
  autoApply: boolean;
}

const ApplyButton = ({ autoApply }: Props) => {
  return autoApply ? (
    <ActionButton
      disabled
      className="rounded-full"
      description="Auto applying the query to the provided JSON. You can disable this feature in the settings."
    >
      <CirclePlay />
    </ActionButton>
  ) : (
    <ActionButton
      className="rounded-full"
      onClick={() => {}}
      description="Apply the query to the provided JSON"
    >
      <CirclePlay />
    </ActionButton>
  );
};
export default ApplyButton;
