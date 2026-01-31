import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EasingFactorSelector(params: {
  divideBy: number;
  setDivideBy: (n: number) => void;
  verseLength: number;
}) {
  return (
    <Select onValueChange={(value) => params.setDivideBy(Number(value))}>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder={`easing factor: ${params.divideBy}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>easing factor</SelectLabel>
          {[
            ...new Set([
              ...getDivisors(params.verseLength),
              ...getDivisors(params.verseLength + 1),
              ...getDivisors(params.verseLength - 1),
            ]),
          ]
            .sort((a, b) => a - b)
            .filter((divisor) => Math.floor(params.verseLength / divisor) > 1)
            .map((divisor) => (
              <SelectItem key={divisor} value={divisor.toString()}>
                {divisor}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
function getDivisors(n: number): number[] {
  const divisors = [];
  // Iterate from 1 up to the square root of n
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      // Add the current divisor
      divisors.push(i);
      // Add the complementary divisor if it's different from the current one
      if (i !== n / i) {
        divisors.push(n / i);
      }
    }
  }
  return divisors;
}
