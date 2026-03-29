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
import roundToTwo from "@/utils/roundToTwo";

export function EasingFactorSelector(params: {
  divideBy: number;
  setDivideBy: (n: number) => void;
  verseLength: number;
  onValueChange?: (value?: number) => void;
}) {
  return (
    <Select
      onValueChange={(value) => {
        const numValue = Number(value);
        params.setDivideBy(numValue);
        params.onValueChange && params.onValueChange(numValue);
      }}
      value={params.divideBy.toString()}
    >
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder={`easing factor: ${params.divideBy}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Easing Factor</SelectLabel>
          {validChunkSizes(params.verseLength)
            .sort((a, b) => a - b)
            .filter((divisor) => Math.floor(params.verseLength / divisor) > 1)
            .map((divisor) => (
              <SelectItem key={divisor} value={divisor.toString()}>
                {roundToTwo(divisor)}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function validChunkSizes(n: number): number[] {
  const sizes: number[] = [];

  for (let k = 1; k <= n; k++) {
    const r = n % k;

    if (r === 0 || r === 1 || r === k - 1) {
      sizes.push(k);
    }
  }

  return sizes;
}
