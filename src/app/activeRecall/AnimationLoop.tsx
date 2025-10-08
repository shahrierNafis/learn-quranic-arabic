import MotionDiv from "@/components/MotionDiv";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import _, { random, set } from "lodash";
import React, { useEffect, useState } from "react";

export default function AnimationLoop() {
  const [array1, setArray1] = useState<{ width: number; id: number }[]>([]);
  const [array2, setArray2] = useState<{ width: number; id: number }[]>([]);
  const [xp, setXp] = useState(0);
  const [shouldLose, setShouldLose] = useState(Math.random() < 0.5 ? true : false);
  const [click, setClick] = useState(false);

  useEffect(() => {
    const array1 = Array(10)
      .fill(1)
      .map((a, i) => {
        const randomWidth = Math.floor(Math.random() * (12 - 6 + 1)) + 6;
        return { width: randomWidth, id: i };
      });
    setArray1(_.shuffle(array1) as typeof array1);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    setTimeout(() => {
      setClick(true);
    }, 500);
    timeout = play();

    function play() {
      return setTimeout(() => {
        setClick(false);
        if (xp < 1500) {
          setArray2((prev) => {
            if (prev.length >= 5)
              if (shouldLose) {
                setShouldLose(Math.random() < 0.5 ? true : false);
                setArray1(_.shuffle(array1) as typeof array1);
                return [];
              }
            if (prev.length == array1.length) {
              setXp(xp + 500);

              return [];
            }
            setTimeout(() => {
              setClick(true);
            }, 250);
            return [array1.filter((a) => a.id == prev.length)[0], ...prev];
          });

          timeout = play();
        } else {
          setTimeout(() => {
            setXp(0);
            setArray2([]);
            setArray1(_.shuffle(array1) as typeof array1);
            setShouldLose(Math.random() < 0.5 ? true : false);
          }, 5000);
          clearTimeout(timeout);
        }
      }, 1000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [array1, shouldLose, xp]);

  useEffect(() => {
    array2;
  }, [array2]);

  const parentage = Math.min(100, (xp / 1500) * 100);
  return (
    <div className="absolute top-0 left-0  w-1/2 h-screen hidden lg:flex flex-col gap-4 items-center justify-center pl-16 overflow-hidden">
      <div>DEMO</div>
      <div className="relative w-full text-center font-mono text-sm">XP {xp} / 1500</div>
      <div className="w-full h-[1rem] rounded-full bg-zinc-200 relative">
        <motion.div
          className="h-full rounded-full bg-green-200 flex items-center justify-center"
          initial={{ width: parentage + "%" }}
          animate={{
            width: `${parentage}%`,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        ></motion.div>
      </div>
      <Button disabled className="mt-2" size={"sm"} variant={"outline"}>
        <div>Level {xp == 1500 ? 1000 : 999}</div>
      </Button>
      {/* array2 */}
      <div dir="rtl" className="flex flex-wrap items-start justify-start gap-2">
        {xp !== 1500 &&
          array1
            .toSorted((a, b) => a.id - b.id)
            .map((a) => {
              const array2Ids = array2.map((b) => b?.id);

              return (
                <div className={""} key={a.id}>
                  <div
                    style={{ width: `${a.width}rem`, visibility: array2Ids.includes(a.id) ? "visible" : "hidden" }}
                    className={`h-12 rounded-md border bg-green-200 text-center content-center text-muted-foreground`}
                  >
                    {a.id + 1}
                  </div>
                </div>
              );
            })}
      </div>

      {/* skeletons */}
      {xp !== 1500 && (
        <>
          <div className=" w-full h-[.5rem] rounded-md bg-muted"></div>
          <div className=" w-full h-[.5rem] rounded-md bg-muted"></div>
          <div className="w-full">
            <div className=" w-1/4 h-[.5rem] rounded-md bg-muted"></div>
          </div>
        </>
      )}
      {/* array1 */}
      <MotionDiv className="flex flex-wrap items-start justify-center gap-2">
        {xp !== 1500 &&
          array1.map((a) => {
            const array2Ids = array2.map((b) => b?.id);
            return (
              <MotionDiv style={{ visibility: array2Ids.includes(a.id) ? "hidden" : "visible" }} key={a.id}>
                <div
                  style={{ width: `${a.width}rem` }}
                  className={cn(
                    `h-12 rounded-md border text-center content-center text-muted-foreground`,
                    a.id == array2.length && xp < 1500 && click && array2.length != 5 ? "bg-green-200" : "",
                    array2.length == 5 && a.id == 6 && shouldLose && click ? "bg-red-200" : ""
                  )}
                >
                  {a.id + 1}
                </div>
              </MotionDiv>
            );
          })}
      </MotionDiv>
    </div>
  );
}
