"use client";
import React from "react";
import { create } from "zustand";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { createClient } from "@/utils/supabase/clients";
import { Database } from "@/database.types";
import superjson from "superjson";

export const useUserDataOutOfSyncStore = create<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
}));

const supabase = createClient<Database>();

export default function UserDataOutOfSync() {
  const { open } = useUserDataOutOfSyncStore();
  return (
    <>
      <AlertDialog {...{ open }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>User Data Out of Sync</AlertDialogTitle>
            <AlertDialogDescription>
              Your local data is out of sync with the server, Your local data is more recent than the server. Would you
              like to push your local data to the server or pull the server data to your local storage?
            </AlertDialogDescription>
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

export async function pullFromTheServer() {
  const { data, error } = await supabase.from("user_preference").select("*").single();
  if (data?.preference && !error) {
    useOnlineStorage.setState((superjson.parse(data.preference as string) as any).state);
  }
  useUserDataOutOfSyncStore.getState().setOpen(false);
}
async function pushToTheServer() {
  const state = useOnlineStorage.getState();
  const { error } = await supabase.from("user_preference").upsert({ preference: superjson.stringify({ state }) });
  if (!error) {
    useUserDataOutOfSyncStore.getState().setOpen(false);
  }
}
