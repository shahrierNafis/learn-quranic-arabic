"use client";
import React, { useState } from "react";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SelectTranslation from "./SelectTranslation";
import UpdatePassword from "@/components/ChangePassword";
import ChangeColours from "@/components/ui/ChangeColours";
import ChangeFont from "@/components/ui/ChangeFont";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Switch } from "@/components/ui/switch";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { SetReviewOrder } from "@/components/SetReviewOrder";
import ChangeReciter from "@/components/ChangeReciter";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
export default function Preference() {
  const displayPreferences = useQuery(api.displayPreferences.get);
  const updateDisplayPreferences = useMutation(api.displayPreferences.update);

  const showTransliteration = displayPreferences?.showTransliteration ?? false;
  const showTranslation = displayPreferences?.showTranslation ?? false;
  const showTranslationOnHiddenWords = displayPreferences?.showTranslationOnHiddenWords ?? false;

  const setShowTransliteration = (val: boolean) => updateDisplayPreferences({ showTransliteration: val });
  const setShowTranslation = (val: boolean) => updateDisplayPreferences({ showTranslation: val });
  const setShowTranslationOnHiddenWords = (val: boolean) =>
    updateDisplayPreferences({ showTranslationOnHiddenWords: val });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return a shell skeleton or null during SSR to avoid extension interference
  if (!mounted) {
    return <div className="h-10 w-full animate-pulse bg-muted rounded-md" />;
  }

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings /> Preference{" "}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </DialogTrigger>
        <DialogContent className={"sm:max-w-md"}>
          <DialogHeader>
            <DialogTitle>Preference</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>{" "}
          <div className="overflow-y-auto flex flex-col max-h-[85vh] justify-center gap-2 p-2 max-w-md">
            <SelectTranslation />
            <ChangeReciter />
            <ChangeColours />
            <ChangeFont />
            <div
              style={{ gridTemplateColumns: "auto 1fr" }}
              className="grid align-middle rounded-md text-sm font-medium ring-offset-background transition-colors"
            >
              <div className={"flex h-10 px-4 py-2 rounded-md  justify-center items-center border"}>
                Show Transliteration on words{" "}
              </div>{" "}
              <Button
                className="h-full"
                onClick={() => setShowTransliteration(!showTransliteration)}
                variant={"outline"}
              >
                <Switch checked={showTransliteration} />
              </Button>
              <div className={"flex h-10 px-4 py-2 rounded-md  justify-center items-center border"}>
                Show Translation on words{" "}
              </div>{" "}
              <Button className="h-full" onClick={() => setShowTranslation(!showTranslation)} variant={"outline"}>
                <Switch checked={showTranslation} />
              </Button>
              <div className={"flex h-10 px-4 py-2 rounded-md  justify-center items-center border"}>
                Show Translation on hidden words
              </div>{" "}
              <Button
                className="h-full"
                onClick={() => setShowTranslationOnHiddenWords(!showTranslationOnHiddenWords)}
                variant={"outline"}
              >
                <Switch disabled={!showTranslation} checked={showTranslation && showTranslationOnHiddenWords} />
              </Button>
            </div>
            <div className="flex gap-2 justify-center  max-w-md">
              <ModeToggle />
              {/* <SetReviewOrder /> */}
              <UpdatePassword />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
