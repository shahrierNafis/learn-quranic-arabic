"use client";
import ParticlesEffect from "@/components/ui/ParticlesEffect";
import ScrollDown from "@/components/ui/ScrollDown";
import React from "react";
import ConvexAuthPanel from "@/components/ConvexAuthPanel";

export default function Home() {
  return (
    <>
      <ParticlesEffect />
      <div className="grid grid-rows-2 md:grid-cols-2 md:grid-rows-1 min-h-dvh">
        <div className="font-extrabold text-2xl p-8 text-justify content-center">
          Learn <span className="text-green-500 dark:text-green-300">Quranic Arabic</span> More Efficiently And
          Effectively Using<span className="text-green-500 dark:text-green-300"> Immersion </span> And &quot;
          <span className="text-green-500 dark:text-green-300">Active Reading</span>&quot;
        </div>
        <div className="flex flex-col gap-2 justify-center items-center min-h-dvh">
          <ConvexAuthPanel />
          <ScrollDown />
        </div>
      </div>
    </>
  );
}
