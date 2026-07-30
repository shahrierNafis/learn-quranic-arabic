import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Edit } from "lucide-react";
import { DailyGoalsSlice, GoalRecord, PreferenceStore } from "@/stores/types";
import NumberFlow from "@number-flow/react";
import { cn, roundByNthPlace } from "@/lib/utils";
import _ from "lodash";
const enums: Record<string, string> = {
  xp: "XP",
  verse: "Verses",
  word: "word",
};

const initialGoalRecords = {
  xp: { value: 0, name: "XP", goal: 1000, streak: 0 },
  verse: { value: 0, name: "Quran Verse Count", goal: 10, streak: 0 },
  word: { value: 0, name: "Frequency List Verse Count", goal: 100, streak: 0 },
};

function DailyGoals(props: { toAdd?: Partial<Record<keyof typeof enums, number>> }) {
  const dailyGoalsData = useQuery(api.dailyGoals.get);
  const currentGoalRecords = dailyGoalsData?.goalRecords ?? initialGoalRecords;

  const [goalRecords, setGoalRecords] = useState<Partial<Record<keyof typeof enums, GoalRecord>>>(
    _.mapValues(currentGoalRecords, (value, key) => {
      const newValue = { ...value };
      newValue.value =
        value.value - (props.toAdd ? (props.toAdd[key as keyof typeof enums] ?? value.value) : value.value);

      return newValue;
    }),
  );

  const [animationEnded, setAnimationEnded] = useState(false);

  React.useEffect(() => {
    if (!dailyGoalsData) return;
    const timer = setTimeout(() => {
      setGoalRecords(dailyGoalsData.goalRecords);
      setAnimationEnded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [dailyGoalsData]);

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
          currentGoalRecords={currentGoalRecords}
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
  currentGoalRecords: Record<string, GoalRecord>;
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
          currentGoalRecords={props.currentGoalRecords}
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
function ProgressValue(props: {
  value: number;
  goal: number;
  edit: string;
  animationEnded: boolean;
  toAdd?: number;
  currentGoalRecords: Record<string, GoalRecord>;
}) {
  const [num, setNum] = useState(0);
  const updateDailyGoals = useMutation(api.dailyGoals.update);

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
          const promptValue = parseFloat(
            prompt("Goal", props.currentGoalRecords[props.edit].goal + "") ??
              props.currentGoalRecords[props.edit].goal + "",
          );
          if (isNaN(promptValue)) return;
          const newGoalRecords = { ...props.currentGoalRecords };
          newGoalRecords[props.edit].goal = promptValue;
          updateDailyGoals({ goalRecords: newGoalRecords });
        }}
      ></Edit>
    </div>
  );
}
