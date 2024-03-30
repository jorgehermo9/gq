import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Props {
  onClick?: () => void;
  description: string;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const ActionButton = ({
  onClick,
  description,
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
      <HoverCardContent className="max-w-96 w-fit text-sm p-2">
        {description}
      </HoverCardContent>
    </HoverCard>
  );
};

export default ActionButton;
