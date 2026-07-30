"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";

export default function ChangePassword() {
  return (
    <Dialog>
      <DialogTrigger className={"w-full"}>
        <Button className={"w-full"} variant={"outline"}>
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Password updates are handled through the Convex Auth flow. Use the sign-in screen to create or reset your
            account credentials.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
