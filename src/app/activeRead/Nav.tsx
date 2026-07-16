import React from "react";
import AnimationLoop from "./AnimationLoop";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useLocalStorage } from "@/stores/localStorage";
import { useShallow } from "zustand/react/shallow";
import { useOnlineStorage } from "@/stores/onlineStorage";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import EditRanks from "./Rank";
import { p, pre } from "framer-motion/client";
import SelectChapters from "./SelectChapters";
import DailyGoals from "./DailyGoals";

function Nav() {
  const [order] = useLocalStorage(useShallow((state) => [state.order]));
  const [openRanks, setOpenRanks] = React.useState(false);
  const [openSetChapters, setOpenSetChapters] = React.useState(false);
  const [openDailyGoals, setOpenDailyGoals] = React.useState(false);

  return (
    <div className="flex gap-2 items-start justify-center mt-2 w-full h-full">
      <div className="flex gap-2 items-start justify-start mt-2">
        <AnimationLoop />

        <ButtonGroup aria-label="Button group">
          <Button
            variant={order === "frequency" ? "secondary" : "outline"}
            onClick={() => {
              setOpenRanks((prev) => !prev);
            }}
          >
            <Settings className="" />
          </Button>
          <Button
            onClick={() => useLocalStorage.setState(() => ({ order: "frequency" }))}
            className=""
            variant={order === "frequency" ? "secondary" : "outline"}
          >
            <div className="flex gap-2 items-center justify-center">Frequency List</div>
          </Button>
          <Button
            onClick={() => useLocalStorage.setState(() => ({ order: "quran" }))}
            className=""
            variant={order === "quran" ? "secondary" : "outline"}
          >
            <div>Quran</div>
          </Button>
          <Button
            variant={order === "quran" ? "secondary" : "outline"}
            onClick={() => {
              setOpenSetChapters((prev) => !prev);
            }}
          >
            <Settings className="" />
          </Button>
        </ButtonGroup>
        <Dialog open={openDailyGoals} onOpenChange={(o) => setOpenDailyGoals(o)}>
          <DialogTrigger>
            <Button variant="outline">Daily Goals</Button>
          </DialogTrigger>
          <DialogContent className="max-w-fit min-w-sm  flex flex-col  max-h-[80vh]">
            <DialogHeader className="">
              <DialogTitle>Daily Goals</DialogTitle>
              <DialogDescription></DialogDescription>
              <DailyGoals />
            </DialogHeader>
            <DialogFooter>
              <DialogClose>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Dialog open={openRanks} onOpenChange={(o) => setOpenRanks(o)}>
        <DialogTrigger className="w-0 h-0"></DialogTrigger>
        <DialogContent className="sm:max-w-[80vw] flex flex-col  max-h-[80vh]">
          <DialogHeader className="">
            <DialogTitle>Quran Word frequency list</DialogTitle>
            <DialogDescription>This is a list of words in the quran ordered by their frequency.</DialogDescription>
          </DialogHeader>
          <EditRanks />
        </DialogContent>
      </Dialog>
      <Dialog open={openSetChapters} onOpenChange={(o) => setOpenSetChapters(o)}>
        <DialogTrigger className="w-0 h-0"></DialogTrigger>
        <DialogContent className="sm:max-w-[80vw] flex flex-col  max-h-[80vh]">
          <DialogHeader className="">
            <DialogTitle>Quran Progress</DialogTitle>
            <DialogDescription>Check your progress or select the chapters you want to read</DialogDescription>
          </DialogHeader>
          <SelectChapters />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Nav;
