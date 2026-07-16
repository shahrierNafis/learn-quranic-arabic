// src/stores/storage.ts
import { PersistStorage } from "zustand/middleware";
import superjson from "superjson";
import { createClient } from "@/utils/supabase/clients";
import { Database } from "@/database.types";
import reportIssue from "@/utils/reportIssue";
import { PreferenceStore } from "./types";

const supabase = createClient<Database>();

export const storage: PersistStorage<PreferenceStore> = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    return superjson.parse(str);
  },

  setItem: async (name, value) => {
    value.state.lastModified = new Date();

    // 1. Write to localStorage
    localStorage.setItem(name, superjson.stringify(value) as string);

    // 2. Write to Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();

    async function setUserPreference() {
      if (user) {
        const a = await supabase
          .from("user_preference")
          .upsert({ preference: superjson.stringify(value), user_id: user.id })
          .then();
        if (a.error)
          if (!navigator.onLine)
            if (confirm("Failed to save preference to server. Retry?")) await setUserPreference();
            else reportIssue();
      }
    }
    await setUserPreference();
  },

  removeItem: (name: string) => {
    console.log(name, "has been deleted");
  },
};

export { supabase };
