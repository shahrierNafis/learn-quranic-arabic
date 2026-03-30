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
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import Ad from "./Ad";

export default function AdDialog() {
  return (
    <>
      <Dialog>
        <DialogTrigger>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <span className="absolute bg-linear-to-r from-purple-500 to-yellow-500 bg-clip-text text-transparent font-bold animate-pulse bg-size-[200%_auto]">
                Ad
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </DialogTrigger>
        <DialogContent className="md:min-w-[80vw]">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription className="h-[80vh] pt-[20vh]">
              <Ad />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
