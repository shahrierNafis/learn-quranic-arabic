import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { Edit } from "lucide-react";
import { PreferenceStore } from "@/stores/types";
import { useShallow } from "zustand/react/shallow";
import NumberFlow from "@number-flow/react";
import { roundByNthPlace } from "@/lib/utils";

function DailyGoals(props: { toAdd?: Partial<PreferenceStore> }) {
  const [
    dailyXPGoal,
    dailyXpStreak,
    dailyQuranVerseCountGoal,
    dailyQuranVerseCountStreak,
    dailyFrequencyListVerseCountGoal,
    dailyFrequencyListVerseCountStreak,
    dailyQuranProgressPercentageGoal,
    dailyQuranProgressPercentageStreak,
  ] = useOnlineStorage(
    useShallow((a) => [
      a.dailyXPGoal,
      a.dailyXpStreak,
      a.dailyQuranVerseCountGoal,
      a.dailyQuranVerseCountStreak,
      a.dailyFrequencyListVerseCountGoal,
      a.dailyFrequencyListVerseCountStreak,
      a.dailyQuranProgressPercentageGoal,
      a.dailyQuranProgressPercentageStreak,
    ]),
  );
  const [dailyXP, setDailyXP] = useState(
    useOnlineStorage.getState().dailyXP - (props.toAdd?.dailyXP ?? useOnlineStorage.getState().dailyXP),
  );
  const [dailyQuranVerseCount, setDailyQuranVerseCount] = useState(
    useOnlineStorage.getState().dailyQuranVerseCount -
      (props.toAdd?.dailyQuranVerseCount ?? useOnlineStorage.getState().dailyQuranVerseCount),
  );
  const [dailyFrequencyListVerseCount, setDailyFrequencyListVerseCount] = useState(
    useOnlineStorage.getState().dailyFrequencyListVerseCount -
      (props.toAdd?.dailyFrequencyListVerseCount ?? useOnlineStorage.getState().dailyFrequencyListVerseCount),
  );
  const [dailyQuranProgressPercentage, setDailyQuranProgressPercentage] = useState(
    useOnlineStorage.getState().dailyQuranProgressPercentage -
      (props.toAdd?.dailyQuranProgressPercentage ?? useOnlineStorage.getState().dailyQuranProgressPercentage),
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDailyXP(useOnlineStorage.getState().dailyXP);
      setDailyQuranVerseCount(useOnlineStorage.getState().dailyQuranVerseCount);
      setDailyFrequencyListVerseCount(useOnlineStorage.getState().dailyFrequencyListVerseCount);
      setDailyQuranProgressPercentage(useOnlineStorage.getState().dailyQuranProgressPercentage);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full h-full">
      <Progress value={(dailyXP / dailyXPGoal) * 100} className="w-full max-w-sm">
        <ProgressLabel streak={dailyXpStreak}>XP</ProgressLabel>
        <ProgressValue
          value={dailyXP}
          goal={dailyXPGoal}
          edit="dailyXPGoal"
          toAdd={props.toAdd?.dailyXP}
        ></ProgressValue>
      </Progress>
      <Progress value={(dailyQuranVerseCount / dailyQuranVerseCountGoal) * 100} className="w-full max-w-sm">
        <ProgressLabel streak={dailyQuranVerseCountStreak}>Quran Verses</ProgressLabel>
        <ProgressValue
          value={dailyQuranVerseCount}
          goal={dailyQuranVerseCountGoal}
          edit="dailyQuranVerseCountGoal"
          toAdd={props.toAdd?.dailyQuranVerseCount}
        ></ProgressValue>
      </Progress>
      <Progress
        value={(dailyFrequencyListVerseCount / dailyFrequencyListVerseCountGoal) * 100}
        className="w-full max-w-sm"
      >
        <ProgressLabel streak={dailyFrequencyListVerseCountStreak}>Frequency List Verses</ProgressLabel>
        <ProgressValue
          value={dailyFrequencyListVerseCount}
          goal={dailyFrequencyListVerseCountGoal}
          edit="dailyFrequencyListVerseCountGoal"
          toAdd={props.toAdd?.dailyFrequencyListVerseCount}
        ></ProgressValue>
      </Progress>{" "}
      <Progress
        value={(dailyQuranProgressPercentage / dailyQuranProgressPercentageGoal) * 100}
        className="w-full max-w-sm"
      >
        <ProgressLabel streak={dailyQuranProgressPercentageStreak}>Quran Progress</ProgressLabel>
        <ProgressValue
          value={roundByNthPlace(dailyQuranProgressPercentage, 4)}
          goal={dailyQuranProgressPercentageGoal}
          edit="dailyQuranProgressPercentageGoal"
          toAdd={props.toAdd?.dailyQuranProgressPercentage}
        ></ProgressValue>
      </Progress>
    </div>
  );
}

export default DailyGoals;
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
function ProgressValue(props: { value: number; goal: number; edit: string; toAdd?: number }) {
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
          {roundByNthPlace(props.value - (props.toAdd + num), 4)}+
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
            const promptValue = parseInt(
              prompt("Goal", state[props.edit as keyof PreferenceStore] as string) ??
                (state[props.edit as keyof PreferenceStore] as string),
            );
            return {
              [props.edit]: promptValue,
            };
          });
        }}
      ></Edit>
    </div>
  );
}
