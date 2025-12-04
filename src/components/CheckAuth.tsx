"use client";
import { createClient } from "@/utils/supabase/clients";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import LoadingScreen from "./ui/LoadingScreen";
import { useOnlineStorage } from "@/stores/onlineStorage";
export default function CheckAuth() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (
        error &&
        !user &&
        (pathname.startsWith("/dashboard") ||
          pathname.startsWith("/collection") ||
          pathname.startsWith("/play") ||
          pathname.startsWith("/review"))
      ) {
        alert(error.message);
        window.location.href = "/";
      }
      setIsLoading(false);
    });

    return () => {};
  }, [pathname, supabase.auth]);

  if (isLoading) {
    return <LoadingScreen />;
  }
  return <></>;
}
