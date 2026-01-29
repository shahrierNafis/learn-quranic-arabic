"use client";
import Logout from "@/components/Logout";
import ParticlesEffect from "@/components/ui/ParticlesEffect";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { createClient } from "@/utils/supabase/clients";
import { Auth } from "@supabase/auth-ui-react";
import {
  // Import predefined theme
  ThemeSupa,
} from "@supabase/auth-ui-shared";
import { User } from "@supabase/supabase-js";
import { use, useEffect, useState } from "react";
import ScrollDown from "@/components/ui/ScrollDown";
import UpdatePassword from "@/components/ChangePassword";
import Link from "@/components/ui/Link";
import React from "react";
import { Button } from "@/components/ui/button";
import { useOnlineStorage } from "@/stores/onlineStorage";

export default function Home() {
  const [user, setUser] = useState<User | null>();
  const supabase = createClient();
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      setUser(data.user);
    });
    supabase.auth.onAuthStateChange((event, session) => {
      if (event == "SIGNED_IN") {
        setUser(session?.user);
        useOnlineStorage.persist.rehydrate();
      }
      setTimeout(async () => {
        // await on other Supabase function here
        // this runs right after the callback has finished
      }, 0);
    });
  }, [supabase]);
  return (
    <>
      <ParticlesEffect />
      <div className="grid grid-rows-2 md:grid-cols-2 md:grid-rows-1 min-h-dvh">
        <div className="font-extrabold text-2xl p-8 text-justify content-center">
          Learn <span className="text-green-500 dark:text-green-300">Quranic Arabic</span> More Efficiently And
          Effectively Using <span className="text-green-500 dark:text-green-300">Immersion</span> And &quot;
          <span className="text-green-500 dark:text-green-300">Active Reading</span>&quot;
        </div>
        <div className="flex flex-col gap-2 justify-center items-center min-h-dvh">
          {user === undefined ? (
            <LoadingScreen />
          ) : (
            <>
              {user === null ? (
                <Auth
                  supabaseClient={supabase}
                  appearance={{ theme: ThemeSupa }}
                  providers={["github"]}
                  theme="dark"
                  redirectTo="/dashboard"
                />
              ) : (
                <>
                  <div className="flex flex-col gap-4 items-center">
                    {/* <div className="grid grid-cols-2 relative">
                    <div className="text-sm relative bottom-0 mt-auto mx-auto text-red-500 animate-pulse">
                      *start here
                    </div>
                    <div></div> */}
                    <Link
                      className="mx-auto animate-background-move block rounded-md bg-gradient-to-r from-green-300 via-white to-green-500 bg-[length:_400%_400%] p-px [animation-duration:_3s] w-full"
                      href={"/activeRecall"}
                    >
                      <Button className=" w-full" variant={"outline"}>
                        <div> Start </div>
                      </Button>
                    </Link>
                    {/* <Link href={"/spacedRepetition"}>
                      <Button className="" variant={"outline"}>
                        Spaced Repetition
                      </Button>
                    </Link>
                  </div> */}
                    <UpdatePassword />
                    <Logout />
                  </div>
                </>
              )}
              <ScrollDown />
            </>
          )}
        </div>
      </div>
    </>
  );
}
