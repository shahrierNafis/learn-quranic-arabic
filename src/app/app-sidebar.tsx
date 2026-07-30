"use client";
import { Home, BrainCircuit, Grid3x3 } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Preference from "./Preference";
import ReadQuranBtn from "./ReadQuranBtn";
import Link from "@/components/ui/Link";
// import { usePathname } from "next/navigation";
import AD from "@/app/AD";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  // {
  //   title: "Spaced Repetition",
  //   url: "/spacedRepetition",
  //   icon: Clock,
  // },
  {
    title: "Active Read",
    url: "/activeRead",
    icon: BrainCircuit,
  },
  {
    title: "Root Lists",
    url: "/rootLists",
    icon: Grid3x3,
  },
];

export function AppSidebar() {
  // const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={(props) => <Link {...(props as any)} href={item.url} />}>
                    <item.icon />
                    <div> {item.title}</div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <Preference />
              <ReadQuranBtn />
              <AD />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarTrigger className="mx-auto mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
