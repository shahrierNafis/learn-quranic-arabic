"use client";
import React from "react";
import { SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";

export default function Ad() {
  const { state, open, setOpen, isMobile } = useSidebar();

  return (
    <>
      <SidebarMenuItem>
        <a href="https://shahriernafis.github.io/billboard/" target="_blank">
          <SidebarMenuButton variant="outline" size={"sm"} className="flex items-center justify-center">
            <span className="absolute bg-linear-to-r from-purple-500 to-yellow-500 bg-clip-text text-transparent font-bold animate-pulse bg-size-[200%_auto]">
              {open ? "Billboard" : "B"}
            </span>
          </SidebarMenuButton>
        </a>
      </SidebarMenuItem>
    </>
  );
}
