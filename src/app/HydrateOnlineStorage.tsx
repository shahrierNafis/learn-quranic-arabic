"use client";
import React from "react";
import { createClient } from "@/utils/supabase/clients";
import { useOnlineStorage } from "@/stores/onlineStorage";

export default function HydrateOnlineStorage() {
  const supabase = createClient();
  React.useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event == "INITIAL_SESSION") useOnlineStorage.persist.rehydrate();
    });
  }, [supabase]);

  return <></>;
}
