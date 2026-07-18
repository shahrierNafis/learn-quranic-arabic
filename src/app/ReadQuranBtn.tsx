"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "@/components/ui/Link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSubItem, useSidebar } from "@/components/ui/sidebar";

export default function CollapsibleQuranMenu() {
  const pathname = usePathname();
  const num = pathname.split("/")[pathname.split("/").length - 1];

  // Determine if we should open Surah or Juz by default based on current path
  const pathType = pathname.split("/")[2];
  const isSurahPath = !pathType || pathType === "surah";
  const isJuzPath = pathType === "juz";
  const { toggleSidebar, open } = useSidebar();

  const [openCollapsible, setOpenCollapsible] = React.useState(open);
  return (
    <>
      <div className="sidebar-menu w-full">
        <Collapsible
          open={openCollapsible && open}
          onOpenChange={setOpenCollapsible}
          className="group/collapsible w-full"
        >
          <SidebarMenuItem className="w-full">
            <CollapsibleTrigger className="w-full">
              <SidebarMenuButton
                onClick={() => !open && toggleSidebar()}
                className="w-full flex items-center justify-between shadow-sm"
              >
                <Book />
                <div className="flex items-center">
                  {pathname.startsWith("/quran/surah") ? (
                    <div>{surahArr[+num - 1]}</div>
                  ) : pathname.startsWith("/quran/juz") ? (
                    <>Juz {num}</>
                  ) : (
                    "Read Quran"
                  )}
                </div>
                <ChevronRight
                  className="h-3 w-3  duration-200 lucide lucide-chevron-right transition-transform ml-auto group-data-[state=open]/collapsible:rotate-90"
                  aria-hidden="true"
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </SidebarMenuItem>

          <CollapsibleContent className="mt-2 space-y-2">
            {/* Surah Submenu */}
            <div className="sidebar-menu-sub">
              <Collapsible defaultOpen={isSurahPath} className="group/surah-collapsible">
                {" "}
                <CollapsibleTrigger>
                  <Button variant="ghost" size="sm" className="w-full flex items-center justify-between">
                    <span>Surah</span>
                    <ChevronRight
                      className="h-3 w-3  duration-200 lucide lucide-chevron-right transition-transform ml-auto group-data-[state=open]/surah-collapsible:rotate-90"
                      aria-hidden="true"
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1">
                  <ScrollArea className="h-[40vh]">
                    <div className="space-y-1 py-1 pl-4">
                      {Array.from(Array(114).keys()).map((num) => (
                        <Link
                          key={num + 1}
                          disabled={pathname === `/quran/surah/${num + 1}`}
                          href={`/quran/surah/${num + 1}`}
                          className="w-full"
                        >
                          <Button
                            disabled={pathname === `/quran/surah/${num + 1}`}
                            className="w-full flex items-center justify-start gap-4"
                            variant="ghost"
                            size="sm"
                          >
                            <div className="w-6 text-right">{num + 1}.</div>
                            <div>{surahArr[num]}</div>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Juz Submenu */}
            <div className="sidebar-menu-sub">
              <Collapsible defaultOpen={isJuzPath} className="group/juz-collapsible">
                <CollapsibleTrigger>
                  <Button variant="ghost" size="sm" className="w-full flex items-center justify-between">
                    <span>Juz</span>
                    <ChevronRight
                      className="h-3 w-3  duration-200 lucide lucide-chevron-right transition-transform ml-auto group-data-[state=open]/juz-collapsible:rotate-90"
                      aria-hidden="true"
                    />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-1">
                  <ScrollArea className="h-[30vh]">
                    <div className="space-y-1 py-1 pl-4">
                      {Array.from(Array(30).keys()).map((num) => (
                        <Link
                          key={num + 1}
                          disabled={pathname === `/quran/juz/${num + 1}`}
                          href={`/quran/juz/${num + 1}`}
                          className="w-full"
                        >
                          <Button
                            disabled={pathname === `/quran/juz/${num + 1}`}
                            className="w-full flex items-center justify-start gap-4"
                            variant="ghost"
                            size="sm"
                          >
                            <div className="w-6 text-right">{num + 1}.</div>
                            <div>Juz {num + 1}</div>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </CollapsibleContent>
        </Collapsible>{" "}
      </div>
    </>
  );
}

const surahArr = [
  "Al-Fatihah",
  "Al-Baqarah",
  "Ali 'Imran",
  "An-Nisa",
  "Al-Ma'idah",
  "Al-An'am",
  "Al-A'raf",
  "Al-Anfal",
  "At-Tawbah",
  "Yunus",
  "Hud",
  "Yusuf",
  "Ar-Ra'd",
  "Ibrahim",
  "Al-Hijr",
  "An-Nahl",
  "Al-Isra",
  "Al-Kahf",
  "Maryam",
  "Taha",
  "Al-Anbya",
  "Al-Hajj",
  "Al-Mu'minun",
  "An-Nur",
  "Al-Furqan",
  "Ash-Shu'ara",
  "An-Naml",
  "Al-Qasas",
  "Al-'Ankabut",
  "Ar-Rum",
  "Luqman",
  "As-Sajdah",
  "Al-Ahzab",
  "Saba",
  "Fatir",
  "Ya-Sin",
  "As-Saffat",
  "Sad",
  "Az-Zumar",
  "Ghafir",
  "Fussilat",
  "Ash-Shuraa",
  "Az-Zukhruf",
  "Ad-Dukhan",
  "Al-Jathiyah",
  "Al-Ahqaf",
  "Muhammad",
  "Al-Fath",
  "Al-Hujurat",
  "Qaf",
  "Adh-Dhariyat",
  "At-Tur",
  "An-Najm",
  "Al-Qamar",
  "Ar-Rahman",
  "Al-Waqi'ah",
  "Al-Hadid",
  "Al-Mujadila",
  "Al-Hashr",
  "Al-Mumtahanah",
  "As-Saf",
  "Al-Jumu'ah",
  "Al-Munafiqun",
  "At-Taghabun",
  "At-Talaq",
  "At-Tahrim",
  "Al-Mulk",
  "Al-Qalam",
  "Al-Haqqah",
  "Al-Ma'arij",
  "Nuh",
  "Al-Jinn",
  "Al-Muzzammil",
  "Al-Muddaththir",
  "Al-Qiyamah",
  "Al-Insan",
  "Al-Mursalat",
  "An-Naba",
  "An-Nazi'at",
  "'Abasa",
  "At-Takwir",
  "Al-Infitar",
  "Al-Mutaffifin",
  "Al-Inshiqaq",
  "Al-Buruj",
  "At-Tariq",
  "Al-A'la",
  "Al-Ghashiyah",
  "Al-Fajr",
  "Al-Balad",
  "Ash-Shams",
  "Al-Layl",
  "Ad-Duhaa",
  "Ash-Sharh",
  "At-Tin",
  "Al-'Alaq",
  "Al-Qadr",
  "Al-Bayyinah",
  "Az-Zalzalah",
  "Al-'Adiyat",
  "Al-Qari'ah",
  "At-Takathur",
  "Al-'Asr",
  "Al-Humazah",
  "Al-Fil",
  "Quraysh",
  "Al-Ma'un",
  "Al-Kawthar",
  "Al-Kafirun",
  "An-Nasr",
  "Al-Masad",
  "Al-Ikhlas",
  "Al-Falaq",
  "An-Nas",
];
