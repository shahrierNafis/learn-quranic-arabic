"use client";
import { useConvexAuth } from "@convex-dev/auth/react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import LoadingScreen from "./ui/LoadingScreen";

export default function CheckAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const pathname = usePathname();
  const [shouldShowLoader, setShouldShowLoader] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setShouldShowLoader(false);
    }

    if (
      !isAuthenticated &&
      (pathname.startsWith("/dashboard") ||
        pathname.startsWith("/collection") ||
        pathname.startsWith("/play") ||
        pathname.startsWith("/review"))
    ) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isLoading, pathname]);

  if (shouldShowLoader || isLoading) {
    return <LoadingScreen />;
  }
  return <></>;
}
