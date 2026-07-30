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

export const useUserDataOutOfSyncStore = create<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
}));

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
  useUserDataOutOfSyncStore.getState().setOpen(false);
}
async function pushToTheServer() {
  useUserDataOutOfSyncStore.getState().setOpen(false);
}
