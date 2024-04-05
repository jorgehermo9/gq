import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import ActionButton from "../action-button/action-button";
import { CircleAlert } from "lucide-react";

const Terminal = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <ActionButton description="Check notification errors">
          <CircleAlert />
        </ActionButton>
      </DrawerTrigger>
      <DrawerContent className="w-1/2 mx-auto">
        <DrawerHeader>
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default Terminal;
