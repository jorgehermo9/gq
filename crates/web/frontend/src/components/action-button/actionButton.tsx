import { Button } from "../ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

interface Props {
  onClick: () => void;
  description: string;
  children: React.ReactNode;
}

const ActionButton = ({ onClick, description, children }: Props) => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <Button variant="outline" size="icon" onClick={onClick}>
          {children}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-fit text-sm p-2">{description}</HoverCardContent>
    </HoverCard>
  );
};

export default ActionButton;
