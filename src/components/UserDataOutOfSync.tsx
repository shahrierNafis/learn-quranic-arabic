"use client";
import React from "react";
import { create } from "zustand";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { createClient } from "@/utils/supabase/clients";
import { Database } from "@/database.types";
import superjson from "superjson";

export const useUserDataOutOfSyncStore = create<{ open: boolean; text: string; setOpen: (open: boolean) => void; setText: (text: string) => void }>((set) => ({
  open: false,
  text: "Your user data is out of sync. Please choose to pull from the server or push to the server.",
  setOpen: (open: boolean) => set({ open }),
  setText: (text: string) => set({ text }),
}));

const supabase = createClient<Database>();

export default function UserDataOutOfSync() {
  const { open, text } = useUserDataOutOfSyncStore();
  return (
    <>
      <AlertDialog {...{ open }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>User Data Out of Sync</AlertDialogTitle>
            <AlertDialogDescription>{text}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-around sm:justify-around">
            <Button variant={"destructive"} onClick={pushToTheServer}>
              Push to the Server
            </Button>
            <Button variant={"outline"} onClick={pullFromTheServer}>
              Pull from the Server
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

async function pullFromTheServer() {
  const { data, error } = await supabase.from("user_preference").select("*").single();
  if (data?.preference && !error) {
    useOnlineStorage.setState((superjson.parse(data.preference as string) as any).state);
  }
  useUserDataOutOfSyncStore.getState().setOpen(false);
}
export async function pushToTheServer() {
  const state = useOnlineStorage.getState();
  const { error } = await supabase.from("user_preference").upsert({ preference: superjson.stringify({ state }) });
  if (!error) {
    useUserDataOutOfSyncStore.getState().setOpen(false);
  }
}
