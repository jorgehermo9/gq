import { CirclePlay, Play } from "lucide-react";
import ActionButton from "@/components/action-button/action-button";
import { useSettings } from "@/providers/settings-provider";
import { useCallback, useEffect } from "react";

interface Props {
  autoApply: boolean;
  onClick: () => void;
}

const ApplyButton = ({ autoApply, onClick }: Props) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.altKey && e.key === "Enter") {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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
      onClick={onClick}
      description="Apply the query to the provided JSON (Alt + Enter)"
    >
      <Play className="w-5 h-5" />
    </ActionButton>
  );
};
export default ApplyButton;
