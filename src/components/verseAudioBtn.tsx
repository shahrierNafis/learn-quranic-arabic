import React, { useRef } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Volume2, X } from "lucide-react";
import { Button } from "./ui/button";
import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import useVerseAudio from "./useVerseAudio";
import { useShallow } from "zustand/react/shallow";
import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useTimeListened = create<{
  timeListened: number;
  setTimeListened: (timeListened: number) => void;
  addTimeListened: (amount: number) => void;
  stringTimeListened: string;
}>()(
  persist(
    (set) => ({
      timeListened: 0,
      setTimeListened: (timeListened: number) => set({ timeListened }),
      addTimeListened: (amount: number) =>
        set((state) => ({
          timeListened: state.timeListened + amount,
          stringTimeListened: millisecondsToHMS(state.timeListened + amount),
        })),
      stringTimeListened: "00:00:00",
    }),
    {
      name: "TimeListened", // add a name for the store
      // skipHydration: true,
    },
  ),
);

export default function VerseAudioBtn({
  verse_key,
  onClick,
  modal = false,
  variant = "ghost",
}: {
  verse_key: string;
  onClick?: () => void;
  modal?: boolean;
  variant?: "ghost" | "outline" | "link" | "default" | "destructive" | "secondary" | null | undefined;
}) {
  const { verseAudio, audioVerse, setAudioVerse } = useVerseAudio(verse_key);
  const [addTimeListened] = useTimeListened(useShallow((s) => [s.addTimeListened]));
  const callCountRef = useRef(0); // To track how many times onListen is called

  return (
    <>
      <Drawer open={audioVerse == verse_key} modal={modal}>
        <DrawerTrigger>
          <div className="flex">
            <Button
              onClick={() => {
                setAudioVerse(verse_key);
                onClick?.();
              }}
              className=""
              size={"icon"}
              variant={variant}
              disabled={!verseAudio || !!audioVerse}
            >
              <Volume2 />
            </Button>
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <AudioPlayer
            listenInterval={1000}
            onListen={(e) => {
              callCountRef.current += 1;
              if (callCountRef.current % 2 === 0) {
                return; // Skip every second call
              }
              addTimeListened(1000);
            }}
            autoPlay
            src={verseAudio}
            showJumpControls={false}
            // other props here
            customControlsSection={[
              RHAP_UI.ADDITIONAL_CONTROLS,

              RHAP_UI.MAIN_CONTROLS,
              <Button
                key={verse_key}
                className="w-fit m-auto rounded-full aspect-square"
                variant={"outline"}
                size={"icon"}
                onClick={() => setAudioVerse(undefined)}
              >
                <X />
              </Button>,
              RHAP_UI.VOLUME_CONTROLS,
            ]}
          />
        </DrawerContent>
      </Drawer>
    </>
  );
}
function millisecondsToHMS(milliseconds: number): string {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
