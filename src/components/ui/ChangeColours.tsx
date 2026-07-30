import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import relations from "@/utils/relations";
import { PartOfSpeech } from "@/types";
import { ColourPicker } from "./ColourPicker";
import { Button } from "./button";
import { defaultColours } from "@/stores/constants";
export default function ChangeColours() {
  const colorsData = useQuery(api.colors.get);
  const updateColors = useMutation(api.colors.update);
  const resetColorsMut = useMutation(api.colors.reset);

  const colours = colorsData?.colors ?? defaultColours;
  const setColours = (pos: string, value: string, value2: string) => updateColors({ pos, value, value2 });
  const resetColours = () => resetColorsMut();

  return (
    <>
      <Dialog>
        <DialogTrigger className="flex">
          <Button variant={"outline"} className="grow">
            Change Colours
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Colours</DialogTitle>
            <DialogDescription>
              <div className="overflow-y-scroll max-h-[75vh]">
                {Object.keys(colours).map((pos) => {
                  return (
                    <>
                      <div className="grid grid-cols-2 my-4">
                        {relations[pos as PartOfSpeech] ?? "others"}
                        <div className="flex gap-4 ml-auto mr-4">
                          {" "}
                          <ColourPicker
                            {...{
                              value: colours[pos][0],
                              onChange: (value) => {
                                setColours(pos, value, colours[pos][1]);
                              },
                            }}
                          />{" "}
                          <ColourPicker
                            {...{
                              value: colours[pos][1],
                              onChange: (value) => {
                                setColours(pos, colours[pos][0], value);
                              },
                            }}
                          />
                        </div>
                      </div>
                    </>
                  );
                })}{" "}
                <div className="flex justify-center items-center">
                  <Button onClick={resetColours}>reset</Button>
                </div>
              </div>{" "}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
