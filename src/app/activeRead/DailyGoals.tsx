import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { Edit } from "lucide-react";
import { DailyGoalsSlice, GoalRecord, PreferenceStore } from "@/stores/types";
import { useShallow } from "zustand/react/shallow";
import NumberFlow from "@number-flow/react";
import { cn, roundByNthPlace } from "@/lib/utils";
import _ from "lodash";
const enums: Record<string, string> = {
  xp: "XP",
  verse: "Verses",
  word: "word",
};
function DailyGoals(props: { toAdd?: Partial<Record<keyof typeof enums, number>> }) {
  useOnlineStorage(useShallow((a) => [a.goalRecords]));

  const [goalRecords, setGoalRecords] = useState<Partial<Record<keyof typeof enums, GoalRecord>>>(
    _.mapValues(useOnlineStorage.getState().goalRecords, (value, key) => {
      const newValue = { ...value };
      newValue.value =
        value.value - (props.toAdd ? (props.toAdd[key as keyof typeof enums] ?? value.value) : value.value);

      return newValue;
    }),
    //   {
    //   dailyXP: useOnlineStorage.getState().dailyXP - (props.toAdd?.dailyXP ?? useOnlineStorage.getState().dailyXP),
    //   dailyQuranVerseCount:
    //     useOnlineStorage.getState().dailyQuranVerseCount -
    //     (props.toAdd?.dailyQuranVerseCount ?? useOnlineStorage.getState().dailyQuranVerseCount),
    //   dailyFrequencyListVerseCount:
    //     useOnlineStorage.getState().dailyFrequencyListVerseCount -
    //     (props.toAdd?.dailyFrequencyListVerseCount ?? useOnlineStorage.getState().dailyFrequencyListVerseCount),
    //   dailyQuranProgressPercentage:
    //     useOnlineStorage.getState().dailyQuranProgressPercentage -
    //     (props.toAdd?.dailyQuranProgressPercentage ?? useOnlineStorage.getState().dailyQuranProgressPercentage),
    // }
  );

  const [animationEnded, setAnimationEnded] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setGoalRecords(useOnlineStorage.getState().goalRecords);
      setAnimationEnded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full h-full">
      {(Object.keys(enums) as Array<keyof typeof enums>).map((key) => (
        <DailyGoal
          key={key}
          x={goalRecords[key]?.value ?? 0}
          name={enums[key] as string}
          goal={goalRecords[key]?.goal ?? 0}
          edit={key}
          streak={goalRecords[key]?.streak ?? 0}
          toAdd={props.toAdd?.[key as keyof PreferenceStore] as number | undefined}
          animationEnded={animationEnded}
        />
      ))}
    </div>
  );
}

export default DailyGoals;

function DailyGoal(props: {
  x: number;
  name: string;
  goal: number;
  edit: string;
  animationEnded: boolean;
  streak?: number;
  toAdd?: number;
}) {
  return (
    <>
      <Progress value={(props.x / props.goal) * 100} className={cn("w-full max-w-sm", props.goal == 0 && "opacity-25")}>
        <ProgressLabel streak={props.streak}>{props.name}</ProgressLabel>
        <ProgressValue
          value={roundByNthPlace(props.x, 4)}
          goal={props.goal}
          edit={props.edit}
          toAdd={props.toAdd}
          animationEnded={props.animationEnded}
        ></ProgressValue>
      </Progress>
    </>
  );
}

function ProgressLabel(props: { children: React.ReactNode; streak?: number }) {
  return (
    <label className={"text-sm font-medium"} data-slot="progress-label">
      {props.children}
      {props.streak ? (
        <span className="ml-2 text-xs text-muted-foreground align-middle">Streak: {props.streak} </span>
      ) : null}
    </label>
  );
}
function ProgressValue(props: { value: number; goal: number; edit: string; animationEnded: boolean; toAdd?: number }) {
  const [num, setNum] = useState(0);
  useEffect(() => {
    setTimeout(() => {
      setNum(props.toAdd ?? 0);
    }, 1000);
  }, [props.value, props.goal, props.toAdd]);

  return (
    <div
      className="ml-auto text-sm text-muted-foreground tabular-nums flex items-center gap-2"
      data-slot="progress-value"
    >
      {props.toAdd ? (
        <span className="text-muted-foreground">
          {roundByNthPlace(props.value - (props.animationEnded ? props.toAdd : 0), 4)}+
          <NumberFlow value={num} />
        </span>
      ) : (
        <NumberFlow value={props.value} />
      )}
      /
      <NumberFlow value={props.goal} />
      <Edit
        size={16}
        onClick={() => {
          useOnlineStorage.setState((state) => {
            const promptValue = parseFloat(
              prompt("Goal", state.goalRecords[props.edit].goal + "") ?? state.goalRecords[props.edit].goal + "",
            );
            if (isNaN(promptValue)) return;
            state.goalRecords[props.edit].goal = promptValue;
          });
        }}
      ></Edit>
    </div>
  );
}
