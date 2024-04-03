import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Props {
  description: string;
  side?: "top" | "bottom" | "left" | "right";
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const ActionButton = ({
  description,
  side = "bottom",
  onClick,
  disabled = false,
  children,
  className,
}: Props) => {
  return (
    <HoverCard openDelay={1200}>
      <HoverCardTrigger>
        <Button
          className={className}
          variant="outline"
          size="icon"
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent side={side} className="max-w-96 w-fit text-sm p-2">
        {description}
      </HoverCardContent>
    </HoverCard>
  );
};

export default ActionButton;
