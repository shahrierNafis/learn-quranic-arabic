import MotionDiv from "@/components/MotionDiv";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function AnimationLoop() {
  const [array1, setArray1] = useState<{ width: number; id: number }[]>([]);
  const [array2, setArray2] = useState<{ width: number; id: number }[]>([]);
  const [xp, setXp] = useState(0);
  const [shouldLose, setShouldLose] = useState(false);
  const [click, setClick] = useState(false);
  const [open, setOpen] = useState(false);

  const fillArray1 = useCallback(() => {
    function get5Array(offset = 0) {
      return _.shuffle(
        Array(5)
          .fill(1)
          .map((a, i) => {
            return { width: 15, id: i + offset };
          })
      ).map((a, i) => {
        switch (i) {
          case 0:
            a.width += 2;
            break;
          case 1:
            a.width += 5;
            break;
          case 2:
            a.width += -1.5;
            break;
          case 3:
            a.width += -3.5;
            break;
          case 4:
            a.width += -2;
            break;
        }
        return { ...a };
      });
    }

    setArray1([...get5Array(), ...get5Array(5)]);
  }, []);

  useEffect(() => {
    if (open) {
      fillArray1();
      setArray2([]);
      setXp(0);
    }
  }, [open, fillArray1]);

  useEffect(() => {
    if (!open) return;
    let timeout: NodeJS.Timeout;

    timeout = play(shouldLose && array2.length == 5 ? 3000 : undefined); // pause after loosing

    function play(waitTime: number = 1000, clickTime: number = 900) {
      return setTimeout(() => {
        setClick(false);
        if (xp < 1500) {
          setArray2((prev) => {
            if (prev.length >= 5)
              if (shouldLose) {
                setShouldLose(false);
                fillArray1();
                return [];
              }
            if (prev.length == array1.length) {
              setXp(xp + 500);
              xp == 0 && setShouldLose(true); // lose the second time
              return [];
            }
            setTimeout(() => {
              setClick(true);
            }, clickTime);
            return [array1.filter((a) => a.id == prev.length)[0], ...prev];
          });
        } else {
          setTimeout(() => {
            setXp(0);
            setArray2([]);
            fillArray1();
          }, 5000);
          clearTimeout(timeout);
        }
      }, waitTime);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [array1, array2, fillArray1, open, shouldLose, xp]);

  const parentage = Math.min(100, (xp / 1500) * 100);
  return (
    <Dialog {...{ open }} onOpenChange={setOpen}>
      <DialogTrigger className="w-full">
        <Button size={"lg"} variant="outline" onClick={() => {}} className="font-black text-xl md:text-2xl w-full">
          DEMO
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-full h-full overflow-y-auto flex flex-col items-center justify-center gap-2">
        <div className="w-full h-full flex flex-col gap-4 items-center justify-center p-2 overflow-hidden">
          <div>DEMO</div>
          <div className="relative w-full text-center font-mono text-sm">XP {xp} / 1500</div>
          <div className="w-full h-[1rem] rounded-full bg-zinc-200 relative">
            <motion.div
              className={cn("h-full rounded-full bg-green-200 flex items-center justify-center")}
              initial={{ width: parentage + "%" }}
              animate={{
                width: `${parentage}%`,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            ></motion.div>
          </div>
          <motion.div animate={{ scale: xp == 1500 ? [1, 2] : 1 }} transition={{ duration: 1 }} className="">
            <Button
              disabled={xp !== 1500}
              className={cn("mt-2 pointer-events-none", xp == 1500 && "ring-2 ring-green-500")}
              size={"sm"}
              variant={"outline"}
            >
              <div>Level {xp == 1500 ? 1000 : 999}</div>
            </Button>
          </motion.div>
          {/* array2 */}
          <div dir="rtl" className="flex flex-wrap items-start justify-start gap-2">
            {xp !== 1500 &&
              array1
                .toSorted((a, b) => a.id - b.id)
                .map((a) => {
                  const array2Ids = array2.map((b) => b?.id);

                  return (
                    <MotionDiv className={""} key={a.id}>
                      <MotionDiv
                        style={{ width: `${a.width}vw`, visibility: array2Ids.includes(a.id) ? "visible" : "hidden" }}
                        className={cn(
                          `h-[5vh] md:h-[10vh] rounded-md border bg-green-200 text-center content-center text-muted-foreground`
                        )}
                      >
                        {a.id + 1}
                      </MotionDiv>
                    </MotionDiv>
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
                      style={{ width: `${a.width}vw` }}
                      className={cn(
                        `h-[5vh] md:h-[10vh] rounded-md border text-center content-center text-muted-foreground`,
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
      </DialogContent>
    </Dialog>
  );
}
