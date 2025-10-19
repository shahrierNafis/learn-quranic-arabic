import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader } from "@/components/ui/drawer";
import Score from "./Score";
import { use, useCallback, useEffect, useState } from "react";
export default function ScoreDrawer() {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setTimeout(() => {
      setOpen(false);
    }, 4000); // close after 4 seconds
  }, []);
  useEffect(() => {
    window.addEventListener("openScoreDrawer", handleOpen);
    return () => {
      window.removeEventListener("openScoreDrawer", handleOpen);
    };
  }, [handleOpen]);

  return (
    <Drawer modal={false} dismissible={false} {...{ open }} onOpenChange={setOpen} direction="bottom">
      <DrawerContent className="h-fit m-0 py-2">
        <Score />
      </DrawerContent>
    </Drawer>
  );
}
